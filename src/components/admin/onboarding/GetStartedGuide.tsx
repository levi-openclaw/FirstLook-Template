'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import {
  Plug,
  Search,
  Eye,
  BarChart3,
  ChevronDown,
  ChevronRight,
  ArrowRight,
} from 'lucide-react';

interface StepProps {
  number: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  links: { label: string; href: string }[];
  isExpanded: boolean;
  onToggle: () => void;
}

function Step({ number, icon, title, description, children, links, isExpanded, onToggle }: StepProps) {
  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <button
          onClick={onToggle}
          className="flex items-center gap-3"
          style={{
            width: '100%',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: 0,
            textAlign: 'left',
            color: 'inherit',
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 'var(--radius)',
              background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              color: 'var(--accent)',
            }}
          >
            {icon}
          </div>
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-2">
              <span className="t-caption" style={{ color: 'var(--accent)' }}>Step {number}</span>
            </div>
            <span className="t-sub" style={{ fontWeight: 600 }}>{title}</span>
            <p className="t-caption" style={{ color: 'var(--text-tertiary)', margin: 0 }}>{description}</p>
          </div>
          {isExpanded ? (
            <ChevronDown size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          ) : (
            <ChevronRight size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          )}
        </button>

        {isExpanded && (
          <div style={{ marginTop: 'var(--space-3)', paddingLeft: 48 }}>
            <div className="t-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)' }}>
              {children}
            </div>
            <div className="flex items-center gap-2" style={{ flexWrap: 'wrap' }}>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="btn btn-sm btn-primary flex items-center gap-1"
                  style={{ textDecoration: 'none' }}
                >
                  {link.label} <ArrowRight size={14} />
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function GetStartedGuide() {
  const [expandedStep, setExpandedStep] = useState<number | null>(1);

  const toggle = (step: number) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  return (
    <div>
      {/* Pipeline visualization */}
      <div
        className="flex items-center justify-center gap-2"
        style={{
          padding: 'var(--space-4)',
          marginBottom: 'var(--space-4)',
          borderRadius: 'var(--radius)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border)',
          flexWrap: 'wrap',
        }}
      >
        {['Connect', 'Scrape', 'Analyze', 'Explore'].map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              style={{
                padding: 'var(--space-1) var(--space-3)',
                borderRadius: 'var(--radius)',
                background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
                border: '1px solid color-mix(in srgb, var(--accent) 25%, transparent)',
                color: 'var(--accent)',
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              {label}
            </div>
            {i < 3 && (
              <ArrowRight size={14} style={{ color: 'var(--text-tertiary)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <Step
          number={1}
          icon={<Plug size={18} />}
          title="Connect Your Services"
          description="Add your API keys to connect Supabase, Apify, and Anthropic"
          links={[{ label: 'Go to Settings', href: '/admin/settings' }]}
          isExpanded={expandedStep === 1}
          onToggle={() => toggle(1)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p style={{ margin: 0 }}>
              <strong>Supabase</strong> — Your database. Stores scraped posts, analyzed images, and trends.
              You&apos;ll need: <em>Public URL</em>, <em>Anon Key</em> (for the client), and <em>Service Role Key</em> (for
              server-side operations like ingestion and analysis).
            </p>
            <p style={{ margin: 0 }}>
              <strong>Apify</strong> — The scraper engine. Runs pre-built actors that pull posts from Instagram,
              TikTok, and other platforms. You&apos;ll need an <em>API Token</em> from apify.com.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Anthropic</strong> — Vision AI. Claude analyzes each image and tags it with content
              attributes (style, lighting, composition, etc.). You&apos;ll need an <em>API Key</em> from
              console.anthropic.com.
            </p>
          </div>
        </Step>

        <Step
          number={2}
          icon={<Search size={18} />}
          title="Set Up a Scraper"
          description="Find an Apify actor and give it a list of accounts to scrape"
          links={[{ label: 'Go to Ingestion', href: '/admin/ingestion' }]}
          isExpanded={expandedStep === 2}
          onToggle={() => toggle(2)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p style={{ margin: 0 }}>
              <strong>What is an Apify Actor?</strong> A pre-built scraper that runs in the cloud. Search for
              &quot;Instagram Scraper&quot; or &quot;TikTok Scraper&quot; in the marketplace to find one.
            </p>
            <p style={{ margin: 0 }}>
              Upload a CSV with account handles (one column: <code>handle</code>) or paste them directly into the
              actor input. The scraper will pull recent posts from those accounts into your database.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Optional:</strong> Set up a cron schedule in Supabase to run the scraper automatically
              (e.g., daily at 2am). The ingestion page will walk you through this.
            </p>
          </div>
        </Step>

        <Step
          number={3}
          icon={<Eye size={18} />}
          title="Run Vision Analysis"
          description="Claude analyzes each scraped image and tags it with content attributes"
          links={[
            { label: 'View Analysis Queue', href: '/admin/ingestion' },
            { label: 'Edit Prompt', href: '/admin/prompts' },
          ]}
          isExpanded={expandedStep === 3}
          onToggle={() => toggle(3)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p style={{ margin: 0 }}>
              Once posts are scraped, run Vision analysis to tag each image. Tags include content type,
              lighting, composition, style, setting, subject type, and more.
            </p>
            <p style={{ margin: 0 }}>
              You can customize the Vision prompt to tag attributes specific to your niche. The Prompt Editor
              lets you define exactly what Claude should look for.
            </p>
            <p style={{ margin: 0 }}>
              <strong>Cost:</strong> Approximately $0.01–0.03 per image with Claude Sonnet.
            </p>
          </div>
        </Step>

        <Step
          number={4}
          icon={<BarChart3 size={18} />}
          title="Explore & Discover Trends"
          description="Sort content by engagement, filter by tags, and spot what's working"
          links={[
            { label: 'Content Explorer', href: '/admin/review' },
            { label: 'View Trends', href: '/admin/trends' },
          ]}
          isExpanded={expandedStep === 4}
          onToggle={() => toggle(4)}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <p style={{ margin: 0 }}>
              The <strong>Content Explorer</strong> lets you sort by engagement rate, likes, comments, follower count,
              and date. Filter by content type, style, lighting, setting, and more.
            </p>
            <p style={{ margin: 0 }}>
              The <strong>Trends</strong> page shows aggregate patterns: which styles get the most engagement, which
              settings perform best, and what&apos;s trending up or down.
            </p>
            <p style={{ margin: 0 }}>
              Export filtered results to CSV for further analysis.
            </p>
          </div>
        </Step>
      </div>
    </div>
  );
}
