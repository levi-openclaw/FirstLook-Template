'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, Store, Users, Play, ArrowLeft, Loader2, Package, HelpCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatNumber } from '@/lib/utils/format';

interface ApifyActor {
  id: string;
  name: string;
  title: string;
  description: string;
  username: string;
  stats?: {
    totalUsers?: number;
    totalRuns?: number;
  };
  currentPricingInfo?: {
    pricingModel?: string;
  };
}

interface ApifyStoreResponse {
  data?: {
    items?: ApifyActor[];
    total?: number;
  };
}

interface ApifyMarketplaceProps {
  injectedHandles?: string[];
}

const RECOMMENDED_ACTORS = [
  {
    id: 'rec-instagram',
    name: 'instagram-scraper',
    title: 'Instagram Profile Scraper',
    description: 'Scrape Instagram profiles, posts, reels, and stories. Supports multiple accounts and saves post images, captions, likes, and comments.',
    username: 'apify',
    stats: { totalUsers: 15000 },
    currentPricingInfo: { pricingModel: 'FREE' },
  },
  {
    id: 'rec-tiktok',
    name: 'tiktok-scraper',
    title: 'TikTok Scraper',
    description: 'Scrape TikTok profiles and videos. Collects video metadata, engagement counts, hashtags, and download links.',
    username: 'clockworks',
    stats: { totalUsers: 8000 },
    currentPricingInfo: { pricingModel: 'FREE' },
  },
];

