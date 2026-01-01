# Stickies MVP Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a working web PWA for quick notes with AI-powered clustering and semantic search.

**Architecture:** Monorepo with shared core library and React PWA. SQLite via sql.js for browser storage. Transformers.js for local embeddings. Simple k-means clustering with LLM-generated labels.

**Tech Stack:** pnpm workspaces, TypeScript, React, Vite, Tailwind, sql.js, Transformers.js, Vitest

---

## Phase 1: Project Scaffolding

### Task 1: Initialize Monorepo

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`
- Create: `tsconfig.base.json`

**Step 1: Create root package.json**

```json
{
  "name": "stickies",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "pnpm --filter @stickies/web dev",
    "build": "pnpm --filter @stickies/core build && pnpm --filter @stickies/web build",
    "test": "pnpm -r test",
    "lint": "pnpm -r lint"
  },
  "devDependencies": {
    "typescript": "^5.3.3"
  }
}
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

**Step 3: Create .gitignore**

```
node_modules/
dist/
.env
.env.local
*.log
.DS_Store
```

**Step 4: Create tsconfig.base.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": false
  }
}
```

**Step 5: Install pnpm and initialize**

Run: `pnpm install`
Expected: Empty install (no deps yet in workspaces)

**Step 6: Commit**

```bash
git add -A
git commit -m "chore: initialize pnpm monorepo"
```

---

### Task 2: Create Core Package Structure

**Files:**
- Create: `packages/core/package.json`
- Create: `packages/core/tsconfig.json`
- Create: `packages/core/src/index.ts`
- Create: `packages/core/vitest.config.ts`

**Step 1: Create packages/core/package.json**

```json
{
  "name": "@stickies/core",
  "version": "0.0.1",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "devDependencies": {
    "vitest": "^2.0.0"
  }
}
```

**Step 2: Create packages/core/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["src/**/*"]
}
```

**Step 3: Create packages/core/vitest.config.ts**

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
  },
})
```

**Step 4: Create packages/core/src/index.ts**

```typescript
export const VERSION = '0.0.1'
```

**Step 5: Install dependencies**

Run: `cd packages/core && pnpm install`

**Step 6: Build and verify**

Run: `pnpm --filter @stickies/core build`
Expected: Creates dist/index.js and dist/index.d.ts

**Step 7: Commit**

```bash
git add -A
git commit -m "chore: add core package scaffold"
```

---

### Task 3: Create Web Package with Vite + React

**Files:**
- Create: `packages/web/package.json`
- Create: `packages/web/tsconfig.json`
- Create: `packages/web/vite.config.ts`
- Create: `packages/web/index.html`
- Create: `packages/web/src/main.tsx`
- Create: `packages/web/src/App.tsx`
- Create: `packages/web/src/index.css`

**Step 1: Create packages/web/package.json**

```json
{
  "name": "@stickies/web",
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint src"
  },
  "dependencies": {
    "@stickies/core": "workspace:*",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.38",
    "tailwindcss": "^3.4.4",
    "vite": "^5.4.0",
    "vite-plugin-pwa": "^0.20.0"
  }
}
```

**Step 2: Create packages/web/tsconfig.json**

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": {
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "noEmit": true
  },
  "include": ["src"]
}
```

**Step 3: Create packages/web/vite.config.ts**

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Stickies',
        short_name: 'Stickies',
        description: 'Quick notes with AI organization',
        theme_color: '#fbbf24',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
})
```

**Step 4: Create packages/web/postcss.config.js**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**Step 5: Create packages/web/tailwind.config.js**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sticky: {
          yellow: '#fbbf24',
          pink: '#f472b6',
          blue: '#60a5fa',
          green: '#4ade80',
        },
      },
    },
  },
  plugins: [],
}
```

**Step 6: Create packages/web/index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stickies</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Step 7: Create packages/web/src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  @apply bg-amber-50 min-h-screen;
}
```

**Step 8: Create packages/web/src/main.tsx**

```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

**Step 9: Create packages/web/src/App.tsx**

```tsx
import { VERSION } from '@stickies/core'

export default function App() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-amber-900">Stickies</h1>
      <p className="text-amber-700">Quick notes, AI organized. v{VERSION}</p>
    </div>
  )
}
```

