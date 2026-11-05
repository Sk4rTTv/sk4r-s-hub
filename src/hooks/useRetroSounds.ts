import { useEffect, useRef, useState } from "react";

export function useRetroSounds() {
  const [enabled, setEnabled] = useState(true);
  const context = useRef<AudioContext | null>(null);
  useEffect(() => {
    if (!enabled || !window.AudioContext) return;
    let lastHover = 0;
    const beep = (hover: boolean) => {
      context.current ??= new AudioContext();
      const audio = context.current;
      const play = () => {
        const oscillator = audio.createOscillator();
        const gain = audio.createGain();
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(hover ? 440 : 660, audio.currentTime);
        if (!hover) oscillator.frequency.setValueAtTime(880, audio.currentTime + .055);
        gain.gain.setValueAtTime(.025, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(.001, audio.currentTime + (hover ? .045 : .12));
        oscillator.connect(gain); gain.connect(audio.destination);
        oscillator.start(); oscillator.stop(audio.currentTime + (hover ? .05 : .13));
      };
      if (audio.state === "suspended") void audio.resume().then(play).catch(() => {});
      else if (audio.state === "running") play();
    };
    const click = (e: MouseEvent) => {
      if ((e.target as Element)?.closest("button, [role='option'], [role='menuitem'], [role='combobox']")) beep(false);
    };
    const hover = (e: PointerEvent) => {
      if (!context.current || e.pointerType !== "mouse") return;
      const card = (e.target as Element)?.closest(".cartridge");
      if (!card || card.contains(e.relatedTarget as Node | null) || performance.now() - lastHover < 100) return;
      lastHover = performance.now(); beep(true);
    };
    document.addEventListener("click", click);
    document.addEventListener("pointerover", hover);
    return () => { document.removeEventListener("click", click); document.removeEventListener("pointerover", hover); };
  }, [enabled]);
  useEffect(() => () => { void context.current?.close(); }, []);
  return { enabled, setEnabled };
}
