'use client';

import { useEffect } from 'react';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    import('@tauri-apps/api/core').then(({ invoke }) => {
      setTimeout(() => {
        invoke('close_splashscreen');
      }, 2300);
    });
  }, []);

  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
} 