**Step 10: Install dependencies**

Run: `pnpm install`

**Step 11: Build core and start dev server**

Run: `pnpm --filter @stickies/core build && pnpm dev`
Expected: Opens http://localhost:5173 with "Stickies" heading

**Step 12: Commit**

```bash
git add -A
git commit -m "feat: add web PWA with React + Vite + Tailwind"
```

---

## Phase 2: Core - Notes & Database

### Task 4: Add SQLite Database Layer

**Files:**
- Modify: `packages/core/package.json` (add sql.js)
- Create: `packages/core/src/db.ts`
- Create: `packages/core/src/db.test.ts`

**Step 1: Update packages/core/package.json**

Add to dependencies:
```json
"dependencies": {
  "sql.js": "^1.10.0",
  "uuid": "^9.0.1"
},
"devDependencies": {
  "@types/uuid": "^9.0.8",
  "vitest": "^2.0.0"
}
```

**Step 2: Write failing test for db initialization**

Create `packages/core/src/db.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createDatabase, type Database } from './db'

describe('Database', () => {
  let db: Database

  beforeEach(async () => {
    db = await createDatabase()
  })

  it('should initialize with notes table', async () => {
    const tables = db.exec(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='notes'"
    )
    expect(tables[0]?.values[0]?.[0]).toBe('notes')
  })
})
```

**Step 3: Run test to verify it fails**

Run: `pnpm --filter @stickies/core test`
Expected: FAIL - Cannot find module './db'

**Step 4: Implement database layer**

Create `packages/core/src/db.ts`:

```typescript
import initSqlJs, { type Database as SqlJsDatabase } from 'sql.js'

export type Database = SqlJsDatabase

export async function createDatabase(): Promise<Database> {
  const SQL = await initSqlJs()
  const db = new SQL.Database()

  db.run(`
    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'text',
      raw_transcript TEXT,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS embeddings (
      note_id TEXT PRIMARY KEY,
      vector BLOB NOT NULL,
      FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE
    )
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS clusters (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      note_ids TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)

  return db
}
```

**Step 5: Update packages/core/src/index.ts**

```typescript
export { createDatabase, type Database } from './db'
export const VERSION = '0.0.1'
```

**Step 6: Install dependencies**

Run: `cd packages/core && pnpm install`

**Step 7: Run test to verify it passes**

Run: `pnpm --filter @stickies/core test`
Expected: PASS

**Step 8: Commit**

```bash
git add -A
git commit -m "feat(core): add SQLite database layer with sql.js"
```

---

### Task 5: Add Note CRUD Operations

**Files:**
- Create: `packages/core/src/notes.ts`
- Create: `packages/core/src/notes.test.ts`
- Modify: `packages/core/src/index.ts`

**Step 1: Write failing tests for notes**

Create `packages/core/src/notes.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createDatabase, type Database } from './db'
import { createNote, getNote, getAllNotes, deleteNote, type Note } from './notes'

