'use client';

import { Chip } from '@/components/ui/Chip';

type SortOption =
  | 'engagement_desc'
  | 'engagement_asc'
  | 'likes'
  | 'comments'
  | 'date_desc'
  | 'date_asc'
  | 'content_type'
  | 'style';

interface ReviewFiltersProps {
  styleFilter: string;
  onStyleChange: (style: string) => void;
  momentFilter: string;
  onMomentChange: (moment: string) => void;
  dateRange: string;
  onDateRangeChange: (range: string) => void;
  engagementMin: string;
  onEngagementMinChange: (val: string) => void;
  engagementMax: string;
  onEngagementMaxChange: (val: string) => void;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  totalCount: number;
  filteredCount: number;
}

const styles = [
  'all',
  'light_and_airy',
  'dark_and_moody',
  'editorial',
  'fine_art',
  'classic',
  'film',
  'photojournalistic',
  'documentary',
  'romantic_soft',
  'modern_minimalist',
  'cinematic',
  'bohemian',
  'bold_colorful',
  'whimsical',
  'ethereal',
];

const moments = [
  'all',
  'couple_portrait',
  'golden_hour_portrait',
  'bridal_portrait',
  'groom_portrait',
  'first_look',
  'ceremony_vows',
  'ceremony_kiss',
  'first_dance',
  'reception_dancing',
  'getting_ready_bride',
  'getting_ready_groom',
  'detail_rings',
  'detail_florals',
  'detail_tablescape',
  'detail_venue',
  'wedding_party',
  'family_formal',
  'grand_exit',
  'elopement_landscape',
  'elopement_intimate',
];

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'engagement_desc', label: 'Engagement (High\u2192Low)' },
  { value: 'engagement_asc', label: 'Engagement (Low\u2192High)' },
  { value: 'likes', label: 'Likes' },
  { value: 'comments', label: 'Comments' },
  { value: 'date_desc', label: 'Date (Newest)' },
  { value: 'date_asc', label: 'Date (Oldest)' },
  { value: 'content_type', label: 'Content Type' },
  { value: 'style', label: 'Style' },
];

const dateRanges = [
  { value: 'all', label: 'All Time' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

export type { SortOption };

export function ReviewFilters({
  styleFilter,
  onStyleChange,
  momentFilter,
  onMomentChange,
  dateRange,
  onDateRangeChange,
  engagementMin,
  onEngagementMinChange,
  engagementMax,
  onEngagementMaxChange,
  sortBy,
  onSortChange,
  totalCount,
  filteredCount,
}: ReviewFiltersProps) {
  return (
    <div className="filter-bar">
      {/* Sort control */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="t-caption" style={{ color: 'var(--text-tertiary)', marginRight: 'var(--space-1)' }}>Sort:</span>
        <select
          className="input"
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          style={{ fontSize: 12, padding: '4px 8px', minWidth: 180 }}
        >
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Style filter */}
      <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 'var(--space-2)' }}>
        <span className="t-caption" style={{ color: 'var(--text-tertiary)', marginRight: 'var(--space-1)' }}>Style:</span>
        {styles.map((s) => (
          <Chip key={s} active={styleFilter === s} onClick={() => onStyleChange(s)}>
            {s === 'all' ? 'All Styles' : s.replace(/_/g, ' ')}
          </Chip>
        ))}
      </div>

      {/* Moment filter */}
      <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 'var(--space-2)' }}>
        <span className="t-caption" style={{ color: 'var(--text-tertiary)', marginRight: 'var(--space-1)' }}>Moment:</span>
        {moments.map((m) => (
          <Chip key={m} active={momentFilter === m} onClick={() => onMomentChange(m)}>
            {m === 'all' ? 'All Moments' : m.replace(/_/g, ' ')}
          </Chip>
        ))}
      </div>

      {/* Date range + Engagement range */}
      <div className="flex items-center gap-4 flex-wrap" style={{ marginTop: 'var(--space-2)' }}>
        <div className="flex items-center gap-2">
          <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>Date:</span>
          {dateRanges.map((dr) => (
            <Chip key={dr.value} active={dateRange === dr.value} onClick={() => onDateRangeChange(dr.value)} size="sm">
              {dr.label}
            </Chip>
          ))}
        </div>

        <div style={{ width: 1, height: 20, background: 'var(--border)' }} />

        <div className="flex items-center gap-2">
          <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>Engagement:</span>
          <input
            type="number"
            className="input"
            placeholder="Min %"
            value={engagementMin}
            onChange={(e) => onEngagementMinChange(e.target.value)}
            style={{ width: 72, fontSize: 12, padding: '4px 8px' }}
            step="0.1"
            min="0"
          />
          <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>&ndash;</span>
          <input
            type="number"
            className="input"
            placeholder="Max %"
            value={engagementMax}
            onChange={(e) => onEngagementMaxChange(e.target.value)}
            style={{ width: 72, fontSize: 12, padding: '4px 8px' }}
            step="0.1"
            min="0"
          />
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-2)' }}>
        <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
          Showing {filteredCount} of {totalCount} images
        </span>
      </div>
    </div>
  );
}
