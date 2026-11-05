import { EmulationAppList } from "@/components/EmulationAppList";
import { AddEmulationApp } from "@/components/AddEmulationApp";
import { EmulationApp } from "@/types/emulation";
import { SAMPLE_APPS } from "@/data/apps";
import { Plus, Star, Gamepad2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RetroBackdrop } from "@/components/RetroBackdrop";
import "@/retro.css";

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
    <div className="retro-world relative min-h-screen overflow-x-hidden pb-24 text-white">
      <RetroBackdrop />
      <header className="relative z-10 mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5 py-6 sm:px-8">
        <div className="flex items-center gap-3">
          <Gamepad2 className="h-9 w-9 text-[var(--retro-gold)]" />
          <span className="retro-hud text-lg">EmuHub 64</span>
        </div>
        <div className="retro-hud flex items-center gap-2 text-lg">
          <Star className="h-7 w-7 fill-[var(--retro-gold)] text-[var(--retro-gold)]" />
          <span>× {String(apps.length).padStart(2, "0")}</span>
          <span className="ml-2 text-xs tracking-widest">GAMES</span>
        </div>
      </header>
      <section className="relative z-10 mx-auto max-w-6xl px-5 pb-8 pt-5 text-center sm:pt-8">
        <p className="retro-hud mb-4 text-xs tracking-[.25em]">YOUR NEXT ADVENTURE STARTS HERE</p>
        <h1 aria-label="EmuHub" className="retro-title text-6xl sm:text-8xl">
          {"EmuHub".split("").map((letter, i) => <span key={i} style={{ color: ["var(--retro-red)", "var(--retro-gold)", "#65c649", "#fff4d6", "var(--retro-red)", "var(--retro-gold)"][i], transform: `rotate(${i % 2 ? 4 : -4}deg)` }}>{letter}</span>)}
          <span className="ml-3 text-4xl text-[var(--retro-gold)] sm:text-6xl">64</span>
        </h1>
        <p className="retro-hud mt-5 text-lg">Choose your adventure.</p>
        <Button onClick={() => setShowAddForm(true)} className="retro-button mt-6 h-12 rounded-xl px-7 text-base">
          <Plus className="mr-2 h-5 w-5" /> Add Game
        </Button>
      </section>
      <main className="relative z-10 mx-auto max-w-6xl p-4 sm:px-8">
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