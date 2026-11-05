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
      <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden relative">
        {/* Wii Background Pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-blue-900/20 via-transparent to-purple-900/20" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, rgba(255, 85, 34, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 188, 212, 0.1) 0%, transparent 50%)`
          }} />
        </div>
        
        {/* Header */}
        <header className="border-b border-white/10 py-6 relative z-10">
          <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500 p-0.5 animate-pulse">
                  <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">W</span>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-900 animate-bounce" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400 bg-clip-text text-transparent">
                  EmuHub
                </h1>
                <p className="text-white/50 text-sm">Your Wii-Style Emulation Library</p>
              </div>
            </div>
  
            <Button
              variant="outline"
              onClick={() => setShowAddForm(true)}
              className="rounded-xl px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 border-white/20 text-white shadow-lg hover:shadow-xl transition-all duration-300"
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