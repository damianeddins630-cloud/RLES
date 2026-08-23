# League Master System

Multi-league competitive gaming platform — manage Rocket League leagues, standings, and stats from one place.

## Deploy to Vercel

1. Push this repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Vercel auto-detects the Vite framework — no extra build settings needed
4. Add environment variables in Vercel project settings (see below)
5. Deploy

## Discord App Setup (Website Login)

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application (or use an existing one)
3. Open **OAuth2** → add this redirect URL:
   ```
   https://your-app-name.vercel.app/api/auth/callback
   ```
4. Copy the **Client ID** and **Client Secret**
5. Add them as Vercel environment variables

## Environment Variables

Set these in Vercel (Settings → Environment Variables) and in a local `.env` file for development:

| Variable | Description |
| --- | --- |
| `DISCORD_CLIENT_ID` | Discord application client ID |
| `DISCORD_CLIENT_SECRET` | Discord application client secret |
| `SESSION_SECRET` | Random string for signing cookies (`openssl rand -hex 32`) |
| `DISCORD_REDIRECT_URI` | Optional — defaults to `https://your-domain/api/auth/callback` |

Copy `.env.example` to `.env` for local development.

## Local Development

**Frontend only** (no Discord login):

```bash
npm install
npm run dev
```

**Full stack** (Discord login works):

```bash
npm install
cp .env.example .env   # fill in your Discord credentials
npm run dev:full       # runs vercel dev on http://localhost:3000
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server (frontend only) |
| `npm run dev:full` | Vercel dev server (frontend + API routes) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |

## Stack

- React 19 + TypeScript + Vite 6
- Vercel serverless functions for Discord OAuth
- Signed cookie sessions

## Discord Bot

League Master System bot for match reporting and standings across **multiple leagues**. See **[bot/README.md](bot/README.md)** for step-by-step setup.

Quick start:

```bash
cd bot
cp .env.example .env   # add bot token + client ID
npm install
npm run db:push
npm run register
npm run dev
```
