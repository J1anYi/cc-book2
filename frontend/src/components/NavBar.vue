<template>
  <nav class="navbar">
    <router-link to="/" class="nav-brand">
      <span class="brand-icon">📚</span>
      <span class="brand-text">书库</span>
    </router-link>
    <div class="nav-links">
      <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
        <span class="link-icon">📖</span>
        <span>书库</span>
      </router-link>
      <router-link to="/upload" class="nav-link" :class="{ active: $route.path === '/upload' }">
        <span class="link-icon">📤</span>
        <span>上传</span>
      </router-link>
      <router-link to="/admin" class="nav-link" :class="{ active: $route.path === '/admin' }">
        <span class="link-icon">⚙️</span>
        <span>管理</span>
      </router-link>
      <button class="theme-toggle" @click="cycleTheme()" :title="getThemeLabel()">
        <span class="theme-icon">{{ getThemeIcon() }}</span>
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useTheme } from '../composables/useTheme';

const { cycleTheme, getThemeIcon, getThemeLabel } = useTheme();
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-6);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--text-inverse);
  text-decoration: none;
  transition: transform var(--transition-fast);
}

.nav-brand:hover {
  transform: scale(1.02);
}

.brand-icon {
  font-size: var(--font-size-2xl);
}

.brand-text {
  letter-spacing: var(--letter-spacing-wide);
}

.nav-links {
  display: flex;
  gap: var(--spacing-1);
  align-items: center;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-4);
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.link-icon {
  font-size: var(--font-size-base);
}

.nav-link:hover {
  color: var(--text-inverse);
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-1px);
}

.nav-link.active {
  color: var(--text-inverse);
  background: rgba(255, 255, 255, 0.2);
  box-shadow: inset 0 2px 4px rgba(255, 255, 255, 0.1);
}

.theme-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  margin-left: var(--spacing-2);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.theme-toggle:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.theme-icon {
  font-size: var(--font-size-lg);
}

@media (max-width: 640px) {
  .navbar {
    padding: var(--spacing-2) var(--spacing-4);
  }

  .brand-text {
    display: none;
  }

  .nav-link {
    padding: var(--spacing-2) var(--spacing-3);
  }

  .nav-link span:not(.link-icon) {
    display: none;
  }

  .theme-toggle {
    width: 32px;
    height: 32px;
    margin-left: var(--spacing-1);
  }
}
</style>
