# Deployment Guide - Free Hosting Alternatives

This guide provides instructions for deploying the Slack translation app to free hosting platforms.

## Option 1: Deno Deploy (Recommended) ⭐

**Deno Deploy** is the official hosting platform for Deno applications and offers a generous free tier.

### Features:
- ✅ Free tier with 100,000 requests/day
- ✅ Zero-config Deno deployment
- ✅ Global edge network
- ✅ Automatic HTTPS
- ✅ Built-in CI/CD with GitHub integration

### Setup Steps:

1. **Sign up at [deno.com/deploy](https://deno.com/deploy)**

2. **Connect your GitHub repository**:
   - Go to your Deno Deploy dashboard
   - Click "New Project"
   - Select your repository
   - Choose the branch (usually `main` or `master`)

3. **Configure the project**:
   - **Entrypoint**: `server.ts`
   - **Environment Variables**: Add the following:
     - `DEEPL_AUTH_KEY` - Your DeepL API key
     - `SLACK_BOT_TOKEN` - Your Slack bot token
     - `SLACK_SIGNING_SECRET` - Your Slack signing secret

4. **Deploy**: Click "Deploy" and your app will be live!

5. **Configure Slack App**:
   - Go to https://api.slack.com/apps
   - Set Event Subscriptions Request URL to your Deno Deploy URL + `/slack/events`
   - Subscribe to `reaction_added` event

---

## Option 2: Railway

**Railway** offers a free tier with $5 credit per month.

### Features:
- ✅ $5 free credit per month
- ✅ Easy GitHub integration
- ✅ Automatic deployments
- ✅ Environment variable management

### Setup Steps:

1. **Sign up at [railway.app](https://railway.app)**

2. **Create a new project**:
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Configure the service**:
   - Railway will auto-detect Deno
   - Set the start command: `deno run --allow-net --allow-env server.ts`
   - Add environment variable: `DEEPL_AUTH_KEY`

4. **Deploy**: Railway will automatically deploy on every push

---

## Option 3: Render

**Render** offers a free tier with some limitations.

### Features:
- ✅ Free tier available
- ✅ Automatic SSL
- ✅ GitHub auto-deploy
- ✅ Environment variables

### Setup Steps:

1. **Sign up at [render.com](https://render.com)**

2. **Create a new Web Service**:
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

3. **Configure**:
   - **Name**: `slack-translator` (or your choice)
   - **Region**: `Oregon (US West)`
   - **Branch**: `master`
   - **Language**: `Docker` ⚠️ **Render doesn't have native Deno support, so we use Docker**
   - **Dockerfile Path**: `./Dockerfile` (or leave empty if using render.yaml)
   - **Plan**: Free
   
   **Note**: The `Dockerfile` in this repo will automatically build and run your Deno app. You don't need to set build/start commands manually when using Docker.

4. **Add Environment Variables**:
   - `DEEPL_AUTH_KEY`: Your DeepL API key

5. **Deploy**: Click "Create Web Service"

---

## Option 4: Fly.io

**Fly.io** offers a free tier with 3 shared VMs.

### Features:
- ✅ Free tier with 3 shared VMs
- ✅ Global edge network
- ✅ Easy scaling

### Setup Steps:

1. **Install Fly CLI**:
   ```bash
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. **Sign up and login**:
   ```bash
   fly auth signup
   fly auth login
   ```

3. **Initialize your app**:
   ```bash
   cd deno-message-translator-main
   fly launch
   ```

4. **Set environment variables**:
   ```bash
   fly secrets set DEEPL_AUTH_KEY=your_key_here
   ```

5. **Deploy**:
   ```bash
   fly deploy
   ```

---

## Important Notes

✅ **This app now supports both deployment methods:**

1. **Slack Infrastructure** (Original method):
   ```bash
   slack deploy
   ```
   This deploys directly to Slack's infrastructure at no cost using serverless functions.

2. **External Hosting** (Docker/Webhook method):
   The `server.ts` file provides a webhook-based server that can be deployed to any Docker-compatible platform. This method uses Slack's Events API webhooks instead of serverless functions.

---

## Recommendation

**Choose based on your needs:**

- **Use `slack deploy`** if:
  - You want the simplest setup
  - You're okay with Slack-managed infrastructure
  - You don't need custom server configuration

- **Use Docker deployment** (Render, Railway, etc.) if:
  - You want more control over the hosting environment
  - You prefer using free tiers from external platforms
  - You want to customize the server setup

**For Docker deployments, Render is recommended** due to its free tier and easy Docker integration.

