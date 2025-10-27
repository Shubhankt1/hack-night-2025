import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  ...authTables,
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
