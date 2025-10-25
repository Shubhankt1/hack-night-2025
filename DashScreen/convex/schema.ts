import { v } from "convex/values";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  commits: defineTable({
    owner: v.string(),
    repo: v.string(),
    branch: v.string(),
    sha: v.string(),
    message: v.string(),
    author: v.string(),
    date: v.string(),
  }).index("by_repo", ["owner", "repo"]),

  shoutouts: defineTable({
    text: v.string(),
    user: v.string(),
    userName: v.string(),
    timestamp: v.string(),
    channelId: v.string(),
  }).index("by_timestamp", ["timestamp"]),
});
