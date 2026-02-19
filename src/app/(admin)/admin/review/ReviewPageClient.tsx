'use client';

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Image, Clock, Download, Keyboard } from 'lucide-react';
import type { AnalyzedImage } from '@/lib/types/database';
import { MetricCard } from '@/components/ui/MetricCard';
import { ReviewFilters, type SortOption } from '@/components/admin/review/ReviewFilters';
import { ImageCard } from '@/components/admin/review/ImageCard';
import { ImageDetailPanel } from '@/components/admin/review/ImageDetailPanel';
import { Button } from '@/components/ui/Button';
import { formatNumber, formatPercentage } from '@/lib/utils/format';

interface ReviewPageClientProps {
  initialImages: AnalyzedImage[];
}

function sortImages(images: AnalyzedImage[], sortBy: SortOption): AnalyzedImage[] {
  const sorted = [...images];
  switch (sortBy) {
    case 'engagement_desc':
      return sorted.sort((a, b) => b.engagement_rate - a.engagement_rate);
    case 'engagement_asc':
      return sorted.sort((a, b) => a.engagement_rate - b.engagement_rate);
    case 'likes':
      return sorted.sort((a, b) => (b.like_count ?? 0) - (a.like_count ?? 0));
    case 'comments':
      return sorted.sort((a, b) => (b.comment_count ?? 0) - (a.comment_count ?? 0));
    case 'date_desc':
      return sorted.sort((a, b) => {
        if (!a.post_date && !b.post_date) return 0;
        if (!a.post_date) return 1;
        if (!b.post_date) return -1;
        return new Date(b.post_date).getTime() - new Date(a.post_date).getTime();
      });
    case 'date_asc':
      return sorted.sort((a, b) => {
        if (!a.post_date && !b.post_date) return 0;
        if (!a.post_date) return 1;
        if (!b.post_date) return -1;
        return new Date(a.post_date).getTime() - new Date(b.post_date).getTime();
      });
    case 'content_type':
      return sorted.sort((a, b) => (a.content_type || '').localeCompare(b.content_type || ''));
    case 'style':
      return sorted.sort((a, b) => a.style.localeCompare(b.style));
    default:
      return sorted;
  }
}

