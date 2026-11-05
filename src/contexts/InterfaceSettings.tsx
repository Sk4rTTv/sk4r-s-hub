import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";
import "@/interface-settings.css";

interface InterfaceSettingsValue {
  textSize: number;
  guiSize: number;
  setTextSize: (value: number) => void;
  setGuiSize: (value: number) => void;
  reset: () => void;
}
const InterfaceSettingsContext = createContext<InterfaceSettingsValue | null>(null);

export function InterfaceSettingsProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSize] = useState(100);
  const [guiSize, setGuiSize] = useState(100);
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--text-scale", String(textSize / 100));
    root.style.setProperty("--gui-scale", String(guiSize / 100));
    root.dataset.largeText = String(textSize > 100);
    return () => {
      root.style.removeProperty("--text-scale");
      root.style.removeProperty("--gui-scale");
      delete root.dataset.largeText;
    };
  }, [textSize, guiSize]);

  return <InterfaceSettingsContext.Provider value={{ textSize, guiSize, setTextSize, setGuiSize, reset: () => { setTextSize(100); setGuiSize(100); } }}>{children}</InterfaceSettingsContext.Provider>;
}

export function useInterfaceSettings() {
  const settings = useContext(InterfaceSettingsContext);
  if (!settings) throw new Error("Interface settings require their provider.");
  return settings;
}
