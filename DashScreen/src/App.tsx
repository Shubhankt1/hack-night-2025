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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 relative overflow-hidden">
      {/* Spiderweb PNG in top-right corner */}
      <img
        src="/spiderweb.png"
        alt=""
        className="absolute top-0 left-0 w-[50%] opacity-20 pointer-events-none"
      />

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Header */}
        <header className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-2xl lg:text-3xl 2xl:text-4xl font-bold text-orange-600">
              🎃 Welcome, {settings?.displayName || ""} 👻
            </h1>
            <p className="text-gray-700 mt-2 lg:text-lg xl:text-xl 2xl:text-2xl">
              Monitor everything here... if you dare 🦇
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(true)}
              className="px-3 py-3 bg-white text-orange-600 rounded hover:bg-orange-50 transition border-2 border-orange-500"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => signOut()}
              className="px-3 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
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
