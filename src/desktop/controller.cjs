const path = require('node:path');
const { performance } = require('node:perf_hooks');

function loadWindowsInput() {
  const koffi = require('koffi');
  const system = path.join(process.env.SystemRoot || 'C:\\Windows', 'System32');
  const gamepad = koffi.struct('EmuHubGamepad', { buttons: 'uint16_t', leftTrigger: 'uint8_t', rightTrigger: 'uint8_t', lx: 'int16_t', ly: 'int16_t', rx: 'int16_t', ry: 'int16_t' });
  koffi.struct('EmuHubPadState', { packet: 'uint32_t', gamepad });
  const xinput = koffi.load(path.join(system, 'xinput1_4.dll'));
  const read = xinput.func('uint32_t __stdcall XInputGetState(uint32_t index, _Out_ EmuHubPadState *state)');
  const user = koffi.load(path.join(system, 'user32.dll'));
  const foreground = user.func('void * __stdcall GetForegroundWindow()');
  const owner = user.func('void * __stdcall GetAncestor(void *window, uint32_t flags)');
  const pid = user.func('uint32_t __stdcall GetWindowThreadProcessId(void *window, _Out_ uint32_t *processId)');
  const rect = koffi.struct('EmuHubRect', { left: 'int32_t', top: 'int32_t', right: 'int32_t', bottom: 'int32_t' });
  const gui = koffi.struct('EmuHubGuiInfo', { size: 'uint32_t', flags: 'uint32_t', active: 'void *', focus: 'void *', capture: 'void *', menuOwner: 'void *', moveSize: 'void *', caret: 'void *', rect });
  const guiInfo = user.func('int __stdcall GetGUIThreadInfo(uint32_t thread, _Inout_ EmuHubGuiInfo *info)');
  const post = user.func('int __stdcall PostMessageW(void *window, uint32_t message, uintptr_t wparam, intptr_t lparam)');
  const scan = user.func('uint32_t __stdcall MapVirtualKeyW(uint32_t code, uint32_t mapType)');
  const processFor = handle => { const out = [0]; const thread = handle ? pid(handle, out) : 0; return { pid: out[0], thread }; };
  const same = (a, b) => a != null && b != null && String(a) === String(b);
  function ownedDialog(window) {
    if (!window || window.isDestroyed()) return null;
    const active = foreground();
    const root = koffi.decode(window.getNativeWindowHandle(), 'void *');
    if (!active || same(active, root) || !same(owner(active, 3), root) || processFor(active).pid !== process.pid) return null;
    return active;
  }
  return {
    read: index => { const state = {}; return read(index, state) === 0 ? state.gamepad : null; },
    foregroundPid: () => processFor(foreground()).pid,
    ownedDialog,
    // Hardware-only, fixed navigation keys, directed to this instance's owned dialog.
    // Never inject into the system input stream or another process's foreground window.
    dialogKey(window, key) {
      const active = ownedDialog(window);
      if (!active) return;
      const info = { size: koffi.sizeof(gui) };
      if (!guiInfo(processFor(active).thread, info)) return;
      const target = info.focus || active;
      const root = koffi.decode(window.getNativeWindowHandle(), 'void *');
      if (processFor(target).pid !== process.pid || !same(owner(target, 3), root)) return;
      const code = scan(key, 0) << 16;
      post(target, 0x100, key, code | 1);
      post(target, 0x101, key, code | 0xc0000001);
    },
  };
}

