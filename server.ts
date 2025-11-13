// Note: This file uses Deno APIs and will work correctly when run with Deno (via Docker on Render).
import { allReactionToLang } from "./functions/detect_lang.ts";

// Type declarations for Deno global (available at runtime in Deno environment)
// @ts-ignore - Deno is a global in Deno runtime
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  exit(code: number): never;
  serve(options: { port: number }, handler: (req: Request) => Response | Promise<Response>): void;
};

// Get environment variables
// @ts-ignore - Deno.env is available at runtime
const botToken = Deno.env.get("SLACK_BOT_TOKEN");
// @ts-ignore
const signingSecret = Deno.env.get("SLACK_SIGNING_SECRET");
// @ts-ignore
const deeplAuthKey = Deno.env.get("DEEPL_AUTH_KEY");
// @ts-ignore
const port = parseInt(Deno.env.get("PORT") || "10000");

if (!botToken || !signingSecret) {
  console.error("Missing SLACK_BOT_TOKEN or SLACK_SIGNING_SECRET");
  // @ts-ignore
  Deno.exit(1);
}

if (!deeplAuthKey) {
  console.error("Missing DEEPL_AUTH_KEY");
  // @ts-ignore
  Deno.exit(1);
}

// Slack API client helper
async function slackApi(method: string, body: Record<string, unknown>) {
  const response = await fetch(`https://slack.com/api/${method}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${botToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  return await response.json();
}

// Handle reaction_added event
async function handleReactionAdded(event: any) {
  try {
    const reaction = event.reaction;
    const channelId = event.item.channel;
    const messageTs = event.item.ts;

    console.log(`Reaction added: ${reaction} in channel ${channelId}`);

    // Detect language from reaction
    let lang: string | undefined = undefined;
    if (reaction.startsWith("flag-")) {
      // Extract country code from flag-jp, flag-us, etc.
      const country = reaction.replace(/^flag-/, "");
      lang = allReactionToLang[country];
    } else {
      // Direct reaction like jp, fr, us, etc.
      lang = allReactionToLang[reaction];
    }

    if (!lang) {
      console.log(`No language mapping found for reaction: ${reaction}`);
      return;
    }

    // Fetch the target message
    const messageResponse = await slackApi("conversations.replies", {
      channel: channelId,
      ts: messageTs,
      limit: 1,
      inclusive: true,
    });

    if (messageResponse.error) {
      console.error(`Failed to fetch message: ${messageResponse.error}`);
      return;
    }

    if (!messageResponse.messages || messageResponse.messages.length === 0) {
      console.log("No message found");
      return;
    }

    const targetMessage = messageResponse.messages[0];
    const threadTs = targetMessage.thread_ts || messageTs;

    // Check if translation already exists
    const replies = await slackApi("conversations.replies", {
      channel: channelId,
      ts: threadTs,
    });

    // Prepare text for translation
    const targetText = targetMessage.text
      ?.replace(/<(.*?)>/g, (_: unknown, match: string) => {
        if (match.match(/^[#@].*$/)) {
          const matched = match.match(/^([#@].*)$/);
          if (matched != null) {
            return `<mrkdwn>${matched[1]}</mrkdwn>`;
          }
          return "";
        }
        if (match.match(/^!subteam.*$/)) {
          return "@[subteam mention removed]";
        }
        if (match.match(/^!date.*$/)) {
          const matched = match.match(/^(!date.*)$/);
          if (matched != null) {
            return `<mrkdwn>${matched[1]}</mrkdwn>`;
          }
          return "";
        }
        if (match.match(/^!.*$/)) {
          const matched = match.match(/^!(.*?)(?:\|.*)?$/);
          if (matched != null) {
            return `<ignore>@${matched[1]}</ignore>`;
          }
          return "<ignore>@[special mention]</ignore>";
        }
        if (match.match(/^.*?\|.*$/)) {
          const matched = match.match(/^(.*?)\|(.*)$/);
          if (matched != null) {
            return `<a href="${matched[1]}">${matched[2]}</a>`;
          }
          return "";
        }
        return `<mrkdwn>${match}</mrkdwn>`;
      })
      .replace(/:([a-z0-9_-]+):/g, (_: unknown, match: string) => {
        return `<emoji>${match}</emoji>`;
      }) || "";

    // Call DeepL API
    // deeplAuthKey is guaranteed to be defined due to check at startup
    const apiSubdomain = deeplAuthKey!.endsWith(":fx") ? "api-free" : "api";
    const url = `https://${apiSubdomain}.deepl.com/v2/translate`;
    const body = new URLSearchParams();
    body.append("auth_key", deeplAuthKey!);
    body.append("text", targetText);
    body.append("tag_handling", "xml");
    body.append("ignore_tags", "emoji,mrkdwn,ignore");
    body.append("target_lang", lang.toUpperCase());

    const deeplResponse = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/x-www-form-urlencoded;charset=utf-8",
      },
      body,
    });

    if (deeplResponse.status !== 200) {
      console.error(`DeepL API error: ${deeplResponse.status}`);
      return;
    }

    const translationResult = await deeplResponse.json();
    if (
      !translationResult ||
      !translationResult.translations ||
      translationResult.translations.length === 0
    ) {
      console.error("No translation result");
      return;
    }

    let translatedText = translationResult.translations[0].text
      .replace(/<emoji>([a-z0-9_-]+)<\/emoji>/g, (_: unknown, match: string) => {
        return `:${match}:`;
      })
      .replace(/<mrkdwn>(.*?)<\/mrkdwn>/g, (_: unknown, match: string) => {
        return `<${match}>`;
      })
      .replace(
        /(<a href="(?:.*?)">(?:.*?)<\/a>)/g,
        (_: unknown, match: string) => {
          const matched = match.match(/<a href="(.*?)">(.*?)<\/a>/);
          if (matched != null) {
            return `<${matched[1]}|${matched[2]}>`;
          }
          return "";
        },
      )
      .replace(/<ignore>(.*?)<\/ignore>/g, (_: unknown, match: string) => {
        return match;
      });

    // Check if already posted
    if (replies.messages) {
      for (const msg of replies.messages) {
        if (msg.text === translatedText) {
          console.log("Translation already posted, skipping");
          return;
        }
      }
    }

    // Post translation
    await slackApi("chat.postMessage", {
      channel: channelId,
      text: translatedText,
      thread_ts: threadTs,
    });

    console.log(`Translation posted successfully for language: ${lang}`);
  } catch (error) {
    console.error("Error handling reaction:", error);
  }
}

