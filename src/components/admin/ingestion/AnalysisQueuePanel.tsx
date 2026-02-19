'use client';

import { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, Play, Eye, Square, Loader } from 'lucide-react';

interface AnalysisQueuePanelProps {
  totalRawPosts: number;
  totalAnalyzed: number;
  totalFilteredOut: number;
}

interface AnalyzedResult {
  handle: string;
  postId: string;
  contentType?: string;
  style?: string;
}

export function AnalysisQueuePanel({ totalRawPosts, totalAnalyzed, totalFilteredOut }: AnalysisQueuePanelProps) {
  const [batchSize, setBatchSize] = useState(50);
  const [isRunning, setIsRunning] = useState(false);
  const [isDryRun, setIsDryRun] = useState(false);
  const [analyzed, setAnalyzed] = useState(totalAnalyzed);
  const [currentHandle, setCurrentHandle] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [skipCount, setSkipCount] = useState(0);
  const [recentResults, setRecentResults] = useState<AnalyzedResult[]>([]);
  const abortRef = useRef(false);

  const [result, setResult] = useState<{
    analyzed?: number;
    failed?: number;
    skipped?: number;
    estimated_cost?: string;
    total_remaining?: number;
    dryRun?: boolean;
    will_analyze?: number;
    will_skip?: number;
    skip_reasons?: Array<{ handle: string; postId: string; reason: string; engagement: string }>;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const queueSize = Math.max(0, totalRawPosts - analyzed - totalFilteredOut);

  // One-at-a-time sequential analysis with live progress
  const runSequential = useCallback(async () => {
    setIsRunning(true);
    setIsDryRun(false);
    setResult(null);
    setError(null);
    setSuccessCount(0);
    setFailCount(0);
    setSkipCount(0);
    setRecentResults([]);
    abortRef.current = false;

    const targetCount = batchSize === 0 ? 9999 : batchSize;
    let completed = 0;

    try {
      while (completed < targetCount && !abortRef.current) {
        const res = await fetch('/api/analyze/next', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(data.error || `HTTP ${res.status}`);
        }

        const data = await res.json();

        if (data.done) {
          // No more posts to analyze
          break;
        }

        if (data.skipped) {
          setSkipCount((prev) => prev + 1);
          completed++;
          continue;
        }

        if (data.analyzed) {
          setSuccessCount((prev) => prev + 1);
          setAnalyzed(data.analyzed_total);
          setCurrentHandle(data.analyzed.handle);
          setRecentResults((prev) => [
            { handle: data.analyzed.handle, postId: data.analyzed.postId, contentType: data.analyzed.contentType, style: data.analyzed.style },
            ...prev.slice(0, 4),
          ]);
        }

        if (data.error) {
          setFailCount((prev) => prev + 1);
        }

        completed++;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
      setCurrentHandle(null);
    }
  }, [batchSize]);

  // Dry run uses the batch endpoint
  const runDryRun = useCallback(async () => {
    setIsRunning(true);
    setIsDryRun(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch('/api/analyze/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ limit: batchSize, dryRun: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsRunning(false);
      setIsDryRun(false);
    }
  }, [batchSize]);

  const stopAnalysis = useCallback(() => {
    abortRef.current = true;
  }, []);

  const totalProcessed = successCount + failCount + skipCount;
  const targetTotal = batchSize === 0 ? queueSize : Math.min(batchSize, queueSize);
  const progressPct = targetTotal > 0 ? Math.round((totalProcessed / targetTotal) * 100) : 0;

  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="flex items-center gap-2">
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <span className="t-sub">Vision Analysis Queue</span>
            {queueSize > 0 && (
              <Badge variant="warning">{queueSize} ready</Badge>
            )}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: 'var(--space-3)',
          marginBottom: 'var(--space-4)',
        }}>
          <div style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-success, #f0fdf4)',
          }}>
            <div className="t-sm" style={{ color: 'var(--text-secondary)' }}>Pre-Screen Approved</div>
            <div className="t-lg" style={{ fontWeight: 600 }}>{totalRawPosts.toLocaleString()}</div>
          </div>
          <div style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-primary)',
          }}>
            <div className="t-sm" style={{ color: 'var(--text-secondary)' }}>Analyzed</div>
            <div className="t-lg" style={{ fontWeight: 600 }}>{analyzed.toLocaleString()}</div>
          </div>
          <div style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-primary)',
          }}>
            <div className="t-sm" style={{ color: 'var(--text-secondary)' }}>Ready for Analysis</div>
            <div className="t-lg" style={{ fontWeight: 600, color: queueSize > 0 ? 'var(--accent)' : 'var(--text-primary)' }}>
              {queueSize.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3" style={{ marginBottom: 'var(--space-3)' }}>
          <label className="t-sm" style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            Batch size:
          </label>
          <select
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            disabled={isRunning}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: '13px',
            }}
          >
            <option value={10}>10 images (~$0.25)</option>
            <option value={25}>25 images (~$0.63)</option>
            <option value={50}>50 images (~$1.25)</option>
            <option value={100}>100 images (~$2.50)</option>
            <option value={250}>250 images (~$6.25)</option>
            <option value={500}>500 images (~$12.50)</option>
            <option value={0}>All remaining</option>
          </select>

          <button
            className="btn btn-sm"
            onClick={runDryRun}
            disabled={isRunning || queueSize === 0}
            style={{ marginLeft: 'auto' }}
          >
            <Eye size={14} />
            {isDryRun && isRunning ? 'Previewing...' : 'Preview'}
          </button>

          {isRunning && !isDryRun ? (
            <button
              className="btn btn-sm"
              onClick={stopAnalysis}
              style={{
                background: 'var(--bg-error, #fef2f2)',
                border: '1px solid var(--border-error, #fecaca)',
              }}
            >
              <Square size={14} />
              Stop
            </button>
          ) : (
            <button
              className="btn btn-sm btn-primary"
              onClick={runSequential}
              disabled={isRunning || queueSize === 0}
            >
              <Play size={14} />
              Start Analysis
            </button>
          )}
        </div>

        {/* Live progress during analysis */}
        {isRunning && !isDryRun && (
          <div style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            fontSize: '13px',
            marginBottom: 'var(--space-3)',
          }}>
            <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-2)' }}>
              <Loader size={14} style={{ animation: 'spin 1s linear infinite', color: 'var(--accent)' }} />
              <span style={{ fontWeight: 600 }}>
                Analyzing {currentHandle ? `@${currentHandle}` : '...'}
              </span>
              <span style={{ color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
                {totalProcessed} / {targetTotal} ({progressPct}%)
              </span>
            </div>

            {/* Progress bar */}
            <div style={{
              width: '100%',
              height: 6,
              borderRadius: 3,
              background: 'var(--bg-tertiary, #e5e5e5)',
              overflow: 'hidden',
              marginBottom: 'var(--space-2)',
            }}>
              <div style={{
                width: `${progressPct}%`,
                height: '100%',
                background: 'var(--accent)',
                borderRadius: 3,
                transition: 'width 0.3s ease',
              }} />
            </div>

            <div className="flex gap-3" style={{ color: 'var(--text-secondary)' }}>
              <span style={{ color: 'var(--success)' }}>{successCount} analyzed</span>
              {failCount > 0 && <span style={{ color: 'var(--error)' }}>{failCount} failed</span>}
              {skipCount > 0 && <span>{skipCount} skipped</span>}
              <span style={{ marginLeft: 'auto' }}>~${(successCount * 0.025).toFixed(2)} spent</span>
            </div>

            {/* Recent results feed */}
            {recentResults.length > 0 && (
              <div style={{ marginTop: 'var(--space-2)', borderTop: '1px solid var(--border)', paddingTop: 'var(--space-2)' }}>
                {recentResults.map((r, i) => (
                  <div key={`${r.postId}-${i}`} className="t-caption" style={{ color: 'var(--text-tertiary)', padding: '1px 0' }}>
                    @{r.handle} — {r.contentType || 'unknown'} / {r.style || 'unknown'}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Completion summary */}
        {!isRunning && successCount > 0 && (
          <div style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-success, #f0fdf4)',
            border: '1px solid var(--border-success, #bbf7d0)',
            fontSize: '13px',
            marginBottom: 'var(--space-3)',
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Analysis Complete</div>
            <div className="flex gap-3">
              <span>Analyzed: {successCount}</span>
              {failCount > 0 && <span style={{ color: 'var(--text-error, #dc2626)' }}>Failed: {failCount}</span>}
              {skipCount > 0 && <span>Skipped: {skipCount}</span>}
              <span>Cost: ~${(successCount * 0.025).toFixed(2)}</span>
            </div>
          </div>
        )}

        {error && (
          <div style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-error, #fef2f2)',
            border: '1px solid var(--border-error, #fecaca)',
            color: 'var(--text-error, #dc2626)',
            fontSize: '13px',
          }}>
            Error: {error}
          </div>
        )}

        {result?.dryRun && (
          <div style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg-primary)',
            border: '1px solid var(--border)',
            fontSize: '13px',
          }}>
            <div style={{ fontWeight: 600, marginBottom: '4px' }}>Dry Run Preview</div>
            <div className="flex gap-3" style={{ marginBottom: '8px' }}>
              <span>Will analyze: {result.will_analyze}</span>
              <span>Will skip: {result.will_skip}</span>
              <span>Estimated cost: {result.estimated_cost}</span>
            </div>
            {result.skip_reasons && result.skip_reasons.length > 0 && (
              <details>
                <summary style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  Skip reasons ({result.skip_reasons.length} shown)
                </summary>
                <div style={{ marginTop: '8px', maxHeight: '200px', overflow: 'auto' }}>
                  {result.skip_reasons.map((r, i) => (
                    <div key={i} className="t-sm" style={{ color: 'var(--text-secondary)', padding: '2px 0' }}>
                      @{r.handle} — {r.reason} (engagement: {r.engagement})
                    </div>
                  ))}
                </div>
              </details>
            )}
          </div>
        )}
      </div>

      {/* Spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Card>
  );
}
