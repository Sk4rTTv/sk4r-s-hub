const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('emuDesktop', {
  selectExecutable: () => ipcRenderer.invoke('emuhub:select-executable'),
  launchExecutable: id => ipcRenderer.invoke('emuhub:launch-executable', id),
});
