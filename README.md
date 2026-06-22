# SVCE Placement Intelligence Hub — Phase 1

**College:** Sri Venkateswara College of Engineering (SVCE)

This is **Phase 1: UI only.** Everything renders from a single hardcoded TypeScript
seed file at `src/data/seedCompanies.ts`. There is **no database, no auth, no
Supabase, no edge functions** in this phase.

## Important properties

- **Public — no login.** Every route is reachable by any visitor. No `/login`
  route, no `AuthProvider`, no `ProtectedRoute`.
- **No college logo asset.** The hero uses only the SVCE wordmark + a small
  "SVCE · INTELLIGENCE PLATFORM" pill.
- **No CTC, Stipend, or Selection-Ratio** anywhere in the platform.
- Company logos for recruiters come from Logo.dev (`VITE_LOGO_DEV_PUBLISHABLE_KEY`,
  optional) with fallback to the seed `logo_url` and finally an initial-letter
  circle.

## Stack adaptation note

The project template is **TanStack Start + Tailwind v4 + React 19** (not Vite +
React Router 6 + Tailwind v3). The implementation honors every functional
requirement and uses the exact URLs requested:

| URL | File |
| --- | --- |
| `/` | `src/routes/index.tsx` |
| `/company` (redirects → intelligence) | `src/routes/company.index.tsx` |
| `/company/intelligence` | `src/routes/company.intelligence.tsx` |
| `/company/skills` | `src/routes/company.skills.tsx` |

`AppLayout` is `src/routes/company.tsx` (renders `<Outlet />` inside a sidebar
shell).

## Phase 2 — Supabase

Phase 2 swaps the data source from `SEED_COMPANIES` to Supabase while keeping
all UI components and normalizer output shapes unchanged. The app now reads
company rows from `public.company_json` and skill data from these tables only:
`company_skill_levels`, `skill_set_master`, `proficiency_levels`, and
`skill_set_topics`.

To run locally, paste your values into `.env` and then:

```bash
npm install
npm run dev
```

Make sure these are set in `.env`:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

The existing `src/data/seedCompanies.ts` and `src/data/skillTopics.ts` files
remain in the repo as fallback documentation only; they are no longer used in
live render paths.
