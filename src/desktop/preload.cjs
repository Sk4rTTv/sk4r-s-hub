const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('emuDesktop', {
  selectExecutable: () => ipcRenderer.invoke('emuhub:select-executable'),
  selectAppDirectory: () => ipcRenderer.invoke('emuhub:select-app-directory'),
  selectGameDirectory: () => ipcRenderer.invoke('emuhub:select-game-directory'),
  launchExecutable: id => ipcRenderer.invoke('emuhub:launch-executable', id),
  listProjectionSources: () => ipcRenderer.invoke('emuhub:list-projection-sources'),
  selectProjectionSource: id => ipcRenderer.invoke('emuhub:select-projection-source', id),
  scannerState: () => ipcRenderer.invoke('emuhub:scanner-state'),
  connectScanner: credentials => ipcRenderer.invoke('emuhub:scanner-connect', credentials),
  startScanner: options => ipcRenderer.invoke('emuhub:scanner-start', options),
  stopScanner: id => ipcRenderer.invoke('emuhub:scanner-stop', id),
  resumeScanner: () => ipcRenderer.invoke('emuhub:scanner-resume'),
  retryScannerMetadata: (id, system, title) => ipcRenderer.invoke('emuhub:scanner-retry', id, system, title),
  disconnectScanner: () => ipcRenderer.invoke('emuhub:scanner-disconnect'),
  onScannerEvent: callback => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('emuhub:library-scanner-event', listener);
    return () => ipcRenderer.removeListener('emuhub:library-scanner-event', listener);
  },
  readPlayStats: ids => ipcRenderer.invoke('emuhub:read-play-stats', ids),
  logPlaySession: (id, session) => ipcRenderer.invoke('emuhub:log-play-session', id, session),
});
