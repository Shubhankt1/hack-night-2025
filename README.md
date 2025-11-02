<img src="./_assets/banner.png" style="border-radius: 10px" />

### What's the goal?

Build an app for Screens, Envoy's upcoming digital signage platform.

### Where to start?

1. Make sure you have a GitHub account (https://github.com/signup)
2. Fork this repository (https://github.com/envoy/hack-night-2025/fork)
3. Fill in the team/app form below
4. Start hacking!

### Rules

- You have only 2 hours to build the entire app
- You can use any technology, frameworks, etc. you're comfortable with
- You may use AI to assist you, but remember you'll be graded on quality
- Bonus points for leveraging a hardware API (camera, flashlight, etc.)

<br/>

---

<br/>

### Team name

<!-- Team name -->

### Team members

1. \_<!-- Team member -->
2. \_<!-- Team member (optional) -->
3. \_<!-- Team member (optional) -->

# Envoy Screens Dashboard

A real-time monitoring dashboard built for Envoy Screens, displaying GitHub commits, Slack shoutouts, and weather forecasts.

## Prerequisites

- Node.js (v18 or higher)
- npm or pnpm
- GitHub account (for OAuth)
- Slack workspace access (optional)
- Convex account

## Installation

1. **Clone the repository**

```bash
   git clone <your-repo-url>
   cd envoy-screens-dashboard
```

2. **Install dependencies**

```bash
   npm install
```

3. **Set up Convex**

```bash
   npx convex dev
```

- Follow the prompts to create a new Convex project
- This will create a `.env.local` file with `VITE_CONVEX_URL`

4. **Configure Google OAuth**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth credentials
   - Add authorized redirect URIs:
     - `http://localhost:5173/api/auth/callback/google`
     - `https://your-deployment.convex.site/api/auth/callback/google`
   - Add environment variables in Convex Dashboard:

```
     AUTH_GOOGLE_ID=your-google-client-id
     AUTH_GOOGLE_SECRET=your-google-client-secret
     SITE_URL=http://localhost:5173
```

5. **Configure GitHub API** (in Convex Dashboard)

```
   GITHUB_ACCESS_TOKEN=your-github-token
```

6. **Configure Slack API** (in Convex Dashboard)

```
   SLACK_BOT_TOKEN=xoxb-your-token
   SLACK_CHANNEL_ID=C1234567890
```

## Running Development Server

1. **Start Convex backend**

```bash
   npm run dev:backend
```

2. **Start frontend (in another terminal)**

```bash
   npm run dev:frontend
```

3. **Or run both together**

```bash
   npm run dev
```

4. **Open your browser**

```
   http://localhost:5173
```

## Building for Production

```bash
npm run build
```

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Convex (database, auth, serverless functions, cron jobs)
- **APIs**: GitHub API, Slack API, Open-Meteo Weather API
- **Auth**: Convex Auth with Google OAuth

## Features

- ✅ Real-time GitHub commit monitoring
- ✅ Slack shoutouts from team channels
- ✅ Weather forecasts with 3-day outlook
- ✅ User authentication with Google
- ✅ Customizable settings per user
- ✅ Automatic data syncing via cron jobs

## Environment Variables

Create these in the Convex Dashboard (Settings → Environment Variables):

| Variable              | Description                                   |
| --------------------- | --------------------------------------------- |
| `AUTH_GOOGLE_ID`      | Google OAuth Client ID                        |
| `AUTH_GOOGLE_SECRET`  | Google OAuth Client Secret                    |
| `SITE_URL`            | Your site URL (http://localhost:5173 for dev) |
| `GITHUB_ACCESS_TOKEN` | GitHub Personal Access Token                  |
| `SLACK_BOT_TOKEN`     | Slack Bot User OAuth Token                    |
| `SLACK_CHANNEL_ID`    | Slack Channel ID to monitor                   |
