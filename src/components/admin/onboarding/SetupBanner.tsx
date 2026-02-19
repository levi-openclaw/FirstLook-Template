'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Database, Loader2, CheckCircle, Copy, ExternalLink, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface SetupBannerProps {
  schemaStatus: 'tables_missing';
  hasDatabaseUrl: boolean;
  schemaSql: string;
}

export function SetupBanner({ hasDatabaseUrl, schemaSql }: SetupBannerProps) {
  const router = useRouter();
  const [initializing, setInitializing] = useState(false);
  const [result, setResult] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [showSql, setShowSql] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleInitialize = async () => {
    setInitializing(true);
    setResult(null);

    try {
      const res = await fetch('/api/setup/init-db', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        setResult({ message: data.message, type: 'success' });
        // Refresh the page after a short delay so the server re-checks health
        setTimeout(() => router.refresh(), 1500);
      } else {
        setResult({ message: data.error || 'Initialization failed', type: 'error' });
      }
    } catch (err) {
      setResult({
        message: err instanceof Error ? err.message : 'Failed to connect',
        type: 'error',
      });
    } finally {
      setInitializing(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(schemaSql);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = schemaSql;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <div style={{
        padding: 'var(--space-4)',
        borderLeft: '3px solid var(--warning, #f59e0b)',
        background: 'color-mix(in srgb, var(--warning, #f59e0b) 6%, transparent)',
      }}>
        {/* Header */}
        <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-3)' }}>
          <AlertTriangle size={18} style={{ color: 'var(--warning, #f59e0b)', flexShrink: 0 }} />
          <span className="t-sub" style={{ fontWeight: 600 }}>Database Setup Required</span>
        </div>

        <p className="t-body" style={{ color: 'var(--text-secondary)', margin: 0, marginBottom: 'var(--space-3)' }}>
          Your Supabase project is connected but the database tables haven&apos;t been created yet.
          The data pipeline needs tables to store scraped posts and analyzed images.
        </p>

        {/* Success / Error result */}
        {result && (
          <div
            className="flex items-center gap-2"
            style={{
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius)',
              marginBottom: 'var(--space-3)',
              background: result.type === 'success'
                ? 'var(--success-bg, rgba(34,197,94,0.08))'
                : 'var(--error-bg, rgba(239,68,68,0.08))',
            }}
          >
            {result.type === 'success' ? (
              <CheckCircle size={14} style={{ color: 'var(--success, #22c55e)', flexShrink: 0 }} />
            ) : (
              <AlertTriangle size={14} style={{ color: 'var(--error, #ef4444)', flexShrink: 0 }} />
            )}
            <span className="t-caption" style={{
              fontWeight: 500,
              color: result.type === 'success'
                ? 'var(--success, #22c55e)'
                : 'var(--error, #ef4444)',
            }}>
              {result.message}
            </span>
          </div>
        )}

        {hasDatabaseUrl ? (
          /* Mode A: DATABASE_URL is available — one-click init */
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-2)' }}>
              <Button
                variant="primary"
                onClick={handleInitialize}
                disabled={initializing || result?.type === 'success'}
              >
                {initializing ? (
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                ) : result?.type === 'success' ? (
                  <CheckCircle size={14} />
                ) : (
                  <Database size={14} />
                )}
                {initializing
                  ? 'Initializing...'
                  : result?.type === 'success'
                    ? 'Done!'
                    : 'Initialize Database'}
              </Button>

              <button
                className="flex items-center gap-1 t-caption"
                onClick={() => setShowSql((p) => !p)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  padding: 0,
                }}
              >
                {showSql ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                View SQL
              </button>
            </div>

            <p className="t-caption" style={{ color: 'var(--text-tertiary)', margin: 0 }}>
              Creates all 10 tables, 9 enum types, and indexes in your Supabase database.
            </p>
          </div>
        ) : (
          /* Mode B: No DATABASE_URL — manual options */
          <div>
            <div style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              marginBottom: 'var(--space-3)',
            }}>
              <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                Option 1: One-Click Setup
              </span>
              <p className="t-caption" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                Add <code>DATABASE_URL</code> to your environment variables and refresh this page.
                Find it in Supabase under <strong>Project Settings &rarr; Database &rarr; Connection string (URI)</strong>.
              </p>
            </div>

            <div style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border)',
              marginBottom: 'var(--space-3)',
            }}>
              <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                Option 2: Manual Setup
              </span>
              <p className="t-caption" style={{ color: 'var(--text-secondary)', margin: 0, marginBottom: 'var(--space-2)' }}>
                Copy the SQL below and paste it into your Supabase SQL Editor.
              </p>
              <div className="flex items-center gap-2">
                <Button variant="default" size="sm" onClick={handleCopy}>
                  {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied!' : 'Copy SQL to Clipboard'}
                </Button>
                <a
                  href="https://supabase.com/dashboard/project/_/sql/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-ghost flex items-center gap-1"
                  style={{ textDecoration: 'none' }}
                >
                  <ExternalLink size={14} />
                  Open SQL Editor
                </a>
              </div>
            </div>

            <button
              className="flex items-center gap-1 t-caption"
              onClick={() => setShowSql((p) => !p)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                padding: 0,
              }}
            >
              {showSql ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              {showSql ? 'Hide SQL' : 'Preview SQL'}
            </button>
          </div>
        )}

        {/* Expandable SQL preview */}
        {showSql && schemaSql && (
          <div style={{ marginTop: 'var(--space-3)' }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
              <span className="t-label">schema.sql</span>
              <Button variant="ghost" size="sm" onClick={handleCopy}>
                {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
            <textarea
              readOnly
              value={schemaSql}
              style={{
                width: '100%',
                height: 200,
                fontFamily: 'monospace',
                fontSize: 11,
                lineHeight: 1.5,
                padding: 'var(--space-2)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                color: 'var(--text-secondary)',
                resize: 'vertical',
              }}
            />
          </div>
        )}
      </div>
    </Card>
  );
}
