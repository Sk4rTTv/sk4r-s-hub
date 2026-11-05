# Tech Stack

- React + TypeScript, React Router; keep routes in `src/App.tsx`.
- Pages in `src/pages/`, components in `src/components/`; main page is `src/pages/Index.tsx`.
- Use customized shadcn/ui components and Tailwind CSS. Do not edit the shared shadcn/ui files.
- lucide-react and the shadcn/Radix dependencies are available.

# Windows Desktop

- EmuHub also has an Electron desktop shell in `src/desktop/main.cjs` and `preload.cjs`.
- Vite uses relative asset paths; desktop routing uses HashRouter, browser routing uses BrowserRouter.
- Only expose narrow, typed `window.emuDesktop` methods. Keep nodeIntegration off, contextIsolation and sandbox on.
- Validate IPC main-frame senders. Native launching is Windows-only: select `.exe` in the native picker, register it in the main process, launch only registered IDs with explicit user confirmation and `shell: false`. Never accept arbitrary renderer paths, arguments, commands, or IPC channels.
- Executable registrations and app/media state last for the current session. No automatic native launch or silent screen capture.
- Native emulators run in their own windows; projection is display-only window sharing, not embedded execution or remote input.
- `desktop` and `desktop:package` npm scripts provide local startup and Windows NSIS packaging. The web preview/build does not test Windows runtime or produce the installer.
