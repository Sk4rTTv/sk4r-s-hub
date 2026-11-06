import * as Dialog from "@radix-ui/react-dialog";
import { Gamepad2 } from "lucide-react";
import type { ScreenTransitionState } from "@/hooks/useScreenTransition";
import "@/screen-transition.css";

export function ScreenTransition({ state, onComplete, onRestoreFocus }: { state: ScreenTransitionState | null; onComplete: (id: number, phase: ScreenTransitionState["phase"]) => void; onRestoreFocus: () => void }) {
  return <Dialog.Root open={Boolean(state)}>
    {state && <Dialog.Portal>
      <Dialog.Overlay className="screen-transition-blocker" />
      <Dialog.Content className="screen-transition-dialog" onEscapeKeyDown={event => event.preventDefault()} onPointerDownOutside={event => event.preventDefault()} onCloseAutoFocus={event => { event.preventDefault(); onRestoreFocus(); }}>
        <Dialog.Title className="sr-only">{state.label}</Dialog.Title>
        <Dialog.Description className="sr-only">A brief transition. EmuHub will be available again automatically.</Dialog.Description>
        <div key={state.id} className="screen-transition-fade" data-phase={state.phase} data-reduced-motion={state.reducedMotion} onAnimationEnd={event => { if (event.target === event.currentTarget) onComplete(state.id, state.phase); }}>
          <div aria-hidden="true" className="screen-transition-message"><Gamepad2 className="h-9 w-9" /><p>{state.label}</p></div>
        </div>
      </Dialog.Content>
    </Dialog.Portal>}
  </Dialog.Root>;
}