function exportCsv(images: AnalyzedImage[]) {
  const headers = [
    'id', 'image_url', 'style', 'moment_category', 'content_type', 'setting',
    'lighting', 'composition', 'engagement_rate', 'like_count', 'comment_count',
    'save_count', 'share_count', 'account_handle', 'account_follower_count',
    'follower_tier', 'post_date',
  ];

  const rows = images.map((img) => {
    const record = img as unknown as Record<string, unknown>;
    return headers.map((h) => {
      const val = record[h];
      if (val == null) return '';
      const str = String(val);
      // Escape commas and quotes in CSV
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `content-explorer-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function ReviewPageClient({ initialImages }: ReviewPageClientProps) {
  const [images] = useState<AnalyzedImage[]>(initialImages);
  const [styleFilter, setStyleFilter] = useState('all');
  const [momentFilter, setMomentFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [engagementMin, setEngagementMin] = useState('');
  const [engagementMax, setEngagementMax] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('engagement_desc');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Ref to track latest filtered list for keyboard nav
  const filteredRef = useRef<AnalyzedImage[]>([]);

  const filtered = useMemo(() => {
    let result = images.filter((img) => {
      if (styleFilter !== 'all' && img.style !== styleFilter) return false;
      if (momentFilter !== 'all' && img.moment_category !== momentFilter) return false;

      // Date range filter
      if (dateRange !== 'all' && img.post_date) {
        const days = parseInt(dateRange, 10);
        const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
        if (new Date(img.post_date).getTime() < cutoff) return false;
      }

      // Engagement range filter
      if (engagementMin !== '') {
        const min = parseFloat(engagementMin) / 100;
        if (!isNaN(min) && img.engagement_rate < min) return false;
      }
      if (engagementMax !== '') {
        const max = parseFloat(engagementMax) / 100;
        if (!isNaN(max) && img.engagement_rate > max) return false;
      }

      return true;
    });

    result = sortImages(result, sortBy);
    return result;
  }, [images, styleFilter, momentFilter, dateRange, engagementMin, engagementMax, sortBy]);

  // Keep ref in sync
  filteredRef.current = filtered;

  const selectedImage = selectedId ? images.find((img) => img.id === selectedId) : null;
  const selectedIndex = selectedId ? filtered.findIndex((img) => img.id === selectedId) : -1;

  const counts = useMemo(() => {
    const total = images.length;
    const avgEng = total > 0
      ? images.reduce((sum, img) => sum + img.engagement_rate, 0) / total
      : 0;
    const totalLikes = images.reduce((sum, img) => sum + (img.like_count ?? 0), 0);
    return { total, avgEng, totalLikes };
  }, [images]);

  // Navigate to prev/next image in filtered list
  const navigateImage = useCallback((direction: 'prev' | 'next') => {
    const list = filteredRef.current;
    if (list.length === 0) return;
    const curIdx = list.findIndex((img) => img.id === selectedId);
    if (curIdx === -1) {
      setSelectedId(list[0].id);
      return;
    }
    const nextIdx = direction === 'next'
      ? Math.min(curIdx + 1, list.length - 1)
      : Math.max(curIdx - 1, 0);
    setSelectedId(list[nextIdx].id);
  }, [selectedId]);

  // Keyboard shortcuts (arrows + escape only, no approve/reject)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.metaKey || e.ctrlKey) return;

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
        case 'Escape':
          e.preventDefault();
          setSelectedId(null);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateImage]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Content Explorer</h1>
          <p className="t-sub">Browse, filter, and analyze your content</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="default"
            onClick={() => exportCsv(filtered)}
            disabled={filtered.length === 0}
          >
            <Download size={14} />
            Export CSV ({filtered.length})
          </Button>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 'var(--space-6)' }}>
        <MetricCard
          label="Total Images"
          value={formatNumber(counts.total)}
          icon={Image}
        />
        <MetricCard
          label="Avg Engagement"
          value={formatPercentage(counts.avgEng)}
          trend={{ value: `across ${counts.total} images`, direction: 'up' }}
          icon={Clock}
        />
        <MetricCard
          label="Total Likes"
          value={formatNumber(counts.totalLikes)}
          icon={Image}
        />
      </div>

      <div style={{ marginBottom: 'var(--space-4)' }}>
        <ReviewFilters
          styleFilter={styleFilter}
          onStyleChange={setStyleFilter}
          momentFilter={momentFilter}
          onMomentChange={setMomentFilter}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          engagementMin={engagementMin}
          onEngagementMinChange={setEngagementMin}
          engagementMax={engagementMax}
          onEngagementMaxChange={setEngagementMax}
          sortBy={sortBy}
          onSortChange={setSortBy}
          totalCount={counts.total}
          filteredCount={filtered.length}
        />
      </div>

      {/* Keyboard shortcut hint bar */}
      {selectedImage && (
        <div className="keyboard-hint-bar">
          <Keyboard size={13} />
          <span><kbd>&larr;</kbd><kbd>&rarr;</kbd> Navigate</span>
          <span><kbd>Esc</kbd> Close</span>
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
                onClick={() => setSelectedId(selectedId === image.id ? null : image.id)}
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

        {/* Sidebar -- read-only detail view */}
        {selectedImage && (
          <ImageDetailPanel
            key={selectedImage.id}
            image={selectedImage}
            imageIndex={selectedIndex + 1}
            imageTotal={filtered.length}
            onClose={() => setSelectedId(null)}
            onNavigate={navigateImage}
          />
        )}
      </div>
    </div>
  );
}
