import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  ...authTables,

  // ===== USER SETTINGS (Unified) =====
  userSettings: defineTable({
    userId: v.string(),

    // Profile
    displayName: v.optional(v.string()),
    timezone: v.optional(v.string()),

    // Display Preferences
    theme: v.optional(
      v.union(v.literal("light"), v.literal("dark"), v.literal("auto"))
    ),
    temperatureUnit: v.union(v.literal("fahrenheit"), v.literal("celsius")),

    // Location (for weather)
    location: v.optional(
      v.object({
        latitude: v.number(),
        longitude: v.number(),
        locationName: v.optional(v.string()),
      })
    ),

    // GitHub Settings
    github: v.optional(
      v.object({
        accessToken: v.optional(v.string()), // User's personal token - Blank to use ENV var
        repos: v.array(
          v.object({
            owner: v.string(),
            repo: v.string(),
            branch: v.optional(v.string()), // null = default branch
            displayName: v.optional(v.string()), // Custom nickname
          })
        ),
      })
    ),

    // Slack Settings
    slack: v.optional(
      v.object({
        accessToken: v.optional(v.string()), // User's token
        channelId: v.optional(v.string()),
      })
    ),

    // TODO: Widget Visibility
    // widgets: v.optional(
    //   v.object({
    //     github: v.boolean(),
    //     slack: v.boolean(),
    //     weather: v.boolean(),
    //   })
    // ),

    // Metadata
    // createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

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

  weather: defineTable({
    location: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    temperature: v.number(),
    feelsLike: v.number(),
    description: v.string(),
    humidity: v.number(),
    windSpeed: v.number(),
    precipitation: v.number(),
    timestamp: v.number(),
    // Forecast data (next 3 days)
    forecast: v.array(
      v.object({
        date: v.string(),
        maxTemp: v.number(),
        minTemp: v.number(),
        precipitation: v.number(),
        weatherCode: v.number(),
      })
    ),
  }).index("by_location", ["location"]),
});