describe('Notes', () => {
  let db: Database

  beforeEach(async () => {
    db = await createDatabase()
  })

  it('should create a note', () => {
    const note = createNote(db, 'Buy milk')
    expect(note.content).toBe('Buy milk')
    expect(note.source).toBe('text')
    expect(note.id).toBeDefined()
  })

  it('should get a note by id', () => {
    const created = createNote(db, 'Test note')
    const fetched = getNote(db, created.id)
    expect(fetched?.content).toBe('Test note')
  })

  it('should get all notes', () => {
    createNote(db, 'Note 1')
    createNote(db, 'Note 2')
    const notes = getAllNotes(db)
    expect(notes.length).toBe(2)
  })

  it('should delete a note', () => {
    const note = createNote(db, 'To delete')
    deleteNote(db, note.id)
    expect(getNote(db, note.id)).toBeNull()
  })
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @stickies/core test`
Expected: FAIL - Cannot find module './notes'

**Step 3: Implement notes module**

Create `packages/core/src/notes.ts`:

```typescript
import { v4 as uuid } from 'uuid'
import type { Database } from './db'

export interface Note {
  id: string
  content: string
  source: 'text' | 'voice'
  rawTranscript?: string
  createdAt: number
  updatedAt: number
}

export function createNote(
  db: Database,
  content: string,
  source: 'text' | 'voice' = 'text',
  rawTranscript?: string
): Note {
  const id = uuid()
  const now = Date.now()

  db.run(
    `INSERT INTO notes (id, content, source, raw_transcript, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, content, source, rawTranscript ?? null, now, now]
  )

  return { id, content, source, rawTranscript, createdAt: now, updatedAt: now }
}

export function getNote(db: Database, id: string): Note | null {
  const result = db.exec(
    `SELECT id, content, source, raw_transcript, created_at, updated_at
     FROM notes WHERE id = ?`,
    [id]
  )

  if (!result[0]?.values[0]) return null

  const [noteId, content, source, rawTranscript, createdAt, updatedAt] =
    result[0].values[0] as [string, string, string, string | null, number, number]

  return {
    id: noteId,
    content,
    source: source as 'text' | 'voice',
    rawTranscript: rawTranscript ?? undefined,
    createdAt,
    updatedAt,
  }
}

export function getAllNotes(db: Database): Note[] {
  const result = db.exec(
    `SELECT id, content, source, raw_transcript, created_at, updated_at
     FROM notes ORDER BY created_at DESC`
  )

  if (!result[0]) return []

  return result[0].values.map(
    ([id, content, source, rawTranscript, createdAt, updatedAt]) => ({
      id: id as string,
      content: content as string,
      source: source as 'text' | 'voice',
      rawTranscript: (rawTranscript as string | null) ?? undefined,
      createdAt: createdAt as number,
      updatedAt: updatedAt as number,
    })
  )
}

export function deleteNote(db: Database, id: string): void {
  db.run(`DELETE FROM notes WHERE id = ?`, [id])
}
```

**Step 4: Update exports in index.ts**

```typescript
export { createDatabase, type Database } from './db'
export { createNote, getNote, getAllNotes, deleteNote, type Note } from './notes'
export const VERSION = '0.0.1'
```

**Step 5: Run tests**

Run: `pnpm --filter @stickies/core test`
Expected: PASS

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(core): add note CRUD operations"
```

---

## Phase 3: Core - Embeddings & Search

### Task 6: Add Embedding Generation

**Files:**
- Modify: `packages/core/package.json`
- Create: `packages/core/src/embeddings.ts`
- Create: `packages/core/src/embeddings.test.ts`

**Step 1: Update package.json with transformers.js**

Add to dependencies:
```json
"@xenova/transformers": "^2.17.0"
```

**Step 2: Write failing test**

Create `packages/core/src/embeddings.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import { generateEmbedding } from './embeddings'

describe('Embeddings', () => {
  it('should generate an embedding vector', async () => {
    const vector = await generateEmbedding('Hello world')
    expect(vector).toBeInstanceOf(Float32Array)
    expect(vector.length).toBeGreaterThan(0)
  }, 30000) // Allow time for model download
})
```

**Step 3: Run test to verify it fails**

Run: `pnpm --filter @stickies/core test`
Expected: FAIL - Cannot find module './embeddings'

**Step 4: Implement embeddings**

Create `packages/core/src/embeddings.ts`:

```typescript
import { pipeline, type FeatureExtractionPipeline } from '@xenova/transformers'

let extractor: FeatureExtractionPipeline | null = null

async function getExtractor(): Promise<FeatureExtractionPipeline> {
  if (!extractor) {
    extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    )
  }
  return extractor
}

export async function generateEmbedding(text: string): Promise<Float32Array> {
  const ext = await getExtractor()
  const output = await ext(text, { pooling: 'mean', normalize: true })
  return output.data as Float32Array
}

export function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
  }
  return dot // Already normalized
}
```

**Step 5: Update index.ts**

```typescript
export { createDatabase, type Database } from './db'
export { createNote, getNote, getAllNotes, deleteNote, type Note } from './notes'
export { generateEmbedding, cosineSimilarity } from './embeddings'
export const VERSION = '0.0.1'
```

**Step 6: Install and run test**

Run: `cd packages/core && pnpm install && pnpm test`
Expected: PASS (may take 30s first run to download model)

**Step 7: Commit**

```bash
git add -A
git commit -m "feat(core): add embedding generation with transformers.js"
```

---

### Task 7: Add Semantic Search

**Files:**
- Create: `packages/core/src/search.ts`
- Create: `packages/core/src/search.test.ts`

**Step 1: Write failing test**

Create `packages/core/src/search.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createDatabase, type Database } from './db'
import { createNote } from './notes'
import { indexNote, searchNotes } from './search'

