//convex/github.ts

import { v } from "convex/values";
import { Octokit } from "@octokit/rest";
import { internal } from "./_generated/api";
import {
  query,
  action,
  internalAction,
  internalMutation,
} from "./_generated/server";

// Mutation: Store commits in the database
export const storeCommits = internalMutation({
  args: {
    owner: v.string(),
    repo: v.string(),
    branch: v.string(),
    commits: v.array(
      v.object({
        sha: v.string(),
        message: v.string(),
        author: v.string(),
        date: v.string(),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Remove old commits for this repo (optional, for simplicity)
    const existing = await ctx.db
      .query("commits")
      .withIndex("by_repo", (q) =>
        q.eq("owner", args.owner).eq("repo", args.repo)
      )
      .collect();
    for (const doc of existing) {
      await ctx.db.delete(doc._id);
    }
    // Insert new commits
    for (const commit of args.commits) {
      await ctx.db.insert("commits", {
        owner: args.owner,
        repo: args.repo,
        branch: args.branch,
        ...commit,
      });
      console.log(`Stored "${commit.message}"\n`);
    }
  },
});

// Action: Fetch commits from GitHub and store them
export const fetchAndStoreCommits = internalAction({
  args: { owner: v.string(), repo: v.string(), branch: v.string() },
  handler: async (ctx, args) => {
    try {
      const octokit = new Octokit({ auth: process.env.GITHUB_ACCESS_TOKEN });
      const { data: commits } = await octokit.rest.repos.listCommits({
        owner: args.owner,
        repo: args.repo,
        per_page: 5,
        sha: args.branch,
      });

      const simplified = commits.map((c) => ({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author?.name ?? "Unknown",
        date: c.commit.author?.date ?? "--",
      }));
      await ctx.scheduler.runAfter(0, internal.github.storeCommits, {
        owner: args.owner,
        repo: args.repo,
        branch: args.branch,
        commits: simplified,
      });
      return { success: true, count: simplified.length, commits: commits };
    } catch (error) {
      console.error("Error fetching commits:", error);
      throw new Error(
        `Failed to fetch commits: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  },
});

// Query: Read cached commits from the database
export const getCommits = query({
  args: { owner: v.string(), repo: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("commits")
      .withIndex("by_repo", (q) =>
        q.eq("owner", args.owner).eq("repo", args.repo)
      )
      //   .order("desc")
      .take(5);
  },
});

// Trigger commit fetch
export const triggerCommitSync = action({
  args: { owner: v.string(), repo: v.string(), branch: v.string() },
  handler: async (ctx, args) => {
    await ctx.scheduler.runAfter(0, internal.github.fetchAndStoreCommits, {
      owner: args.owner,
      repo: args.repo,
      branch: args.branch,
    });
    return { success: true };
  },
});
