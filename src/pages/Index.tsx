import { EmulationAppList } from "@/components/EmulationAppList";
import { AddEmulationApp } from "@/components/AddEmulationApp";
import { EmulationApp } from "@/types/emulation";
import { SAMPLE_APPS } from "@/data/apps";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [apps, setApps] = useState<EmulationApp[]>(SAMPLE_APPS);

  const handleAddApp = (newApp: Omit<EmulationApp, "id">) => {
    setApps((prev) => [...prev, { ...newApp, id: Date.now().toString() }]);
  };

  const handleEdit = (app: EmulationApp) => {
    // In a full app, this would open an edit form
    alert(`Edit mode for ${app.name} - coming soon!`);
  };

  const handleDelete = (id: string) => {
    setApps((prev) => prev.filter((app) => app.id !== id));
  };

  const handlePlay = (app: EmulationApp) => {
    alert(`Playing ${app.name} on ${app.system}!`);
  };

  const handleToggleFavorite = (app: EmulationApp) => {
    setApps((prev) =>
      prev.map((a) =>
        a.id === app.id ? { ...a, status: a.status === "favorite" ? "installed" : "favorite" } : a
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Header */}
      <header className="border-b border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg"
            >
              EH
            </div>
            <div>
              <h1 className="text-2xl font-bold">EmuHub</h1>
              <p className="text-white/50 text-sm">Your Emulation Library</p>
            </div>
          </div>

          <Button
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="rounded-xl px-4 py-2 text-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Game
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6">
        <EmulationAppList
          apps={apps}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onPlay={handlePlay}
          onToggleFavorite={handleToggleFavorite}
        />
      </main>

      {/* Add Form */}
      {showAddForm && (
        <AddEmulationApp
          onAdd={handleAddApp}
          onClose={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
};

export default Index;