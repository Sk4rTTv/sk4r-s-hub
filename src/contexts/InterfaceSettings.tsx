import { createContext, useContext, useLayoutEffect, useState, type ReactNode } from "react";
import { uiThemes, readableText, readableAccent, type UiColors } from "@/lib/ui-colors";
import "@/interface-settings.css";
import "@/ui-colors.css";
import "@/crt-effects.css";

interface InterfaceSettingsValue {
  textSize: number;
  guiSize: number;
  crtEnabled: boolean;
  setCrtEnabled: (enabled: boolean) => void;
  colors: UiColors;
  setColors: (colors: UiColors) => void;
  resetColors: () => void;
  setTextSize: (value: number) => void;
  setGuiSize: (value: number) => void;
  reset: () => void;
}
const InterfaceSettingsContext = createContext<InterfaceSettingsValue | null>(null);

export function InterfaceSettingsProvider({ children }: { children: ReactNode }) {
  const [textSize, setTextSize] = useState(100);
  const [guiSize, setGuiSize] = useState(100);
  const [crtEnabled, setCrtEnabled] = useState(false);
  const [colors, updateColors] = useState<UiColors>(uiThemes[0].colors);
  const setColors = (value: UiColors) => {
    if (Object.values(value).every(color => /^#[0-9a-f]{6}$/i.test(color))) updateColors(value);
  };
  useLayoutEffect(() => {
    document.documentElement.dataset.crtEnabled = String(crtEnabled);
    return () => { delete document.documentElement.dataset.crtEnabled; };
  }, [crtEnabled]);
  useLayoutEffect(() => {
    const root = document.documentElement;
    const variables = {
      "--ui-background": colors.background,
      "--ui-panel": colors.panel,
      "--ui-text": readableText(colors.panel),
      "--ui-background-text": readableText(colors.background),
      "--ui-accent": colors.accent,
      "--ui-accent-text": readableText(colors.accent),
      "--ui-highlight": readableAccent(colors),
      "--retro-gold": colors.accent,
    };
    for (const [name, value] of Object.entries(variables)) root.style.setProperty(name, value);
    return () => { for (const name of Object.keys(variables)) root.style.removeProperty(name); };
  }, [colors]);
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

  return <InterfaceSettingsContext.Provider value={{ textSize, guiSize, crtEnabled, setCrtEnabled, colors, setColors, resetColors: () => updateColors(uiThemes[0].colors), setTextSize, setGuiSize, reset: () => { setTextSize(100); setGuiSize(100); } }}>{children}</InterfaceSettingsContext.Provider>;
}

export function useInterfaceSettings() {
  const settings = useContext(InterfaceSettingsContext);
  if (!settings) throw new Error("Interface settings require their provider.");
  return settings;
}
