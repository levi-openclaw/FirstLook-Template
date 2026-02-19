'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { adminNavItems } from '@/lib/utils/constants';
import styles from './AdminHeader.module.css';

export function AdminHeader() {
  const pathname = usePathname();

  const currentSection =
    adminNavItems.find((item) =>
      item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
    )?.label ?? 'Dashboard';

  return (
    <header className={styles.header}>
      <div className={styles.breadcrumb}>
        <span className={styles.breadcrumbSection}>{currentSection}</span>
      </div>

      <div className={styles.actions}>
        <button className="btn-icon" title="Notifications">
          <Bell />
        </button>
        <div className={styles.avatar}>A</div>
      </div>
    </header>
  );
}
