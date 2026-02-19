'use client';

import { useState } from 'react';
import { Copy, Check, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PROMPT_HELPER_GUIDE } from '@/lib/prompts/prompt-helper';

export function PromptHelperSection() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PROMPT_HELPER_GUIDE);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = PROMPT_HELPER_GUIDE;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Card>
      <div style={{ padding: 'var(--space-4)' }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-3)' }}>
          <div className="flex items-center gap-2">
            <BookOpen size={16} style={{ color: 'var(--text-tertiary)' }} />
            <span className="t-sub">Prompt Helper</span>
          </div>
          <Button variant="default" size="sm" onClick={handleCopy}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy to Clipboard'}
          </Button>
        </div>

        <p className="t-body" style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-3)', lineHeight: 1.5 }}>
          Paste this template into Claude to generate a custom vision prompt for your industry.
          Fill in the bracketed fields with your specific niche details, and Claude will create
          a tailored analysis prompt you can use in the Prompt Editor.
        </p>

        <div style={{
          padding: 'var(--space-3)',
          borderRadius: 'var(--radius)',
          border: '1px solid var(--border)',
          background: 'var(--bg)',
          maxHeight: 400,
          overflowY: 'auto',
          whiteSpace: 'pre-wrap',
          fontFamily: 'monospace',
          fontSize: 12,
          lineHeight: 1.6,
          color: 'var(--text-secondary)',
        }}>
          {PROMPT_HELPER_GUIDE}
        </div>
      </div>
    </Card>
  );
}
