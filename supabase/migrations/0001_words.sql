-- Shared dictionary cache. Filled by the server with the secret key only.
create table public.words (
  id bigint generated always as identity primary key,
  word text not null unique check (word = lower(word) and char_length(word) between 1 and 50),
  phonetic text,
  audio_url text,
  meanings jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.words enable row level security;

create policy "Signed-in users can read words"
  on public.words for select
  to authenticated
  using (true);

-- A user's personal dictionary.
create table public.user_words (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  word_id bigint not null references public.words (id) on delete cascade,
  note text check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  primary key (user_id, word_id)
);

create index user_words_user_created_idx
  on public.user_words (user_id, created_at desc);

alter table public.user_words enable row level security;

create policy "Users can read their own words"
  on public.user_words for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own words"
  on public.user_words for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own words"
  on public.user_words for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own words"
  on public.user_words for delete
  to authenticated
  using ((select auth.uid()) = user_id);
