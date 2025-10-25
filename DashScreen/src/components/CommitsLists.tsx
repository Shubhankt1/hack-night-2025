// src/components/CommitsList.tsx
import { useQuery, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";

export function CommitsList() {
  const owner = "Shubhankt1";
  const repo = "shubhankt1.github.io";
  const branch = "migrate";

  const commits = useQuery(api.github.getCommits, { owner, repo });
  const triggerSync = useAction(api.github.triggerCommitSync);

  const handleSync = async () => {
    try {
      await triggerSync({ owner, repo, branch });
    } catch (error) {
      console.error("Failed to sync commits:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">
          {owner}/{repo} ({branch})
        </span>
        <button
          onClick={handleSync}
          className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition"
        >
          Sync
        </button>
      </div>

      {commits === undefined ? (
        <div className="text-gray-500 text-center py-8">Loading commits...</div>
      ) : commits.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No commits found. Click "Sync" to fetch from GitHub.
        </div>
      ) : (
        <div className="space-y-3">
          {commits.map((commit) => (
            <div
              key={commit._id}
              className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="font-mono text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {commit.sha.substring(0, 7)}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(commit.date).toLocaleDateString()}
                </div>
              </div>
              <div className="flex items-start gap-2">
                <div className="text-sm font-medium mb-1 text-gray-800">
                  {commit.message}
                </div>
                <div className="font-mono text-xs text-gray-500 bg-sky-200 px-2 py-[2px] rounded whitespace-nowrap">
                  {commit.branch}
                </div>
              </div>
              <div className="text-xs text-gray-600">by {commit.author}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
