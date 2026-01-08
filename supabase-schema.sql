-- Stickies database schema for Supabase

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Notes table
create table public.notes (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  color text not null default 'yellow' check (color in ('yellow', 'pink', 'blue', 'green')),
  source text not null default 'text' check (source in ('text', 'voice')),
  raw_transcript text,
  position integer not null default 0,
  -- Smart Inbox fields
  state text not null default 'inbox' check (state in ('inbox', 'active', 'snoozed', 'archived')),
  snoozed_until timestamptz,
  last_surfaced_at timestamptz,
  linked_to uuid references public.notes(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  user_id uuid references auth.users(id) on delete cascade
);

-- Enable Row Level Security
alter table public.notes enable row level security;

-- Policy: Users can only see their own notes
create policy "Users can view own notes"
  on public.notes for select
  using (auth.uid() = user_id);

-- Policy: Users can insert their own notes
create policy "Users can insert own notes"
  on public.notes for insert
  with check (auth.uid() = user_id);

-- Policy: Users can update their own notes
create policy "Users can update own notes"
  on public.notes for update
  using (auth.uid() = user_id);

-- Policy: Users can delete their own notes
create policy "Users can delete own notes"
  on public.notes for delete
  using (auth.uid() = user_id);

-- Index for faster queries by user
create index notes_user_id_idx on public.notes(user_id);

-- Index for ordering by position
create index notes_position_idx on public.notes(position);

-- Index for state filtering
create index notes_state_idx on public.notes(state);

-- Index for snoozed notes due check
create index notes_snoozed_until_idx on public.notes(snoozed_until) where state = 'snoozed';

-- Function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to auto-update updated_at
create trigger notes_updated_at
  before update on public.notes
  for each row
  execute function public.handle_updated_at();
