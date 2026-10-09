# Lingo

A vocabulary app for the words you meet while reading. Look a word up and it is saved with its meaning, pronunciation and examples. Browse your collection by recency or alphabet.

Built with Next.js 16, Supabase and Tailwind 4. Everything runs on free tiers.

## Setup

You need Node 22 or newer and a free [Supabase](https://supabase.com) account.

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a Supabase project. In its SQL editor, run `supabase/migrations/0001_words.sql`.

3. Copy the env template and fill in the three keys from **Project Settings > API**:

   ```bash
   cp .env.example .env.local
   ```

4. In **Authentication > URL Configuration**, add `http://localhost:3000/auth/callback` to the redirect URLs.

5. Start the app:

   ```bash
   npm run dev
   ```

Open http://localhost:3000 and sign in with your email.

### Google sign-in (optional)

Supabase's built-in email sender is rate-limited and meant for testing. To let other people sign in, enable the Google provider under **Authentication > Providers**, then set `NEXT_PUBLIC_GOOGLE_SIGN_IN=true`.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | Generate route types, then type-check |
| `npm test` | Unit tests (Vitest) |

## Project layout

| Path | Contents |
|---|---|
| `src/app` | Routes, layouts and Server Actions |
| `src/components` | UI components |
| `src/lib` | Data access (server only) and pure logic with tests |
| `src/proxy.ts` | Refreshes the session and redirects signed-out visitors |
| `supabase/migrations` | Database schema and access rules |

Row-level security in the database is the access boundary: each user can only read and change their own words. The shared `words` table is filled by the server only.

## Deploy

1. Push the repo to GitHub and import it in [Vercel](https://vercel.com).
2. Add the same environment variables in the Vercel project settings.
3. Add `https://<your-domain>/auth/callback` to Supabase's redirect URLs.

Free Supabase projects pause after a week without activity. Restore one from the Supabase dashboard.

## Definitions

Word data comes from the [Free Dictionary API](https://dictionaryapi.dev) and is cached in the `words` table after the first lookup. When that API is down, lookups fall back to [freedictionaryapi.com](https://freedictionaryapi.com), which serves [Wiktionary](https://en.wiktionary.org) data under CC BY-SA 4.0 and has no audio.

Spelling suggestions for words that are not found come from [Datamuse](https://www.datamuse.com/api/).
