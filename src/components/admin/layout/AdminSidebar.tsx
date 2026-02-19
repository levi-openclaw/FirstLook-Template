'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Rocket,
  Download,
  Images,
  MessageSquareCode,
  TrendingUp,
  Settings,
  ChevronsLeft,
  ChevronsRight,
  Sun,
  Moon,
} from 'lucide-react';
import { useTheme } from '@/lib/hooks/useTheme';
import { adminNavItems } from '@/lib/utils/constants';
import { cn } from '@/lib/utils/cn';
import styles from './AdminSidebar.module.css';

const iconMap = {
  Rocket,
  Download,
  Images,
  MessageSquareCode,
  TrendingUp,
  Settings,
} as const;

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ isCollapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();

  return (
    <aside
      className={styles.sidebar}
      style={{ '--sidebar-width': isCollapsed ? '56px' : '240px' } as React.CSSProperties}
    >
      <div className={styles.logo}>
        <div className={styles.logoMark}>F</div>
        <span className={cn(styles.logoText, isCollapsed && styles.logoTextHidden)}>
          FirstLook
        </span>
      </div>

      <nav className={styles.nav}>
        {adminNavItems.map((item) => {
          const Icon = iconMap[item.icon];
          const isActive =
            item.href === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(styles.navItem, isActive && styles.navItemActive)}
              title={isCollapsed ? item.label : undefined}
            >
              <span className={styles.navIcon}>
                <Icon />
              </span>
              <span className={cn(styles.navLabel, isCollapsed && styles.navLabelHidden)}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        <button
          className={styles.collapseBtn}
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          <span className={styles.navIcon}>
            {theme === 'light' ? <Moon /> : <Sun />}
          </span>
          <span className={cn(styles.navLabel, isCollapsed && styles.navLabelHidden)}>
            {theme === 'light' ? 'Dark mode' : 'Light mode'}
          </span>
        </button>

        <button className={styles.collapseBtn} onClick={onToggle}>
          <span className={styles.navIcon}>
            {isCollapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </span>
          <span className={cn(styles.navLabel, isCollapsed && styles.navLabelHidden)}>
            Collapse
          </span>
        </button>
      </div>
    </aside>
  );
}
