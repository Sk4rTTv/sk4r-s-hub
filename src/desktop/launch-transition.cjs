const { randomUUID } = require('node:crypto');

function installLaunchTransition({ app, ipcMain, authorize, getWindow }) {
  let pending = null;

  ipcMain.handle('emuhub:complete-launch-transition', (event, token, ready) => {
    authorize(event);
    if (typeof token !== 'string' || typeof ready !== 'boolean' || !pending || pending.token !== token || pending.frame !== event.senderFrame) throw new Error('Invalid launch transition.');
    const current = pending;
    pending = null;
    clearTimeout(current.timer);
    current.resolve(ready);
  });

  app.on('before-quit', () => {
    if (!pending) return;
    clearTimeout(pending.timer);
    pending.resolve(false);
    pending = null;
  });

  return (event, name) => {
    authorize(event);
    if (pending) throw new Error('A launch transition is already in progress.');
    return new Promise((resolve, reject) => {
      const token = randomUUID();
      const current = { token, frame: event.senderFrame, resolve, timer: null };
      current.timer = setTimeout(() => {
        if (pending !== current) return;
        pending = null;
        reject(new Error('The launch transition did not finish. Please try again.'));
      }, 5000);
      pending = current;
      getWindow().webContents.send('emuhub:launch-transition', { token, name });
    });
  };
}

module.exports = { installLaunchTransition };
