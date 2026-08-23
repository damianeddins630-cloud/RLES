# RLES Discord Bot

Rocket League competitive league bot for match reporting, standings, and player stats.

## Commands

| Command | Description |
| --- | --- |
| `/report` | Report a match — league role, home/away team roles, scores, replays, Ballchasing group |
| `/player-standings` | Top 10 players overall in a league |
| `/player-stats` | Top 10 players for a stat category (goals, assists, saves, etc.) |
| `/team-standings` | Team W/L standings grouped by conference |
| `/set-team` | Set team conference and logo URL (admin) |
| `/register-player` | Register a player for stat tracking |

### Stat categories (`/player-stats`)

Goals, Assists, Saves, Shots, Demos, Score, Matches Played

---

## Step-by-step setup

### Step 1 — Create the bot application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → name it (e.g. `RLES Bot`)
3. Open **Bot** → **Reset Token** → copy the token (save it — shown once)
4. Enable **Message Content Intent** if you add message parsing later

### Step 2 — Get application ID

1. **General Information** → copy **Application ID** (this is `DISCORD_CLIENT_ID`)

### Step 3 — Invite the bot to your server

1. **OAuth2** → **URL Generator**
2. Scopes: `bot`, `applications.commands`
3. Bot permissions: `Send Messages`, `Embed Links`, `Use Slash Commands`, `Manage Messages` (for score reporters)
4. Open the generated URL and add the bot to your league server

### Step 4 — Configure environment

```bash
cd bot
cp .env.example .env
```

Edit `.env`:

```env
DISCORD_BOT_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_server_id
DATABASE_URL="file:./dev.db"
```

`DISCORD_GUILD_ID` = right-click your server → Copy Server ID (Developer Mode on in Discord settings)

### Step 5 — Install and register commands

```bash
npm install
npm run db:push
npm run register
```

Guild commands appear instantly when `DISCORD_GUILD_ID` is set.

### Step 6 — Run the bot

```bash
npm run dev
```

You should see: `RLES bot online as RLES Bot#1234`

---

## Using `/report`

Example (matches the RSC-style channel post):

```
/report
  league: @Challenger
  home_team: @Warbirds
  away_team: @Hydras
  home_score: 4
  away_score: 0
  stage: Semifinals
  replays: https://ballchasing.com/replay/abc https://ballchasing.com/replay/def
  ballchasing_group: https://ballchasing.com/group/your-group-id
```

The bot posts in the channel with:
- Team role mentions
- Embed title: `Semifinals: Warbirds vs Hydras`
- Match summary with score
- Team logo thumbnail (set via `/set-team`)
- **Ballchasing Group** link button

## League setup workflow

1. Create Discord roles for each **league** (Challenger, Premier, etc.)
2. Create Discord roles for each **team**
3. `/set-team` — assign conferences and logo URLs
4. `/register-player` — add players to a league
5. Use `/report` for match results

## Database

SQLite by default (`bot/dev.db`). For production, switch Prisma to PostgreSQL and set `DATABASE_URL` to your hosted database — the website can share this DB later for synced standings.

## Next steps (future)

- Ballchasing API integration to auto-parse replay stats into player records
- Website API sharing the same database
- Playoff bracket commands
