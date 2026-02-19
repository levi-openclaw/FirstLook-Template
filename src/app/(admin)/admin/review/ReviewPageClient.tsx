'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Image, CheckCircle, XCircle, Clock, CheckSquare, Square, X, Check, Keyboard } from 'lucide-react';
import type { ReviewStatus, AnalyzedImage } from '@/lib/types/database';
import { MetricCard } from '@/components/ui/MetricCard';
import { ReviewFilters } from '@/components/admin/review/ReviewFilters';
import { ImageCard } from '@/components/admin/review/ImageCard';
import { ImageDetailPanel } from '@/components/admin/review/ImageDetailPanel';
import { Button } from '@/components/ui/Button';
import { formatNumber } from '@/lib/utils/format';

interface ReviewPageClientProps {
  initialImages: AnalyzedImage[];
}

export default function ReviewPageClient({ initialImages }: ReviewPageClientProps) {
  const [images, setImages] = useState<AnalyzedImage[]>(initialImages);
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'all'>('all');
  const [styleFilter, setStyleFilter] = useState('all');
  const [momentFilter, setMomentFilter] = useState('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [autoAdvance, setAutoAdvance] = useState(true);

  // Multi-select state
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [checkedIds, setCheckedIds] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  // Ref to track latest filtered list for keyboard nav
  const filteredRef = useRef<AnalyzedImage[]>([]);

  const filtered = useMemo(() => {
    return images.filter((img) => {
      if (statusFilter !== 'all' && img.review_status !== statusFilter) return false;
      if (styleFilter !== 'all' && img.style !== styleFilter) return false;
      if (momentFilter !== 'all' && img.moment_category !== momentFilter) return false;
      return true;
    });
  }, [images, statusFilter, styleFilter, momentFilter]);

  // Keep ref in sync
  filteredRef.current = filtered;

  const selectedImage = selectedId ? images.find((img) => img.id === selectedId) : null;

  // Current index within filtered list
  const selectedIndex = selectedId ? filtered.findIndex((img) => img.id === selectedId) : -1;

  const counts = useMemo(() => ({
    total: images.length,
    unreviewed: images.filter((i) => i.review_status === 'unreviewed').length,
    approved: images.filter((i) => i.review_status === 'approved').length,
    rejected: images.filter((i) => i.review_status === 'rejected').length,
  }), [images]);

  // Navigate to prev/next image in filtered list
  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    const list = filteredRef.current;
    if (list.length === 0) return;
    const curIdx = list.findIndex((img) => img.id === selectedId);
    if (curIdx === -1) {
      // Nothing selected — select first
      setSelectedId(list[0].id);
      return;
    }
    const nextIdx = direction === 'next'
      ? Math.min(curIdx + 1, list.length - 1)
      : Math.max(curIdx - 1, 0);
    setSelectedId(list[nextIdx].id);
  }, [selectedId]);

  // After approve/reject, advance to next unreviewed if autoAdvance is on
  const advanceToNextUnreviewed = useCallback(() => {
    if (!autoAdvance) return;
    const list = filteredRef.current;
    const curIdx = list.findIndex((img) => img.id === selectedId);
    // Find next unreviewed after current position
    for (let i = curIdx + 1; i < list.length; i++) {
      if (list[i].review_status === 'unreviewed') {
        setSelectedId(list[i].id);
        return;
      }
    }
    // Wrap around from beginning
    for (let i = 0; i < curIdx; i++) {
      if (list[i].review_status === 'unreviewed') {
        setSelectedId(list[i].id);
        return;
      }
    }
    // No more unreviewed — close sidebar
    setSelectedId(null);
  }, [autoAdvance, selectedId]);

  // Persist error state
  const [persistError, setPersistError] = useState<string | null>(null);

  // Single image status update
  const handleUpdateStatus = useCallback(async (id: string, status: ReviewStatus, notes: string | null) => {
    // Store previous state for rollback
    const prevImages = images;
    setPersistError(null);

    // Optimistic update
    setImages((prev) =>
      prev.map((img) =>
        img.id === id ? { ...img, review_status: status, override_notes: notes } : img
      )
    );

    // Auto-advance after a short delay so user sees the status change
    if (autoAdvance && id === selectedId) {
      setTimeout(() => advanceToNextUnreviewed(), 200);
    }

    try {
      const res = await fetch('/api/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, notes }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }

      const data = await res.json();
      if (data.mock) {
        console.warn('Review update returned mock response — Supabase may not be configured');
      }
    } catch (err) {
      console.error('Failed to persist review status:', err);
      // Rollback optimistic update
      setImages(prevImages);
      setPersistError(err instanceof Error ? err.message : 'Failed to save review');
      // Clear error after 5 seconds
      setTimeout(() => setPersistError(null), 5000);
    }
  }, [autoAdvance, selectedId, advanceToNextUnreviewed, images]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in inputs/textareas
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      // Don't capture when modifier keys are held (except shift for some)
      if (e.metaKey || e.ctrlKey) return;

      if (multiSelectMode) return; // No keyboard nav in multi-select

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          navigateImage('next');
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          navigateImage('prev');
          break;
        case 'a':
        case 'A':
          if (selectedId && selectedImage) {
            e.preventDefault();
            handleUpdateStatus(selectedId, 'approved', selectedImage.override_notes);
          }
          break;
        case 'r':
        case 'R':
          if (selectedId && selectedImage) {
            e.preventDefault();
            handleUpdateStatus(selectedId, 'rejected', selectedImage.override_notes);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedId(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [multiSelectMode, selectedId, selectedImage, navigateImage, handleUpdateStatus]);

  // Batch status update
  const handleBatchUpdate = useCallback(async (status: ReviewStatus) => {
    const ids = Array.from(checkedIds);
    if (ids.length === 0) return;

    setBatchLoading(true);
    setPersistError(null);
    const prevImages = images;

    // Optimistic update
    setImages((prev) =>
      prev.map((img) =>
        checkedIds.has(img.id) ? { ...img, review_status: status } : img
      )
    );

    try {
      const res = await fetch('/api/review', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status, notes: null }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(data.error || `HTTP ${res.status}`);
      }
    } catch (err) {
      console.error('Failed to persist batch review status:', err);
      setImages(prevImages);
      setPersistError(err instanceof Error ? err.message : 'Failed to save batch review');
      setTimeout(() => setPersistError(null), 5000);
    } finally {
      setBatchLoading(false);
      setCheckedIds(new Set());
      setMultiSelectMode(false);
    }
  }, [checkedIds, images]);

  // Toggle single checkbox
  const toggleCheck = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // Select / deselect all visible
  const selectAllVisible = useCallback(() => {
    setCheckedIds(new Set(filtered.map((img) => img.id)));
  }, [filtered]);

  const deselectAll = useCallback(() => {
    setCheckedIds(new Set());
  }, []);

  // Toggle multi-select mode
  const toggleMultiSelect = useCallback(() => {
    if (multiSelectMode) {
      // Exiting multi-select — clear checks
      setCheckedIds(new Set());
      setMultiSelectMode(false);
    } else {
      setMultiSelectMode(true);
      setSelectedId(null); // Close detail sidebar when entering multi-select
    }
  }, [multiSelectMode]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Content Explorer</h1>
          <p className="t-sub">Review and classify analyzed images to train the scoring model</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={multiSelectMode ? 'primary' : 'default'}
            onClick={toggleMultiSelect}
          >
            {multiSelectMode ? <CheckSquare size={14} /> : <Square size={14} />}
            {multiSelectMode ? 'Exit Select' : 'Multi-Select'}
          </Button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 'var(--space-6)' }}>
        <MetricCard
          label="Total Images"
          value={formatNumber(counts.total)}
          icon={Image}
        />
        <MetricCard
          label="Unreviewed"
          value={formatNumber(counts.unreviewed)}
          trend={{ value: counts.total > 0 ? `${Math.round((counts.unreviewed / counts.total) * 100)}% remaining` : '0%', direction: 'down' }}
          icon={Clock}
        />
        <MetricCard
          label="Approved"
          value={formatNumber(counts.approved)}
          trend={{ value: counts.total > 0 ? `${Math.round((counts.approved / counts.total) * 100)}%` : '0%', direction: 'up' }}
          icon={CheckCircle}
        />
        <MetricCard
          label="Rejected"
          value={formatNumber(counts.rejected)}
          trend={{ value: counts.total > 0 ? `${Math.round((counts.rejected / counts.total) * 100)}%` : '0%', direction: 'down' }}
          icon={XCircle}
        />
      </div>

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <ReviewFilters
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          styleFilter={styleFilter}
          onStyleChange={setStyleFilter}
          momentFilter={momentFilter}
          onMomentChange={setMomentFilter}
          totalCount={counts.total}
          filteredCount={filtered.length}
        />
      </div>

      {/* Keyboard shortcut hint bar — shows when sidebar is open */}
      {selectedImage && !multiSelectMode && (
        <div className="keyboard-hint-bar">
          <Keyboard size={13} />
          <span><kbd>A</kbd> Approve</span>
          <span><kbd>R</kbd> Reject</span>
          <span><kbd>&larr;</kbd><kbd>&rarr;</kbd> Navigate</span>
          <span><kbd>Esc</kbd> Close</span>
          <div style={{ marginLeft: 'auto' }}>
            <label className="flex items-center gap-2" style={{ cursor: 'pointer', fontSize: 12 }}>
              <input
                type="checkbox"
                checked={autoAdvance}
                onChange={(e) => setAutoAdvance(e.target.checked)}
                style={{ accentColor: 'var(--accent)' }}
              />
              Auto-advance
            </label>
          </div>
        </div>
      )}

      {/* Batch actions bar — shows when images are checked */}
      {multiSelectMode && checkedIds.size > 0 && (
        <div className="batch-actions-bar">
          <span className="batch-count">{checkedIds.size} selected</span>
          <Button
            variant="default"
            onClick={selectAllVisible}
            style={{ fontSize: 12 }}
          >
            <CheckSquare size={13} />
            Select All ({filtered.length})
          </Button>
          <Button
            variant="default"
            onClick={deselectAll}
            style={{ fontSize: 12 }}
          >
            <X size={13} />
            Deselect
          </Button>
          <div style={{ width: 1, height: 24, background: 'var(--divider)' }} />
          <Button
            variant="primary"
            onClick={() => handleBatchUpdate('approved')}
            disabled={batchLoading}
            style={{ fontSize: 12 }}
          >
            <Check size={13} />
            Approve All
          </Button>
          <Button
            variant="default"
            onClick={() => handleBatchUpdate('rejected')}
            disabled={batchLoading}
            style={{ fontSize: 12, color: 'var(--error)' }}
          >
            <XCircle size={13} />
            Reject All
          </Button>
        </div>
      )}

      {/* Show "Select All" prompt when multi-select is on but nothing checked */}
      {multiSelectMode && checkedIds.size === 0 && (
        <div className="batch-actions-bar">
          <span className="t-caption" style={{ color: 'var(--text-tertiary)', marginRight: 'auto' }}>
            Click images to select them, or:
          </span>
          <Button
            variant="default"
            onClick={selectAllVisible}
            style={{ fontSize: 12 }}
          >
            <CheckSquare size={13} />
            Select All ({filtered.length})
          </Button>
        </div>
      )}

      <div className="review-layout">
        <div className="review-grid-area">
          <div className="image-grid">
            {filtered.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                isSelected={selectedId === image.id}
                isChecked={checkedIds.has(image.id)}
                showCheckbox={multiSelectMode}
                onClick={() => {
                  if (multiSelectMode) {
                    // In multi-select mode, clicking the card toggles the check
                    setCheckedIds((prev) => {
                      const next = new Set(prev);
                      if (next.has(image.id)) {
                        next.delete(image.id);
                      } else {
                        next.add(image.id);
                      }
                      return next;
                    });
                  } else {
                    setSelectedId(selectedId === image.id ? null : image.id);
                  }
                }}
                onToggleCheck={(e) => toggleCheck(image.id, e)}
              />
            ))}
          </div>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
              <p className="t-body" style={{ color: 'var(--text-tertiary)' }}>
                No images match the current filters
              </p>
            </div>
          )}
        </div>

        {/* Sidebar — only shows when an image is selected (not in multi-select mode) */}
        {selectedImage && !multiSelectMode && (
          <ImageDetailPanel
            key={selectedImage.id}
            image={selectedImage}
            imageIndex={selectedIndex + 1}
            imageTotal={filtered.length}
            onClose={() => setSelectedId(null)}
            onUpdateStatus={handleUpdateStatus}
            onNavigate={navigateImage}
          />
        )}
      </div>

      {/* Persist error toast */}
      {persistError && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          padding: '12px 20px',
          borderRadius: 'var(--radius)',
          background: 'var(--bg-error, #fef2f2)',
          border: '1px solid var(--border-error, #fecaca)',
          color: 'var(--text-error, #dc2626)',
          fontSize: 13,
          fontWeight: 500,
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          maxWidth: 400,
        }}>
          ⚠️ {persistError}
        </div>
      )}
    </div>
  );
}
