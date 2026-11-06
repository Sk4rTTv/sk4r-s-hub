const fs = require('node:fs/promises');
const path = require('node:path');
const { createHash, randomUUID } = require('node:crypto');
const formats = require('../types/game-formats.json');

function installPlayStats({ app, ipcMain, authorize, resolveEntry }) {
  let document = null;
  let transaction = Promise.resolve();
  const serial = operation => { const result = transaction.then(operation, operation); transaction = result.catch(() => {}); return result; };
  const folderPath = () => path.join(app.isPackaged ? path.dirname(app.getPath('exe')) : app.getAppPath(), 'saves');
  const empty = () => ({ totalMinutes: 0, lastPlayed: null, sessionCount: 0 });
  const validStats = value => value && Number.isSafeInteger(value.totalMinutes) && value.totalMinutes >= 0 && Number.isSafeInteger(value.sessionCount) && value.sessionCount >= 0 && (value.lastPlayed === null || typeof value.lastPlayed === 'string' && Number.isFinite(Date.parse(value.lastPlayed)) && Date.parse(value.lastPlayed) >= 0) && Array.isArray(value.sessionIds) && value.sessionCount === value.sessionIds.length && value.sessionIds.every(id => typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id)) && new Set(value.sessionIds).size === value.sessionIds.length;
  async function checkedFolder() {
    const folder = folderPath();
    await fs.mkdir(folder, { recursive: true });
    const info = await fs.lstat(folder);
    if (!info.isDirectory() || info.isSymbolicLink()) throw new Error('The saves folder must be a real directory beside EmuHub, not a link.');
    return folder;
  }
  async function load() {
    if (document) return;
    try {
      const folder = await checkedFolder();
      const file = path.join(folder, 'play-stats.json');
      let fileInfo;
      try { fileInfo = await fs.lstat(file); } catch (cause) { if (cause.code !== 'ENOENT') throw cause; }
      if (!fileInfo) { document = { version: 1, games: {} }; return; }
      if (!fileInfo.isFile() || fileInfo.isSymbolicLink() || fileInfo.size > 8 * 1024 * 1024) throw new Error('Invalid play-stat save file.');
      const data = JSON.parse(await fs.readFile(file, 'utf8'));
      if (data?.version !== 1 || !data.games || typeof data.games !== 'object' || Array.isArray(data.games) || Object.keys(data.games).length > 10000 || !Object.entries(data.games).every(([key, value]) => /^[a-f0-9]{64}$/.test(key) && validStats(value))) throw new Error('Invalid play-stat save file.');
      if (!Number.isSafeInteger(Object.values(data.games).reduce((sum, value) => sum + value.totalMinutes, 0)) || !Number.isSafeInteger(Object.values(data.games).reduce((sum, value) => sum + value.sessionCount, 0))) throw new Error('Invalid saved totals.');
      document = data;
    } catch { throw new Error('Could not read EmuHub’s saves/play-stats.json. Check app-folder permissions and the save file. Existing data was not overwritten.'); }
  }
  function keyFor(id) {
    if (typeof id !== 'string') throw new Error('Import this game directory again before logging playtime.');
    const filePath = resolveEntry(id);
    if (!filePath || !Object.hasOwn(formats, path.extname(filePath).toLowerCase())) throw new Error('Log playtime only for a game imported from a selected directory.');
    return createHash('sha256').update(filePath.toLowerCase()).digest('hex');
  }
  function snapshot(ids) {
    const games = {};
    for (const id of ids) { const value = document.games[keyFor(id)]; games[id] = value ? { totalMinutes: value.totalMinutes, lastPlayed: value.lastPlayed, sessionCount: value.sessionCount } : empty(); }
    const values = Object.values(document.games);
    const totalMinutes = values.reduce((total, value) => total + value.totalMinutes, 0);
    const sessionCount = values.reduce((total, value) => total + value.sessionCount, 0);
    if (!Number.isSafeInteger(totalMinutes) || !Number.isSafeInteger(sessionCount)) throw new Error('Saved playtime totals exceed the supported range. The save file was not changed.');
    return { games, totalMinutes, sessionCount, saveFolder: folderPath() };
  }
  ipcMain.handle('emuhub:read-play-stats', (event, ids) => {
    authorize(event);
    if (!Array.isArray(ids) || ids.length > 3000 || ids.some(id => typeof id !== 'string')) throw new Error('Choose valid game entries.');
    return serial(async () => { await load(); authorize(event); return snapshot(ids); });
  });
  ipcMain.handle('emuhub:log-play-session', (event, id, session) => {
    authorize(event);
    const key = keyFor(id);
    if (!session || typeof session.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(session.id) || !Number.isInteger(session.minutes) || session.minutes < 1 || session.minutes > 1440 || typeof session.playedAt !== 'string' || !Number.isFinite(Date.parse(session.playedAt)) || Date.parse(session.playedAt) < 0 || Date.parse(session.playedAt) > Date.now() + 60000) throw new Error('Enter a completed session of 1 minute to 24 hours and a date that is not in the future.');
    return serial(async () => {
      await load(); authorize(event);
      const previous = document.games[key];
      if (previous?.sessionIds.includes(session.id)) return snapshot([id]);
      if (!previous && Object.keys(document.games).length >= 10000) throw new Error('The save file reached its 10,000-game safety limit.');
      const next = { version: 1, games: { ...document.games, [key]: { totalMinutes: (previous?.totalMinutes || 0) + session.minutes, lastPlayed: previous?.lastPlayed && Date.parse(previous.lastPlayed) > Date.parse(session.playedAt) ? previous.lastPlayed : new Date(session.playedAt).toISOString(), sessionCount: (previous?.sessionCount || 0) + 1, sessionIds: [...(previous?.sessionIds || []), session.id] } } };
      if (!Number.isSafeInteger(Object.values(next.games).reduce((sum, value) => sum + value.totalMinutes, 0)) || !Number.isSafeInteger(Object.values(next.games).reduce((sum, value) => sum + value.sessionCount, 0))) throw new Error('The saved totals reached the play-stat safety limit.');
      let temporary;
      try {
        const folder = await checkedFolder();
        const target = path.join(folder, 'play-stats.json');
        try { const info = await fs.lstat(target); if (!info.isFile() || info.isSymbolicLink()) throw new Error('Invalid save target.'); } catch (cause) { if (cause.code !== 'ENOENT') throw cause; }
        temporary = path.join(folder, `play-stats-${randomUUID()}.tmp`);
        const content = JSON.stringify(next, null, 2);
        if (Buffer.byteLength(content) > 8 * 1024 * 1024) throw new Error('Save size limit reached.');
        await fs.writeFile(temporary, content, { flag: 'wx', mode: 0o600 });
        await fs.rename(temporary, target);
        document = next;
      } catch { if (temporary) await fs.unlink(temporary).catch(() => {}); throw new Error('Could not save playtime. EmuHub needs a writable saves folder beside the app. Your previous stats are unchanged; retry without closing this form.'); }
      return snapshot([id]);
    });
  });
}
module.exports = { installPlayStats };
