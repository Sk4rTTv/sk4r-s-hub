import { EmulationApp, SYSTEMS } from "../types/emulation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X, Palette, Gamepad2 } from "lucide-react";

interface AddEmulationAppProps {
  onAdd: (app: Omit<EmulationApp, "id">) => void;
  onClose: () => void;
}

export const AddEmulationApp = ({ onAdd, onClose }: AddEmulationAppProps) => {
  const [name, setName] = useState("");
  const [system, setSystem] = useState("");
  const [icon, setIcon] = useState("🎮");
  const [color, setColor] = useState("#00A0E8");
  const [status, setStatus] = useState<EmulationApp["status"]>("installed");
  const [lastPlayed, setLastPlayed] = useState("");
  const [playtimeHours, setPlaytimeHours] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !system) return;

    onAdd({
      name,
      system,
      icon,
      color,
      status,
      lastPlayed: lastPlayed || undefined,
      playtimeHours: playtimeHours ? parseInt(playtimeHours, 10) : undefined,
    });
  };

  const presetColors = [
    "#00A0E8",
    "#FF5722",
    "#FFB300",
    "#9C27B0",
    "#00BCD4",
    "#F44336",
    "#607D8B",
    "#4CAF50",
    "#795548",
    "#E91E63",
    "#3F51B5",
    "#009688",
  ];

  return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/20 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-gradient-to-r from-red-500 via-blue-500 to-purple-600 p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-white text-xl font-bold flex items-center gap-2">
                <Gamepad2 className="h-5 w-5" />
                Add Emulation App
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </button>
            </div>
          </div>
  
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Game Name</Label>
              <Input
                placeholder="e.g. Super Mario World"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-xl"
              />
            </div>
  
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">System</Label>
              <Select value={system} onValueChange={setSystem}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Select system..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {SYSTEMS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
  
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Icon</Label>
              <Input
                placeholder="🎮"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="rounded-xl text-2xl"
              />
            </div>
  
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Color Theme</Label>
              <div className="flex flex-wrap gap-2">
                {presetColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full border-2 transition-all ${
                      color === c ? "ring-2 ring-blue-500 scale-110" : "border-transparent hover:scale-105"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
                <button
                  type="button"
                  onClick={() => {
                    const input = document.createElement("input");
                    input.type = "color";
                    input.value = color;
                    input.onchange = (e) => setColor((e.target as HTMLInputElement).value);
                    input.click();
                  }}
                  className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-105 transition-all flex items-center justify-center"
                  title="Custom color"
                >
                  <Palette className="h-4 w-4" />
                </button>
              </div>
            </div>
  
            <div className="space-y-2">
              <Label className="text-gray-700 font-medium">Status</Label>
              <div className="flex gap-2">
                {["installed", "not-installed", "favorite"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s as EmulationApp["status"])}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all ${
                      status === s
                        ? "bg-gradient-to-r from-red-500 to-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1).replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Last Played</Label>
                <Input
                  type="text"
                  placeholder="e.g. 2 hours ago"
                  value={lastPlayed}
                  onChange={(e) => setLastPlayed(e.target.value)}
                  className="rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Playtime (hours)</Label>
                <Input
                  type="number"
                  placeholder="0"
                  value={playtimeHours}
                  onChange={(e) => setPlaytimeHours(e.target.value)}
                  className="rounded-xl"
                />
              </div>
            </div>
  
            <div className="pt-4 flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-red-500 to-blue-600 hover:from-red-600 hover:to-blue-700 text-white rounded-xl shadow-lg"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Game
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  };