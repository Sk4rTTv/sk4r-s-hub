const { nativeImage } = require('electron');
const { setTimeout: delay } = require('node:timers/promises');

const systemIds = { NES: 3, SNES: 4, 'Nintendo 64': 14, GameCube: 13, Wii: 16, 'Game Boy': 9, 'Game Boy Color': 10, 'Game Boy Advance': 12, 'Nintendo DS': 15, 'Nintendo 3DS': 17, Genesis: 1, 'Sega Saturn': 22, Dreamcast: 23, PlayStation: 57, 'PlayStation 2': 58, PSP: 61, 'PS Vita': 62, 'Atari 2600': 26, 'TurboGrafx-16': 31, 'Neo Geo': 142 };
const emulators = [
  ['dolphin', 'Dolphin (emulator)', 'GameCube'], ['project64', 'Project64', 'Nintendo 64'], ['pcsx2', 'PCSX2', 'PlayStation 2'],
  ['xemu', 'Xemu', 'Modern'], ['xenia', 'Xenia (emulator)', 'Modern'], ['cemu', 'Cemu', 'Modern'],
  ['sameboy', 'SameBoy', 'Game Boy'], ['mgba', 'mGBA', 'Game Boy Advance'], ['ppsspp', 'PPSSPP', 'PSP'],
  ['azahar', 'Azahar (emulator)', 'Nintendo 3DS'], ['retroarch', 'RetroArch', 'Multi-system'],
];
let credentials = null;
let nextRequest = 0;
let artworkBytes = 0;
const cache = new Map();
const text = value => typeof value === 'string' ? value.trim().slice(0, 4000) : undefined;
const normalize = value => String(value).normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const cleanTitle = value => value.replace(/\([^)]*\)|\[[^\]]*\]/g, '').replace(/[_]+/g, ' ').trim();
function emulatorFor(fileName) {
  const stem = fileName.replace(/\.exe$/i, '').toLowerCase();
  return emulators.find(([name]) => stem === name || stem.startsWith(name) && /^[-_](?:v?\d[\w.-]*|x64|x86|qt|avx2|sse4)$/.test(stem.slice(name.length)) || (name === 'ppsspp' && /^ppsspp(?:windows)?(?:64)?$/.test(stem)) || (name === 'xenia' && stem === 'xenia_canary'));
}
async function bytes(response, limit) {
  if (!response.body) throw new Error('The metadata service returned an empty response.');
  if (Number(response.headers.get('content-length')) > limit) { await response.body.cancel(); throw new Error('The metadata response exceeded its size limit.'); }
  const parts = []; let size = 0;
  const reader = response.body.getReader();
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > limit) { await reader.cancel(); throw new Error('The metadata response exceeded its size limit.'); }
      parts.push(Buffer.from(value));
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(parts);
}
async function json(url, signal) {
  let response;
  try { response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]), redirect: 'error', headers: { 'User-Agent': 'EmuHub/1.0 (desktop metadata catalog)', Accept: 'application/json' } }); }
  catch { throw new Error('Metadata request failed or timed out. Check your connection and retry.'); }
  if (new URL(url).hostname === 'api.screenscraper.fr' && [401, 403, 426, 429, 430, 431].includes(response.status)) {
    await response.body?.cancel();
    const error = new Error([429, 430, 431].includes(response.status) ? 'ScreenScraper quota or rate limit reached. Metadata is paused; retry later.' : 'ScreenScraper rejected the credentials or application. Reconnect with valid developer and member credentials.');
    error.pause = true; throw error;
  }
  if (response.status === 404) { await response.body?.cancel(); return null; }
  if (!response.ok) { await response.body?.cancel(); throw new Error(`Metadata service unavailable (HTTP ${response.status}). Retry later.`); }
  try { return JSON.parse((await bytes(response, 5 * 1024 * 1024)).toString('utf8')); }
  catch { throw new Error('The metadata service returned an invalid response. Check credentials and service availability.'); }
}
async function screenscraper(endpoint, params, signal, account = credentials) {
  if (!account) { const error = new Error('Connect ScreenScraper before fetching game metadata.'); error.pause = true; throw error; }
  await delay(Math.max(0, nextRequest - Date.now()), undefined, { signal });
  nextRequest = Date.now() + 2500;
  const url = new URL(`https://api.screenscraper.fr/api2/${endpoint}.php`);
  url.search = new URLSearchParams({ devid: account.developerId, devpassword: account.developerPassword, softname: 'EmuHub', output: 'json', ssid: account.username, sspassword: account.password, ...params }).toString();
  return json(url, signal);
}
async function configure(value, signal) {
  if (!value || !['developerId', 'developerPassword', 'username', 'password'].every(key => typeof value[key] === 'string' && value[key].length > 0 && value[key].length <= 200)) throw new Error('Enter all four ScreenScraper credentials (maximum 200 characters each).');
  const account = { developerId: value.developerId, developerPassword: value.developerPassword, username: value.username, password: value.password };
  const result = await screenscraper('ssuserInfos', {}, signal, account);
  if (!result?.response?.ssuser?.id && !result?.response?.ssuser?.numid) throw new Error('ScreenScraper did not validate this account. Check your developer and member credentials.');
  credentials = account;
}
async function artwork(rawUrl, signal, source) {
  if (typeof rawUrl !== 'string' || artworkBytes >= 100 * 1024 * 1024) return undefined;
  let url;
  try { url = new URL(rawUrl); } catch { return undefined; }
  const valid = target => target.protocol === 'https:' && !target.username && !target.password && !target.port && (source === 'Wikipedia' ? target.hostname === 'upload.wikimedia.org' : target.hostname === 'screenscraper.fr' || target.hostname.endsWith('.screenscraper.fr'));
  if (url.protocol === 'http:') url.protocol = 'https:';
  if (!valid(url)) return undefined;
  for (let redirect = 0; redirect <= 3; redirect++) {
    const response = await fetch(url, { signal: AbortSignal.any([signal, AbortSignal.timeout(30000)]), redirect: 'manual' });
    if ([301, 302, 303, 307, 308].includes(response.status)) {
      const location = response.headers.get('location'); await response.body?.cancel();
      if (!location) return undefined;
      url = new URL(location, url);
      if (!valid(url)) return undefined;
      continue;
    }
    if (!response.ok || !['image/png', 'image/jpeg', 'image/webp'].includes(response.headers.get('content-type')?.split(';')[0])) { await response.body?.cancel(); return undefined; }
    const buffer = await bytes(response, 10 * 1024 * 1024);
    const image = nativeImage.createFromBuffer(buffer);
    const dimensions = image.getSize();
    if (image.isEmpty() || dimensions.width * dimensions.height > 16000000) return undefined;
    artworkBytes += buffer.length;
    return `data:${response.headers.get('content-type').split(';')[0]};base64,${buffer.toString('base64')}`;
  }
}
async function gameMetadata(entry, signal) {
  const systemId = systemIds[entry.system];
  if (!systemId) return { status: 'needs-console', message: 'Choose a supported console and retry metadata.' };
  const params = { systemeid: String(systemId), romnom: entry.fileName, romtype: 'rom' };
  const renamed = entry.title && normalize(cleanTitle(entry.title)) !== normalize(cleanTitle(entry.fileName.replace(/\.[^.]+$/, '')));
  let game = renamed ? undefined : (await screenscraper('jeuInfos', params, signal))?.response?.jeu;
  if (!game) {
    const search = await screenscraper('jeuRecherche', { systemeid: String(systemId), recherche: cleanTitle(entry.title || entry.fileName) }, signal);
    const matches = (Array.isArray(search?.response?.jeux) ? search.response.jeux : []).filter(candidate => Array.isArray(candidate.noms) && candidate.noms.some(name => normalize(name.text) === normalize(cleanTitle(entry.title || entry.fileName))));
    if (new Set(matches.map(candidate => String(candidate.id))).size !== 1) return { status: 'unmatched', message: 'No unique match. Edit the title/console and retry; existing artwork is unchanged.' };
    game = matches[0];
    if (/^\d+$/.test(String(game.id))) game = (await screenscraper('jeuInfos', { gameid: String(game.id), systemeid: String(systemId) }, signal))?.response?.jeu || game;
  }
  if (!/^\d+$/.test(String(game.id)) || !Array.isArray(game.noms) || !game.noms.length) return { status: 'unmatched', message: 'The provider did not return an identifiable game.' };
  if (game.systeme?.id && Number(game.systeme.id) !== systemId) return { status: 'unmatched', message: 'The provider returned a different console; metadata was not applied.' };
  const years = (Array.isArray(game.dates) ? game.dates : []).map(date => Number(String(date.text).match(/\b(?:19|20)\d{2}\b/)?.[0])).filter(year => year >= 1950 && year <= new Date().getUTCFullYear() + 2);
  const media = (Array.isArray(game.medias) ? game.medias : []).filter(item => String(item.type).toLowerCase() === 'box-2d').sort((a, b) => (a.region === 'us' ? 0 : a.region === 'wor' ? 1 : 2) - (b.region === 'us' ? 0 : b.region === 'wor' ? 1 : 2))[0];
  let cover;
  try { cover = await artwork(media?.url, signal, 'ScreenScraper'); } catch { if (signal.aborted) throw new Error('Canceled'); }
  return { status: 'matched', source: 'ScreenScraper', sourceUrl: `https://www.screenscraper.fr/gameinfos.php?gameid=${game.id}`, description: text((Array.isArray(game.synopsis) ? game.synopsis : []).find(item => item.langue === 'en')?.text), releaseYear: years.length ? Math.min(...years) : undefined, developer: text(game.developpeur?.text), artwork: cover, message: media && !cover ? 'Text metadata fetched; artwork was unavailable or exceeded the session image budget.' : undefined };
}
async function applicationMetadata(entry, signal) {
  const emulator = emulatorFor(entry.fileName);
  if (!emulator) return { status: 'unmatched', message: 'No recognized emulator name. This application remains in your library without guessed metadata.' };
  const url = new URL('https://en.wikipedia.org/w/api.php');
  url.search = new URLSearchParams({ action: 'query', format: 'json', formatversion: '2', redirects: '1', titles: emulator[1], prop: 'extracts|pageprops|pageimages|info', exintro: '1', explaintext: '1', piprop: 'thumbnail', pithumbsize: '600', inprop: 'url' }).toString();
  const page = (await json(url, signal))?.query?.pages?.[0];
  if (!page || page.missing || page.pageprops?.disambiguation !== undefined || normalize(String(page.title).replace(/\s*\(emulator\)$/i, '')) !== normalize(emulator[0])) return { status: 'unmatched', message: 'No specific encyclopedia entry was available for this emulator.' };
  let developer; let releaseYear; let message;
  const entityId = page.pageprops?.wikibase_item;
  try {
    if (/^Q\d+$/.test(entityId || '')) {
      const entity = (await json(`https://www.wikidata.org/wiki/Special:EntityData/${entityId}.json`, signal))?.entities?.[entityId];
      const dates = entity?.claims?.P577 || [];
      const years = dates.map(claim => Number(claim.mainsnak?.datavalue?.value?.time?.match(/^\+(\d{4})-/)?.[1])).filter(year => year >= 1950 && year <= new Date().getUTCFullYear());
      releaseYear = years.length ? Math.min(...years) : undefined;
      const ids = (entity?.claims?.P178 || []).map(claim => claim.mainsnak?.datavalue?.value?.id).filter(id => /^Q\d+$/.test(id || '')).slice(0, 8);
      if (ids.length) {
        const labels = await json(`https://www.wikidata.org/w/api.php?action=wbgetentities&format=json&props=labels&languages=en&ids=${ids.join('|')}`, signal);
        developer = ids.map(id => labels?.entities?.[id]?.labels?.en?.value).filter(Boolean).join(', ') || undefined;
      }
    }
  } catch { if (signal.aborted) throw new Error('Canceled'); message = 'Description fetched; additional Wikidata fields were unavailable.'; }
  let cover;
  try { cover = await artwork(page.thumbnail?.source, signal, 'Wikipedia'); } catch { if (signal.aborted) throw new Error('Canceled'); }
  return { status: 'matched', source: 'Wikipedia', sourceUrl: `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title.replace(/ /g, '_'))}`, description: text(page.extract), releaseYear, developer, artwork: cover, system: emulator[2], message };
}
async function lookup(entry, signal) {
  const key = `${entry.kind}:${entry.system}:${entry.title || entry.fileName}:${entry.fileName}`;
  if (cache.has(key)) return cache.get(key);
  const result = entry.kind === 'games' ? await gameMetadata(entry, signal) : await applicationMetadata(entry, signal);
  if (result.status === 'matched' && cache.size < 1000) cache.set(key, result);
  return result;
}
module.exports = { configure, lookup, emulatorFor, systemIds, connected: () => !!credentials, disconnect: () => { credentials = null; }, clear: () => { credentials = null; cache.clear(); artworkBytes = 0; } };
