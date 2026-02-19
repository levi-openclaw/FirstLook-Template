'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'firstlook-sidebar-collapsed';

export function useSidebarState() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setIsCollapsed(true);
  }, []);

  const toggle = useCallback(() => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, String(next));
      return next;
    });
  }, []);

  const setCollapsed = useCallback((value: boolean) => {
    setIsCollapsed(value);
    localStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  return { isCollapsed, toggle, setCollapsed };
}
