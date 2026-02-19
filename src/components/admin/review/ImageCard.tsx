import { Check, Heart, MessageCircle, Users } from 'lucide-react';
import type { AnalyzedImage } from '@/lib/types/database';
import { Badge } from '@/components/ui/Badge';
import { formatPercentage, formatNumber, formatRelativeTime } from '@/lib/utils/format';

const statusVariant: Record<string, 'success' | 'warning' | 'neutral'> = {
  approved: 'success',
  rejected: 'warning',
  unreviewed: 'neutral',
};

interface ImageCardProps {
  image: AnalyzedImage;
  isSelected: boolean;
  isChecked: boolean;
  showCheckbox: boolean;
  onClick: () => void;
  onToggleCheck: (e: React.MouseEvent) => void;
}

export function ImageCard({ image, isSelected, isChecked, showCheckbox, onClick, onToggleCheck }: ImageCardProps) {
  return (
    <div
      className="image-card"
      onClick={onClick}
      style={{
        cursor: 'pointer',
        borderRadius: 'var(--radius)',
        overflow: 'hidden',
        border: isSelected
          ? '2px solid var(--accent)'
          : isChecked
            ? '2px solid var(--accent)'
            : '2px solid transparent',
        background: 'var(--surface)',
        transition: 'border-color 0.15s ease',
        opacity: isChecked ? 0.85 : 1,
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '4/5', overflow: 'hidden' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.image_url}
          alt={`${image.moment_category} - ${image.style}`}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Multi-select checkbox */}
        {showCheckbox && (
          <div
            className={`image-card-checkbox ${isChecked ? 'checked' : ''}`}
            onClick={onToggleCheck}
          >
            {isChecked && <Check size={14} strokeWidth={3} />}
          </div>
        )}

        <div
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
          }}
        >
          <Badge variant={statusVariant[image.review_status]} dot>
            {image.review_status}
          </Badge>
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: 'var(--space-3)',
            background: 'linear-gradient(transparent, rgba(0,0,0,0.75))',
            color: 'white',
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: 4 }}>
            <span style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {image.style.replace(/_/g, ' ')}
            </span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>
              {formatPercentage(image.engagement_rate)}
            </span>
          </div>
          {/* Engagement stats row */}
          <div className="flex items-center gap-3" style={{ fontSize: 11, opacity: 0.85 }}>
            {image.like_count != null && (
              <span className="flex items-center gap-1">
                <Heart size={10} /> {formatNumber(image.like_count)}
              </span>
            )}
            {image.comment_count != null && (
              <span className="flex items-center gap-1">
                <MessageCircle size={10} /> {formatNumber(image.comment_count)}
              </span>
            )}
            {image.account_follower_count != null && image.account_follower_count > 0 && (
              <span className="flex items-center gap-1" style={{ marginLeft: 'auto' }}>
                <Users size={10} /> {formatNumber(image.account_follower_count)}
              </span>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: 'var(--space-2) var(--space-3)' }}>
        <div className="flex items-center justify-between">
          <span className="t-caption">
            {image.moment_category.replace(/_/g, ' ')}
          </span>
          {image.post_date && (
            <span className="t-caption" style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>
              {formatRelativeTime(image.post_date)}
            </span>
          )}
        </div>
        <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
          {image.account_handle ? `@${image.account_handle} · ` : ''}{image.follower_tier} · {image.setting.replace(/_/g, ' ')}
        </span>
      </div>
    </div>
  );
}
