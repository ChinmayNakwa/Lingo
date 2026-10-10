-- Inflected forms from the dictionary, such as "ran" for "run". Used to check
-- that a sentence contains the word.
alter table public.words
  add column forms text[] not null default '{}';
