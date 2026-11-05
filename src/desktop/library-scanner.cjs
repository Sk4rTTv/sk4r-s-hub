const fs = require('node:fs/promises');
const path = require('node:path');
const { randomUUID } = require('node:crypto');
const { scanAppDirectory } = require('./directory-scan.cjs');
const metadata = require('./library-metadata.cjs');
const formats = require('../types/game-formats.json');

function inferSystem(relativePath, fallback) {
  const extension = path.extname(relativePath).toLowerCase();
  if (extension === '.gbc') return 'Game Boy Color';
  if (formats[extension]) return formats[extension];
  const aliases = { n64: 'Nintendo 64', gba: 'Game Boy Advance', gb: 'Game Boy', gbc: 'Game Boy Color', ds: 'Nintendo DS', nds: 'Nintendo DS', '3ds': 'Nintendo 3DS', ps1: 'PlayStation', ps2: 'PlayStation 2', 'super nintendo': 'SNES', 'mega drive': 'Genesis', 'pc engine': 'TurboGrafx-16' };
  for (const folder of relativePath.split(/[\\/]/).slice(0, -1).reverse()) {
    const name = folder.toLowerCase().replace(/[_-]+/g, ' ').trim();
    const system = aliases[name] || Object.keys(metadata.systemIds).find(value => value.toLowerCase() === name);
    if (system) return system;
  }
  return fallback === 'detect' ? 'Unassigned' : fallback;
}

