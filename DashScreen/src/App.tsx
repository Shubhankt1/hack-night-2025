// src/App.tsx
import { Card } from "./components/Card";
import { SignIn } from "./components/SignIn";
import { Weather } from "./components/Weather";
import { useAuthActions } from "@convex-dev/auth/react";
import { CommitsList } from "./components/CommitsLists";
import { ShoutoutsList } from "./components/ShoutoutsList";
import { Authenticated, Unauthenticated } from "convex/react";

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl lg:text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-900">
              Envoy Screens Dashboard
            </h1>
            <p className="text-gray-600 mt-2 lg:text-lg xl:text-xl 2xl:text-2xl">
              Monitor everything here...
            </p>
          </div>
          <button
            onClick={() => signOut()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Sign Out
          </button>
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
      </div>
    </div>
  );
}

export default App;
