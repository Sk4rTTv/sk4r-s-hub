import { useEffect, useRef, useState } from "react";
import type { LibraryMetadata, ScannerEntry, ScannerState } from "@/types/library-scanner";

export function useLibraryScanner(onEntries: (entries: ScannerEntry[]) => void, onMetadata: (id: string, kind: "apps" | "games", metadata: LibraryMetadata) => void) {
  const [state, setState] = useState<ScannerState>({ connected: false, paused: false, error: "", current: "", queued: 0, folders: [] });
  const callbacks = useRef({ onEntries, onMetadata });
  callbacks.current = { onEntries, onMetadata };
  useEffect(() => {
    const desktop = window.emuDesktop;
    if (!desktop) return;
    let mounted = true;
    const unsubscribe = desktop.onScannerEvent(event => {
      if (event.type === "state") setState(event.state);
      else if (event.type === "entries") callbacks.current.onEntries(event.entries);
      else callbacks.current.onMetadata(event.id, event.kind, event.metadata);
    });
    void desktop.scannerState().then(snapshot => {
      if (!mounted) return;
      const { entries, ...settings } = snapshot;
      setState(settings);
      callbacks.current.onEntries(entries);
      entries.forEach(entry => { if (entry.metadata) callbacks.current.onMetadata(entry.id, entry.kind, entry.metadata); });
    }).catch(() => { if (mounted) setState(current => ({ ...current, error: "Could not connect to the desktop scanner. Reopen EmuHub and try again." })); });
    return () => { mounted = false; unsubscribe(); };
  }, []);
  return state;
}
