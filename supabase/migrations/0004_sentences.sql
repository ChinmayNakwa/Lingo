-- One sentence per user per word. Writing it marks the word as learned.
-- Tied to user_words, so removing a word removes its sentence.
create table public.sentences (
  id bigint generated always as identity primary key,
  user_id uuid not null default auth.uid(),
  word_id bigint not null,
  body text not null check (char_length(body) between 10 and 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, word_id),
  foreign key (user_id, word_id)
    references public.user_words (user_id, word_id) on delete cascade
);

create index sentences_word_idx on public.sentences (word_id);

alter table public.sentences enable row level security;

-- Sentences are public to other signed-in users; the form says so.
create policy "Signed-in users can read sentences"
  on public.sentences for select
  to authenticated
  using (true);

create policy "Users can add their own sentences"
  on public.sentences for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own sentences"
  on public.sentences for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can remove their own sentences"
  on public.sentences for delete
  to authenticated
  using ((select auth.uid()) = user_id);
