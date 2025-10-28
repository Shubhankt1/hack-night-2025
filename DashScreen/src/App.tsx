// src/App.tsx
import { Card } from "./components/Card";
import { SignIn } from "./components/SignIn";
import { Weather } from "./components/Weather";
import { useAuthActions } from "@convex-dev/auth/react";
import { CommitsList } from "./components/CommitsLists";
import { ShoutoutsList } from "./components/ShoutoutsList";
import { UserSettings } from "./components/UserSettings";
import {
  Authenticated,
  Unauthenticated,
  useMutation,
  useQuery,
} from "convex/react";
import { Settings, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { api } from "../convex/_generated/api";
// import { api } from "../convex/_generated/api";
// import { useEffect } from "react";

function App() {
  return (
    <>
      <Unauthenticated>
        <SignIn />
      </Unauthenticated>

      <Authenticated>
        <Dashboard />
      </Authenticated>
    </>
  );
}

function Dashboard() {
  const { signOut } = useAuthActions();
  const location = useQuery(api.weather.getLatestWeather);
  const [showSettings, setShowSettings] = useState(false);

  const settings = useQuery(api.userSettings.getUserSettings);
  const initSettings = useMutation(api.userSettings.createNewUser);

  useEffect(() => {
    if (settings === null)
      initSettings({
        location: {
          latitude: location?.latitude || 0,
          longitude: location?.longitude || 0,
        },
      });
  }, [initSettings]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl lg:text-3xl 2xl:text-4xl font-bold text-gray-900">
              Welcome, {settings?.displayName || ""}
            </h1>
            <p className="text-gray-600 mt-2 lg:text-lg xl:text-xl 2xl:text-2xl">
              Monitor everything here...
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="px-3 py-3 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition flex items-center gap-2"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => signOut()}
              className="px-3 py-3 bg-red-600 text-white rounded hover:bg-red-700 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
              {/* <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg> */}
            </button>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 gap-6">
          <div className="md:col-span-2 lg:col-span-2 2xl:col-span-3">
            <Card title="Recent Commits">
              <CommitsList />
            </Card>
          </div>

          <div className="md:col-span-1 lg:col-span-1 2xl:col-span-3">
            <Card title="Slack Shoutouts">
              <ShoutoutsList />
            </Card>
          </div>

          <div className="md:col-span-1 lg:col-span-1 2xl:col-span-2">
            <Card title="Weather">
              <Weather />
            </Card>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <UserSettings onClose={() => setShowSettings(false)} />
        )}
      </div>
    </div>
  );
}

export default App;