describe('Search', () => {
  let db: Database

  beforeEach(async () => {
    db = await createDatabase()
  })

  it('should index and search notes', async () => {
    const note1 = createNote(db, 'Buy groceries: milk, eggs, bread')
    const note2 = createNote(db, 'Schedule dentist appointment')
    const note3 = createNote(db, 'Pick up dry cleaning')

    await indexNote(db, note1)
    await indexNote(db, note2)
    await indexNote(db, note3)

    const results = await searchNotes(db, 'food shopping')
    expect(results[0].note.id).toBe(note1.id) // Groceries most relevant
  }, 60000)
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @stickies/core test`
Expected: FAIL - Cannot find module './search'

**Step 3: Implement search**

Create `packages/core/src/search.ts`:

```typescript
import type { Database } from './db'
import type { Note } from './notes'
import { generateEmbedding, cosineSimilarity } from './embeddings'
import { getAllNotes } from './notes'

export async function indexNote(db: Database, note: Note): Promise<void> {
  const vector = await generateEmbedding(note.content)
  const buffer = Buffer.from(vector.buffer)

  db.run(
    `INSERT OR REPLACE INTO embeddings (note_id, vector) VALUES (?, ?)`,
    [note.id, buffer]
  )
}

export interface SearchResult {
  note: Note
  score: number
}

export async function searchNotes(
  db: Database,
  query: string,
  limit = 10
): Promise<SearchResult[]> {
  const queryVector = await generateEmbedding(query)
  const notes = getAllNotes(db)

  const results: SearchResult[] = []

  for (const note of notes) {
    const embResult = db.exec(
      `SELECT vector FROM embeddings WHERE note_id = ?`,
      [note.id]
    )

    if (!embResult[0]?.values[0]) continue

    const buffer = embResult[0].values[0][0] as Uint8Array
    const noteVector = new Float32Array(buffer.buffer)
    const score = cosineSimilarity(queryVector, noteVector)

    results.push({ note, score })
  }

  return results
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}
```

**Step 4: Update index.ts**

```typescript
export { createDatabase, type Database } from './db'
export { createNote, getNote, getAllNotes, deleteNote, type Note } from './notes'
export { generateEmbedding, cosineSimilarity } from './embeddings'
export { indexNote, searchNotes, type SearchResult } from './search'
export const VERSION = '0.0.1'
```

**Step 5: Run tests**

Run: `pnpm --filter @stickies/core test`
Expected: PASS

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(core): add semantic search with embeddings"
```

---

## Phase 4: Core - Clustering

### Task 8: Add Basic K-Means Clustering

**Files:**
- Create: `packages/core/src/clustering.ts`
- Create: `packages/core/src/clustering.test.ts`

**Step 1: Write failing test**

Create `packages/core/src/clustering.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createDatabase, type Database } from './db'
import { createNote } from './notes'
import { indexNote } from './search'
import { clusterNotes } from './clustering'

describe('Clustering', () => {
  let db: Database

  beforeEach(async () => {
    db = await createDatabase()
  })

  it('should cluster related notes together', async () => {
    // Food related
    const n1 = createNote(db, 'Buy milk and eggs')
    const n2 = createNote(db, 'Get groceries from store')
    // Work related
    const n3 = createNote(db, 'Finish quarterly report')
    const n4 = createNote(db, 'Schedule team meeting')

    for (const note of [n1, n2, n3, n4]) {
      await indexNote(db, note)
    }

    const clusters = await clusterNotes(db, 2)
    expect(clusters.length).toBe(2)

    // Notes about same topic should be in same cluster
    const cluster1NoteIds = clusters[0].noteIds
    const cluster2NoteIds = clusters[1].noteIds

    // Either n1&n2 together OR n3&n4 together (depends on clustering)
    const foodTogether =
      (cluster1NoteIds.includes(n1.id) && cluster1NoteIds.includes(n2.id)) ||
      (cluster2NoteIds.includes(n1.id) && cluster2NoteIds.includes(n2.id))

    expect(foodTogether).toBe(true)
  }, 60000)
})
```

**Step 2: Run test to verify it fails**

Run: `pnpm --filter @stickies/core test`
Expected: FAIL

**Step 3: Implement clustering**

Create `packages/core/src/clustering.ts`:

```typescript
import { v4 as uuid } from 'uuid'
import type { Database } from './db'
import { getAllNotes, type Note } from './notes'

export interface Cluster {
  id: string
  name: string
  description?: string
  noteIds: string[]
  createdAt: number
  updatedAt: number
}

interface NoteWithVector {
  note: Note
  vector: Float32Array
}

function euclideanDistance(a: Float32Array, b: Float32Array): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2
  }
  return Math.sqrt(sum)
}

function kMeans(
  items: NoteWithVector[],
  k: number,
  maxIterations = 100
): string[][] {
  if (items.length === 0) return []
  if (items.length <= k) {
    return items.map((item) => [item.note.id])
  }

  const dim = items[0].vector.length

  // Initialize centroids randomly
  const centroids: Float32Array[] = []
  const shuffled = [...items].sort(() => Math.random() - 0.5)
  for (let i = 0; i < k; i++) {
    centroids.push(new Float32Array(shuffled[i].vector))
  }

  let assignments: number[] = new Array(items.length).fill(0)

  for (let iter = 0; iter < maxIterations; iter++) {
    // Assign points to nearest centroid
    const newAssignments = items.map((item) => {
      let minDist = Infinity
      let minIdx = 0
      for (let c = 0; c < k; c++) {
        const dist = euclideanDistance(item.vector, centroids[c])
        if (dist < minDist) {
          minDist = dist
          minIdx = c
        }
      }
      return minIdx
    })

    // Check convergence
    if (newAssignments.every((a, i) => a === assignments[i])) break
    assignments = newAssignments

    // Update centroids
    for (let c = 0; c < k; c++) {
      const clusterItems = items.filter((_, i) => assignments[i] === c)
      if (clusterItems.length === 0) continue

      const newCentroid = new Float32Array(dim)
      for (const item of clusterItems) {
        for (let d = 0; d < dim; d++) {
          newCentroid[d] += item.vector[d]
        }
      }
      for (let d = 0; d < dim; d++) {
        newCentroid[d] /= clusterItems.length
      }
      centroids[c] = newCentroid
    }
  }

  // Group by cluster
  const groups: string[][] = Array.from({ length: k }, () => [])
  items.forEach((item, i) => {
    groups[assignments[i]].push(item.note.id)
  })

  return groups.filter((g) => g.length > 0)
}

export async function clusterNotes(
  db: Database,
  k = 5
): Promise<Cluster[]> {
  const notes = getAllNotes(db)
  const notesWithVectors: NoteWithVector[] = []

  for (const note of notes) {
    const embResult = db.exec(
      `SELECT vector FROM embeddings WHERE note_id = ?`,
      [note.id]
    )
    if (!embResult[0]?.values[0]) continue

    const buffer = embResult[0].values[0][0] as Uint8Array
    const vector = new Float32Array(buffer.buffer)
    notesWithVectors.push({ note, vector })
  }

  const actualK = Math.min(k, notesWithVectors.length)
  const groups = kMeans(notesWithVectors, actualK)

  const now = Date.now()
  const clusters: Cluster[] = groups.map((noteIds, i) => ({
    id: uuid(),
    name: `Cluster ${i + 1}`, // Will be named by LLM later
    noteIds,
    createdAt: now,
    updatedAt: now,
  }))

  // Save clusters to DB
  db.run(`DELETE FROM clusters`)
  for (const cluster of clusters) {
    db.run(
      `INSERT INTO clusters (id, name, description, note_ids, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        cluster.id,
        cluster.name,
        cluster.description ?? null,
        JSON.stringify(cluster.noteIds),
        cluster.createdAt,
        cluster.updatedAt,
      ]
    )
  }

  return clusters
}

