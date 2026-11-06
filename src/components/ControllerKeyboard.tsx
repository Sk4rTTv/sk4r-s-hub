import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Delete, Keyboard, Check, ArrowUp, X } from "lucide-react";
import { setControlValue, type EditableControl } from "@/lib/controller-navigation";

export function ControllerKeyboard({ target, onClose }: { target: EditableControl; onClose: () => void }) {
  const [value, setValue] = useState(target.value);
  const [shift, setShift] = useState(false);
  const [error, setError] = useState("");
  const label = target.labels?.[0]?.textContent || target.getAttribute("aria-label") || target.placeholder || "Edit text";
  const rows = ["1234567890", "qwertyuiop", "asdfghjkl", "zxcvbnm", "-_./:@#", "!?$%&*+=", "()[]{}\\\"',;<>|~`^"];
  const apply = () => {
    if (!target.isConnected || target.disabled || target.readOnly) { onClose(); return; }
    if (target.type === "color" && !/^#[0-9a-f]{6}$/i.test(value)) { setError("Use a six-digit hex color, such as #6366F1."); return; }
    if (target.maxLength >= 0 && value.length > target.maxLength) { setError(`Use at most ${target.maxLength} characters.`); return; }
    if (value && target.minLength > 0 && value.length < target.minLength) { setError(`Use at least ${target.minLength} characters.`); return; }
    const test = target.cloneNode() as EditableControl;
    test.value = value;
    if ((value && !test.value) || !test.checkValidity()) { setError(test.validationMessage || "Use a valid value for this field."); return; }
    setControlValue(target, value);
    onClose();
  };
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }}>
    <DialogContent className="controller-keyboard retro-dialog max-h-[90dvh] max-w-2xl overflow-y-auto rounded-3xl border-2 border-indigo-300 bg-blue-950 p-4 text-white sm:p-6" onCloseAutoFocus={event => { event.preventDefault(); if (target.isConnected) target.focus(); }}>
      <DialogHeader><DialogTitle className="flex items-center gap-3 text-xl"><Keyboard className="text-cyan-300" />{label}</DialogTitle><DialogDescription className="text-blue-100">D-pad to choose a key · A to type · B to cancel. Select Apply when finished.{target.type === "color" ? " Use a six-digit hex color, such as #6366F1." : target.type === "datetime-local" ? " Format: YYYY-MM-DDTHH:mm." : ""}</DialogDescription></DialogHeader>
      <input aria-label="Text being edited" data-controller-no-editor type={target.type === "password" ? "password" : "text"} value={value} onChange={event => setValue(event.target.value)} className="w-full rounded-xl border-2 border-indigo-300 bg-indigo-950 p-3 text-white" autoComplete="off" />
      <div className="space-y-2" aria-label="On-screen keyboard">
        {rows.map((row, index) => <div key={index} className="flex flex-wrap justify-center gap-1.5">{[...row].map(character => <Button key={character} type="button" aria-label={`Type ${shift ? character.toUpperCase() : character}`} onClick={() => setValue(current => current + (shift ? character.toUpperCase() : character))} className="h-10 min-w-8 rounded-lg border border-indigo-400 bg-indigo-950 px-2 text-base text-white hover:bg-indigo-700 sm:min-w-10">{shift ? character.toUpperCase() : character}</Button>)}</div>)}
        <div className="flex flex-wrap justify-center gap-2">
          <Button type="button" aria-pressed={shift} onClick={() => setShift(!shift)} className="rounded-xl bg-indigo-700 text-white"><ArrowUp className="mr-1 h-4 w-4" />{shift ? "Uppercase" : "Lowercase"}</Button>
          <Button type="button" onClick={() => setValue(current => current + " ")} className="min-w-24 rounded-xl bg-indigo-700 text-white">Space</Button>
          <Button type="button" onClick={() => setValue(current => [...current].slice(0, -1).join(""))} className="rounded-xl bg-indigo-700 text-white"><Delete className="mr-1 h-4 w-4" />Delete</Button>
          <Button type="button" onClick={() => setValue("")} className="rounded-xl bg-indigo-700 text-white">Clear</Button>
          {target instanceof HTMLTextAreaElement && <Button type="button" onClick={() => setValue(current => current + "\n")} className="rounded-xl bg-indigo-700 text-white">New line</Button>}
        </div>
      </div>
      {error && <p role="alert" className="rounded-lg bg-red-950 p-3 text-sm text-red-100">{error}</p>}
      <div className="flex justify-end gap-3"><Button type="button" onClick={onClose} className="rounded-xl bg-indigo-700 text-white"><X className="mr-2 h-4 w-4" />Cancel</Button><Button type="button" onClick={apply} className="rounded-xl bg-yellow-300 text-blue-950 hover:bg-yellow-200"><Check className="mr-2 h-4 w-4" />Apply</Button></div>
    </DialogContent>
  </Dialog>;
}
