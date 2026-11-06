import { useCallback, useEffect, useRef, useState } from "react";

export interface ScreenTransitionState {
  id: number;
  label: string;
  phase: "cover" | "hold" | "reveal";
  reducedMotion: boolean;
}
interface TransitionJob {
  id: number;
  timer: number;
  frames: number[];
  resolveCover: (covered: boolean) => void;
  revealPromise?: Promise<void>;
  resolveReveal?: () => void;
  handoffPromise?: Promise<void>;
  finishHandoff?: () => void;
}

export function useScreenTransition() {
  const [screen, setScreen] = useState<ScreenTransitionState | null>(null);
  const job = useRef<TransitionJob | null>(null);
  const sequence = useRef(0);
  const previousFocus = useRef<HTMLElement | null>(null);
  const mounted = useRef(true);

  const clear = useCallback(() => {
    const current = job.current;
    if (!current) return;
    job.current = null;
    clearTimeout(current.timer);
    current.frames.forEach(frame => cancelAnimationFrame(frame));
    current.resolveCover(false);
    current.resolveReveal?.();
    current.finishHandoff?.();
    if (mounted.current) setScreen(null);
  }, []);

  const cover = useCallback((label: string) => {
    if (job.current || !mounted.current) return Promise.resolve(false);
    const id = ++sequence.current;
    previousFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    return new Promise<boolean>(resolveCover => {
      job.current = { id, resolveCover, frames: [], timer: window.setTimeout(clear, 4000) };
      setScreen({ id, label, phase: "cover", reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches });
    });
  }, [clear]);

  const waitForHandoff = useCallback(() => {
    const current = job.current;
    if (!current || !document.hasFocus()) return Promise.resolve();
    if (current.handoffPromise) return current.handoffPromise;
    current.handoffPromise = new Promise<void>(resolve => {
      const finish = () => { clearTimeout(timer); window.removeEventListener("blur", finish); resolve(); };
      const timer = window.setTimeout(finish, 900);
      current.finishHandoff = finish;
      window.addEventListener("blur", finish, { once: true });
    });
    return current.handoffPromise;
  }, []);

  const reveal = useCallback(() => {
    const current = job.current;
    if (!current) return Promise.resolve();
    if (current.revealPromise) return current.revealPromise;
    current.revealPromise = new Promise<void>(resolve => { current.resolveReveal = resolve; });
    setScreen(state => state?.id === current.id ? { ...state, phase: "reveal" } : state);
    return current.revealPromise;
  }, []);

  const completePhase = useCallback((id: number, phase: ScreenTransitionState["phase"]) => {
    const current = job.current;
    if (!current || current.id !== id) return;
    if (phase === "reveal") { clear(); return; }
    if (phase !== "cover") return;
    setScreen(state => state?.id === id && state.phase === "cover" ? { ...state, phase: "hold" } : state);
    // Acknowledge only after the fully opaque frame has reached the compositor.
    current.frames.push(requestAnimationFrame(() => {
      if (job.current !== current) return;
      current.frames.push(requestAnimationFrame(() => { if (job.current === current) current.resolveCover(true); }));
    }));
  }, [clear]);

  const restoreFocus = useCallback(() => {
    const target = previousFocus.current;
    if (document.hasFocus() && target?.isConnected && target.getClientRects().length && !target.closest('[hidden], [inert], [aria-hidden="true"]')) target.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    mounted.current = true;
    const focus = () => { if (job.current?.revealPromise) clear(); };
    window.addEventListener("focus", focus);
    return () => { mounted.current = false; window.removeEventListener("focus", focus); clear(); };
  }, [clear]);

  return { screen, cover, reveal, waitForHandoff, cancel: clear, completePhase, restoreFocus, isBusy: () => job.current !== null };
}
