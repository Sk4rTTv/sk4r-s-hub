const { app, BrowserWindow, ipcMain, dialog, shell, desktopCapturer } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { pathToFileURL } = require('node:url');
const { randomUUID } = require('node:crypto');
const { spawn } = require('node:child_process');
const { scanAppDirectory } = require('./directory-scan.cjs');

let window;
const executables = new Map();
const directoryEntries = new Map();
let scanningDirectory = false;
const projectionSources = new Map();
let selectedProjection = null;
const indexFile = path.resolve(__dirname, '../../dist/index.html');
const indexUrl = pathToFileURL(indexFile).href;

function trustedFrame(frame) {
  return window && !window.isDestroyed() && frame === window.webContents.mainFrame && frame.url.split('#')[0] === indexUrl;
}
function authorize(event) {
  if (!trustedFrame(event.senderFrame)) throw new Error('Untrusted launcher request.');
}
async function checkedExecutable(filePath) {
  const resolved = await fs.realpath(filePath);
  if (!path.isAbsolute(resolved) || path.extname(resolved).toLowerCase() !== '.exe' || !(await fs.stat(resolved)).isFile()) throw new Error('Choose an installed Windows executable (.exe).');
  return resolved;
}

ipcMain.handle('emuhub:select-executable', async event => {
  authorize(event);
  if (process.platform !== 'win32') throw new Error('Native launching is configured for Windows.');
  const result = await dialog.showOpenDialog(window, { title: 'Select installed emulator — e.g. Dolphin.exe', properties: ['openFile'], filters: [{ name: 'Windows emulator application', extensions: ['exe'] }] });
  if (result.canceled || !result.filePaths[0]) return null;
  const filePath = await checkedExecutable(result.filePaths[0]);
  const existing = [...executables.entries()].find(([, entry]) => entry.filePath === filePath);
  const id = existing?.[0] ?? randomUUID();
  const name = path.basename(filePath, path.extname(filePath));
  executables.set(id, { filePath, name });
  return { id, name, fileName: path.basename(filePath) };
});

ipcMain.handle('emuhub:select-app-directory', async event => {
  authorize(event);
  if (process.platform !== 'win32') throw new Error('Desktop directory scanning is configured for Windows.');
  if (scanningDirectory) throw new Error('A directory scan is already in progress.');
  scanningDirectory = true;
  try {
    const result = await dialog.showOpenDialog(window, { title: 'Choose a folder of installed apps', properties: ['openDirectory'] });
    if (result.canceled || !result.filePaths[0]) return null;
    authorize(event);
    const root = await fs.realpath(result.filePaths[0]);
    if (!(await fs.stat(root)).isDirectory()) throw new Error('Choose an app directory.');
    const scan = await scanAppDirectory(root);
    authorize(event);
    const entries = scan.files.map(file => {
      const key = file.filePath.toLowerCase();
      if (!directoryEntries.has(key)) directoryEntries.set(key, randomUUID());
      return { id: directoryEntries.get(key), fileName: file.fileName, relativePath: file.relativePath };
    });
    return { folderName: path.basename(root) || 'Selected drive', entries, truncated: scan.truncated, skippedDirectories: scan.skippedDirectories };
  } finally { scanningDirectory = false; }
});

ipcMain.handle('emuhub:launch-executable', async (event, id) => {
  authorize(event);
  if (typeof id !== 'string' || !executables.has(id)) throw new Error('Select this emulator again before launching.');
  const entry = executables.get(id);
  const executable = await checkedExecutable(entry.filePath);
  const confirmation = await dialog.showMessageBox(window, { type: 'question', title: 'Launch emulator', message: `Open ${entry.name}?`, detail: `This runs the selected executable on your computer in its own window. Only launch apps you trust.\n\n${executable}`, buttons: ['Cancel', 'Launch'], defaultId: 0, cancelId: 0, noLink: true });
  if (confirmation.response !== 1) return { launched: false };
  await new Promise((resolve, reject) => {
    const child = spawn(executable, [], { cwd: path.dirname(executable), shell: false, detached: true, stdio: 'ignore', windowsHide: false });
    child.once('error', () => reject(new Error('Windows could not start this emulator. Check that it is installed with its required files.')));
    child.once('spawn', () => { child.unref(); resolve(); });
  });
  return { launched: true };
});

