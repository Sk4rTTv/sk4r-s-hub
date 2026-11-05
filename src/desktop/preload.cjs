const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('emuDesktop', {
  selectExecutable: () => ipcRenderer.invoke('emuhub:select-executable'),
  launchExecutable: id => ipcRenderer.invoke('emuhub:launch-executable', id),
  listProjectionSources: () => ipcRenderer.invoke('emuhub:list-projection-sources'),
  selectProjectionSource: id => ipcRenderer.invoke('emuhub:select-projection-source', id),
});
