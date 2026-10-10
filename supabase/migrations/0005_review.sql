-- Spaced review: five boxes at 1, 3, 7, 14 and 30 days. A miss sends the word
-- back to box one and counts as a lapse.
alter table public.user_words
  add column review_box smallint not null default 1
    check (review_box between 1 and 5),
  add column next_review_at timestamptz not null default (now() + interval '1 day'),
  add column last_reviewed_at timestamptz,
  add column lapses integer not null default 0 check (lapses >= 0);

-- Words saved before this migration are due straight away.
update public.user_words set next_review_at = now();

create index user_words_user_due_idx
  on public.user_words (user_id, next_review_at);
