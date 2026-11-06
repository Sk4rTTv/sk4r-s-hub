import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Gamepad2 } from "lucide-react";
import { toast } from "sonner";
import { ControllerKeyboard } from "@/components/ControllerKeyboard";
import { adjustRange, controllerScope, controls, editable, keyboardEvent, markFocus, moveFocus, moveSequential, setControlValue, visible, type Direction, type EditableControl } from "@/lib/controller-navigation";
import type { ControllerPacket, ControllerState } from "@/types/desktop";
import "@/controller.css";

const defaultHint = "D-pad move · A select / launch · B back · Y settings · LB/RB cycle controls";
const initialNative: ControllerState = { nativeAvailable: false, connected: false, shortcutEnabled: true, message: "Global return requires the Windows desktop app and an XInput controller." };
interface ControllerContextValue {
  connected: boolean;
  native: ControllerState;
  setShortcut: (enabled: boolean) => Promise<void>;
}
const ControllerContext = createContext<ControllerContextValue | null>(null);

export function ControllerProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [connected, setConnected] = useState(false);
  const [native, setNative] = useState(initialNative);
  const [hint, setHint] = useState(defaultHint);
  const [target, setTarget] = useState<EditableControl | null>(null);
  const action = useRef<(packet: ControllerPacket) => void>(() => {});
  const nativeRef = useRef(native);
  nativeRef.current = native;
  const previous = useRef<boolean[]>([]);
  const blocked = useRef(new Set<number>());
  const repeat = useRef<{ direction: Direction; next: number } | null>(null);
  const selectMode = useRef<HTMLSelectElement | null>(null);
  const connection = useRef(false);
  const lastSource = useRef("");
  const updateConnection = (value: boolean) => {
    if (value !== connection.current) { connection.current = value; setConnected(value); }
  };
  const activate = () => {
    const candidates = controls();
    let element = document.activeElement as HTMLElement;
    if (!candidates.includes(element)) {
      element = candidates.find(candidate => candidate.closest(".start-menu")) ?? candidates[0];
      if (!element) return;
      markFocus(element);
    }
    if (editable(element)) { setTarget(element); return; }
    if (element instanceof HTMLSelectElement) {
      selectMode.current = selectMode.current === element ? null : element;
      setHint(selectMode.current ? "D-pad choose option · A or B finish" : defaultHint);
      return;
    }
    const space = element.matches('input[type="checkbox"], input[type="radio"], input[type="file"], [role="checkbox"], [role="switch"], summary');
    if (window.emuDesktop) {
      void window.emuDesktop.activateControllerControl(space ? "Space" : "Return").catch(() => toast.error("Controller activation failed. Please try again."));
    } else if (!keyboardEvent(element, space ? " " : "Enter")) element.click();
  };
  const back = () => {
    if (selectMode.current) { selectMode.current = null; setHint(defaultHint); return; }
    const scope = controllerScope();
    if (scope !== document.body) {
      keyboardEvent(document.activeElement instanceof HTMLElement ? document.activeElement : scope, "Escape");
      return;
    }
    if (location.pathname !== "/") navigate("/");
    else window.dispatchEvent(new Event("emuhub:controller-back"));
  };
  const settings = () => {
    if (target) { setHint("Apply or cancel your text before opening Settings."); return; }
    const scope = controllerScope();
    if (scope !== document.body) keyboardEvent(document.activeElement instanceof HTMLElement ? document.activeElement : scope, "Escape");
    requestAnimationFrame(() => {
      if (controllerScope() === document.body) { selectMode.current = null; setHint(defaultHint); navigate("/settings"); }
      else setHint("Close the current dialog before opening Settings.");
    });
  };
  const move = (direction: Direction) => {
    const element = document.activeElement as HTMLElement;
    const select = selectMode.current;
    if (select && select === element && visible(select)) {
      const options = [...select.options].filter(option => !option.disabled && !option.hidden && !option.closest("optgroup[disabled]"));
      const index = options.findIndex(option => option.value === select.value);
      const next = Math.max(0, Math.min(options.length - 1, index + (direction === "left" || direction === "up" ? -1 : 1)));
      if (options[next]) setControlValue(select, options[next].value);
      return;
    }
    selectMode.current = null;
    if (element && adjustRange(element, direction)) { setHint("Left/right adjust value · Up/down move · Y settings"); return; }
    setHint(defaultHint);
    moveFocus(direction);
  };
  action.current = packet => {
    const buttons = [...packet.buttons];
    buttons[12] = Boolean(buttons[12] || packet.axes[1] < -.6);
    buttons[13] = Boolean(buttons[13] || packet.axes[1] > .6);
    buttons[14] = Boolean(buttons[14] || packet.axes[0] < -.6);
    buttons[15] = Boolean(buttons[15] || packet.axes[0] > .6);
    if (packet.suspended || buttons[8] && buttons[9]) {
      blocked.current = new Set(buttons.flatMap((pressed, index) => pressed ? [index] : []));
      previous.current = buttons;
      repeat.current = null;
      return;
    }
    buttons.forEach((pressed, index) => {
      if (!pressed) blocked.current.delete(index);
      if (blocked.current.has(index)) buttons[index] = false;
    });
    const before = previous.current;
    previous.current = buttons;
    const justPressed = (index: number) => buttons[index] && !before[index];
    if (justPressed(0)) activate();
    else if (justPressed(1)) back();
    else if (justPressed(3)) settings();
    else if (justPressed(4) || justPressed(5)) { selectMode.current = null; moveSequential(Boolean(justPressed(4))); }
    const directions: [number, Direction][] = [[12, "up"], [13, "down"], [14, "left"], [15, "right"]];
    const direction = directions.find(([index]) => buttons[index])?.[1];
    if (!direction) { repeat.current = null; return; }
    const now = performance.now();
    const prior = repeat.current;
    if (!prior || prior.direction !== direction || now >= prior.next) {
      move(direction);
      repeat.current = { direction, next: now + (prior?.direction === direction ? 130 : 380) };
    }
  };

  useEffect(() => {
    const desktop = window.emuDesktop;
    let active = true;
    let frame = 0;
    const applyNative = (state: ControllerState) => { if (active) { nativeRef.current = state; setNative(state); } };
    const cleanups = desktop ? [
      desktop.onControllerState(applyNative),
      desktop.onControllerInput(packet => {
        updateConnection(true);
        if (lastSource.current !== "native") { lastSource.current = "native"; action.current({ ...packet, suspended: true }); return; }
        action.current(packet);
      }),
      desktop.onControllerReturn(result => {
        setTarget(null);
        selectMode.current = null;
        keyboardEvent(document.activeElement instanceof HTMLElement ? document.activeElement : document.body, "Escape");
        navigate("/");
        setHint(defaultHint);
        if (result.error) toast.error(result.message); else toast.success(result.message);
      }),
    ] : [];
    if (desktop) void desktop.controllerState().then(applyNative).catch(() => applyNative({ ...initialNative, message: "Desktop controller support is unavailable in this app version." }));
    const poll = () => {
      if (!active) return;
      if (!nativeRef.current.connected) {
        const pad = navigator.getGamepads ? [...navigator.getGamepads()].find(gamepad => gamepad?.connected) : null;
        const source = pad ? `browser:${pad.index}:${pad.id}` : "browser:disconnected";
        const changed = lastSource.current !== source;
        lastSource.current = source;
        updateConnection(Boolean(pad));
        if (pad) action.current({ buttons: pad.buttons.map(button => button.pressed), axes: [...pad.axes], suspended: changed || !document.hasFocus() || document.hidden });
        else { previous.current = []; blocked.current.clear(); repeat.current = null; }
      }
      frame = requestAnimationFrame(poll);
    };
    frame = requestAnimationFrame(poll);
    const focus = (event: FocusEvent) => { if (connection.current && event.target instanceof HTMLElement && controls().includes(event.target)) {
      document.querySelectorAll("[data-controller-focus]").forEach(element => element.removeAttribute("data-controller-focus"));
      event.target.setAttribute("data-controller-focus", "true");
    } };
    document.addEventListener("focusin", focus);
    return () => { active = false; cancelAnimationFrame(frame); cleanups.forEach(cleanup => cleanup()); document.removeEventListener("focusin", focus); };
  }, [navigate]);

  useEffect(() => {
    if (!connected) document.querySelectorAll("[data-controller-focus]").forEach(element => element.removeAttribute("data-controller-focus"));
  }, [connected]);
  useEffect(() => { selectMode.current = null; }, [location.pathname]);

  const setShortcut = async (enabled: boolean) => {
    if (!window.emuDesktop) return;
    const state = await window.emuDesktop.setControllerShortcut(enabled);
    nativeRef.current = state;
    setNative(state);
  };
  return <ControllerContext.Provider value={{ connected, native, setShortcut }}>
    <div className={connected ? "controller-layout" : undefined}>{children}</div>
    {connected && !target && <div className="controller-hud" aria-label="Controller controls"><Gamepad2 className="h-5 w-5 shrink-0" /><p>{hint}</p></div>}
    {target && <ControllerKeyboard key={target.id || target.name || "editor"} target={target} onClose={() => { setTarget(null); setHint(defaultHint); }} />}
  </ControllerContext.Provider>;
}

export function useController() {
  const context = useContext(ControllerContext);
  if (!context) throw new Error("Controller controls require their provider.");
  return context;
}
