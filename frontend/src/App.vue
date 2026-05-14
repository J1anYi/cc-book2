<template>
  <div class="app">
    <header class="app-header">
      <NavBar />
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import NavBar from './components/NavBar.vue';
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  background-color: var(--bg-primary);
  border-bottom: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.app-main {
  flex: 1;
  max-width: var(--container-xl);
  width: 100%;
  margin: 0 auto;
  padding: var(--spacing-6);
}
</style>
