<template>
  <nav class="navbar">
    <router-link to="/" class="nav-brand">
      📚 书库
    </router-link>
    <div class="nav-links">
      <router-link to="/" class="nav-link" :class="{ active: $route.path === '/' }">
        书库
      </router-link>
      <router-link to="/upload" class="nav-link" :class="{ active: $route.path === '/upload' }">
        上传
      </router-link>
      <router-link to="/admin" class="nav-link" :class="{ active: $route.path === '/admin' }">
        管理
      </router-link>
    </div>
  </nav>
</template>

<script setup lang="ts">
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #42b883;
  color: white;
}

.nav-brand {
  font-size: 1.2em;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  gap: 5px;
}

.nav-link {
  padding: 15px 20px;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s ease;
  border-bottom: 3px solid transparent;
}

.nav-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.nav-link.active {
  color: white;
  border-bottom-color: white;
  background: rgba(255, 255, 255, 0.1);
}
</style>
