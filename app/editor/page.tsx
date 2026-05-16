'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import TitleBar from '@/components/TitleBar';

interface Task {
  id: number;
  wbs: string;
  name: string;
  duration: number;
  start: Date;
  finish: Date;
  pct: number;
  summary: boolean;
  level: number;
  predecessors: number[];
  milestone: boolean;
  collapsed: boolean;
}

let taskIdCounter = 1;

const ROW_HEIGHT = 32;

export default function EditorPage() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const initial: Task = {
      id: taskIdCounter++,
      wbs: '1',
      name: 'New Task',
      duration: 5,
      start: new Date(2026, 4, 25),
      finish: new Date(2026, 4, 30),
      pct: 0,
      summary: false,
      level: 0,
      predecessors: [],
      milestone: false,
      collapsed: false,
    };
    return [initial];
  });

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(1);
  const [editingCell, setEditingCell] = useState<{ taskId: number; field: string } | null>(null);
  const [activeTab, setActiveTab] = useState('tab-task');
  const [dayWidth, setDayWidth] = useState(28);
  const tableBodyRef = useRef<HTMLDivElement>(null);
  const ganttBodyRef = useRef<HTMLDivElement>(null);
  const ganttHeaderRef = useRef<HTMLDivElement>(null);

  const DAY_WIDTH = dayWidth;
  const PROJECT_START = new Date(2026, 4, 25);
  const TODAY = new Date(2026, 5, 15);

  const daysBetween = (d1: Date, d2: Date) => Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const recalculateWBS = useCallback(() => {
    const counters = [0, 0, 0, 0, 0];
    setTasks(prev => prev.map(task => {
      const level = task.level;
      for (let i = level + 1; i < 5; i++) counters[i] = 0;
      counters[level]++;
      return { ...task, wbs: counters.slice(0, level + 1).join('.') };
    }));
  }, []);

  const insertTask = () => {
    const idx = selectedTaskId ? tasks.findIndex(t => t.id === selectedTaskId) + 1 : tasks.length;
    const newId = taskIdCounter++;
    const newTask: Task = {
      id: newId,
      wbs: '',
      name: 'New Task',
      duration: 5,
      start: new Date(PROJECT_START),
      finish: new Date(PROJECT_START.getTime() + 5 * 86400000),
      pct: 0,
      summary: false,
      level: 0,
      predecessors: [],
      milestone: false,
      collapsed: false,
    };
    const newTasks = [...tasks];
    newTasks.splice(idx, 0, newTask);
    setTasks(newTasks);
    setSelectedTaskId(newId);
    recalculateWBS();
  };

  const deleteSelectedTask = () => {
    if (!selectedTaskId) return;
    setTasks(prev => prev.filter(t => t.id !== selectedTaskId));
    setSelectedTaskId(null);
    recalculateWBS();
  };

  const indentTask = () => {
    if (!selectedTaskId) return;
    setTasks(prev => prev.map(t => {
      if (t.id === selectedTaskId && t.level < 4) {
        const idx = prev.findIndex(pt => pt.id === selectedTaskId);
        const prevTask = idx > 0 ? prev[idx - 1] : null;
        const newLevel = t.level + 1;
        if (prevTask && newLevel === prevTask.level + 1 && !prevTask.summary) {
          prevTask.summary = true;
        }
        return { ...t, level: newLevel };
      }
      return t;
    }));
    recalculateWBS();
  };

  const outdentTask = () => {
    if (!selectedTaskId) return;
    setTasks(prev => prev.map(t => {
      if (t.id === selectedTaskId && t.level > 0) {
        return { ...t, level: t.level - 1 };
      }
      return t;
    }));
    recalculateWBS();
  };

  const linkTasks = () => {
    if (!selectedTaskId) return;
    const idx = tasks.findIndex(t => t.id === selectedTaskId);
    if (idx > 0) {
      const predecessor = tasks[idx - 1];
      setTasks(prev => prev.map(t => {
        if (t.id === selectedTaskId && !t.predecessors.includes(predecessor.id)) {
          return {
            ...t,
            predecessors: [...t.predecessors, predecessor.id],
            start: new Date(predecessor.finish.getTime() + 86400000),
            finish: new Date(predecessor.finish.getTime() + 86400000 + t.duration * 86400000),
          };
        }
        return t;
      }));
    }
  };

  const updateTaskField = (taskId: number, field: string, value: any) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const updated = { ...t, [field]: value };
      if (field === 'duration' && !t.milestone) {
        updated.finish = new Date(updated.start.getTime() + (value || 0) * 86400000);
      }
      if (field === 'name' && value === '0d') {
        updated.milestone = true;
        updated.duration = 0;
        updated.finish = new Date(updated.start);
      }
      return updated;
    }));
  };

  const visibleTasks = tasks;

  const totalDays = 90;
  const totalWidth = totalDays * DAY_WIDTH;
  const totalHeight = visibleTasks.length * ROW_HEIGHT + 60;

  const ganttStartX = 0;

  const handleGanttBarDrag = (taskId: number, newStartOffset: number) => {
    const newStart = new Date(PROJECT_START.getTime() + newStartOffset * 86400000);
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t;
      const finish = new Date(newStart.getTime() + t.duration * 86400000);
      return { ...t, start: newStart, finish };
    }));
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-50">
      <TitleBar />

      {/* Green Top Bar */}
      <header className="bg-[#217346] text-white px-4 py-1.5 flex justify-between items-center text-sm flex-shrink-0">
        <div className="flex items-center gap-4">
          <span className="font-bold text-base tracking-wide">OpenProject Libre</span>
          <span className="opacity-80 text-xs">Untitled Project *</span>
        </div>
      </header>

      {/* Ribbon */}
      <nav className="bg-white border-b border-gray-300 shadow-sm flex-shrink-0">
        <div className="flex text-xs border-b border-gray-200">
          {[
            { id: 'tab-file', label: 'File', icon: FileIcon },
            { id: 'tab-task', label: 'Task', icon: CheckSquareIcon },
            { id: 'tab-resource', label: 'Resource', icon: UsersIcon },
            { id: 'tab-view', label: 'View', icon: EyeIcon },
            { id: 'tab-project', label: 'Project', icon: BriefcaseIcon },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`px-5 py-2.5 font-medium flex items-center gap-1.5 transition-colors ${
                activeTab === id
                  ? 'text-[#217346] border-b-2 border-[#217346]'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Ribbon Content */}
        <div className="p-2.5 gap-5 items-center bg-gray-50 overflow-x-auto flex-shrink-0 flex">
          {activeTab === 'tab-file' && (
            <>
              <RibbonGroup label="File">
                <RibbonButton icon={SaveIcon} label="Save" />
                <RibbonButton icon={FolderOpenIcon} label="Open" />
                <RibbonButton icon={FilePlusIcon} label="New" />
              </RibbonGroup>
              <RibbonGroup label="Output">
                <RibbonButton icon={PrinterIcon} label="Print" />
                <RibbonButton icon={DownloadIcon} label="Export" />
              </RibbonGroup>
            </>
          )}
          {activeTab === 'tab-task' && (
            <>
              <RibbonGroup label="Edit">
                <RibbonButton icon={PlusCircleIcon} label="Insert" onClick={insertTask} />
                <RibbonButton icon={TrashIcon} label="Delete" onClick={deleteSelectedTask} />
                <RibbonButton icon={ArrowRightIcon} label="Indent" onClick={indentTask} />
                <RibbonButton icon={ArrowLeftIcon} label="Outdent" onClick={outdentTask} />
              </RibbonGroup>
              <RibbonGroup label="Schedule">
                <RibbonButton icon={LinkIcon} label="Link" onClick={linkTasks} />
                <RibbonButton icon={UnlinkIcon} label="Unlink" />
                <RibbonButton icon={CheckCircleIcon} label="100%" onClick={() => {
                  if (selectedTaskId) updateTaskField(selectedTaskId, 'pct', 100);
                }} />
              </RibbonGroup>
            </>
          )}
          {activeTab === 'tab-view' && (
            <RibbonGroup label="Zoom">
              <RibbonButton icon={ZoomInIcon} label="In" onClick={() => setDayWidth(prev => Math.min(56, prev + 4))} />
              <RibbonButton icon={ZoomOutIcon} label="Out" onClick={() => setDayWidth(prev => Math.max(14, prev - 4))} />
            </RibbonGroup>
          )}
        </div>
      </nav>

      {/* Main Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Task Table */}
        <div className="w-[45%] min-w-[350px] border-r-2 border-gray-400 bg-white flex flex-col flex-shrink-0">
          <div className="bg-gray-100 border-b border-gray-300 flex-shrink-0">
            <table className="w-full text-left text-xs border-collapse">
              <colgroup>
                <col style={{ width: '36px' }} />
                <col style={{ width: '28px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '60px' }} />
                <col style={{ width: '72px' }} />
                <col style={{ width: '72px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '56px' }} />
              </colgroup>
              <thead>
                <tr>
                  <th className="p-2 border-r border-gray-300 text-center">ID</th>
                  <th className="p-2 border-r border-gray-300 text-center"></th>
                  <th className="p-2 border-r border-gray-300">Task Name</th>
                  <th className="p-2 border-r border-gray-300 text-center">Duration</th>
                  <th className="p-2 border-r border-gray-300">Start</th>
                  <th className="p-2 border-r border-gray-300">Finish</th>
                  <th className="p-2 border-r border-gray-300">Pred</th>
                  <th className="p-2 text-center">%</th>
                </tr>
              </thead>
            </table>
          </div>
          <div className="flex-1 overflow-y-auto overflow-x-hidden" ref={tableBodyRef}>
            <table className="w-full text-left text-xs border-collapse">
              <colgroup>
                <col style={{ width: '36px' }} />
                <col style={{ width: '28px' }} />
                <col style={{ width: 'auto' }} />
                <col style={{ width: '60px' }} />
                <col style={{ width: '72px' }} />
                <col style={{ width: '72px' }} />
                <col style={{ width: '80px' }} />
                <col style={{ width: '56px' }} />
              </colgroup>
              <tbody>
                {visibleTasks.map((task, idx) => (
                  <tr
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className={`cursor-pointer transition-colors ${
                      task.id === selectedTaskId
                        ? 'bg-blue-50 outline outline-1 outline-blue-400 outline-offset-[-1px]'
                        : task.summary
                        ? 'bg-gray-50 font-semibold'
                        : idx % 2 === 0
                        ? 'bg-white'
                        : 'bg-gray-50/50'
                    } hover:bg-blue-50/50`}
                    style={{ height: ROW_HEIGHT }}
                  >
                    <td className="p-2 border-r border-gray-200 text-gray-500 text-center">{task.wbs}</td>
                    <td className="p-2 border-r border-gray-200 text-center text-gray-400">
                      {task.milestone ? '◆' : task.summary ? (task.collapsed ? '▶' : '▼') : '•'}
                    </td>
                    <td className="p-2 border-r border-gray-200" style={{ paddingLeft: 12 + task.level * 16 }}>
                      <input
                        className="w-full bg-transparent outline-none border-b border-transparent focus:border-blue-400"
                        value={task.name}
                        onChange={e => updateTaskField(task.id, 'name', e.target.value)}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-2 border-r border-gray-200 text-center">
                      <input
                        className="w-full bg-transparent outline-none border-b border-transparent focus:border-blue-400 text-center"
                        value={task.milestone ? '0d' : `${task.duration}d`}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          if (val === 0) {
                            updateTaskField(task.id, 'milestone', true);
                            updateTaskField(task.id, 'duration', 0);
                          } else {
                            updateTaskField(task.id, 'milestone', false);
                            updateTaskField(task.id, 'duration', val);
                          }
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                    <td className="p-2 border-r border-gray-200 text-[10px]">{formatDate(task.start)}</td>
                    <td className="p-2 border-r border-gray-200 text-[10px]">{formatDate(task.finish)}</td>
                    <td className="p-2 border-r border-gray-200 text-[10px] text-center">
                      {task.predecessors.length > 0 ? task.predecessors.join(',') + 'FS' : ''}
                    </td>
                    <td className="p-2 text-center">
                      <input
                        className="w-10 bg-transparent outline-none border-b border-transparent focus:border-blue-400 text-center"
                        value={`${task.pct}%`}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 0;
                          updateTaskField(task.id, 'pct', Math.min(100, Math.max(0, val)));
                        }}
                        onClick={e => e.stopPropagation()}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Gantt Chart */}
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
          <div className="flex-shrink-0 border-b border-gray-300 bg-gray-100 overflow-hidden" ref={ganttHeaderRef}>
            <div style={{ minWidth: totalWidth, height: 36, position: 'relative' }}>
              {(() => {
                const months = ['May 2026', 'June 2026', 'July 2026', 'August 2026'];
                return months.map((m, i) => (
                  <div
                    key={m}
                    className="absolute top-0 h-full border-r border-gray-300 text-center text-[10px] font-semibold text-gray-600 pt-1"
                    style={{ left: i * 30 * DAY_WIDTH, width: 30 * DAY_WIDTH }}
                  >
                    {m}
                  </div>
                ));
              })()}
            </div>
          </div>
          <div className="flex-1 overflow-auto" ref={ganttBodyRef}>
            <div
              className="relative"
              style={{
                minWidth: totalWidth,
                minHeight: totalHeight,
                backgroundSize: `${DAY_WIDTH}px 100%`,
                backgroundImage: 'linear-gradient(to right, #e5e7eb 1px, transparent 1px)',
              }}
            >
              {/* Today line */}
              {(() => {
                const offset = daysBetween(PROJECT_START, TODAY);
                const x = offset * DAY_WIDTH;
                return (
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
                    style={{ left: x }}
                  >
                    <span className="absolute -top-4 left-0 text-[9px] text-red-500 font-semibold whitespace-nowrap">
                      Today
                    </span>
                  </div>
                );
              })()}

              {/* Gantt bars */}
              {visibleTasks.map((task, idx) => {
                const y = idx * ROW_HEIGHT + 6;
                const startOffset = daysBetween(PROJECT_START, task.start);
                const barWidth = task.milestone ? 0 : Math.max(task.duration * DAY_WIDTH, 4);
                const x = startOffset * DAY_WIDTH;

                if (task.milestone) {
                  return (
                    <div
                      key={task.id}
                      className="absolute z-10 cursor-pointer"
                      style={{ left: x - 9, top: y + 2 }}
                      onClick={() => setSelectedTaskId(task.id)}
                    >
                      <div className="w-0 h-0 border-l-[8px] border-r-[8px] border-b-[14px] border-l-transparent border-r-transparent border-b-gray-800"></div>
                    </div>
                  );
                }

                return (
                  <div
                    key={task.id}
                    className={`absolute h-5 rounded-sm cursor-pointer flex items-center px-1.5 text-[9px] text-white z-10 transition-shadow hover:shadow-lg ${
                      task.summary ? 'bg-gray-800' : 'bg-blue-500'
                    }`}
                    style={{ left: x, top: y, width: barWidth }}
                    onClick={() => setSelectedTaskId(task.id)}
                  >
                    {!task.summary && (
                      <div
                        className="absolute left-0 top-0 h-full rounded-l-sm bg-black/25"
                        style={{ width: `${task.pct}%` }}
                      />
                    )}
                    <span className="relative z-10 truncate">
                      {task.summary ? task.name : `${task.pct}%`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Status Bar */}
      <footer className="bg-gray-100 border-t border-gray-300 text-[11px] px-3 py-1.5 flex justify-between items-center text-gray-600 flex-shrink-0">
        <span>READY</span>
        <div className="flex gap-3 items-center">
          <span>Zoom:</span>
          <input
            type="range"
            className="w-24 accent-green-700"
            min={14}
            max={56}
            value={dayWidth}
            onChange={e => setDayWidth(parseInt(e.target.value))}
          />
          <span className="font-mono w-10 text-right">{dayWidth}px</span>
        </div>
      </footer>
    </div>
  );
}

// --- Ribbon Components ---
function RibbonGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center border-r border-gray-300 pr-4">
      <div className="flex gap-2 mb-1">{children}</div>
      <span className="text-[9px] uppercase text-gray-500 font-bold tracking-wider">{label}</span>
    </div>
  );
}

function RibbonButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center p-1.5 hover:bg-white hover:shadow-sm rounded border border-transparent hover:border-gray-200 transition"
    >
      <Icon className="w-5 h-5" />
      <span className="text-[10px]">{label}</span>
    </button>
  );
}

// --- SVG Icons ---
function FileIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
    </svg>
  );
}

function CheckSquareIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <polyline points="9,11 11,13 15,9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16" />
    </svg>
  );
}

function SaveIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
      <polyline points="17,21 17,13 7,13 7,21" />
      <polyline points="7,3 7,8 15,8" />
    </svg>
  );
}

function FolderOpenIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      <path d="M3 9h18" />
    </svg>
  );
}

function FilePlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="12" y1="18" x2="12" y2="12" />
      <line x1="9" y1="15" x2="15" y2="15" />
    </svg>
  );
}

function PrinterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="6,9 6,2 18,2 18,9" />
      <path d="M6 12H4a2 2 0 00-2 2v4a2 2 0 002 2h16a2 2 0 002-2v-4a2 2 0 00-2-2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
      <polyline points="7,10 12,15 17,10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function PlusCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12,5 19,12 12,19" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12,19 5,12 12,5" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </svg>
  );
}

function UnlinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M18.36 6.64a9 9 0 11-12.73 0" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  );
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="9,12 11,14 15,10" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ZoomInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}

function ZoomOutIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  );
}