function installLibraryScanner({ ipcMain, dialog, getWindow, authorize, registerEntry, canSend }) {
  const watches = new Map();
  const entries = new Map();
  let queue = [];
  let current = null;
  let working = false;
  let connecting = false;
  let paused = false;
  let error = '';
  let selecting = false;
  let closed = false;
  const emit = event => { const window = getWindow(); if (window && canSend()) window.webContents.send('emuhub:library-scanner-event', event); };
  const snapshot = () => ({ connected: metadata.connected(), paused, error, current: current?.entry.fileName || '', queued: queue.length, folders: [...watches.values()].map(watch => ({ id: watch.id, folderName: watch.name, kind: watch.kind, files: watch.seen.size, lastScan: watch.lastScan, warning: watch.warning, scanning: watch.scanning })), entries: [...entries.values()].map(entry => ({ ...entry, filePath: undefined })) });
  const status = () => { const { entries: ignored, ...state } = snapshot(); emit({ type: 'state', state }); };
  const result = (entry, value) => { entry.metadata = value; emit({ type: 'metadata', id: entry.id, kind: entry.kind, metadata: value }); };
  async function work() {
    if (working || closed) return;
    working = true;
    try {
      while (!closed) {
        const index = queue.findIndex(entry => watches.has(entry.folderId) && (entry.kind === 'apps' || !paused && metadata.connected()));
        if (index < 0) break;
        const [entry] = queue.splice(index, 1);
        const controller = new AbortController();
        current = { entry, controller }; status();
        try {
          const value = await metadata.lookup(entry, controller.signal);
          if (!controller.signal.aborted && watches.has(entry.folderId)) result(entry, value);
        } catch (cause) {
          if (!controller.signal.aborted) {
            result(entry, { status: 'error', message: cause instanceof Error ? cause.message : 'Metadata lookup failed. Retry later.' });
            if (cause.pause && entry.kind === 'games') { paused = true; error = cause.message; }
          }
        } finally { current = null; status(); }
      }
    } finally { working = false; }
  }
  function enqueue(entry) {
    if (queue.some(item => item.id === entry.id) || current?.entry.id === entry.id) return;
    result(entry, { status: 'pending' }); queue.push(entry); void work();
  }
  async function scan(watch) {
    if (watch.scanning || !watches.has(watch.id) || closed) return;
    watch.scanning = true; status();
    try {
      const root = await fs.realpath(watch.root);
      if (root.toLowerCase() !== watch.root.toLowerCase() || !(await fs.stat(root)).isDirectory()) throw new Error('Folder moved or is unavailable.');
      const scanned = await scanAppDirectory(root, watch.kind);
      if (!watches.has(watch.id) || closed) return;
      watch.warning = [scanned.truncated ? 'Safety limit reached: 500 files, 20,000 entries, or 12 folder levels. Select smaller folders for the rest.' : '', scanned.skippedDirectories ? `${scanned.skippedDirectories} inaccessible subfolders skipped.` : ''].filter(Boolean).join(' ');
      const discovered = [];
      for (const file of scanned.files) {
        const id = registerEntry(file.filePath);
        if (watch.seen.has(id)) continue;
        if (watch.seen.size >= 500) { watch.warning = 'This watched folder reached its 500-entry session limit. Stop monitoring and choose a smaller folder to continue.'; break; }
        watch.seen.add(id);
        if (entries.has(id)) continue;
        const kind = path.extname(file.fileName).toLowerCase() === '.exe' ? 'apps' : 'games';
        const entry = { id, folderId: watch.id, kind, fileName: file.fileName, relativePath: file.relativePath, title: file.fileName.replace(/\.[^.]+$/, '').replace(/[_]+/g, ' ').slice(0, 120) || 'Imported item', system: kind === 'games' ? inferSystem(file.relativePath, watch.system) : metadata.emulatorFor(file.fileName)?.[2] || 'Multi-system' };
        entries.set(id, entry); discovered.push(entry);
      }
      if (discovered.length) { emit({ type: 'entries', entries: discovered }); discovered.forEach(enqueue); }
      watch.lastScan = Date.now();
    } catch { if (watches.has(watch.id)) watch.warning = 'This folder is inaccessible or moved. Check it or stop watching and select it again.'; }
    finally { watch.scanning = false; status(); }
  }
  const timer = setInterval(() => { for (const watch of watches.values()) void scan(watch); }, 15000);
  timer.unref();
  ipcMain.handle('emuhub:scanner-state', event => { authorize(event); return snapshot(); });
  ipcMain.handle('emuhub:scanner-connect', async (event, value) => {
    authorize(event);
    if (connecting || working) throw new Error('Wait for the current metadata request to finish before reconnecting.');
    connecting = true;
    try { await metadata.configure(value, AbortSignal.timeout(35000)); authorize(event); paused = false; error = ''; void work(); status(); return { connected: true }; }
    finally { connecting = false; }
  });
  ipcMain.handle('emuhub:scanner-start', async (event, options) => {
    authorize(event);
    if (process.platform !== 'win32') throw new Error('Continuous directory monitoring requires EmuHub for Windows.');
    if (selecting) throw new Error('A folder picker is already open.');
    if (!options || !['apps', 'games', 'both'].includes(options.kind) || !['detect', ...Object.keys(metadata.systemIds)].includes(options.system)) throw new Error('Choose a valid folder type and console.');
    if (options.kind !== 'apps' && !metadata.connected()) throw new Error('Connect ScreenScraper before starting a game or mixed-folder scan.');
    if (watches.size >= 5) throw new Error('Watch up to five folders per session. Stop one before adding another.');
    selecting = true;
    try {
      const choice = await dialog.showOpenDialog(getWindow(), { title: 'Select a folder to monitor automatically', properties: ['openDirectory'] });
      if (choice.canceled || !choice.filePaths[0]) return null;
      authorize(event);
      const root = await fs.realpath(choice.filePaths[0]);
      const contained = (parent, child) => { const relative = path.relative(parent.toLowerCase(), child.toLowerCase()); return relative === '' || relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative); };
      if ([...watches.values()].some(watch => contained(watch.root, root) || contained(root, watch.root))) throw new Error('This folder overlaps an active watched folder. Stop that folder first or choose a separate directory.');
      const watch = { id: randomUUID(), root, name: path.basename(root) || 'Selected drive', kind: options.kind, system: options.system, seen: new Set(), lastScan: null, scanning: false, warning: '' };
      watches.set(watch.id, watch); void scan(watch); status();
      return { id: watch.id };
    } finally { selecting = false; }
  });
  ipcMain.handle('emuhub:scanner-stop', (event, id) => {
    authorize(event);
    if (typeof id !== 'string' || !watches.has(id)) throw new Error('Select an active watched folder.');
    watches.delete(id); queue = queue.filter(entry => entry.folderId !== id);
    if (current?.entry.folderId === id) current.controller.abort();
    for (const entry of entries.values()) if (entry.folderId === id && entry.metadata?.status === 'pending') result(entry, { status: 'unmatched', message: 'Monitoring stopped before metadata completed. Start the folder again to resume.' });
    for (const [entryId, entry] of entries) if (entry.folderId === id) entries.delete(entryId);
    status();
  });
  ipcMain.handle('emuhub:scanner-resume', event => {
    authorize(event); paused = false; error = '';
    for (const entry of entries.values()) if (entry.metadata?.status === 'error') enqueue(entry);
    void work(); status();
  });
  ipcMain.handle('emuhub:scanner-retry', (event, id, system, title) => {
    authorize(event);
    const entry = entries.get(id);
    if (!entry || !watches.has(entry.folderId) || typeof title !== 'string' || !title.trim() || title.length > 120 || !['Multi-system', 'Modern', ...Object.keys(metadata.systemIds)].includes(system)) throw new Error('Retry an entry from an active monitored folder with a valid title and console.');
    if (current?.entry.id === id) throw new Error('This entry is already being processed.');
    entry.system = system; entry.title = title.trim(); enqueue(entry); status();
  });
  ipcMain.handle('emuhub:scanner-disconnect', event => {
    authorize(event); metadata.disconnect(); paused = true; error = 'ScreenScraper disconnected. Reconnect to continue game metadata.';
    if (current?.entry.kind === 'games') { const entry = current.entry; current.controller.abort(); queue.unshift(entry); }
    status();
  });
  return () => { closed = true; clearInterval(timer); current?.controller.abort(); watches.clear(); queue = []; entries.clear(); metadata.clear(); };
}
module.exports = { installLibraryScanner };
