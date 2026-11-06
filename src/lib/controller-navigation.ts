export type Direction = "up" | "down" | "left" | "right";
export type EditableControl = HTMLInputElement | HTMLTextAreaElement;

export function visible(element: HTMLElement) {
  return element.isConnected && element.getClientRects().length > 0 && !element.closest('[hidden], [inert], [aria-hidden="true"]') && getComputedStyle(element).visibility !== "hidden";
}

export function controllerScope(): HTMLElement {
  const overlays = [...document.querySelectorAll<HTMLElement>('[role="menu"], [role="listbox"], [role="dialog"], [role="alertdialog"]')].filter(visible);
  return overlays.at(-1) ?? document.body;
}

export function controls(scope = controllerScope()) {
  return [...scope.querySelectorAll<HTMLElement>('button, a[href], input:not([type="hidden"]), textarea, select, summary, [role="button"], [role="menuitem"], [role="menuitemcheckbox"], [role="option"], [role="tab"], [role="checkbox"], [role="switch"], [role="slider"], [tabindex]')].filter(element =>
    visible(element) && !element.matches(':disabled, [aria-disabled="true"], [data-disabled]') && (element.tabIndex >= 0 || element.matches('[role="menuitem"], [role="menuitemcheckbox"], [role="option"], [role="tab"], [role="slider"]')),
  );
}

export function markFocus(element: HTMLElement) {
  document.querySelectorAll('[data-controller-focus]').forEach(previous => previous.removeAttribute("data-controller-focus"));
  element.setAttribute("data-controller-focus", "true");
  element.focus({ preventScroll: true });
  element.scrollIntoView({ block: "nearest", inline: "nearest", behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
}

export function keyboardEvent(element: HTMLElement, key: string) {
  const handled = !element.dispatchEvent(new KeyboardEvent("keydown", { key, code: key === " " ? "Space" : key, bubbles: true, cancelable: true }));
  element.dispatchEvent(new KeyboardEvent("keyup", { key, code: key === " " ? "Space" : key, bubbles: true, cancelable: true }));
  return handled;
}

export function moveFocus(direction: Direction) {
  const scope = controllerScope();
  const candidates = controls(scope);
  const current = document.activeElement as HTMLElement;
  if (!current || current === document.body || !visible(current) || !scope.contains(current)) { if (candidates[0]) markFocus(candidates[0]); return; }
  // Menus own their roving focus and selected option state.
  if (current.closest('[role="menu"], [role="listbox"]') && (direction === "up" || direction === "down")) {
    if (keyboardEvent(current, direction === "up" ? "ArrowUp" : "ArrowDown")) {
      if (document.activeElement instanceof HTMLElement) markFocus(document.activeElement);
      return;
    }
  }
  const bounds = current.getBoundingClientRect();
  const horizontal = direction === "left" || direction === "right";
  const sign = direction === "left" || direction === "up" ? -1 : 1;
  let best: HTMLElement | undefined;
  let bestScore = Infinity;
  for (const candidate of candidates) {
    if (candidate === current) continue;
    const rect = candidate.getBoundingClientRect();
    const dx = rect.left + rect.width / 2 - bounds.left - bounds.width / 2;
    const dy = rect.top + rect.height / 2 - bounds.top - bounds.height / 2;
    const forward = (horizontal ? dx : dy) * sign;
    const sideways = Math.abs(horizontal ? dy : dx);
    if (forward < 4) continue;
    const score = forward + sideways * 2 + sideways / forward * 50;
    if (score < bestScore) { best = candidate; bestScore = score; }
  }
  if (best) markFocus(best);
}

export function moveSequential(reverse: boolean) {
  const candidates = controls();
  if (!candidates.length) return;
  const index = candidates.indexOf(document.activeElement as HTMLElement);
  markFocus(candidates[(index + (reverse ? -1 : 1) + candidates.length) % candidates.length]);
}

export function setControlValue(element: EditableControl | HTMLSelectElement, value: string) {
  const prototype = element instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : element instanceof HTMLSelectElement ? HTMLSelectElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, "value")!.set!.call(element, value);
  element.dispatchEvent(new Event("input", { bubbles: true }));
  element.dispatchEvent(new Event("change", { bubbles: true }));
}

export function adjustRange(element: HTMLElement, direction: Direction) {
  if (direction !== "left" && direction !== "right") return false;
  if (element instanceof HTMLInputElement && element.type === "range") {
    const min = Number(element.min || 0), max = Number(element.max || 100);
    const step = element.step === "any" ? (max - min) / 100 : Number(element.step || 1);
    const value = Math.max(min, Math.min(max, Number(element.value) + step * (direction === "left" ? -1 : 1)));
    setControlValue(element, String(Number(value.toFixed(8))));
    return true;
  }
  if (element.getAttribute("role") === "slider") {
    keyboardEvent(element, direction === "left" ? "ArrowLeft" : "ArrowRight");
    return true;
  }
  return false;
}

export function editable(element: HTMLElement): element is EditableControl {
  return (element instanceof HTMLTextAreaElement || element instanceof HTMLInputElement && !["button", "submit", "reset", "file", "checkbox", "radio", "range", "hidden", "image"].includes(element.type)) && !element.readOnly && !element.hasAttribute("data-controller-no-editor");
}
