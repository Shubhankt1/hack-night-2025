import { v } from "convex/values";
import { internal } from "./_generated/api";
import { internalMutation, mutation, query } from "./_generated/server";

// Internal Mutation: Store shoutouts in the database
export const storeShoutouts = internalMutation({
  args: {
    channelId: v.string(),
    shoutouts: v.array(
      v.object({
        text: v.string(),
        user: v.string(),
        userName: v.string(),
        timestamp: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Remove old shoutouts for this channel
    const existing = await ctx.db
      .query("shoutouts")
      .withIndex("by_timestamp")
      .collect();

    for (const doc of existing) {
      if (doc.channelId === args.channelId) {
        await ctx.db.delete(doc._id);
      }
    }

    // Insert new shoutouts
    for (const shoutout of args.shoutouts) {
      await ctx.db.insert("shoutouts", {
        channelId: args.channelId,
        ...shoutout,
      });
    }

    return { inserted: args.shoutouts.length };
  },
});

// Public Mutation: Trigger shoutout fetching (called from client)
export const triggerShoutoutSync = mutation({
  args: {
    channelId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(
      0,
      internal.slackActions.fetchAndStoreShoutouts,
      {
        channelId: args.channelId,
      }
    );

    return { scheduled: true };
  },
});

// Query: Read cached shoutouts from the database
export const getShoutouts = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("shoutouts")
      .withIndex("by_timestamp")
      .order("desc")
      .take(args.limit ?? 10);
  },
});
