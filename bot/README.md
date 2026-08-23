# League Master System — Discord Bot

Rocket League competitive league bot for the League Master System platform. Supports **multiple leagues** per server — each league uses its own Discord role.

## Commands

| Command | Description |
| --- | --- |
| `/leagues` | List all leagues registered on this server |
| `/report` | Report a match — league role, home/away team roles, scores, replays, Ballchasing group |
| `/player-standings` | Top 10 players overall in a league |
| `/player-stats` | Top 10 players for a stat category (goals, assists, saves, etc.) |
| `/team-standings` | Team W/L standings grouped by conference |
| `/set-team` | Set team conference and logo URL (admin) |
| `/register-player` | Register a player for stat tracking |

### Stat categories (`/player-stats`)

Goals, Assists, Saves, Shots, Demos, Score, Matches Played

---

## Multi-league setup

League Master System is built for **many leagues on one platform**:

1. Create a Discord role for each league (Challenger, Premier, Open, etc.)
2. Create team roles for each league
3. When you use any command with a league role, that league is auto-registered
4. Use `/leagues` to see all leagues on your server

Each server's leagues are scoped separately — the same platform can run leagues across many Discord servers.

---

## Step-by-step setup

### Step 1 — Create the bot application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click **New Application** → name it `League Master System` or `LMS Bot`
3. Open **Bot** → **Reset Token** → copy the token
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

You should see: `League Master System bot online as LMS Bot#1234`

---

## Using `/report`

```
/report
  league: @Challenger
  home_team: @Warbirds
  away_team: @Hydras
  home_score: 4
  away_score: 0
  stage: Semifinals
  replays: https://ballchasing.com/replay/abc
  ballchasing_group: https://ballchasing.com/group/your-group-id
```

Posts team role mentions, match embed, and Ballchasing Group button.

## Database

SQLite by default (`bot/dev.db`). For production, switch Prisma to PostgreSQL — the website can share this database for synced standings across leagues.

## Next steps

- Ballchasing API integration to auto-parse replay stats
- Website dashboard per league on League Master System
- Cross-server league management
