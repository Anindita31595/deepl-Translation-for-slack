# How to Add the Functions Folder to GitHub

## The Problem
The `functions/` folder is missing from your GitHub repository, causing deployment failures.

## Solution: Add the File via GitHub Web Interface

### Step 1: Create the detect_lang.ts file

1. Go to your GitHub repository
2. Click **"Add file"** → **"Create new file"**
3. In the file path box, type: **`functions/detect_lang.ts`**
   - This will automatically create the `functions/` folder
4. Copy and paste the entire content from the file below
5. Click **"Commit new file"** at the bottom

### Step 2: File Content

Copy this entire content into the file:

```typescript
// Language mapping from reaction names to DeepL language codes
// This is a simplified version for webhook-based deployment
export const allReactionToLang: Record<string, string> = {
  ac: "en",
  ag: "en",
  ai: "en",
  ao: "pt",
  ar: "es",
  as: "en",
  at: "de",
  au: "en",
  aw: "nl",
  bb: "en",
  be: "nl",
  bf: "fr",
  bi: "fr",
  bj: "fr",
  bl: "fr",
  bn: "en",
  bo: "es",
  bq: "nl",
  br: "pt",
  bs: "en",
  bw: "en",
  bz: "en",
  ca: "en",
  cd: "fr",
  cf: "fr",
  cg: "fr",
  ch: "de",
  ci: "fr",
  ck: "en",
  cl: "es",
  cm: "fr",
  cn: "zh",
  co: "es",
  cp: "fr",
  cr: "es",
  cu: "es",
  cv: "pt",
  cw: "nl",
  cx: "en",
  de: "de",
  dj: "fr",
  dm: "en",
  do: "es",
  ea: "es",
  ec: "es",
  es: "es",
  fj: "en",
  fk: "en",
  fm: "en",
  fr: "fr",
  ga: "fr",
  gb: "en",
  gd: "en",
  gf: "fr",
  gg: "en",
  gh: "en",
  gi: "en",
  gm: "en",
  gn: "fr",
  gp: "fr",
  gq: "es",
  gs: "en",
  gt: "es",
  gu: "en",
  gw: "pt",
  gy: "en",
  hn: "es",
  ic: "es",
  im: "en",
  io: "en",
  it: "it",
  je: "en",
  jm: "en",
  jp: "ja",
  ke: "en",
  ki: "en",
  kr: "ko",
  kn: "en",
  ky: "en",
  lc: "en",
  li: "de",
  lr: "en",
  mc: "fr",
  ml: "fr",
  mp: "en",
  mq: "fr",
  ms: "en",
  mu: "en",
  mw: "en",
  mx: "es",
  mz: "pt",
  na: "en",
  nc: "fr",
  ne: "fr",
  nf: "en",
  ng: "en",
  ni: "es",
  nl: "nl",
  nz: "en",
  pa: "es",
  pe: "es",
  pf: "fr",
  pl: "pl",
  pm: "fr",
  pn: "en",
  pr: "es",
  pt: "pt",
  pw: "en",
  py: "es",
  re: "fr",
  ru: "ru",
  sb: "en",
  sc: "en",
  sg: "en",
  sh: "en",
  sl: "en",
  sm: "it",
  sn: "fr",
  sr: "nl",
  ss: "en",
  st: "pt",
  sv: "es",
  sx: "nl",
  ta: "en",
  tc: "en",
  td: "fr",
  tf: "fr",
  tg: "fr",
  tt: "en",
  ug: "en",
  um: "en",
  us: "en",
  uy: "es",
  va: "it",
  vc: "en",
  ve: "es",
  vg: "en",
  vi: "en",
  wf: "fr",
  yt: "fr",
  zm: "en",
  zw: "en",
  bg: "bg",
  cz: "cs",
  dk: "da",
  gr: "el",
  ee: "et",
  fi: "fi",
  hu: "hu",
  id: "id",
  lt: "lt",
  ro: "ro",
  sk: "sk",
  si: "sl",
  se: "sv",
  tr: "tr",
  ua: "uk",
};
```

## Alternative: Using Git Command Line

If you have Git installed locally:

```bash
# Navigate to your project folder
cd deno-message-translator-main

# Check if functions folder exists
ls functions/

# Add and commit
git add functions/
git commit -m "Add functions folder with detect_lang.ts"
git push
```

## Verify It Worked

After adding the file:
1. Go to your GitHub repository
2. You should see a `functions/` folder
3. Click into it - you should see `detect_lang.ts`
4. Render will auto-deploy, or manually trigger a new deployment

## After Deployment

Check the Render logs - you should see:
- ✅ `ls -la functions/` showing the folder exists
- ✅ `deno cache server.ts` succeeding
- ✅ No "Module not found" errors

