'use client';

import { Chip } from '@/components/ui/Chip';
import type { ReviewStatus } from '@/lib/types/database';

interface ReviewFiltersProps {
  statusFilter: ReviewStatus | 'all';
  onStatusChange: (status: ReviewStatus | 'all') => void;
  styleFilter: string;
  onStyleChange: (style: string) => void;
  momentFilter: string;
  onMomentChange: (moment: string) => void;
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

export function ReviewFilters({
  statusFilter,
  onStatusChange,
  styleFilter,
  onStyleChange,
  momentFilter,
  onMomentChange,
  totalCount,
  filteredCount,
}: ReviewFiltersProps) {
  return (
    <div className="filter-bar">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="t-caption" style={{ color: 'var(--text-tertiary)', marginRight: 'var(--space-1)' }}>Status:</span>
        <Chip active={statusFilter === 'all'} onClick={() => onStatusChange('all')}>All</Chip>
        <Chip active={statusFilter === 'unreviewed'} accent onClick={() => onStatusChange('unreviewed')}>Unreviewed</Chip>
        <Chip active={statusFilter === 'approved'} onClick={() => onStatusChange('approved')}>Approved</Chip>
        <Chip active={statusFilter === 'rejected'} onClick={() => onStatusChange('rejected')}>Rejected</Chip>
      </div>

      <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 'var(--space-2)' }}>
        <span className="t-caption" style={{ color: 'var(--text-tertiary)', marginRight: 'var(--space-1)' }}>Style:</span>
        {styles.map((s) => (
          <Chip key={s} active={styleFilter === s} onClick={() => onStyleChange(s)}>
            {s === 'all' ? 'All Styles' : s.replace(/_/g, ' ')}
          </Chip>
        ))}
      </div>

      <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 'var(--space-2)' }}>
        <span className="t-caption" style={{ color: 'var(--text-tertiary)', marginRight: 'var(--space-1)' }}>Moment:</span>
        {moments.map((m) => (
          <Chip key={m} active={momentFilter === m} onClick={() => onMomentChange(m)}>
            {m === 'all' ? 'All Moments' : m.replace(/_/g, ' ')}
          </Chip>
        ))}
      </div>

      <div style={{ marginTop: 'var(--space-2)' }}>
        <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
          Showing {filteredCount} of {totalCount} images
        </span>
      </div>
    </div>
  );
}