export function getClusters(db: Database): Cluster[] {
  const result = db.exec(
    `SELECT id, name, description, note_ids, created_at, updated_at FROM clusters`
  )
  if (!result[0]) return []

  return result[0].values.map(
    ([id, name, description, noteIds, createdAt, updatedAt]) => ({
      id: id as string,
      name: name as string,
      description: (description as string | null) ?? undefined,
      noteIds: JSON.parse(noteIds as string),
      createdAt: createdAt as number,
      updatedAt: updatedAt as number,
    })
  )
}
```

**Step 4: Update index.ts**

```typescript
export { createDatabase, type Database } from './db'
export { createNote, getNote, getAllNotes, deleteNote, type Note } from './notes'
export { generateEmbedding, cosineSimilarity } from './embeddings'
export { indexNote, searchNotes, type SearchResult } from './search'
export { clusterNotes, getClusters, type Cluster } from './clustering'
export const VERSION = '0.0.1'
```

**Step 5: Run tests**

Run: `pnpm --filter @stickies/core test`
Expected: PASS

**Step 6: Commit**

```bash
git add -A
git commit -m "feat(core): add k-means clustering for notes"
```

---

## Phase 5: Web UI

### Task 9: Create Note Input Component

**Files:**
- Create: `packages/web/src/components/NoteInput.tsx`
- Modify: `packages/web/src/App.tsx`

**Step 1: Create NoteInput component**

Create `packages/web/src/components/NoteInput.tsx`:

```tsx
import { useState, useRef, useEffect } from 'react'

