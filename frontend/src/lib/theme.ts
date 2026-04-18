export type AppTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'app-theme';

export function getStoredTheme(): AppTheme {
  const theme = window.localStorage.getItem(THEME_STORAGE_KEY);
  return theme === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme: AppTheme) {
  const root = document.documentElement;

  root.classList.toggle('dark', theme === 'dark');
  root.dataset.theme = theme;
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
}
