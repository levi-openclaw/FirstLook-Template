'use client';

import { useState, useCallback } from 'react';
import { CsvUploader } from './CsvUploader';
import { ApifyMarketplace } from './ApifyMarketplace';

export function IngestionWorkflow() {
  const [importedHandles, setImportedHandles] = useState<string[]>([]);

  const handleHandlesImported = useCallback((handles: string[]) => {
    setImportedHandles(handles);
  }, []);

  const handleHandlesCleared = useCallback(() => {
    setImportedHandles([]);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
      <CsvUploader
        onHandlesImported={handleHandlesImported}
        onHandlesCleared={handleHandlesCleared}
      />

      {importedHandles.length > 0 && (
        <div
          className="flex items-center justify-center"
          style={{
            padding: 'var(--space-2)',
            color: 'var(--accent)',
            fontSize: 13,
            fontWeight: 500,
          }}
        >
          {importedHandles.length} handles ready — choose a scraper below to use them
        </div>
      )}

      <ApifyMarketplace injectedHandles={importedHandles} />
    </div>
  );
}