interface Props {
  onSubmit: (content: string) => void
  disabled?: boolean
}

export function NoteInput({ onSubmit, disabled }: Props) {
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className="relative">
      <textarea
        ref={inputRef}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="What's on your mind?"
        className="w-full p-4 pr-12 text-lg rounded-xl border-2 border-amber-200
                   focus:border-amber-400 focus:outline-none resize-none
                   bg-white shadow-sm placeholder:text-amber-300"
        rows={2}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !value.trim()}
        className="absolute right-3 bottom-3 p-2 rounded-lg
                   bg-amber-400 text-white hover:bg-amber-500
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  )
}
```

**Step 2: Verify it builds**

Run: `pnpm --filter @stickies/web build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add -A
git commit -m "feat(web): add NoteInput component"
```

---

### Task 10: Create Note Card Component

**Files:**
- Create: `packages/web/src/components/NoteCard.tsx`

**Step 1: Create NoteCard component**

Create `packages/web/src/components/NoteCard.tsx`:

```tsx
import type { Note } from '@stickies/core'

interface Props {
  note: Note
  onDelete?: (id: string) => void
}

const colors = [
  'bg-sticky-yellow',
  'bg-sticky-pink',
  'bg-sticky-blue',
  'bg-sticky-green',
]

function getColor(id: string): string {
  const hash = id.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return colors[hash % colors.length]
}

function formatTime(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}

