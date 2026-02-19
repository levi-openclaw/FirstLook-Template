'use client';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface PromptEditorProps {
  content: string;
  onChange: (content: string) => void;
  isActive: boolean;
  version: number;
  promptType: string;
}

export function PromptEditor({ content, onChange, isActive, version, promptType }: PromptEditorProps) {
  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
          <div className="flex items-center gap-2">
            <span className="t-sub">{promptType === 'vision_tagging' ? 'Vision Tagging' : 'Caption Generation'}</span>
            <Badge variant={isActive ? 'success' : 'neutral'} dot>
              {isActive ? 'Active' : 'Inactive'}
            </Badge>
            <Badge variant="neutral">v{version}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <button className="btn btn-sm">Save Draft</button>
            <button className="btn btn-sm" style={{ background: 'var(--accent)', color: 'white' }}>
              Deploy
            </button>
          </div>
        </div>
        <textarea
          className="input"
          value={content}
          onChange={(e) => onChange(e.target.value)}
          rows={16}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: 13,
            lineHeight: 1.6,
            resize: 'vertical',
          }}
        />
      </div>
    </Card>
  );
}
