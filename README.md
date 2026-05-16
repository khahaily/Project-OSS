```markdown
# OpenProject Libre

A modern, open-source project management desktop application built with Tauri and Next.js. Designed as a free alternative to Microsoft Project with a familiar ribbon interface and full Gantt chart support.

## Features

- **Ribbon Interface** — Familiar tabbed toolbar (File, Task, Resource, View, Project)
- **Task Management** — Create, edit, indent, and delete tasks with WBS auto-numbering
- **Gantt Chart** — Interactive Gantt chart with zoom controls and today line
- **Summary Tasks & Milestones** — Collapsible hierarchy with diamond milestone markers
- **Dependencies** — Link tasks with Finish-to-Start relationships
- **Progress Tracking** — Percentage complete with visual bar fills
- **Import/Export** — Read and write Microsoft Project MSPDI XML format
- **Cross-Platform** — Runs on Windows, macOS, and Linux

## Tech Stack

| Layer | Technology |
|:---|:---|
| Desktop Framework | Tauri 2.x (Rust backend) |
| Frontend | Next.js 16 + React 19 |
| Styling | Tailwind CSS 4 |
| State Management | React Context + Zustand |
| File Format | MSPDI XML (Microsoft Project compatible) |
| Database (Planned) | SQLite via `tauri-plugin-sql` |

## Getting Started

### Prerequisites

- Node.js 20+
- Rust toolchain (install via `rustup.rs`)
- pnpm

### Development

```bash
# Install dependencies
pnpm install

# Run in development mode
pnpm tauri dev
```

The splash screen appears first, followed by the main application window.

### Build for Production

```bash
pnpm tauri build
```

The distributable package will be in `src-tauri/target/release/bundle/`.

## Project Structure

```
projectlibre-pro/
├── app/                    # Next.js App Router pages
│   ├── editor/             # Main editor with task table + Gantt
│   ├── globals.css         # Tailwind + custom styles
│   ├── layout.tsx          # Root layout with splash dismiss
│   └── page.tsx            # Home screen (New / Open)
├── components/             # React components
│   ├── layout/
│   │   ├── TitleBar.tsx    # Custom window title bar
│   │   └── ...
│   └── ...
├── public/
│   └── splash.html         # Splash screen (MS Project-style)
├── src-tauri/              # Tauri (Rust) backend
│   ├── src/
│   │   └── main.rs         # Window management + splash logic
│   └── tauri.conf.json     # Tauri configuration
└── package.json
```

## File Format

This application uses the **MSPDI XML** format (Microsoft Project Data Interchange) for import and export. This format:

- Is fully documented by Microsoft
- Supports tasks, resources, calendars, dependencies, and baselines
- Can be opened natively by Microsoft Project
- Does not require the proprietary `.mpp` binary format

## Architecture

The application follows a three-layer architecture:

```
┌─────────────────────────────┐
│   React Frontend (Next.js)  │  ← UI rendering, state management
├─────────────────────────────┤
│   Tauri Bridge (IPC)        │  ← Rust ↔ JavaScript communication
├─────────────────────────────┤
│   Rust Backend              │  ← File I/O, XML parsing, SQLite
└─────────────────────────────┘
```

## Keyboard Shortcuts

| Shortcut | Action |
|:---|:---|
| `Ctrl + I` | Insert task |
| `Ctrl + D` | Delete selected task |
| `Ctrl + L` | Link selected task to predecessor |
| `Ctrl + ]` | Indent task |
| `Ctrl + [` | Outdent task |
| `Ctrl + +/-` | Zoom Gantt chart |
| `Ctrl + 0` | Zoom to fit |
| `Delete` | Delete selected task |

## Roadmap

- [x] Splash screen with animated loading
- [x] Home screen with New / Open project
- [x] Ribbon interface with tab switching
- [x] Task table with inline editing
- [x] Basic Gantt chart rendering
- [x] Insert, delete, indent, outdent tasks
- [x] Link tasks (FS dependency)
- [x] Custom window title bar
- [ ] SQLite local persistence
- [ ] MSPDI XML import/export
- [ ] Resource sheet view
- [ ] Dependency arrows on Gantt chart
- [ ] Drag-to-resize Gantt bars
- [ ] Baseline tracking
- [ ] Calendar view
- [ ] Critical path highlighting
- [ ] Scroll sync between table and Gantt

## License

This project is an independent implementation and does not use any code from ProjectLibre or MPXJ. The MSPDI XML format is a publicly documented Microsoft specification.

## Acknowledgments

- Inspired by Microsoft Project's interface design
- Built on the incredible work of the Tauri and Next.js communities
```
