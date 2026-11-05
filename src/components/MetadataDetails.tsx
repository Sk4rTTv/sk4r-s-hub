import { useState } from "react";
import { Loader2, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { LibraryMetadata } from "@/types/library-scanner";

export function MetadataDetails({ metadata, directoryKey, title, system }: { metadata?: LibraryMetadata; directoryKey?: string; title: string; system: string }) {
  const [busy, setBusy] = useState(false);
  if (!metadata) return null;
  const retry = async () => {
    if (!window.emuDesktop || !directoryKey?.startsWith("desktop:") || busy) return;
    setBusy(true);
    try { await window.emuDesktop.retryScannerMetadata(directoryKey.slice(8), system, title); }
    catch { toast.error("Could not retry metadata. Keep the source folder monitored, choose a supported console, and check the scanner connection."); }
    finally { setBusy(false); }
  };
  return <div className="space-y-2 text-xs leading-5 text-blue-100">
    {metadata.status === "pending" && <p role="status" className="flex items-center gap-2"><Loader2 className="h-3 w-3 shrink-0 motion-safe:animate-spin" />Metadata queued / fetching…</p>}
    {metadata.releaseYear && <p><strong>Released:</strong> {metadata.releaseYear}</p>}
    {metadata.developer && <p className="break-words"><strong>Developer:</strong> {metadata.developer}</p>}
    {metadata.description && <details className="rounded-lg border border-indigo-400 p-2"><summary className="cursor-pointer font-bold">About {title}</summary><p className="mt-2 whitespace-pre-line break-words">{metadata.description}</p></details>}
    {metadata.sourceUrl && <a href={metadata.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded text-xs text-cyan-200 underline underline-offset-4"><ExternalLink className="h-3 w-3 shrink-0" />{metadata.source === "Wikipedia" ? "Wikipedia / Wikidata · source & artwork credits" : "ScreenScraper · source & credits"}</a>}
    {metadata.message && <p role={metadata.status === "error" ? "alert" : undefined}>{metadata.message}</p>}
    {metadata.status !== "pending" && window.emuDesktop && <Button type="button" variant="outline" disabled={busy} onClick={retry} className="h-auto min-h-8 rounded-lg border-indigo-400 bg-indigo-900 py-2 text-xs text-white"><RefreshCw className="mr-2 h-3 w-3" />{busy ? "Queuing…" : "Retry metadata"}</Button>}
  </div>;
}