function installController({ app, ipcMain, authorize, getWindow, canSend, returnToHub }) {
  let input;
  let timer;
  let connected = false;
  let shortcutEnabled = true;
  let message = process.platform === 'win32' ? 'Starting Windows controller support…' : 'Global controller return requires Windows desktop.';
  const held = new Map();
  const nativeKeys = new Map();
  const dialogGate = new Set();
  let previousDialog = null;
  let previousIndex = -1;
  let lastState = '';
  const state = () => ({ nativeAvailable: Boolean(input), connected, shortcutEnabled, message });
  const send = (channel, payload) => { if (canSend()) getWindow().webContents.send(channel, payload); };
  const emitState = () => { const next = JSON.stringify(state()); if (next !== lastState) { lastState = next; send('emuhub:controller-state-event', state()); } };

  ipcMain.handle('emuhub:controller-state', event => { authorize(event); return state(); });
  ipcMain.handle('emuhub:controller-shortcut', (event, enabled) => {
    authorize(event);
    if (typeof enabled !== 'boolean') throw new Error('Invalid controller setting.');
    shortcutEnabled = enabled;
    held.clear();
    emitState();
    return state();
  });
  ipcMain.handle('emuhub:controller-activate', (event, key) => {
    authorize(event);
    if (!['Return', 'Space'].includes(key)) throw new Error('Invalid activation key.');
    const window = getWindow();
    if (!window.isFocused() || input?.ownedDialog(window)) return;
    // A genuine Chromium key event keeps file/capture user-gesture checks intact.
    window.webContents.sendInputEvent({ type: 'keyDown', keyCode: key });
    window.webContents.sendInputEvent({ type: 'keyUp', keyCode: key });
  });

  function poll() {
    const window = getWindow();
    const now = performance.now();
    const dialog = input.ownedDialog(window);
    let primary = null;
    let primaryIndex = -1;
    const present = new Set();
    for (let index = 0; index < 4; index++) {
      const pad = input.read(index);
      if (!pad) { held.delete(index); continue; }
      present.add(index);
      if (!primary) { primary = pad; primaryIndex = index; }
      const combo = (pad.buttons & 0x30) === 0x30;
      const hold = held.get(index);
      if (combo && shortcutEnabled && !dialog) {
        if (!hold) held.set(index, { since: now, fired: false });
        else if (!hold.fired && now - hold.since >= 1500) {
          hold.fired = true;
          void returnToHub(input.foregroundPid()).then(result => send('emuhub:controller-return', result)).catch(() => send('emuhub:controller-return', { closed: false, error: true, message: 'Could not close the emulator. No unrelated processes were targeted.' }));
        }
      } else held.delete(index);
    }
    for (const index of held.keys()) if (!present.has(index)) held.delete(index);
    connected = Boolean(primary);
    emitState();
    const sourceChanged = primaryIndex !== previousIndex;
    previousIndex = primaryIndex;
    if (!primary) { nativeKeys.clear(); dialogGate.clear(); previousDialog = null; return; }
    const bits = [0x1000, 0x2000, 0x4000, 0x8000, 0x100, 0x200, 0, 0, 0x20, 0x10, 0x40, 0x80, 1, 2, 4, 8];
    const buttons = bits.map(bit => Boolean(primary.buttons & bit));
    buttons[6] = primary.leftTrigger > 80;
    buttons[7] = primary.rightTrigger > 80;
    const axes = [primary.lx / 32768, -primary.ly / 32768, primary.rx / 32768, -primary.ry / 32768];
    const combo = buttons[8] && buttons[9];
    if (dialog) {
      const actions = [[12, 0x26], [13, 0x28], [14, 0x25], [15, 0x27], [0, 0x0d], [1, 0x1b], [5, 0x09]];
      const changed = String(dialog) !== String(previousDialog) || sourceChanged;
      if (changed) { nativeKeys.clear(); dialogGate.clear(); }
      for (const [button, key] of actions) {
        const pressed = buttons[button] || button === 12 && axes[1] < -.6 || button === 13 && axes[1] > .6 || button === 14 && axes[0] < -.6 || button === 15 && axes[0] > .6;
        if (changed && pressed) dialogGate.add(button);
        if (!pressed) { dialogGate.delete(button); nativeKeys.delete(button); continue; }
        if (combo || dialogGate.has(button)) continue;
        const prior = nativeKeys.get(button);
        if (!prior || button >= 12 && now >= prior.next) {
          input.dialogKey(window, key);
          nativeKeys.set(button, { next: now + (prior ? 130 : 400) });
        }
      }
    } else {
      nativeKeys.clear();
      dialogGate.clear();
    }
    previousDialog = dialog;
    send('emuhub:controller-input', { buttons, axes, suspended: Boolean(dialog) || !window?.isFocused() || combo || sourceChanged });
  }

  app.whenReady().then(() => {
    if (process.platform !== 'win32') { emitState(); return; }
    try {
      input = loadWindowsInput();
      message = 'Windows XInput background shortcut is available.';
      timer = setInterval(() => {
        try { poll(); } catch (error) {
          clearInterval(timer);
          input = null;
          connected = false;
          message = 'Native controller support stopped. Foreground browser controls remain available.';
          console.error('EmuHub native controller polling failed:', error.message);
          emitState();
        }
      }, 25);
      timer.unref();
    } catch (error) {
      message = 'Windows XInput support could not load. Global return is unavailable; foreground controls still work.';
      console.error('EmuHub native controller support unavailable:', error.message);
    }
    emitState();
  });
  app.on('before-quit', () => { clearInterval(timer); held.clear(); nativeKeys.clear(); });
}

module.exports = { installController };
