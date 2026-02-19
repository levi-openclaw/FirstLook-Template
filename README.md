Here's a concise overview of the **FirstLook** repository:

## What It Does

FirstLook is a **wedding photography analysis platform** with an admin dashboard. It scrapes wedding content from Instagram and TikTok via Apify, analyzes images using Claude's vision API, scores them on visual quality/engagement, and surfaces trends for wedding photographers. The pipeline flow is:

```
Apify Scrape → raw_posts → Pre-Filter → Claude Vision Analysis → Manual Review → Scoring & Trends
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, RSC) + React 19 + TypeScript |
| **Database** | Supabase (PostgreSQL + pgvector for CLIP embeddings) |
| **AI** | Anthropic Claude (vision analysis/tagging), OpenAI (text embeddings) |
| **Scraping** | Apify (Instagram/TikTok profile scrapers) |
| **Auth** | Clerk (role-based, admin-gated) |
| **Webhooks** | Svix (signature verification) |

## Main Entry Points

- **Root** — `src/app/page.tsx` — redirects to `/admin` or sign-in
- **Middleware** — `src/middleware.ts` — protects admin routes, validates admin role
- **Admin pages** — `src/app/(admin)/admin/` — dashboard, ingestion, review, scoring, prompts, settings, trends
- **API routes** — `src/app/api/`
  - `analyze/vision|batch|preview|captions|embeddings` — AI analysis pipeline
  - `apify/trigger|ingest-curated` — scraping controls
  - `webhooks/apify|clerk` — webhook handlers
  - `review`, `prompts`, `settings/verify-keys` — CRUD operations
- **Database layer** — `src/lib/supabase/queries.ts` (20+ read queries) and `mutations.ts` (writes)
- **Schema** — `supabase/schema.sql` — 15+ tables with vector indexes

## Key Directories

```
src/app/          → Pages (admin dashboard) + API routes
src/components/   → UI components organized by admin section
src/lib/          → Supabase clients, auth utils, pipeline filters, types, mock data
supabase/         → SQL schema and migrations
```

The project runs with `npm run dev` (Turbopack-enabled) on port 3000.
