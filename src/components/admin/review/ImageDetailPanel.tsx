'use client';

import { useState, Component, type ReactNode, type ErrorInfo } from 'react';
import type { AnalyzedImage } from '@/lib/types/database';
import { Badge } from '@/components/ui/Badge';
import { X, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Heart, MessageCircle, Bookmark, Share2, Users, Calendar, AlertTriangle } from 'lucide-react';
import { formatPercentage, formatNumber, formatDate } from '@/lib/utils/format';

// Error boundary to catch render errors in the sidebar
class PanelErrorBoundary extends Component<
  { children: ReactNode; onClose: () => void },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: ReactNode; onClose: () => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ImageDetailPanel render error:', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="review-sidebar">
          <div className="review-sidebar-header">
            <span className="t-label">Error</span>
            <button className="btn btn-icon btn-sm" onClick={this.props.onClose}>
              <X size={16} />
            </button>
          </div>
          <div className="review-sidebar-body" style={{ padding: 'var(--space-4)', textAlign: 'center' }}>
            <AlertTriangle size={32} style={{ color: 'var(--warning)', marginBottom: 'var(--space-3)' }} />
            <p className="t-body" style={{ marginBottom: 'var(--space-2)' }}>Failed to render image details</p>
            <p className="t-caption" style={{ color: 'var(--text-tertiary)', wordBreak: 'break-word' }}>
              {this.state.error?.message || 'Unknown error'}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

interface ImageDetailPanelProps {
  image: AnalyzedImage;
  imageIndex?: number;
  imageTotal?: number;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
}

const coreTagGroups = [
  { label: 'Moment', key: 'moment_category' },
  { label: 'Subject', key: 'subject_type' },
  { label: 'Setting', key: 'setting' },
  { label: 'Lighting', key: 'lighting' },
  { label: 'Composition', key: 'composition' },
  { label: 'Pose', key: 'pose_direction' },
  { label: 'Style', key: 'style' },
  { label: 'Color Palette', key: 'color_palette' },
  { label: 'Color Toning', key: 'color_toning' },
  { label: 'Emotion Level', key: 'emotion_level' },
  { label: 'Narrative', key: 'emotional_narrative' },
] as const;

const secondaryTagGroups = [
  { label: 'Season', key: 'season_indicators' },
  { label: 'Weather', key: 'weather_conditions' },
  { label: 'Venue', key: 'venue_type' },
] as const;

const boolTags = [
  { label: 'Portrait', key: 'is_portrait' },
  { label: 'Candid', key: 'is_candid' },
  { label: 'Detail Shot', key: 'is_detail_shot' },
  { label: 'Dress Visible', key: 'dress_visible' },
  { label: 'Motion Blur', key: 'has_motion_blur' },
  { label: 'Editorial', key: 'editorial_publishable' },
] as const;

function formatTag(value: unknown): string {
  if (value == null || value === '') return '\u2014';
  return String(value).replace(/_/g, ' ');
}

function formatArrayTag(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => v !== 'none').map((v) => String(v).replace(/_/g, ' '));
}

export function ImageDetailPanel(props: ImageDetailPanelProps) {
  return (
    <PanelErrorBoundary onClose={props.onClose}>
      <ImageDetailPanelInner {...props} />
    </PanelErrorBoundary>
  );
}

