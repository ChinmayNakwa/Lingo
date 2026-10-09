-- Where the user met the word: a book, an article or a link.
alter table public.user_words
  add column source text check (char_length(source) <= 200);
