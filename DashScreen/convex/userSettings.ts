// convex/userSettings.ts
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internalMutation, mutation, query } from "./_generated/server";

// Get user settings (or create default)
export const getUserSettings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    // Create default settings if doesn't exist
    if (settings === null) {
      return null;
    }

    return settings;
  },
});

export const createNewUser = mutation({
  args: {
    displayName: v.optional(v.string()),
    timezone: v.optional(v.string()),
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("auto"))
    ),
    temperatureUnit: v.optional(
      v.union(v.literal("fahrenheit"), v.literal("celsius"))
    ),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      locationName: v.optional(v.string()),
    }),
    github: v.optional(
      v.object({
        accessToken: v.optional(v.string()),
        repos: v.array(
          v.object({
            owner: v.string(),
            repo: v.string(),
            branch: v.optional(v.string()),
            displayName: v.optional(v.string()),
          })
        ),
      })
    ),
    slack: v.optional(
      v.object({
        accessToken: v.optional(v.string()),
        channelId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }
    await ctx.scheduler.runAfter(0, internal.userSettings.createUserSettings, {
      userId: userId,
      displayName: args.displayName ?? `User_${userId}`,
      location: args.location,
    });
  },
});

export const createUserSettings = internalMutation({
  args: {
    userId: v.string(),
    displayName: v.string(),
    timezone: v.optional(v.string()),
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("auto"))
    ),
    temperatureUnit: v.optional(
      v.union(v.literal("fahrenheit"), v.literal("celsius"))
    ),
    location: v.object({
      latitude: v.number(),
      longitude: v.number(),
      locationName: v.optional(v.string()),
    }),
    github: v.optional(
      v.object({
        accessToken: v.optional(v.string()),
        repos: v.array(
          v.object({
            owner: v.string(),
            repo: v.string(),
            branch: v.optional(v.string()),
            displayName: v.optional(v.string()),
          })
        ),
      })
    ),
    slack: v.optional(
      v.object({
        accessToken: v.optional(v.string()),
        channelId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const exists = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();
    if (exists) {
      throw new Error("User settings already exist");
    }

    const settingsId = await ctx.db.insert("userSettings", {
      userId: args.userId,
      displayName: args.displayName,
      timezone: args.timezone ?? "",
      theme: args.theme ?? "light",
      temperatureUnit: args.temperatureUnit ?? "fahrenheit",
      location: args.location,
      github: args.github ?? { repos: [] },
      slack: args.slack ?? {
        accessToken: process.env.SLACK_BOT_TOKEN || "",
        channelId: process.env.SLACK_CHANNEL_ID || "",
      },
      updatedAt: Date.now(),
    });

    return { success: true, settingsId: settingsId };
  },
});

// Update user settings (one function for everything)
export const updateSettings = mutation({
  args: {
    // Profile
    displayName: v.optional(v.string()),
    timezone: v.optional(v.string()),

    // Display Preferences
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("auto"))
    ),
    temperatureUnit: v.optional(
      v.union(v.literal("fahrenheit"), v.literal("celsius"))
    ),

    // Location
    location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        locationName: v.string(),
      })
    ),

    // GitHub Settings
    github: v.optional(
      v.object({
        accessToken: v.optional(v.string()),
        repos: v.array(
          v.object({
            owner: v.string(),
            repo: v.string(),
            branch: v.optional(v.string()),
            displayName: v.optional(v.string()),
          })
        ),
      })
    ),

    // Slack Settings
    slack: v.optional(
      v.object({
        accessToken: v.optional(v.string()),
        channelId: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const settings = await ctx.db
      .query("userSettings")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!settings) {
      throw new Error("Settings not found");
    }

    // Build update object with only provided fields
    const updates: any = { updatedAt: Date.now() };

    if (args.displayName !== undefined) updates.displayName = args.displayName;
    if (args.timezone !== undefined) updates.timezone = args.timezone;
    if (args.theme !== undefined) updates.theme = args.theme;
    if (args.temperatureUnit !== undefined)
      updates.temperatureUnit = args.temperatureUnit;
    if (args.location !== undefined) updates.location = args.location;
    if (args.github !== undefined) updates.github = args.github;
    if (args.slack !== undefined) updates.slack = args.slack;

    await ctx.db.patch(settings._id, updates);

    return { success: true };
  },
});

// Helper mutations for common operations (optional convenience functions)

// Add a GitHub repo (convenience function)
// export const addGitHubRepo = mutation({
//   args: {
//     owner: v.string(),
//     repo: v.string(),
//     branch: v.optional(v.string()),
//     displayName: v.optional(v.string()),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     const settings = await ctx.db
//       .query("userSettings")
//       .withIndex("by_user", (q) => q.eq("userId", userId))
//       .first();

//     if (!settings) {
//       throw new Error("Settings not found");
//     }

//     const currentRepos = settings.github?.repos || [];

//     // Check if repo already exists
//     const exists = currentRepos.some(
//       (r) => r.owner === args.owner && r.repo === args.repo
//     );

//     if (exists) {
//       throw new Error("Repository already added");
//     }

//     await ctx.db.patch(settings._id, {
//       github: {
//         accessToken: settings.github?.accessToken,
//         repos: [
//           ...currentRepos,
//           {
//             owner: args.owner,
//             repo: args.repo,
//             branch: args.branch,
//             displayName: args.displayName,
//           },
//         ],
//       },
//       updatedAt: Date.now(),
//     });

//     return { success: true };
//   },
// });

// Remove a GitHub repo (convenience function)
// export const removeGitHubRepo = mutation({
//   args: {
//     owner: v.string(),
//     repo: v.string(),
//   },
//   handler: async (ctx, args) => {
//     const userId = await getAuthUserId(ctx);
//     if (!userId) {
//       throw new Error("Not authenticated");
//     }

//     const settings = await ctx.db
//       .query("userSettings")
//       .withIndex("by_user", (q) => q.eq("userId", userId))
//       .first();

//     if (!settings) {
//       throw new Error("Settings not found");
//     }

//     const currentRepos = settings.github?.repos || [];
//     const filteredRepos = currentRepos.filter(
//       (r) => !(r.owner === args.owner && r.repo === args.repo)
//     );

//     await ctx.db.patch(settings._id, {
//       github: {
//         accessToken: settings.github?.accessToken,
//         repos: filteredRepos,
//       },
//       updatedAt: Date.now(),
//     });

//     return { success: true };
//   },
// });