export function NoteCard({ note, onDelete }: Props) {
  return (
    <div
      className={`${getColor(note.id)} p-4 rounded-lg shadow-md
                  hover:shadow-lg transition-shadow relative group`}
    >
      <p className="text-gray-800 whitespace-pre-wrap break-words">
        {note.content}
      </p>
      <div className="mt-2 flex justify-between items-center text-xs text-gray-600">
        <span>{formatTime(note.createdAt)}</span>
        {note.source === 'voice' && (
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
            </svg>
            voice
          </span>
        )}
      </div>
      {onDelete && (
        <button
          onClick={() => onDelete(note.id)}
          className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100
                     hover:bg-black/10 transition-opacity"
        >
          <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  )
}
```

**Step 2: Verify it builds**

Run: `pnpm --filter @stickies/web build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add -A
git commit -m "feat(web): add NoteCard component"
```

---

### Task 11: Wire Up Main App with Database

**Files:**
- Create: `packages/web/src/hooks/useDatabase.ts`
- Create: `packages/web/src/hooks/useNotes.ts`
- Modify: `packages/web/src/App.tsx`

**Step 1: Create useDatabase hook**

Create `packages/web/src/hooks/useDatabase.ts`:

```tsx
import { useState, useEffect } from 'react'
import { createDatabase, type Database } from '@stickies/core'

export function useDatabase() {
  const [db, setDb] = useState<Database | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    createDatabase()
      .then(setDb)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [])

  return { db, loading, error }
}
```

**Step 2: Create useNotes hook**

Create `packages/web/src/hooks/useNotes.ts`:

```tsx
import { useState, useCallback } from 'react'
import {
  createNote,
  getAllNotes,
  deleteNote,
  indexNote,
  type Database,
  type Note,
} from '@stickies/core'

export function useNotes(db: Database | null) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)

  const refresh = useCallback(() => {
    if (!db) return
    setNotes(getAllNotes(db))
  }, [db])

  const add = useCallback(
    async (content: string) => {
      if (!db) return
      setLoading(true)
      try {
        const note = createNote(db, content)
        await indexNote(db, note)
        refresh()
      } finally {
        setLoading(false)
      }
    },
    [db, refresh]
  )

  const remove = useCallback(
    (id: string) => {
      if (!db) return
      deleteNote(db, id)
      refresh()
    },
    [db, refresh]
  )

  return { notes, loading, add, remove, refresh }
}
```

**Step 3: Update App.tsx**

```tsx
import { useEffect } from 'react'
import { useDatabase } from './hooks/useDatabase'
import { useNotes } from './hooks/useNotes'
import { NoteInput } from './components/NoteInput'
import { NoteCard } from './components/NoteCard'

