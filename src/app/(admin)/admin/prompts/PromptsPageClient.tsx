'use client';

import { useState } from 'react';
import { Chip } from '@/components/ui/Chip';
import { PromptEditor } from '@/components/admin/prompts/PromptEditor';
import { PromptTestPanel } from '@/components/admin/prompts/PromptTestPanel';
import { PromptVersionHistory } from '@/components/admin/prompts/PromptVersionHistory';
import type { PromptType, PromptVersion } from '@/lib/types/database';

interface PromptsPageClientProps {
  initialVersions: PromptVersion[];
}

export default function PromptsPageClient({ initialVersions }: PromptsPageClientProps) {
  const [allVersions, setAllVersions] = useState<PromptVersion[]>(initialVersions);
  const [activeType, setActiveType] = useState<PromptType>('vision_tagging');

  const versionsForType = allVersions.filter((v) => v.prompt_type === activeType);
  const activeVersion = versionsForType.find((v) => v.is_active) || versionsForType[0];

  const [content, setContent] = useState(activeVersion?.content || '');

  const handleTypeChange = (type: PromptType) => {
    setActiveType(type);
    const newVersions = allVersions.filter((v) => v.prompt_type === type);
    const newActive = newVersions.find((v) => v.is_active) || newVersions[0];
    setContent(newActive?.content || '');
  };

  const handleRestore = (version: PromptVersion) => {
    setContent(version.content);
  };

  return (
    <div>
      <div className="page-header">
        <h1>Prompt Editor</h1>
        <p className="t-sub">Manage and test vision tagging and caption generation prompts</p>
      </div>

      <div className="flex items-center gap-2" style={{ marginBottom: 'var(--space-4)' }}>
        <Chip
          active={activeType === 'vision_tagging'}
          accent
          onClick={() => handleTypeChange('vision_tagging')}
        >
          Vision Tagging
        </Chip>
        <Chip
          active={activeType === 'caption_generation'}
          accent
          onClick={() => handleTypeChange('caption_generation')}
        >
          Caption Generation
        </Chip>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        <PromptEditor
          content={content}
          onChange={setContent}
          isActive={activeVersion?.is_active || false}
          version={activeVersion?.version || 1}
          promptType={activeType}
        />
        <PromptTestPanel promptType={activeType} />
      </div>

      <PromptVersionHistory
        versions={versionsForType}
        activeId={activeVersion?.id || ''}
        onRestore={handleRestore}
      />
    </div>
  );
}