// HTTP request handler
async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  // Health check
  if (req.method === "GET" && url.pathname === "/") {
    return new Response("OK", { status: 200 });
  }

  // Slack Events API endpoint
  if (req.method === "POST" && url.pathname === "/slack/events") {
    try {
      // Verify request signature
      const body = await req.text();
      const timestamp = req.headers.get("x-slack-request-timestamp");
      const signature = req.headers.get("x-slack-signature");

      if (!timestamp || !signature) {
        console.error("Missing Slack signature headers");
        return new Response("Unauthorized", { status: 401 });
      }

      // Verify timestamp (prevent replay attacks)
      const currentTime = Math.floor(Date.now() / 1000);
      if (Math.abs(currentTime - parseInt(timestamp)) > 300) {
        console.error("Request timestamp too old");
        return new Response("Unauthorized", { status: 401 });
      }

      // Verify signature
      const sigBaseString = `v0:${timestamp}:${body}`;
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(signingSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const signatureBytes = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(sigBaseString),
      );
      const computedSignature = "v0=" + Array.from(new Uint8Array(signatureBytes))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      if (signature !== computedSignature) {
        console.error("Invalid Slack request signature");
        return new Response("Unauthorized", { status: 401 });
      }

      const payload = JSON.parse(body);

      // Handle URL verification challenge
      if (payload.type === "url_verification") {
        return new Response(payload.challenge, {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      }

      // Handle event callbacks
      if (payload.type === "event_callback") {
        const event = payload.event;

        // Respond immediately to Slack (within 3 seconds)
        const response = new Response("OK", { status: 200 });

        // Process event asynchronously
        if (event.type === "reaction_added") {
          handleReactionAdded(event).catch(console.error);
        }

        return response;
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      console.error("Error processing request:", error);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  console.log(`Unhandled HTTP request (${req.method}) made to ${url.pathname}`);
  return new Response("Not Found", { status: 404 });
}

// Start server using Deno's built-in serve API
console.log(`Starting server on port ${port}...`);
// @ts-ignore - Deno.serve is available at runtime
Deno.serve({ port }, handler);
console.log(`Bolt app is running on port ${port}!`);
