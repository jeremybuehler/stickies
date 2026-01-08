# Stickies

Quick notes with AI organization. Capture thoughts fast, let the system handle remembering.

## Features

- **Quick Capture** - Text input with voice support (Web Speech API)
- **Smart Inbox** - Notes flow through lifecycle states (inbox → active → snoozed → archived)
- **Snooze & Reminders** - Defer notes to resurface later
- **Context Matching** - Related notes surface as you type
- **Daily Digest** - Configurable summary with inbox count, due reminders, and random rediscovery
- **Semantic Search** - Find notes by meaning, not just keywords

## Tech Stack

| Layer | Technology |
|-------|------------|
| UI | React 18 + Tailwind CSS + shadcn/ui |
| Build | Vite + PWA |
| Database | Neon (serverless PostgreSQL) |
| ORM | Drizzle ORM |
| Authentication | Clerk |
| Monorepo | pnpm workspaces |

## Project Structure

```
stickies/
├── db/                    # Database layer (Drizzle + Neon)
│   ├── schema.ts          # Drizzle schema definitions
│   ├── notes.ts           # Note CRUD operations
│   └── index.ts           # Database connection
│
├── packages/
│   ├── core/              # Shared TypeScript library (legacy)
│   │   └── src/
│   │       ├── embeddings.ts  # Vector embeddings
│   │       └── clustering.ts  # K-means clustering
│   │
│   └── web/               # React PWA
│       └── src/
│           ├── components/    # UI components (shadcn/ui)
│           ├── hooks/         # React hooks
│           ├── providers/     # Context providers (Clerk)
│           └── App.tsx        # Main application
│
└── docs/
    └── plans/             # Design documents
```

## Getting Started

### 1. Set up Neon Database

1. Create an account at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy your connection string

### 2. Set up Clerk Authentication

1. Create an account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your publishable key

### 3. Configure Environment

```bash
# Copy the example environment file
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL=postgresql://...
# VITE_DATABASE_URL=postgresql://...
# VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### 4. Install Dependencies

```bash
pnpm install
```

### 5. Push Database Schema

```bash
pnpm db:push
```

### 6. Start Development Server

```bash
pnpm dev
```

Open http://localhost:5173

## Database Commands

```bash
pnpm db:push      # Push schema changes to database
pnpm db:generate  # Generate migration files
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Drizzle Studio (database UI)
```

## Smart Inbox System

Notes have four states:

| State | Description |
|-------|-------------|
| `inbox` | Fresh capture, unprocessed |
| `active` | Being worked with |
| `snoozed` | Deferred until a specific date |
| `archived` | Done, eligible for random rediscovery |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `n` | Focus note input |
| `/` | Focus search |
| `a` | Archive hovered note |
| `s` | Snooze hovered note |

## Scripts

```bash
pnpm dev              # Start dev server
pnpm build            # Build all packages
pnpm test             # Run tests
```

## License

MIT
