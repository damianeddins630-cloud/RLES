# League Master System

Multi-league competitive gaming platform — manage Rocket League leagues, standings, and stats from one place.

## Deploy to Vercel (website + Discord bot)

One Vercel project hosts both the website and Discord slash commands. The bot **sleeps when idle** and wakes on each command — it defers within 3 seconds (no interaction errors), then posts the full response.

### 1. Deploy

1. Push to GitHub and import at [vercel.com/new](https://vercel.com/new)
2. Add a **Vercel Postgres** database (Storage tab) or any PostgreSQL `DATABASE_URL`
3. Add environment variables (see below)
4. Deploy

### 2. Discord Developer Portal

1. [discord.com/developers/applications](https://discord.com/developers/applications)
2. **General Information** → copy **Application ID** and **Public Key**
3. Set **Interactions Endpoint URL**:
   ```
   https://your-app.vercel.app/api/discord/interactions
   ```
   Discord will verify this URL on save (your app must be deployed first).
4. **Bot** → create token → copy **Bot Token**
5. **OAuth2 → URL Generator** → scopes `bot` + `applications.commands` → invite bot to your server

### 3. Register slash commands

```bash
cp .env.example .env   # fill in credentials
npm install
npm run discord:register
```

### 4. Environment variables (Vercel)

| Variable | Description |
| --- | --- |
| `DISCORD_CLIENT_ID` | Application ID |
| `DISCORD_CLIENT_SECRET` | For website OAuth login |
| `DISCORD_BOT_TOKEN` | Bot token |
| `DISCORD_PUBLIC_KEY` | Public key (interactions verification) |
| `SESSION_SECRET` | Random string (`openssl rand -hex 32`) |
| `DATABASE_URL` | PostgreSQL connection string |

Optional: `DISCORD_GUILD_ID` for instant guild command registration during dev.

## How commands avoid errors

Every slash command is **deferred immediately** (Discord shows “Bot is thinking…”). The handler then runs DB/API work and **edits the response** with standings or match results. This uses Discord’s full processing window and avoids “This interaction failed.”

A cron job hits `/api/warm` every 5 minutes to reduce cold starts.

## Local development

```bash
npm install
cp .env.example .env
npm run dev:full       # website + API + Discord interactions on :3000
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite frontend only |
| `npm run dev:full` | Full stack via Vercel dev |
| `npm run build` | Production build |
| `npm run discord:register` | Register slash commands with Discord |
| `npm run db:push` | Push Prisma schema to database |

## Stack

- React 19 + TypeScript + Vite 6
- Vercel serverless (OAuth, Discord interactions, cron warmup)
- Prisma + PostgreSQL
- Signed cookie sessions

## Legacy standalone bot

The `bot/` folder is an optional always-on discord.js version. **Recommended:** use Vercel interactions (above). See `bot/README.md` only if you need a separate host.
