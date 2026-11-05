# EmuHub Windows desktop

EmuHub's Electron shell runs the bundled React UI locally. The browser preview remains an organizer and window mirror; native executable launching is only available in Electron.

## Project tasks

- `desktop`: builds the frontend and opens the Electron app.
- `desktop:package`: builds the frontend and creates a Windows x64 NSIS installer in `desktop-release/`.

Windows packaging requires a suitable desktop build environment. The normal Vite production build does not create this installer. Electron/Windows runtime behavior must be tested on Windows before distributing a release. Unsigned installers may trigger Windows SmartScreen; release signing is not configured.

## Dolphin flow

1. Install or extract the Windows Dolphin emulator separately, keeping its supporting files together.
2. In EmuHub desktop, Add App → Choose installed app (.exe) → select Dolphin.exe → Add app. Artwork is configured separately on the cartridge.
3. Open App Projection Hub, choose the Dolphin entry, click Launch emulator, and confirm the native launch prompt.
4. Dolphin opens in its own window. To mirror its display, click Project app window and explicitly select its window.

Launching does not embed Dolphin, load a game automatically, or route controller/keyboard input through EmuHub. Use Dolphin's own UI. Stop projection stops sharing, not Dolphin. APK files require an Android emulator and are not executable targets for this launcher.

## Security and lifetime

The main process registers only executables selected with its native file picker. The renderer receives an opaque ID, not arbitrary command execution. Launches use no shell and no renderer-supplied arguments, require confirmation, and validate the selected executable again. The renderer is sandboxed and isolated from Node.

Only the trusted main frame can request a launch or capture. Remote navigation and embedded frames are blocked, external HTTP(S) links open in the system browser, and window sharing requires explicit selection. No server, recording, or file upload is involved.

The executable registry, app list, and uploaded media are session-only. Closing EmuHub loses these selections. The launcher does not copy executables, install emulators, or automatically run anything on startup.
