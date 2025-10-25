import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "refresh commits",
  { minuteUTC: 0 },
  internal.github.fetchAndStoreCommits,
  { owner: "Shubhankt1", repo: "shubhankt1.github.io", branch: "migrate" }
);

// Sync Slack shoutouts every minute
crons.interval(
  "sync-slack-shoutouts",
  { minutes: 1 },
  internal.slackActions.fetchAndStoreShoutouts,
  { limit: 10 }
);

export default crons;
