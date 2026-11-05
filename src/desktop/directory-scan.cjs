const fs = require('node:fs/promises');
const path = require('node:path');

async function scanAppDirectory(root) {
  const queue = [{ folder: root, depth: 0 }];
  const files = [];
  let inspected = 0;
  let skippedDirectories = 0;
  let truncated = false;
  while (queue.length && inspected < 20000 && files.length < 500) {
    const { folder, depth } = queue.shift();
    try {
      const resolved = await fs.realpath(folder);
      const relative = path.relative(root, resolved);
      if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) continue;
      const directory = await fs.opendir(resolved);
      for await (const entry of directory) {
        inspected += 1;
        if (entry.isSymbolicLink()) {
          if (inspected >= 20000) { truncated = true; break; }
          continue;
        }
        const filePath = path.join(resolved, entry.name);
        if (entry.isDirectory()) {
          if (depth < 12) queue.push({ folder: filePath, depth: depth + 1 });
          else truncated = true;
        } else if (entry.isFile() && path.extname(entry.name).toLowerCase() === '.exe') {
          files.push({ filePath, fileName: entry.name, relativePath: path.relative(root, filePath) });
        }
        if (inspected >= 20000 || files.length >= 500) { truncated = true; break; }
      }
    } catch { skippedDirectories += 1; }
  }
  return { files, truncated, skippedDirectories };
}

module.exports = { scanAppDirectory };
