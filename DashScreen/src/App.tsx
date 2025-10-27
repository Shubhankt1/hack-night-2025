import { Card } from "./components/Card";
import { CommitsList } from "./components/CommitsLists";
import { ShoutoutsList } from "./components/ShoutoutsList";
import { Weather } from "./components/Weather";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl 2xl:text-6xl font-bold text-gray-900">
            Envoy Screens Dashboard
          </h1>
          <p className="text-gray-600 mt-2 2xl:text-2xl">
            Monitor everything here...
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 2xl:grid-cols-8 gap-6">
          {/* Commits Card */}
          <div className="md:col-span-2 lg:col-span-2 2xl:col-span-3">
            <Card title="Recent Commits">
              <CommitsList />
            </Card>
          </div>

          {/* Card 2 */}
          <div className="md:col-span-1 lg:col-span-1 2xl:col-span-3">
            <Card title="Slack Shoutouts">
              <ShoutoutsList />
            </Card>
          </div>

          {/* Card 3 */}
          <div className="md:col-span-1 lg:col-span-1 2xl:col-span-2">
            <Card title="Weather">
              <div className="text-gray-500 text-center">
                <Weather />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
