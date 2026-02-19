# FirstLook Template

**Open-source social media content intelligence platform.** Scrape, analyze, and explore content performance across any niche using Apify, Claude Vision, and Supabase.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flevi-openclaw%2FFirstLook-Template&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,APIFY_API_TOKEN,ANTHROPIC_API_KEY&envDescription=API%20keys%20for%20Supabase%2C%20Apify%2C%20and%20Anthropic&envLink=https%3A%2F%2Fgithub.com%2Flevi-openclaw%2FFirstLook-Template%23environment-variables&project-name=firstlook&repository-name=firstlook)

---

## What It Does

FirstLook is a **content intelligence dashboard** that lets you:

1. **Scrape** social media content via Apify actors (Instagram, TikTok, or any platform)
2. **Analyze** images using Claude Vision — auto-tag composition, lighting, style, content type, and 20+ attributes
3. **Explore** content with sortable/filterable grids — find what performs best by engagement, likes, style, etc.
4. **Track trends** across platforms, styles, and content categories over time

```
Apify Scrape → Raw Posts → Engagement Filter → Claude Vision Analysis → Content Explorer → Trends
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, RSC) + React 19 + TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Anthropic Claude (vision analysis & tagging) |
| **Scraping** | Apify (configurable actors for any platform) |
| **Styling** | Custom CSS design system (no Tailwind) |
| **Icons** | lucide-react |

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/levi-openclaw/FirstLook-Template.git
cd FirstLook-Template
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Open the SQL Editor and run the contents of `supabase/schema.sql`
3. Copy your project URL, anon key, and service role key

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your API keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
APIFY_API_TOKEN=apify_api_...
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the admin dashboard.

> **No API keys?** The app works with mock data out of the box. All pages render with sample data so you can explore the UI before connecting services.

---

## Dashboard Pages

| Page | Path | Description |
|------|------|-------------|
| **Dashboard** | `/admin` | Pipeline metrics, activity feed, cost tracking |
| **Ingestion** | `/admin/ingestion` | Apify actor configs, scrape history, marketplace browser, CSV upload |
| **Content Explorer** | `/admin/review` | Sortable/filterable image grid with detail panel and CSV export |
| **Filters & Thresholds** | `/admin/scoring` | Engagement threshold configuration per follower tier |
| **Prompts** | `/admin/prompts` | Vision prompt editor, test panel, version history |
| **Trends** | `/admin/trends` | Style/content trends, platform comparison charts |
| **Settings** | `/admin/settings` | API key status, connection testing, prompt helper |

## Key Features

### Apify Marketplace Browser
Search Apify's actor store directly from the dashboard. Select an actor, configure the input JSON, and trigger runs — all without leaving the app.

### CSV Upload
Upload a CSV of handles or URLs to bulk-configure scraping targets. Auto-detects column format and generates actor input JSON.

### Vision Analysis
Claude Vision analyzes each image and tags 24+ attributes: content type, composition, lighting, style, color palette, subject count, text overlays, brand detection, production quality, and more.

### Customizable Prompts
Ship your own vision analysis prompt or use the built-in prompt helper to generate a niche-specific prompt. The prompt editor supports versioning and A/B testing.

### Content Explorer
Browse all analyzed content with sort controls (engagement, likes, comments, date, style, content type) and filters (date range, engagement range, content type). Export filtered results as CSV.

---

## Architecture

```
src/
├── app/
│   ├── (admin)/admin/     # Dashboard pages (7 pages)
│   ├── api/               # API routes
│   │   ├── analyze/       # Vision analysis (single, batch, preview, captions)
│   │   ├── apify/         # Actor trigger, store proxy, webhook handler
│   │   ├── prompts/       # Prompt CRUD + test
│   │   ├── review/        # Content queries
│   │   └── settings/      # Key verification
│   └── layout.tsx         # Root layout with theme support
├── components/
│   ├── admin/             # Page-specific components
│   │   ├── dashboard/     # Metrics, activity feed, cost tracker
│   │   ├── ingestion/     # Actor configs, marketplace, CSV uploader
│   │   ├── review/        # Image grid, detail panel, filters
│   │   ├── scoring/       # Threshold manager
│   │   ├── prompts/       # Prompt editor, test panel
│   │   ├── trends/        # Charts, style grid
│   │   └── settings/      # API status, prompt helper
│   └── ui/                # Shared: Card, Badge, Button, MetricCard, etc.
├── lib/
│   ├── mock/              # Mock data (mirrors Supabase schema)
│   ├── prompts/           # Default vision prompt + prompt helper guide
│   ├── supabase/          # Client, queries, mutations
│   ├── types/             # TypeScript interfaces
│   ├── utils/             # Constants, formatters
│   └── pipeline/          # Engagement filters
└── supabase/
    └── schema.sql         # Full database schema
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server-side only) |
| `APIFY_API_TOKEN` | Yes | Apify API token for running scrapers |
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key for Claude Vision |
| `APIFY_WEBHOOK_SECRET` | No | Secret for verifying Apify webhook signatures |
| `OPENAI_API_KEY` | No | OpenAI key (if using embeddings) |

## Customization

### Custom Vision Prompt
The default prompt works across industries. To tailor it for your niche:

1. Go to **Settings** → **Prompt Helper**
2. Copy the template and paste it into Claude
3. Fill in your industry details
4. Claude generates a custom prompt
5. Paste the result into **Prompts** → **New Version**

### Adding Auth
This template ships without authentication. To add auth:
- **Clerk**: `npm install @clerk/nextjs` + wrap layout in `<ClerkProvider>`
- **NextAuth**: `npm install next-auth` + add API route at `/api/auth/[...nextauth]`
- **Supabase Auth**: Use the existing Supabase client + add middleware

### Custom Styling
The CSS design system uses CSS custom properties. Edit `src/app/globals.css` to change colors, spacing, typography. Supports light/dark themes via `data-framer-theme` attribute.

---

## License

MIT
