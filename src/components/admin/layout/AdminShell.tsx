'use client';

import { useSidebarState } from '@/lib/hooks/useSidebarState';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import styles from './AdminShell.module.css';

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const { isCollapsed, toggle } = useSidebarState();

  return (
    <div className={styles.shell}>
      <AdminSidebar isCollapsed={isCollapsed} onToggle={toggle} />
      <div className={styles.content}>
        <AdminHeader />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