function ImageDetailPanelInner({ image, imageIndex, imageTotal, onClose, onNavigate }: ImageDetailPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const imgRecord = image as unknown as Record<string, unknown>;
  const creativeTechniques = formatArrayTag(imgRecord.creative_techniques);
  const culturalElements = formatArrayTag(imgRecord.cultural_elements);
  const luxuryIndicators = formatArrayTag(imgRecord.luxury_indicators);

  return (
    <div className="review-sidebar">
      <div className="review-sidebar-header">
        <div className="flex items-center gap-2">
          {onNavigate && (
            <>
              <button
                className="btn btn-icon btn-sm"
                onClick={() => onNavigate('prev')}
                disabled={imageIndex !== undefined && imageIndex <= 1}
                title="Previous image"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="btn btn-icon btn-sm"
                onClick={() => onNavigate('next')}
                disabled={imageIndex !== undefined && imageTotal !== undefined && imageIndex >= imageTotal}
                title="Next image"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}
          {imageIndex !== undefined && imageTotal !== undefined && (
            <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>
              {imageIndex} / {imageTotal}
            </span>
          )}
        </div>
        <button className="btn btn-icon btn-sm" onClick={onClose} title="Close (Esc)">
          <X size={16} />
        </button>
      </div>

      <div className="review-sidebar-body">
        <div style={{ marginBottom: 'var(--space-4)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image.image_url}
            alt={`${image.moment_category} - ${image.style}`}
            style={{ width: '100%', borderRadius: 'var(--radius)', aspectRatio: '4/5', objectFit: 'cover' }}
          />
        </div>

        {/* Status + Account */}
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
          <Badge
            variant={image.review_status === 'approved' ? 'success' : image.review_status === 'rejected' ? 'warning' : 'neutral'}
            dot
          >
            {image.review_status}
          </Badge>
          {image.account_handle && (
            <span className="t-caption" style={{ fontWeight: 600 }}>
              @{image.account_handle}
            </span>
          )}
        </div>

        {/* Engagement Stats */}
        <div style={{
          marginBottom: 'var(--space-4)',
          padding: 'var(--space-3)',
          background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
        }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-2)' }}>
            <span className="t-label">Engagement</span>
            <span className="t-body" style={{ fontWeight: 700, color: 'var(--accent)' }}>
              {formatPercentage(image.engagement_rate)}
            </span>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 'var(--space-2)',
          }}>
            {image.like_count != null && (
              <div className="flex items-center gap-2">
                <Heart size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span className="t-caption">{formatNumber(image.like_count)} likes</span>
              </div>
            )}
            {image.comment_count != null && (
              <div className="flex items-center gap-2">
                <MessageCircle size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span className="t-caption">{formatNumber(image.comment_count)} comments</span>
              </div>
            )}
            {image.save_count != null && (
              <div className="flex items-center gap-2">
                <Bookmark size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span className="t-caption">{formatNumber(image.save_count)} saves</span>
              </div>
            )}
            {image.share_count != null && (
              <div className="flex items-center gap-2">
                <Share2 size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span className="t-caption">{formatNumber(image.share_count)} shares</span>
              </div>
            )}
            {image.account_follower_count != null && image.account_follower_count > 0 && (
              <div className="flex items-center gap-2">
                <Users size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span className="t-caption">{formatNumber(image.account_follower_count)} followers</span>
              </div>
            )}
            {image.post_date && (
              <div className="flex items-center gap-2">
                <Calendar size={12} style={{ color: 'var(--text-tertiary)' }} />
                <span className="t-caption">{formatDate(image.post_date)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Core Vision Tags */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Vision Tags</span>
          <div className="flex flex-col gap-2">
            {coreTagGroups.map(({ label, key }) => (
              <div key={key} className="flex items-center justify-between">
                <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                <span className="t-caption" style={{ fontWeight: 500 }}>
                  {formatTag(imgRecord[key])}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Properties (boolean badges) */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Properties</span>
          <div className="flex items-center gap-2 flex-wrap">
            {boolTags.map(({ label, key }) => (
              <Badge
                key={key}
                variant={imgRecord[key] ? 'accent' : 'neutral'}
              >
                {label}
              </Badge>
            ))}
            <Badge variant="neutral">
              Subjects: {image.subject_count}
            </Badge>
            <Badge variant="neutral">
              Tier: {image.follower_tier}
            </Badge>
          </div>
        </div>

        {/* Expandable: Techniques, Cultural, Luxury, Secondary */}
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2"
            style={{
              background: 'none',
              border: 'none',
              padding: 0,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {expanded ? 'Less Details' : 'More Details'}
          </button>

          {expanded && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              {/* Secondary tags */}
              <div className="flex flex-col gap-2" style={{ marginBottom: 'var(--space-3)' }}>
                {secondaryTagGroups.map(({ label, key }) => (
                  <div key={key} className="flex items-center justify-between">
                    <span className="t-caption" style={{ color: 'var(--text-tertiary)' }}>{label}</span>
                    <span className="t-caption" style={{ fontWeight: 500 }}>
                      {formatTag(imgRecord[key])}
                    </span>
                  </div>
                ))}
              </div>

              {/* Creative Techniques */}
              {creativeTechniques.length > 0 && (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <span className="t-caption" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Techniques</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {creativeTechniques.map((t) => (
                      <Badge key={t} variant="accent">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Cultural Elements */}
              {culturalElements.length > 0 && (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <span className="t-caption" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Cultural</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {culturalElements.map((t) => (
                      <Badge key={t} variant="neutral">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Luxury Indicators */}
              {luxuryIndicators.length > 0 && (
                <div style={{ marginBottom: 'var(--space-3)' }}>
                  <span className="t-caption" style={{ color: 'var(--text-tertiary)', display: 'block', marginBottom: 4 }}>Luxury</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {luxuryIndicators.map((t) => (
                      <Badge key={t} variant="neutral">{t}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Override notes (read-only) */}
        {image.override_notes && (
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <span className="t-label" style={{ display: 'block', marginBottom: 'var(--space-2)' }}>Notes</span>
            <p className="t-caption" style={{
              padding: 'var(--space-2) var(--space-3)',
              background: 'var(--bg)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
              color: 'var(--text-secondary)',
            }}>
              {image.override_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
