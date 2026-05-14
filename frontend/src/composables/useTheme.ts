import { ref, onMounted, onUnmounted } from 'vue';

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'theme-preference';

// Global state
const themePreference = ref<Theme>('system');
const isDark = ref(false);

// Check system preference
function getSystemPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Apply theme to document
function applyTheme(dark: boolean) {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

// Calculate actual theme based on preference
function calculateIsDark(): boolean {
  if (themePreference.value === 'system') {
    return getSystemPreference();
  }
  return themePreference.value === 'dark';
}

// Set theme preference
function setTheme(theme: Theme) {
  themePreference.value = theme;
  isDark.value = calculateIsDark();
  applyTheme(isDark.value);

  // Save to localStorage
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, theme);
  }
}

// Toggle between light and dark (ignores system)
function toggleTheme() {
  const newTheme = isDark.value ? 'light' : 'dark';
  setTheme(newTheme);
}

// Cycle through: light → dark → system → light
function cycleTheme() {
  const order: Theme[] = ['light', 'dark', 'system'];
  const currentIndex = order.indexOf(themePreference.value);
  const nextIndex = (currentIndex + 1) % order.length;
  setTheme(order[nextIndex]);
}

// Get theme icon
function getThemeIcon(): string {
  if (themePreference.value === 'system') {
    return isDark.value ? '🌙' : '☀️';
  }
  return themePreference.value === 'dark' ? '🌙' : '☀️';
}

// Get theme label
function getThemeLabel(): string {
  const labels: Record<Theme, string> = {
    light: '浅色',
    dark: '深色',
    system: '跟随系统'
  };
  return labels[themePreference.value];
}

export function useTheme() {
  let mediaQuery: MediaQueryList | null = null;

  // Handle system preference change
  function handleSystemChange(e: MediaQueryListEvent) {
    if (themePreference.value === 'system') {
      isDark.value = e.matches;
      applyTheme(isDark.value);
    }
  }

  onMounted(() => {
    // Load saved preference
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved && ['light', 'dark', 'system'].includes(saved)) {
        themePreference.value = saved;
      }
    }

    // Calculate and apply
    isDark.value = calculateIsDark();
    applyTheme(isDark.value);

    // Listen for system preference changes
    if (typeof window !== 'undefined') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleSystemChange);
    }
  });

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleSystemChange);
    }
  });

  return {
    themePreference,
    isDark,
    setTheme,
    toggleTheme,
    cycleTheme,
    getThemeIcon,
    getThemeLabel
  };
}
