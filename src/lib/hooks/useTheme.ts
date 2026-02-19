'use client';

import { useState, useEffect, useCallback } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>('light');

  useEffect(() => {
    const current = document.documentElement.getAttribute('data-framer-theme') as Theme;
    setThemeState(current || 'light');
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    document.documentElement.setAttribute('data-framer-theme', newTheme);
    localStorage.setItem('firstlook-theme', newTheme);
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }, [theme, setTheme]);

  return { theme, setTheme, toggleTheme };
}