export default function App() {
  const { db, loading: dbLoading, error } = useDatabase()
  const { notes, loading: notesLoading, add, remove, refresh } = useNotes(db)

  useEffect(() => {
    if (db) refresh()
  }, [db, refresh])

  if (error) {
    return (
      <div className="p-8 text-red-600">
        Failed to load database: {error.message}
      </div>
    )
  }

  if (dbLoading) {
    return (
      <div className="p-8 flex items-center gap-2 text-amber-600">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Stickies</h1>
        <p className="text-amber-700">Quick notes, AI organized</p>
      </header>

      <div className="mb-8">
        <NoteInput onSubmit={add} disabled={notesLoading} />
      </div>

      {notes.length === 0 ? (
        <p className="text-center text-amber-400 py-12">
          No notes yet. Jot something down!
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 4: Build and test**

Run: `pnpm --filter @stickies/core build && pnpm dev`
Expected: App loads, can add and delete notes

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(web): wire up notes UI with database"
```

---

### Task 12: Add Search UI

**Files:**
- Create: `packages/web/src/components/SearchBar.tsx`
- Create: `packages/web/src/hooks/useSearch.ts`
- Modify: `packages/web/src/App.tsx`

**Step 1: Create SearchBar component**

Create `packages/web/src/components/SearchBar.tsx`:

```tsx
import { useState } from 'react'

interface Props {
  onSearch: (query: string) => void
  onClear: () => void
  loading?: boolean
}

export function SearchBar({ onSearch, onClear, loading }: Props) {
  const [query, setQuery] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      onSearch(query.trim())
    }
  }

  const handleClear = () => {
    setQuery('')
    onClear()
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-amber-200
                     focus:border-amber-400 focus:outline-none bg-white"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
      {query && (
        <button
          type="button"
          onClick={handleClear}
          className="px-3 py-2 text-amber-600 hover:text-amber-800"
        >
          Clear
        </button>
      )}
      <button
        type="submit"
        disabled={loading || !query.trim()}
        className="px-4 py-2 bg-amber-400 text-white rounded-lg
                   hover:bg-amber-500 disabled:opacity-50 transition-colors"
      >
        {loading ? 'Searching...' : 'Search'}
      </button>
    </form>
  )
}
```

**Step 2: Create useSearch hook**

Create `packages/web/src/hooks/useSearch.ts`:

```tsx
import { useState, useCallback } from 'react'
import { searchNotes, type Database, type SearchResult } from '@stickies/core'

export function useSearch(db: Database | null) {
  const [results, setResults] = useState<SearchResult[] | null>(null)
  const [loading, setLoading] = useState(false)

  const search = useCallback(
    async (query: string) => {
      if (!db) return
      setLoading(true)
      try {
        const res = await searchNotes(db, query)
        setResults(res)
      } finally {
        setLoading(false)
      }
    },
    [db]
  )

  const clear = useCallback(() => {
    setResults(null)
  }, [])

  return { results, loading, search, clear }
}
```

**Step 3: Update App.tsx to include search**

```tsx
import { useEffect } from 'react'
import { useDatabase } from './hooks/useDatabase'
import { useNotes } from './hooks/useNotes'
import { useSearch } from './hooks/useSearch'
import { NoteInput } from './components/NoteInput'
import { NoteCard } from './components/NoteCard'
import { SearchBar } from './components/SearchBar'

export default function App() {
  const { db, loading: dbLoading, error } = useDatabase()
  const { notes, loading: notesLoading, add, remove, refresh } = useNotes(db)
  const { results, loading: searchLoading, search, clear } = useSearch(db)

  useEffect(() => {
    if (db) refresh()
  }, [db, refresh])

  if (error) {
    return (
      <div className="p-8 text-red-600">
        Failed to load database: {error.message}
      </div>
    )
  }

  if (dbLoading) {
    return (
      <div className="p-8 flex items-center gap-2 text-amber-600">
        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading...
      </div>
    )
  }

  const displayNotes = results ? results.map((r) => r.note) : notes

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-amber-900">Stickies</h1>
        <p className="text-amber-700">Quick notes, AI organized</p>
      </header>

      <div className="mb-4">
        <NoteInput onSubmit={add} disabled={notesLoading} />
      </div>

      <div className="mb-6">
        <SearchBar onSearch={search} onClear={clear} loading={searchLoading} />
      </div>

      {results && (
        <p className="text-sm text-amber-600 mb-4">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
        </p>
      )}

      {displayNotes.length === 0 ? (
        <p className="text-center text-amber-400 py-12">
          {results ? 'No matching notes found.' : 'No notes yet. Jot something down!'}
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {displayNotes.map((note) => (
            <NoteCard key={note.id} note={note} onDelete={remove} />
          ))}
        </div>
      )}
    </div>
  )
}
```

**Step 4: Build and test**

Run: `pnpm --filter @stickies/core build && pnpm dev`
Expected: Can add notes and search semantically

**Step 5: Commit**

```bash
git add -A
git commit -m "feat(web): add semantic search UI"
```

---

## Phase 6: Final Polish

### Task 13: Add PWA Icons

**Files:**
- Create: `packages/web/public/icon-192.png`
- Create: `packages/web/public/icon-512.png`

**Step 1: Create placeholder icons**

For now, create simple SVG icons converted to PNG (or use placeholders).

Create `packages/web/public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" rx="20" fill="#fbbf24"/>
  <text x="50" y="70" font-size="60" text-anchor="middle" fill="#92400e">📝</text>
</svg>
```

**Step 2: Update index.html**

Add to head:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
```

**Step 3: Commit**

```bash
git add -A
git commit -m "feat(web): add PWA icons and favicon"
```

---

### Task 14: Test Full Flow End-to-End

**Step 1: Fresh build**

Run: `pnpm install && pnpm build`

**Step 2: Test dev server**

Run: `pnpm dev`

**Step 3: Manual test checklist**

- [ ] App loads without errors
- [ ] Can type a note and press Enter to save
- [ ] Note appears as colored card
- [ ] Can delete a note
- [ ] Can search notes semantically
- [ ] Clear search returns to all notes

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "chore: final MVP polish"
```

---

## Summary

MVP complete with:
- Monorepo structure (pnpm workspaces)
- Core library with SQLite, notes CRUD, embeddings, search, clustering
- React PWA with input, cards, and search
- All data stored locally in browser

**Next phases:**
1. Add cluster browsing UI
2. Add LLM-powered cluster naming
3. Add voice input
4. Add Tauri desktop wrapper
5. Add sync server
