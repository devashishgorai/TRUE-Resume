# ATS Prism

ATS Prism is a role-aware resume analyzer built with Next.js, React, TypeScript, Tailwind CSS, and Gemini. Upload a resume, choose a target role, review the ATS score and improvement suggestions, then download an improved PDF draft.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Environment

Create `.env.local` in the project root:

```env
GEMINI_API_KEY=your_gemini_api_key
```

Never commit the real key. Add the same variable in Vercel Project Settings for production deployments.

## Checks

```bash
npm run lint
npx tsc --noEmit
```

## Deploy

This is a standard Next.js app and can be deployed directly to Vercel. The included `vercel.json` defines the framework and build commands.
