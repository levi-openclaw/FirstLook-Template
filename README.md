# FirstLook Template

**Open-source social media content intelligence platform.** Scrape, analyze, and explore content performance across any niche using Apify, Claude Vision, and Supabase.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Flevi-openclaw%2FFirstLook-Template&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,DATABASE_URL,APIFY_API_TOKEN,ANTHROPIC_API_KEY&envDescription=API%20keys%20for%20Supabase%2C%20Apify%2C%20and%20Anthropic.%20DATABASE_URL%20enables%20one-click%20database%20setup.&envLink=https%3A%2F%2Fgithub.com%2Flevi-openclaw%2FFirstLook-Template%23environment-variables&project-name=firstlook&repository-name=firstlook)

![Dashboard](docs/screenshots/dashboard.png)

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

> **No API keys?** The app works with mock data out of the box. All pages render with sample content so you can explore the UI before connecting services.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 16 (App Router, RSC) + React 19 + TypeScript |
| **Database** | Supabase (PostgreSQL) |
| **AI** | Anthropic Claude (vision analysis & tagging) |
| **Scraping** | Apify (configurable actors for any platform) |
| **Styling** | Custom CSS design system (no Tailwind) |
| **Icons** | lucide-react |

---

## Dashboard Pages

### Get Started — `/admin`

A guided 4-step onboarding that walks you through connecting services, setting up scrapers, running vision analysis, and exploring results. Below the guide, pipeline metrics show posts scraped, images analyzed, and analysis coverage.

![Get Started](docs/screenshots/dashboard.png)

### Data Ingestion — `/admin/ingestion`

Upload a CSV of social media handles, browse the Apify marketplace for scrapers, configure actor input JSON, and trigger scrape runs. The numbered workflow guides you from import to analysis.

![Data Ingestion](docs/screenshots/ingestion.png)

### Content Explorer — `/admin/review`

Browse all analyzed content in a filterable image grid. Sort by engagement, likes, comments, or date. Filter by style (editorial, documentary, minimalist, etc.), content type (product shot, lifestyle, behind the scenes, etc.), date range, and engagement percentage. Click any image for a detail panel with all tagged attributes. Export filtered results as CSV.

![Content Explorer](docs/screenshots/content-explorer.png)

### Prompt Editor — `/admin/prompts`

Edit the Vision Tagging and Caption Generation prompts that Claude uses to analyze each image. The test panel shows a mock response so you can preview the JSON structure. Supports versioning — save drafts and deploy when ready.

![Prompt Editor](docs/screenshots/prompt-editor.png)

### Trends — `/admin/trends`

Engagement benchmarks computed from your analyzed content. Compare candid vs. posed, text overlay impact, selfie vs. professional, and see which brands appear most in your dataset.

![Trends](docs/screenshots/trends.png)

### Settings — `/admin/settings`

Check which API keys are connected, verify service status, and use the Prompt Helper template to generate a custom vision prompt for your specific industry.

![Settings](docs/screenshots/settings.png)

---

## Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/levi-openclaw/FirstLook-Template.git
cd FirstLook-Template
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL, anon key, and service role key (Settings → API)
3. **Recommended:** Also copy the database connection string (Settings → Database → Connection string URI) for one-click setup

> **Auto-setup:** If `DATABASE_URL` is provided, the dashboard will show a one-click "Initialize Database" button on first visit that creates all tables automatically. Otherwise, run `supabase/schema.sql` manually in the SQL Editor.

### 3. Configure Environment

```bash
cp .env.example .env.local
```

Fill in your API keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
APIFY_API_TOKEN=apify_api_...
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### Where to Find Your API Keys

**Supabase** — You need 3 values from your Supabase project:

The **API URL** is under **Integrations → Data API**:

![Supabase API URL](docs/screenshots/supabase-api-url.jpg)

The **anon key** (publishable) and **service role key** (secret) are under **Settings → API Keys**:

![Supabase API Keys](docs/screenshots/supabase-api-keys.jpg)

**Apify** — Go to **Settings → API & Integrations → Personal API tokens** and create a token:

![Apify API Token](docs/screenshots/apify-api-token.jpg)

**Anthropic** — Get your API key from [console.anthropic.com](https://console.anthropic.com) → **API Keys**.

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you'll land on the Get Started guide.

---

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
│   ├── (admin)/admin/     # Dashboard pages (6 pages)
│   ├── api/               # API routes
│   │   ├── analyze/       # Vision analysis (single, batch, preview, captions)
│   │   ├── apify/         # Actor trigger, store proxy, webhook handler
│   │   ├── prompts/       # Prompt CRUD + test
│   │   ├── review/        # Content queries
│   │   └── settings/      # Key verification
│   └── layout.tsx         # Root layout with theme support
├── components/
│   ├── admin/             # Page-specific components
│   │   ├── onboarding/    # Get Started guide
│   │   ├── ingestion/     # Actor configs, marketplace, CSV uploader, workflow
│   │   ├── review/        # Image grid, detail panel, filters
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
| `DATABASE_URL` | Recommended | Direct Postgres connection string (enables one-click database setup) |
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
