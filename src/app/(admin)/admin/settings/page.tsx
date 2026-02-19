export const dynamic = 'force-dynamic';

import { Key, Users } from 'lucide-react';
import { MetricCard } from '@/components/ui/MetricCard';
import { ApiKeyStatusPanel } from '@/components/admin/settings/ApiKeyStatusPanel';
import { CuratedAccountList } from '@/components/admin/settings/CuratedAccountList';
import { getApiKeyStatuses, getCuratedAccounts } from '@/lib/supabase/queries';

export default async function SettingsPage() {
  const [apiKeyStatuses, curatedAccounts] = await Promise.all([
    getApiKeyStatuses(),
    getCuratedAccounts(),
  ]);

  const connectedCount = apiKeyStatuses.filter((s) => s.is_connected).length;

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p className="t-sub">API connections, curated accounts, and pipeline configuration</p>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        <MetricCard
          label="APIs Connected"
          value={`${connectedCount} / ${apiKeyStatuses.length}`}
          trend={{ value: connectedCount === apiKeyStatuses.length ? 'All connected' : 'Action needed', direction: connectedCount === apiKeyStatuses.length ? 'up' : 'down' }}
          icon={Key}
        />
        <MetricCard
          label="Curated Accounts"
          value={String(curatedAccounts.length)}
          trend={{ value: `${curatedAccounts.filter(a => a.is_active).length} active`, direction: 'up' }}
          icon={Users}
        />
      </div>

      <div style={{ marginBottom: 'var(--space-6)' }}>
        <ApiKeyStatusPanel statuses={apiKeyStatuses} />
      </div>

      <CuratedAccountList accounts={curatedAccounts} />
    </div>
  );
}
