# Stickies - Quick Notes with AI Organization

## Overview

A quick-jot notes app where AI handles organization. Capture thoughts via text or voice from any device. AI auto-clusters related notes and enables semantic search. Local-first with optional cloud sync.

## Core Principles

- **Capture fast** - Single input field, keyboard shortcut, voice when hands are busy
- **AI organizes** - No manual tags or folders; AI clusters and labels automatically
- **Local-first** - Data stays on your devices, sync is optional
- **Universal access** - Works on desktop, web, mobile, and CLI

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Clients                              │
├──────────┬──────────┬──────────┬──────────┬─────────────┤
│   PWA    │  Tauri   │ Capacitor│   CLI    │  (Future)   │
│  (Web)   │(Desktop) │ (Mobile) │          │             │
└──────────┴──────────┴──────────┴──────────┴─────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│              Shared Core (TypeScript)                    │
├─────────────────────────────────────────────────────────┤
│  • Note CRUD                                             │
│  • AI Orchestration (organize, transcribe)               │
│  • Search index                                          │
│  • Sync engine                                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                   Local Storage                          │
├─────────────────────────────────────────────────────────┤
│  SQLite (sql.js in browser, better-sqlite3 in native)    │
│  Notes, clusters, embeddings cached locally.             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ (optional)
┌─────────────────────────────────────────────────────────┐
│                   Cloud Sync                             │
│         Self-hosted server or S3 + auth                  │
└─────────────────────────────────────────────────────────┘
```

One TypeScript core library shared across all clients. The UI is a thin shell.

## Data Model

```typescript
// The core unit - a quick jot
Note {
  id: string
  content: string          // The raw text or cleaned transcription
  source: 'text' | 'voice' // How it was captured
  rawTranscript?: string   // Original voice if applicable
  createdAt: timestamp
  updatedAt: timestamp
}

// AI-generated groupings
Cluster {
  id: string
  name: string             // AI-generated label like "Project Ideas"
  description?: string     // Brief AI summary of what's in here
  noteIds: string[]
  createdAt: timestamp
  updatedAt: timestamp
}

// For smart search
Embedding {
  noteId: string
  vector: float[]          // Semantic embedding for similarity search
}

// Sync state
SyncStatus {
  lastSyncedAt: timestamp
  pendingChanges: Change[]
  conflictQueue: Conflict[]
}
```

Notes are saved immediately. Clusters are fluid and recomputed as new notes arrive.

## User Interface

### Capture View (main screen)

```
┌─────────────────────────────────────────┐
│  ┌───────────────────────────────────┐  │
│  │ What's on your mind?          🎤  │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ Buy milk│ │ Call mom│ │ App idea│   │
│  │ eggs,   │ │ about   │ │ for pet │   │
│  │ bread   │ │ Sunday  │ │ tracking│   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                         │
│  [Capture]  [Browse]  [Search]         │
└─────────────────────────────────────────┘
```

- Big input at top, always ready
- Recent notes as glanceable cards
- Mic button for voice capture
- Three modes: Capture, Browse clusters, Search

### Platform-specific

**Desktop**: `Cmd+Shift+N` opens minimal floating window - type, enter, gone.

**CLI**:
```bash
$ jot "remember to email sarah"
✓ Saved

$ jot --voice
🎤 Listening...

$ jot browse   # TUI cluster browser
$ jot search "sarah"
```

## AI Orchestration

### 1. Voice Cleanup (on capture)

```
You speak: "uh so I was thinking maybe we should uh
            look into that thing for the garden"

AI returns: "Look into automatic sprinkler system for garden"
```

- Whisper API for transcription
- Local LLM cleans up filler and tightens phrasing
- Original transcript preserved

### 2. Embedding (on capture)

- Small local model (all-MiniLM-L6-v2 via Transformers.js)
- ~50ms per note
- Enables semantic search

### 3. Clustering (background)

```
Every N notes (or on-demand):
  1. Gather all embeddings
  2. Run HDBSCAN clustering
  3. LLM names each cluster in 2-3 words
  4. Update assignments
```

Triggers: After 5 new notes, on Browse view open, or manual refresh.

## Sync Engine

Local-first with CRDT-style conflict resolution.

### Change log

```typescript
Change {
  id: ulid()              // Time-sortable unique ID
  noteId: string
  operation: 'create' | 'update' | 'delete'
  data: Partial<Note>
  deviceId: string
  timestamp: timestamp
}
```

### Sync flow

1. Device comes online → pushes pending changes
2. Server merges by timestamp (last-write-wins per field)
3. Device pulls changes from other devices
4. Clusters re-computed locally after sync

### Conflict handling

- Same note edited on two devices: last edit wins per-field
- Deleted on one, edited on other: delete wins (30-day trash)
- Clusters never synced; computed locally (they converge)

### Server options

- Self-host: Node server + SQLite/Postgres
- Zero-config: S3/R2 bucket + auth
- None: Single device or manual export/import

### Privacy

- Optional client-side encryption before upload
- Server only sees encrypted blobs if enabled

## Project Structure

```
stickies/
├── packages/
│   ├── core/                 # Shared TypeScript library
│   │   ├── src/
│   │   │   ├── notes.ts      # CRUD operations
│   │   │   ├── ai.ts         # Orchestration
│   │   │   ├── search.ts     # Semantic + text search
│   │   │   ├── sync.ts       # Change log, merge
│   │   │   └── db.ts         # SQLite abstraction
│   │   └── package.json
│   │
│   ├── web/                  # PWA (React + Vite)
│   ├── desktop/              # Tauri shell
│   ├── mobile/               # Capacitor shell
│   └── cli/                  # Node CLI tool
│
├── server/                   # Optional sync server
│   └── src/
│       ├── auth.ts
│       ├── sync.ts
│       └── storage.ts
│
└── package.json              # Monorepo root
```

## Tech Stack

| Purpose | Choice |
|---------|--------|
| UI | React + Tailwind |
| Local DB | sql.js (browser), better-sqlite3 (native) |
| Embeddings | Transformers.js (local) |
| Transcription | Whisper API |
| Clustering | HDBSCAN |
| LLM | Ollama local or OpenAI API |
| Build | Vite + Turborepo |
| Monorepo | pnpm workspaces |
| Desktop | Tauri |
| Mobile | Capacitor |

## MVP Scope

For first working version:

1. **Web PWA only** - Get the core experience right
2. **Text input only** - Voice can come later
3. **Local storage only** - No sync yet
4. **Basic clustering** - Simple k-means, LLM naming
5. **Semantic search** - Embeddings + similarity

Desktop, mobile, CLI, voice, and sync are follow-on phases.
