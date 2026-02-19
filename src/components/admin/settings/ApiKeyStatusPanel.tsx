'use client';

import { useState } from 'react';
import type { ApiKeyStatus } from '@/lib/types/database';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { formatCurrency, formatRelativeTime } from '@/lib/utils/format';
import { Key, ExternalLink, ChevronDown, ChevronUp, AlertCircle, CheckCircle } from 'lucide-react';

const SERVICE_CONFIG: Record<string, { envVars: string[]; helpText: string; helpUrl: string }> = {
  'Supabase': {
    envVars: ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
    helpText: 'You need 3 keys from supabase.com \u2192 Settings \u2192 API: the Project URL, the anon (public) key, and the service_role (secret) key',
    helpUrl: 'https://supabase.com',
  },
  'Apify': {
    envVars: ['APIFY_API_TOKEN'],
    helpText: 'Get your API token from console.apify.com \u2192 Settings \u2192 Integrations',
    helpUrl: 'https://console.apify.com',
  },
  'Anthropic': {
    envVars: ['ANTHROPIC_API_KEY'],
    helpText: 'Get your API key from console.anthropic.com \u2192 API Keys',
    helpUrl: 'https://console.anthropic.com',
  },
  'OpenAI': {
    envVars: ['OPENAI_API_KEY'],
    helpText: 'Get your API key from platform.openai.com \u2192 API Keys (optional \u2014 only needed for embeddings)',
    helpUrl: 'https://platform.openai.com',
  },
};

interface ApiKeyStatusPanelProps {
  statuses: ApiKeyStatus[];
}

export function ApiKeyStatusPanel({ statuses }: ApiKeyStatusPanelProps) {
  const [expandedService, setExpandedService] = useState<string | null>(null);
  const [testingService, setTestingService] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, { success: boolean; message: string } | null>>({});
  const [showRemoveWarning, setShowRemoveWarning] = useState<string | null>(null);

  const toggleExpand = (service: string) => {
    setExpandedService(expandedService === service ? null : service);
    setShowRemoveWarning(null);
    setTestResult((prev) => ({ ...prev, [service]: null }));
  };

  const handleTestConnection = async (service: string) => {
    setTestingService(service);
    setTestResult((prev) => ({ ...prev, [service]: null }));

    try {
      const res = await fetch('/api/settings/verify-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service }),
      });
      const data = await res.json();
      setTestResult((prev) => ({
        ...prev,
        [service]: {
          success: data.success ?? false,
          message: data.message ?? (data.success ? 'Connection verified' : 'Connection failed'),
        },
      }));
    } catch {
      setTestResult((prev) => ({
        ...prev,
        [service]: { success: false, message: 'Failed to reach verification endpoint' },
      }));
    } finally {
      setTestingService(null);
    }
  };

  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <span className="t-sub" style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
          API Connections
        </span>
        <div className="flex flex-col gap-3">
          {statuses.map((status) => {
            const config = SERVICE_CONFIG[status.service];
            const isExpanded = expandedService === status.service;
            const result = testResult[status.service];

            return (
              <div
                key={status.service}
                style={{
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  background: 'var(--bg)',
                  overflow: 'hidden',
                }}
              >
                {/* Service row */}
                <div style={{ padding: 'var(--space-3)' }}>
                  <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
                    <div className="flex items-center gap-2">
                      <Key size={14} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                      <span className="t-body" style={{ fontWeight: 600 }}>{status.service}</span>
                      <Badge variant={status.is_connected ? 'success' : 'warning'} dot>
                        {status.is_connected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    <button
                      className="btn btn-sm btn-ghost"
                      onClick={() => toggleExpand(status.service)}
                      style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}
                    >
                      {status.is_connected ? 'Configure' : 'Connect'}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                  {status.last_verified && (
                    <span className="t-caption" style={{ color: 'var(--text-tertiary)', display: 'block' }}>
                      Last verified: {formatRelativeTime(status.last_verified)}
                    </span>
                  )}
                  {status.quota_limit && status.quota_used !== null && (
                    <div style={{ marginTop: 'var(--space-2)' }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                        <span className="t-caption">Quota</span>
                        <span className="t-caption">
                          {formatCurrency(status.quota_used)} / {formatCurrency(status.quota_limit)}
                        </span>
                      </div>
                      <ProgressBar value={status.quota_used} max={status.quota_limit} />
                    </div>
                  )}
                </div>

                {/* Expanded configuration panel */}
                {isExpanded && config && (
                  <div
                    style={{
                      padding: 'var(--space-3)',
                      borderTop: '1px solid var(--border)',
                      background: 'var(--bg-secondary)',
                    }}
                  >
                    {/* Env var display */}
                    <div style={{ marginBottom: 'var(--space-3)' }}>
                      <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
                        {config.envVars.length > 1 ? 'Environment Variables' : 'Environment Variable'}
                      </label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
                        {config.envVars.map((envVar) => (
                          <input
                            key={envVar}
                            className="input"
                            type="text"
                            value={envVar}
                            readOnly
                            style={{
                              width: '100%',
                              fontFamily: 'var(--font-mono, monospace)',
                              fontSize: 'var(--text-sm)',
                              cursor: 'default',
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Help text */}
                    <div
                      className="flex items-center gap-2"
                      style={{ marginBottom: 'var(--space-3)' }}
                    >
                      <ExternalLink size={12} style={{ color: 'var(--text-secondary)', flexShrink: 0 }} />
                      <span className="t-caption" style={{ color: 'var(--text-secondary)' }}>
                        {config.helpText}
                      </span>
                    </div>

                    {/* Test result */}
                    {result && (
                      <div
                        className="flex items-center gap-2"
                        style={{
                          marginBottom: 'var(--space-3)',
                          padding: 'var(--space-2)',
                          borderRadius: 'var(--radius)',
                          background: result.success ? 'var(--success-bg, rgba(34,197,94,0.08))' : 'var(--error-bg, rgba(239,68,68,0.08))',
                        }}
                      >
                        {result.success ? (
                          <CheckCircle size={14} style={{ color: 'var(--success, #22c55e)', flexShrink: 0 }} />
                        ) : (
                          <AlertCircle size={14} style={{ color: 'var(--error, #ef4444)', flexShrink: 0 }} />
                        )}
                        <span className="t-caption" style={{ color: result.success ? 'var(--success, #22c55e)' : 'var(--error, #ef4444)' }}>
                          {result.message}
                        </span>
                      </div>
                    )}

                    {/* Remove warning */}
                    {showRemoveWarning === status.service && (
                      <div
                        className="flex items-center gap-2"
                        style={{
                          marginBottom: 'var(--space-3)',
                          padding: 'var(--space-2)',
                          borderRadius: 'var(--radius)',
                          background: 'var(--warning-bg, rgba(245,158,11,0.08))',
                        }}
                      >
                        <AlertCircle size={14} style={{ color: 'var(--warning, #f59e0b)', flexShrink: 0 }} />
                        <span className="t-caption" style={{ color: 'var(--warning, #f59e0b)' }}>
                          To update or remove keys, go to your Vercel project → Settings → Environment Variables. For local development, edit your .env.local file and restart the server.
                        </span>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2">
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => handleTestConnection(status.service)}
                        disabled={testingService === status.service}
                      >
                        {testingService === status.service ? 'Testing...' : 'Test Connection'}
                      </button>
                      {status.is_connected && (
                        <button
                          className="btn btn-sm btn-ghost"
                          onClick={() =>
                            setShowRemoveWarning(
                              showRemoveWarning === status.service ? null : status.service
                            )
                          }
                        >
                          Remove Key
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