export function ApifyMarketplace({ injectedHandles = [] }: ApifyMarketplaceProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ApifyActor[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedActor, setSelectedActor] = useState<ApifyActor | null>(null);
  const [inputJson, setInputJson] = useState('');
  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerResult, setTriggerResult] = useState<string | null>(null);
  const [showExplainer, setShowExplainer] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      const res = await fetch(`/api/apify/store?search=${encodeURIComponent(searchQuery)}&limit=20`);
      const data: ApifyStoreResponse = await res.json();
      setResults(data.data?.items || []);
    } catch (err) {
      console.error('Apify store search error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback((value: string) => {
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      search(value);
    }, 300);
  }, [search]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSelect = useCallback((actor: ApifyActor) => {
    setSelectedActor(actor);
    setTriggerResult(null);

    // If handles were imported from CSV, auto-populate the input
    if (injectedHandles.length > 0) {
      const looksLikeUrls = injectedHandles.some((h) => h.startsWith('http'));
      const key = looksLikeUrls ? 'urls' : 'usernames';
      setInputJson(JSON.stringify({
        [key]: injectedHandles,
        resultsLimit: 20,
      }, null, 2));
    } else {
      setInputJson(JSON.stringify({
        usernames: ['example_user_1', 'example_user_2'],
        resultsLimit: 20,
      }, null, 2));
    }
  }, [injectedHandles]);

  const handleTrigger = useCallback(async () => {
    if (!selectedActor) return;

    setTriggerLoading(true);
    setTriggerResult(null);

    try {
      let parsedInput: Record<string, unknown> = {};
      if (inputJson.trim()) {
        parsedInput = JSON.parse(inputJson);
      }

      const res = await fetch('/api/apify/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actorId: `${selectedActor.username}/${selectedActor.name}`,
          input: parsedInput,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setTriggerResult(`Error: ${data.error}`);
      } else if (data.mock) {
        setTriggerResult('Mock run triggered. Configure APIFY_API_TOKEN for real runs.');
      } else {
        setTriggerResult(`Run started: ${data.runId} (status: ${data.status})`);
      }
    } catch (err) {
      setTriggerResult(`Error: ${err instanceof Error ? err.message : 'Failed to trigger actor'}`);
    } finally {
      setTriggerLoading(false);
    }
  }, [selectedActor, inputJson]);

  const handleBack = useCallback(() => {
    setSelectedActor(null);
    setTriggerResult(null);
  }, []);

  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
          <div className="flex items-center gap-2">
            {selectedActor && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft size={14} />
              </Button>
            )}
            <Store size={16} style={{ color: 'var(--text-tertiary)' }} />
            <span className="t-sub">
              {selectedActor ? 'Configure Actor' : 'Choose a Scraper'}
            </span>
          </div>
          {!selectedActor && (
            <button
              className="flex items-center gap-1 t-caption"
              onClick={() => setShowExplainer((p) => !p)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-tertiary)',
                padding: 0,
              }}
            >
              <HelpCircle size={13} />
              What is an Apify Actor?
              {showExplainer ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}
        </div>

        {/* Explainer */}
        {showExplainer && !selectedActor && (
          <div
            style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius)',
              background: 'var(--bg)',
              border: '1px solid var(--border)',
              marginBottom: 'var(--space-3)',
            }}
          >
            <p className="t-body" style={{ color: 'var(--text-secondary)', margin: 0 }}>
              An <strong>Apify Actor</strong> is a pre-built cloud scraper. It runs on Apify&apos;s
              infrastructure and pulls data from social media platforms into your database.
              You give it a list of account handles, and it returns their recent posts with
              images, captions, likes, comments, and more. Search below or pick a recommended one to get started.
            </p>
          </div>
        )}

        {!selectedActor ? (
          <>
            {/* Recommended actors */}
            {!searched && !loading && (
              <div style={{ marginBottom: 'var(--space-4)' }}>
                <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>
                  Recommended Scrapers
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {RECOMMENDED_ACTORS.map((actor) => (
                    <div
                      key={actor.id}
                      style={{
                        padding: 'var(--space-3)',
                        borderRadius: 'var(--radius)',
                        border: '1px solid var(--border)',
                        background: 'var(--bg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-3)',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div className="flex items-center gap-2" style={{ marginBottom: 2 }}>
                          <span className="t-body" style={{ fontWeight: 600, fontSize: 13 }}>
                            {actor.title}
                          </span>
                          <Badge variant="neutral">{actor.currentPricingInfo.pricingModel}</Badge>
                        </div>
                        <p className="t-caption" style={{ color: 'var(--text-secondary)', margin: 0 }}>
                          {actor.description}
                        </p>
                      </div>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleSelect(actor as ApifyActor)}
                        style={{ flexShrink: 0 }}
                      >
                        Use This
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Search input */}
            <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                className="input"
                placeholder="Search for other actors... (e.g., youtube, twitter, scraper)"
                value={query}
                onChange={(e) => handleInputChange(e.target.value)}
                style={{ width: '100%', paddingLeft: 36 }}
              />
            </div>

            {/* Loading state */}
            {loading && (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <Loader2 size={20} style={{ color: 'var(--text-tertiary)', animation: 'spin 1s linear infinite' }} />
                <p className="t-caption" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-2)' }}>
                  Searching Apify store...
                </p>
              </div>
            )}

            {/* Results grid */}
            {!loading && results.length > 0 && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'var(--space-3)',
              }}>
                {results.map((actor) => (
                  <div
                    key={actor.id}
                    style={{
                      padding: 'var(--space-3)',
                      borderRadius: 'var(--radius)',
                      border: '1px solid var(--border)',
                      background: 'var(--bg)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 'var(--space-2)',
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="t-body" style={{ fontWeight: 600, fontSize: 13 }}>
                        {actor.title || actor.name}
                      </span>
                    </div>
                    <p className="t-caption" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                      {actor.description
                        ? actor.description.length > 100
                          ? `${actor.description.slice(0, 100)}...`
                          : actor.description
                        : 'No description'}
                    </p>
                    <div className="flex items-center gap-3" style={{ marginTop: 'auto' }}>
                      {actor.stats?.totalUsers != null && (
                        <span className="flex items-center gap-1 t-caption" style={{ color: 'var(--text-tertiary)' }}>
                          <Users size={11} />
                          {formatNumber(actor.stats.totalUsers)} users
                        </span>
                      )}
                      {actor.currentPricingInfo?.pricingModel && (
                        <Badge variant="neutral">
                          {actor.currentPricingInfo.pricingModel}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleSelect(actor)}
                      style={{ marginTop: 'var(--space-1)' }}
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!loading && searched && results.length === 0 && (
              <div style={{ textAlign: 'center', padding: 'var(--space-6)' }}>
                <Package size={32} style={{ color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }} />
                <p className="t-body" style={{ color: 'var(--text-tertiary)' }}>
                  No actors found for &ldquo;{query}&rdquo;
                </p>
                <p className="t-caption" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                  Try a different search term
                </p>
              </div>
            )}
          </>
        ) : (
          /* Configuration form for selected actor */
          <div className="flex flex-col gap-4">
            <div style={{
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              background: 'var(--bg)',
            }}>
              <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-2)' }}>
                <span className="t-body" style={{ fontWeight: 600 }}>
                  {selectedActor.title || selectedActor.name}
                </span>
                {selectedActor.stats?.totalUsers != null && (
                  <Badge variant="neutral">
                    {formatNumber(selectedActor.stats.totalUsers)} users
                  </Badge>
                )}
              </div>
              <p className="t-caption" style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {selectedActor.description || 'No description'}
              </p>
            </div>

            <div>
              <label className="t-label" style={{ display: 'block', marginBottom: 'var(--space-1)' }}>
                Actor ID
              </label>
              <input
                type="text"
                className="input"
                value={`${selectedActor.username}/${selectedActor.name}`}
                readOnly
                style={{ width: '100%', opacity: 0.7 }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-1)' }}>
                <label className="t-label">Input JSON</label>
                {injectedHandles.length > 0 && (
                  <Badge variant="accent">{injectedHandles.length} handles from CSV</Badge>
                )}
              </div>
              <textarea
                className="input"
                rows={8}
                value={inputJson}
                onChange={(e) => setInputJson(e.target.value)}
                placeholder={'{\n  "usernames": ["user1", "user2"],\n  "resultsLimit": 20\n}'}
                style={{ width: '100%', resize: 'vertical', fontFamily: 'monospace', fontSize: 12 }}
              />
              <p className="t-caption" style={{ color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
                This JSON is sent as the actor&apos;s input. Most scrapers accept a <code>usernames</code> array
                and a <code>resultsLimit</code> to control how many posts to fetch per account.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                onClick={handleTrigger}
                disabled={triggerLoading}
              >
                {triggerLoading ? (
                  <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Play size={14} />
                )}
                {triggerLoading ? 'Running...' : 'Run Actor'}
              </Button>
              <Button variant="default" onClick={handleBack}>
                Cancel
              </Button>
            </div>

            {triggerResult && (
              <div style={{
                padding: 'var(--space-3)',
                borderRadius: 'var(--radius)',
                border: '1px solid var(--border)',
                background: triggerResult.startsWith('Error')
                  ? 'var(--bg-error, #fef2f2)'
                  : 'var(--bg-success, #f0fdf4)',
                fontSize: 13,
              }}>
                <span className="t-caption" style={{ fontWeight: 500 }}>{triggerResult}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
