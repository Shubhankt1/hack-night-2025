import { Card } from "./components/Card";
import { CommitsList } from "./components/CommitsLists";

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl lg:text-5xl font-bold text-gray-900">
            Envoy Screens Dashboard
          </h1>
          <p className="text-gray-600 mt-2 lg:text-lg ">
            Monitor everything here...
          </p>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-8 gap-6">
          {/* Commits Card - Takes 2 columns on large screens */}
          <div className="lg:col-span-4">
            <Card title="Recent Commits">
              <CommitsList />
            </Card>
          </div>

          {/* Placeholder for more cards */}
          <div className="lg:col-span-2">
            <Card title="Pull Requests">
              <div className="text-gray-500 text-center py-8">
                Coming soon...
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card title="Pull Requests">
              <div className="text-gray-500 text-center py-8">
                Coming soon...
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
