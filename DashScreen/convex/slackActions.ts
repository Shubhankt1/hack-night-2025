"use node";

import { v } from "convex/values";
import { WebClient } from "@slack/web-api";
import { internal } from "./_generated/api";
import { internalAction } from "./_generated/server";

// Helper function to convert Slack message format to readable text
async function parseSlackMessage(
  text: string,
  slack: WebClient
): Promise<string> {
  let parsed = text;

  // Replace user mentions: <@U12345> -> @Username
  const userMentions = text.match(/<@([A-Z0-9]+)>/g);
  if (userMentions) {
    for (const mention of userMentions) {
      const userId = mention.replace(/<@|>/g, "");
      try {
        const userInfo = await slack.users.info({ user: userId });
        const displayName =
          userInfo.user?.real_name || userInfo.user?.name || userId;
        parsed = parsed.replace(mention, `@${displayName}`);
      } catch (error) {
        console.error("Failed to resolve user mention:", error);
        parsed = parsed.replace(mention, "@Unknown");
      }
    }
  }

  // Replace emoji codes: :tada: -> 🎉
  const emojiMap: Record<string, string> = {
    tada: "🎉",
    clap: "👏",
    fire: "🔥",
    heart: "❤️",
    star: "⭐",
    rocket: "🚀",
    thumbsup: "👍",
    raised_hands: "🙌",
    "100": "💯",
    muscle: "💪",
    pray: "🙏",
    sparkles: "✨",
    eyes: "👀",
    wave: "👋",
    smile: "😊",
    joy: "😂",
    "+1": "👍",
    "-1": "👎",
  };

  // Replace :emoji_code: with actual emoji
  parsed = parsed.replace(/:([a-z0-9_+-]+):/g, (match, emojiCode) => {
    return emojiMap[emojiCode] || ""; // Keep original if not in map
  });

  // Replace channel mentions: <#C12345|channel-name> -> #channel-name
  parsed = parsed.replace(/<#[A-Z0-9]+\|([^>]+)>/g, "#$1");

  // Replace links: <https://example.com|example.com> -> example.com
  parsed = parsed.replace(/<(https?:\/\/[^|>]+)\|([^>]+)>/g, "$2");

  // Replace plain links: <https://example.com> -> https://example.com
  parsed = parsed.replace(/<(https?:\/\/[^>]+)>/g, "$1");

  return parsed;
}

export const fetchAndStoreShoutouts = internalAction({
  args: {
    channelId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    try {
      const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
      const channelId = args.channelId ?? process.env.SLACK_CHANNEL_ID;

      if (!channelId) {
        throw new Error("Channel ID not provided");
      }

      const result = await slack.conversations.history({
        channel: channelId,
        limit: args.limit ?? 10,
      });

      if (!result.messages) {
        throw new Error("No messages found");
      }

      //   console.log(result);

      const shoutouts = await Promise.all(
        result.messages
          .filter((msg) => msg.text && msg.user && !msg.subtype)
          .map(async (msg) => {
            let userName = "Unknown";
            try {
              const userInfo = await slack.users.info({ user: msg.user! });
              userName =
                userInfo.user?.real_name || userInfo.user?.name || "Unknown";
            } catch (error) {
              console.error("Failed to get user info:", error);
            }

            // Parse the message to convert Slack format to readable text
            const parsedText = await parseSlackMessage(msg.text!, slack);

            return {
              text: parsedText,
              user: msg.user!,
              userName,
              timestamp: msg.ts!,
            };
          })
      );

      await ctx.scheduler.runAfter(0, internal.slack.storeShoutouts, {
        channelId,
        shoutouts,
      });

      return { success: true, count: shoutouts.length };
    } catch (error) {
      console.error("Slack API error:", error);
      throw new Error(
        `Failed to fetch shoutouts: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});
