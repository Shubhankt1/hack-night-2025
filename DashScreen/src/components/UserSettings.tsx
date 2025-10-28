// src/components/UserSettings.tsx
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import {
  X,
  Plus,
  Trash2,
  Save,
  Github,
  MessageSquare,
  User,
} from "lucide-react";

interface UserSettingsProps {
  onClose: () => void;
}

export function UserSettings({ onClose }: UserSettingsProps) {
  const settings = useQuery(api.userSettings.getUserSettings);
  const updateSettings = useMutation(api.userSettings.updateSettings);

  const [activeTab, setActiveTab] = useState<"profile" | "github" | "slack">(
    "profile"
  );
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [timezone, setTimezone] = useState("");
  const [temperatureUnit, setTemperatureUnit] = useState<
    "fahrenheit" | "celsius"
  >("fahrenheit");
  const [githubToken, setGithubToken] = useState("");
  const [githubRepos, setGithubRepos] = useState<
    Array<{
      owner: string;
      repo: string;
      branch?: string;
      displayName?: string;
    }>
  >([]);
  const [slackToken, setSlackToken] = useState("");
  const [slackChannelId, setSlackChannelId] = useState("");

  // GitHub form state
  const [newRepo, setNewRepo] = useState({
    owner: "",
    repo: "",
    branch: "",
    displayName: "",
  });

  // Initialize form when settings load
  useEffect(() => {
    if (settings) {
      setDisplayName(settings.displayName || "");
      setTimezone(settings.timezone || "");
      setTemperatureUnit(settings.temperatureUnit);
      setGithubToken(settings.github?.accessToken || "");
      setGithubRepos(settings.github?.repos || []);
      setSlackToken(settings.slack?.accessToken || "");
      setSlackChannelId(settings.slack?.channelId || "");
    }
  }, [settings]);

  if (!settings) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <div className="text-gray-600">Loading settings...</div>
        </div>
      </div>
    );
  }

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        displayName: displayName || undefined,
        timezone: timezone || undefined,
        temperatureUnit,
      });
    } catch (error) {
      console.error("Failed to save profile:", error);
      alert(error instanceof Error ? error.message : "Failed to save profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveGithub = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        github: {
          accessToken: githubToken || undefined,
          repos: githubRepos,
        },
      });
    } catch (error) {
      console.error("Failed to save GitHub settings:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to save GitHub settings"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveSlack = async () => {
    setIsSaving(true);
    try {
      await updateSettings({
        slack: {
          accessToken: slackToken || undefined,
          channelId: slackChannelId,
        },
      });
    } catch (error) {
      console.error("Failed to save Slack settings:", error);
      alert(
        error instanceof Error ? error.message : "Failed to save Slack settings"
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGitHubRepo = () => {
    if (!newRepo.owner || !newRepo.repo) {
      alert("Owner and Repo are required");
      return;
    }

    const exists = githubRepos.some(
      (r) => r.owner === newRepo.owner && r.repo === newRepo.repo
    );

    if (exists) {
      alert("Repository already added");
      return;
    }

    setGithubRepos([
      ...githubRepos,
      {
        owner: newRepo.owner,
        repo: newRepo.repo,
        branch: newRepo.branch || undefined,
        displayName: newRepo.displayName || undefined,
      },
    ]);

    setNewRepo({ owner: "", repo: "", branch: "", displayName: "" });
  };

  const handleRemoveRepo = (owner: string, repo: string) => {
    setGithubRepos(
      githubRepos.filter((r) => !(r.owner === owner && r.repo === repo))
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b bg-white">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === "profile"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("github")}
            className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === "github"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <Github className="w-4 h-4" />
            GitHub
          </button>
          <button
            onClick={() => setActiveTab("slack")}
            className={`px-6 py-3 font-medium transition flex items-center gap-2 ${
              activeTab === "slack"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Slack
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Profile Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timezone
                    </label>
                    <input
                      type="text"
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="America/New_York"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      e.g., America/New_York, Europe/London, Asia/Tokyo
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature Unit
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="fahrenheit"
                          checked={temperatureUnit === "fahrenheit"}
                          onChange={(e) =>
                            setTemperatureUnit(e.target.value as "fahrenheit")
                          }
                          className="mr-2"
                        />
                        <span>Fahrenheit (°F)</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          value="celsius"
                          checked={temperatureUnit === "celsius"}
                          onChange={(e) =>
                            setTemperatureUnit(e.target.value as "celsius")
                          }
                          className="mr-2"
                        />
                        <span>Celsius (°C)</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="flex text-sm items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          )}

          {/* GitHub Tab */}
          {activeTab === "github" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  GitHub Configuration
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure your GitHub access token and repositories to monitor
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Personal Access Token
                      <span className="text-gray-500 font-normal ml-2">
                        (Optional - uses ENV token if blank)
                      </span>
                    </label>
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="ghp_xxxxxxxxxxxx"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank to use the default token. Get your token from{" "}
                      <a
                        href="https://github.com/settings/tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        GitHub Settings
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Repositories
                </h3>

                {/* Existing Repos */}
                {githubRepos.length > 0 ? (
                  <div className="space-y-2 mb-6">
                    {githubRepos.map((repo, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {repo.displayName || `${repo.owner}/${repo.repo}`}
                          </div>
                          <div className="text-sm text-gray-600">
                            {repo.owner}/{repo.repo}
                            {repo.branch && (
                              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                {repo.branch}
                              </span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            handleRemoveRepo(repo.owner, repo.repo)
                          }
                          className="text-red-600 hover:text-red-800 transition p-2"
                          title="Remove repository"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300 mb-6">
                    No repositories added yet
                  </div>
                )}

                {/* Add New Repo Form */}
                <div className="border border-gray-300 rounded-lg p-4 bg-white mb-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Add Repository
                  </h4>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <input
                      type="text"
                      placeholder="Owner (e.g., facebook)"
                      value={newRepo.owner}
                      onChange={(e) =>
                        setNewRepo({ ...newRepo, owner: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Repo (e.g., react)"
                      value={newRepo.repo}
                      onChange={(e) =>
                        setNewRepo({ ...newRepo, repo: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Branch (optional)"
                      value={newRepo.branch}
                      onChange={(e) =>
                        setNewRepo({ ...newRepo, branch: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Display Name (optional)"
                      value={newRepo.displayName}
                      onChange={(e) =>
                        setNewRepo({ ...newRepo, displayName: e.target.value })
                      }
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <button
                    onClick={handleAddGitHubRepo}
                    className="flex text-sm items-center gap-2 px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-4 h-4" />
                    Add Repo
                  </button>
                </div>

                {/* Save Button */}
                <div className="pt-4 border-t">
                  <button
                    onClick={handleSaveGithub}
                    disabled={isSaving}
                    className="flex text-sm items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-700 transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save GitHub Settings"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Slack Tab */}
          {activeTab === "slack" && (
            <div className="space-y-6 max-w-2xl">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Slack Configuration
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Configure your Slack workspace and channel to monitor
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bot Token
                      <span className="text-gray-500 font-normal ml-2">
                        (Optional - uses ENV token if blank)
                      </span>
                    </label>
                    <input
                      type="password"
                      value={slackToken}
                      onChange={(e) => setSlackToken(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="xoxb-xxxxxxxxxxxx"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Leave blank to use the default token. Get your token from{" "}
                      <a
                        href="https://api.slack.com/apps"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Slack API
                      </a>
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Channel ID
                    </label>
                    <input
                      type="text"
                      value={slackChannelId}
                      onChange={(e) => setSlackChannelId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                      placeholder="C1234567890"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Find your channel ID in Slack: Right-click channel → View
                      channel details → Copy ID
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <button
                  onClick={handleSaveSlack}
                  disabled={isSaving}
                  className="flex text-sm items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-xl hover:bg-orange-700 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Saving..." : "Save Slack Settings"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
