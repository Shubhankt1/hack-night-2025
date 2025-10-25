import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

export function ShoutoutsList() {
  const shoutouts = useQuery(api.slack.getShoutouts, { limit: 5 });
  const triggerSync = useMutation(api.slack.triggerShoutoutSync);

  const handleSync = async () => {
    try {
      await triggerSync({});
    } catch (error) {
      console.error("Failed to sync shoutouts:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-600">#shoutouts</span>
        <button
          onClick={handleSync}
          className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition"
        >
          Sync
        </button>
      </div>

      {shoutouts === undefined ? (
        <div className="text-gray-500 text-center py-8">
          Loading shoutouts...
        </div>
      ) : shoutouts.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No shoutouts found. Click "Sync" to fetch from Slack.
        </div>
      ) : (
        <div className="space-y-3">
          {shoutouts.map((shoutout) => (
            <div
              key={shoutout._id}
              className="border border-purple-200 bg-purple-50 rounded-lg p-3 hover:border-purple-300 transition"
            >
              <div className="text-sm font-medium mb-2 text-gray-800">
                {shoutout.text}
              </div>
              <div className="flex justify-between items-center">
                <div className="text-xs text-gray-600">
                  by {shoutout.userName}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(
                    parseFloat(shoutout.timestamp) * 1000
                  ).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
