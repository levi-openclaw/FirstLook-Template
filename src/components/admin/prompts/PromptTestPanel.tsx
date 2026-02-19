import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface PromptTestPanelProps {
  promptType: string;
}

const mockVisionResponse = {
  moment_category: 'first_look',
  setting: 'outdoor_garden',
  lighting: 'natural_soft',
  composition: 'medium_shot',
  subject_count: 2,
  emotion_level: 'high',
  color_palette: 'warm_pastels',
  style: 'light_and_airy',
  has_motion_blur: false,
  is_detail_shot: false,
  is_portrait: false,
  is_candid: true,
  season_indicators: 'spring',
  dress_visible: true,
  venue_type: 'garden_estate',
};

const mockCaptionResponse = [
  { text: 'The moment everything changed. First looks are always worth it.', estimated_engagement: 0.058 },
  { text: 'His reaction says it all.', estimated_engagement: 0.052 },
];

export function PromptTestPanel({ promptType }: PromptTestPanelProps) {
  const response = promptType === 'vision_tagging' ? mockVisionResponse : mockCaptionResponse;

  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
          <span className="t-sub">Test Output</span>
          <Badge variant="accent">Mock Response</Badge>
        </div>

        <div
          style={{
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius)',
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            marginBottom: 'var(--space-3)',
          }}
        >
          <div style={{ textAlign: 'center', padding: 'var(--space-4)', marginBottom: 'var(--space-3)', borderBottom: '1px solid var(--border)' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://picsum.photos/seed/wedding1/400/500"
              alt="Test image"
              style={{ maxWidth: 200, borderRadius: 'var(--radius)', margin: '0 auto', display: 'block' }}
            />
            <span className="t-caption" style={{ display: 'block', marginTop: 'var(--space-2)', color: 'var(--text-tertiary)' }}>
              Sample test image
            </span>
          </div>

          <pre
            style={{
              fontFamily: 'monospace',
              fontSize: 12,
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap',
              margin: 0,
              color: 'var(--text-secondary)',
            }}
          >
            {JSON.stringify(response, null, 2)}
          </pre>
        </div>

        <button className="btn" style={{ width: '100%' }}>
          Run Test
        </button>
      </div>
    </Card>
  );
}
