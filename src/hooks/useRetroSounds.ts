import { useCallback, useEffect, useRef, useState } from "react";

type Sound = "navigate" | "click" | "launch";
const volume = .035;
const controls = 'button, a[href], input:not([type="hidden"]), textarea, select, summary, [role="button"], [role="option"], [role="menuitem"], [role="menuitemcheckbox"], [role="combobox"], [role="tab"], [role="checkbox"], [role="switch"], [role="slider"]';
const pressable = 'button, a[href], summary, input[type="checkbox"], input[type="radio"], input[type="button"], input[type="submit"], input[type="file"], [role="button"], [role="option"], [role="menuitem"], [role="menuitemcheckbox"], [role="combobox"], [role="tab"], [role="checkbox"], [role="switch"]';

export function useRetroSounds() {
  const [enabled, updateEnabled] = useState(true);
  const enabledRef = useRef(true);
  const context = useRef<AudioContext | null>(null);
  const master = useRef<GainNode | null>(null);
  const voices = useRef(new Set<OscillatorNode>());
  const generation = useRef(0);

  const prepareAudio = useCallback(() => {
    if (!enabledRef.current || !window.AudioContext) return null;
    if (!context.current) {
      try {
        const audio = new AudioContext();
        const gain = audio.createGain();
        const filter = audio.createBiquadFilter();
        gain.gain.value = volume;
        filter.type = "lowpass";
        filter.frequency.value = 3800;
        filter.Q.value = .3;
        gain.connect(filter);
        filter.connect(audio.destination);
        context.current = audio;
        master.current = gain;
      } catch { return null; }
    }
    return context.current;
  }, []);

  const play = useCallback((sound: Sound, create = false) => {
    if (!enabledRef.current) return;
    const audio = create ? prepareAudio() : context.current;
    if (!audio || audio.state === "closed") return;
    const version = generation.current;
    const schedule = () => {
      if (!enabledRef.current || generation.current !== version || context.current !== audio || audio.state !== "running" || !master.current) return;
      const tone = (frequency: number, offset: number, duration: number, level: number, endFrequency = frequency) => {
        const oscillator = audio.createOscillator();
        const envelope = audio.createGain();
        const start = audio.currentTime + .005 + offset;
        oscillator.type = "square";
        oscillator.frequency.setValueAtTime(frequency, start);
        oscillator.frequency.exponentialRampToValueAtTime(endFrequency, start + duration * .7);
        envelope.gain.setValueAtTime(0, start);
        envelope.gain.linearRampToValueAtTime(level, start + .003);
        envelope.gain.exponentialRampToValueAtTime(.001, start + duration - .005);
        envelope.gain.linearRampToValueAtTime(0, start + duration);
        oscillator.connect(envelope);
        envelope.connect(master.current!);
        oscillator.onended = () => { voices.current.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
        oscillator.start(start);
        oscillator.stop(start + duration + .002);
        voices.current.add(oscillator);
      };
      if (sound === "navigate") tone(740, 0, .035, .32, 620);
      else if (sound === "click") tone(880, 0, .055, .5, 440);
      else {
        tone(1046.5, 0, .055, .38);
        tone(1318.5, .065, .065, .38);
        tone(1568, .14, .13, .38);
      }
    };
    if (audio.state === "suspended") void audio.resume().then(schedule).catch(() => {});
    else schedule();
  }, [prepareAudio]);

  const setEnabled = useCallback((value: boolean) => {
    enabledRef.current = value;
    updateEnabled(value);
    generation.current++;
    if (master.current && context.current?.state !== "closed") master.current.gain.setValueAtTime(value ? volume : 0, context.current!.currentTime);
    if (!value) {
      voices.current.forEach(voice => voice.stop());
      voices.current.clear();
    }
  }, []);
  const playLaunchChime = useCallback(() => play("launch"), [play]);

  useEffect(() => {
    let lastNavigation = -Infinity;
    let lastPress = -Infinity;
    const controlFor = (target: EventTarget | null) => {
      const element = target instanceof Element ? target.closest<HTMLElement>(controls) : null;
      return element && !element.matches(':disabled, [aria-disabled="true"], [data-disabled]') && !element.closest('[hidden], [inert], [aria-hidden="true"]') ? element : null;
    };
    const navigation = () => {
      const now = performance.now();
      if (now - lastNavigation < 85 || now - lastPress < 100) return;
      lastNavigation = now;
      play("navigate");
    };
    const unlock = (event: Event) => {
      if (!event.isTrusted) return;
      const audio = prepareAudio();
      if (audio?.state === "suspended") void audio.resume().catch(() => {});
    };
    const click = (event: MouseEvent) => {
      const element = controlFor(event.target);
      if (!element?.matches(pressable) || element.hasAttribute("data-retro-sound-toggle")) return;
      lastPress = performance.now();
      play("click", event.isTrusted);
    };
    const hover = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const element = controlFor(event.target);
      if (element && !(event.relatedTarget instanceof Node && element.contains(event.relatedTarget))) navigation();
    };
    const focus = (event: FocusEvent) => { if (controlFor(event.target)) navigation(); };
    const change = (event: Event) => { if (event.target instanceof HTMLSelectElement && controlFor(event.target)) navigation(); };
    const controllerPress = () => { lastPress = performance.now(); play("click"); };
    document.addEventListener("pointerdown", unlock, true);
    document.addEventListener("keydown", unlock, true);
    document.addEventListener("click", click, true);
    document.addEventListener("pointerover", hover);
    document.addEventListener("focusin", focus);
    document.addEventListener("change", change);
    window.addEventListener("emuhub:controller-press", controllerPress);
    return () => {
      document.removeEventListener("pointerdown", unlock, true);
      document.removeEventListener("keydown", unlock, true);
      document.removeEventListener("click", click, true);
      document.removeEventListener("pointerover", hover);
      document.removeEventListener("focusin", focus);
      document.removeEventListener("change", change);
      window.removeEventListener("emuhub:controller-press", controllerPress);
    };
  }, [play, prepareAudio]);

  useEffect(() => () => {
    generation.current++;
    voices.current.forEach(voice => voice.stop());
    voices.current.clear();
    const audio = context.current;
    context.current = null;
    master.current = null;
    if (audio && audio.state !== "closed") void audio.close().catch(() => {});
  }, []);
  return { enabled, setEnabled, playLaunchChime };
}