ipcMain.handle('emuhub:list-projection-sources', async event => {
  authorize(event);
  const sources = await desktopCapturer.getSources({ types: ['screen', 'window'], thumbnailSize: { width: 0, height: 0 } });
  projectionSources.clear();
  return sources.filter(source => source.name !== 'EmuHub').map(source => {
    const id = randomUUID();
    const type = source.id.startsWith('screen:') ? 'monitor' : 'application';
    const name = type === 'monitor' ? source.name.replace(/^Screen/i, 'Monitor') : source.name;
    projectionSources.set(id, { sourceId: source.id, name, type });
    return { id, name, type };
  });
});

ipcMain.handle('emuhub:select-projection-source', (event, id) => {
  authorize(event);
  if (typeof id !== 'string' || !projectionSources.has(id)) throw new Error('Refresh the source list and select an available monitor or application.');
  selectedProjection = { ...projectionSources.get(id), expires: Date.now() + 30000 };
});

function createWindow() {
  window = new BrowserWindow({ width: 1280, height: 900, minWidth: 680, minHeight: 500, title: 'EmuHub', backgroundColor: '#10143f', autoHideMenuBar: true, webPreferences: { preload: path.join(__dirname, 'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true, webSecurity: true } });
  const session = window.webContents.session;
  session.setPermissionRequestHandler((contents, permission, callback, details) => {
    callback(contents === window.webContents && permission === 'display-capture' && details.isMainFrame && window.webContents.mainFrame.url.split('#')[0] === indexUrl);
  });
  session.setPermissionCheckHandler((contents, permission) => contents === window.webContents && permission === 'display-capture' && trustedFrame(contents.mainFrame));
  session.setDisplayMediaRequestHandler(async (request, callback) => {
    try {
      if (!trustedFrame(request.frame) || !request.userGesture) { callback({}); return; }
      const target = selectedProjection;
      selectedProjection = null;
      if (!target || target.expires < Date.now()) { callback({}); return; }
      const sources = await desktopCapturer.getSources({ types: [target.type === 'monitor' ? 'screen' : 'window'], thumbnailSize: { width: 0, height: 0 } });
      const source = sources.find(entry => entry.id === target.sourceId);
      if (!source) { callback({}); return; }
      const choice = await dialog.showMessageBox(window, { title: 'Confirm mirroring', message: `Mirror ${source.name}?`, detail: target.type === 'monitor' ? 'The entire monitor will be visible, including other windows and notifications. No recording or upload takes place.' : 'Only this application window will be mirrored. No recording or upload takes place.', buttons: ['Cancel', 'Mirror'], defaultId: 0, cancelId: 0, noLink: true });
      if (choice.response !== 1 || !trustedFrame(request.frame)) { callback({}); return; }
      callback({ video: source });
    } catch { callback({}); }
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    try { const link = new URL(url); if (['http:', 'https:'].includes(link.protocol)) void shell.openExternal(link.href); } catch {}
    return { action: 'deny' };
  });
  window.webContents.on('will-navigate', event => event.preventDefault());
  window.webContents.on('will-attach-webview', event => event.preventDefault());
  session.webRequest.onHeadersReceived((details, callback) => callback({ responseHeaders: { ...details.responseHeaders, 'Content-Security-Policy': ["default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; font-src 'self' data:; connect-src 'self'; frame-src 'none'; object-src 'none'; base-uri 'none'"] } }));
  void window.loadFile(indexFile);
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
