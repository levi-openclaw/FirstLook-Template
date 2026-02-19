export const dynamic = 'force-dynamic';

import { Key } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { ApiKeyStatusPanel } from '@/components/admin/settings/ApiKeyStatusPanel';
import { PromptHelperSection } from '@/components/admin/settings/PromptHelperSection';
import { getApiKeyStatuses } from '@/lib/supabase/queries';

export default async function SettingsPage() {
  const apiKeyStatuses = await getApiKeyStatuses();

  const connectedCount = apiKeyStatuses.filter((s) => s.is_connected).length;

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p className="t-sub">API connections and pipeline configuration</p>
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <MetricCard
          label="APIs Connected"
          value={`${connectedCount} / ${apiKeyStatuses.length}`}
          trend={{
            value: apiKeyStatuses.length === 0
              ? 'No services configured'
              : connectedCount === apiKeyStatuses.length
                ? 'All connected'
                : `${apiKeyStatuses.length - connectedCount} need attention`,
            direction: connectedCount === apiKeyStatuses.length && apiKeyStatuses.length > 0 ? 'up' : 'down',
          }}
          icon={Key}
        />
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <ApiKeyStatusPanel statuses={apiKeyStatuses} />
      </div>

      <PromptHelperSection />
    </div>
  );
}
