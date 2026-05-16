'use client';

import { useEffect, useState } from 'react';

export default function TitleBar() {
  const [appWindow, setAppWindow] = useState<any>(null);

  useEffect(() => {
    import('@tauri-apps/api/window').then(({ getCurrentWindow }) => {
      setAppWindow(getCurrentWindow());
    });
  }, []);

  const handleMinimize = () => appWindow?.minimize();
  const handleMaximize = async () => {
    if (!appWindow) return;
    const isMaximized = await appWindow.isMaximized();
    if (isMaximized) appWindow.unmaximize();
    else appWindow.maximize();
  };
  const handleClose = () => appWindow?.close();

  return (
    <div
      data-tauri-drag-region
      className="h-10 bg-[#1a1a1a] flex items-center justify-between px-4 select-none"
      onMouseDown={() => appWindow?.startDragging()}
    >
      <span className="text-white/50 text-xs font-medium tracking-wide ml-2">
        ProjectLibre
      </span>

      <div className="flex items-center gap-2" data-tauri-drag-region="false">
        <button onClick={handleMinimize} className="w-8 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
          <svg width="12" height="2" viewBox="0 0 12 2"><rect x="0" y="0" width="12" height="1.5" fill="currentColor" /></svg>
        </button>
        <button onClick={handleMaximize} className="w-8 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 rounded transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12"><rect x="1.5" y="1.5" width="9" height="9" stroke="currentColor" strokeWidth="1.5" fill="none" /></svg>
        </button>
        <button onClick={handleClose} className="w-8 h-7 flex items-center justify-center text-white/50 hover:text-white hover:bg-red-500/60 rounded transition-colors">
          <svg width="12" height="12" viewBox="0 0 12 12"><path d="M1 1L11 11M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        </button>
      </div>
    </div>
  );
}