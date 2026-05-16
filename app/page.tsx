'use client';

import TitleBar from '@/components/TitleBar';
import { useRouter } from 'next/navigation';

// Inside your component:


export default function Home() {
  const router = useRouter(); 
  const recentProjects = [
    'Smart Kiosk Deployment.pod',
    'MediCore HMS.pod',
    'OpenMarketPlace.pod',
    'FaceAttend AI.pod',
  ];

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <TitleBar />

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Dark Green, Brand Only */}
        <div className="w-[280px] bg-[#0a2a1a] flex items-center justify-center flex-shrink-0">
          <h1 className="text-white text-3xl font-light tracking-wide">
            ProjectLibre
          </h1>
        </div>

        {/* Right Panel - Content */}
        <div className="flex-1 bg-[#f3f2f1] flex flex-col justify-center px-16 overflow-hidden">
          
          {/* Big Action Buttons */}
          <div className="flex gap-4 mb-12">
            {/* New Project Button */}
            <button 
            onClick={() => router.push('/editor')}
            className="w-48 h-36 bg-white border-2 border-[#e04a44] rounded flex flex-col items-center justify-center gap-3 hover:shadow-lg hover:shadow-red-100 transition-shadow"
          >
            <DocumentIcon className="w-10 h-10 text-[#2a723b]" />
            <span className="text-sm font-medium text-[#323130]">Blank Project</span>
          </button>

            {/* Open Existing Button */}
            <button 
              onClick={() => router.push('/projects')}
              className="w-48 h-36 bg-white border border-[#edebe9] rounded flex flex-col items-center justify-center gap-3 hover:border-[#3e9e51] hover:shadow-md transition-all"
            >
              <FolderIcon className="w-10 h-10 text-[#b0b0b0]" />
              <span className="text-sm font-medium text-[#323130]">Open Existing</span>
            </button>
          </div>

          {/* Recent Projects */}
          <h2 className="text-sm font-semibold text-[#605e5c] uppercase tracking-wider mb-4">
            Recent
          </h2>
          <div className="space-y-2 max-w-md">
            {recentProjects.map((project, i) => (
              <div
                key={i}
                className="flex items-center gap-3 px-4 py-3 bg-white border border-[#edebe9] rounded-sm hover:border-[#3e9e51] hover:shadow-sm transition-all cursor-pointer group"
              >
                <FileSmallIcon className="w-4 h-4 text-[#6b7280] flex-shrink-0" />
                <span className="text-sm text-[#323130] group-hover:text-[#2a723b] transition-colors">
                  {project}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DocumentIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <line x1="16" y1="13" x2="8" y2="13" stroke="#3e9e51" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="16" y1="17" x2="8" y2="17" stroke="#3e9e51" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function FolderIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <path d="M3 9h18" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function FileSmallIcon({ className }: { className: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="currentColor" strokeWidth="1.5" fill="none" />
      <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="1.5" fill="none" />
    </svg>
  );
}