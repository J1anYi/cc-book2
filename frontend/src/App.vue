<template>
  <div class="app">
    <header>
      <h1>📚 书籍观看系统</h1>
    </header>
    <main>
      <Upload />
    </main>
  </div>
</template>

<script setup lang="ts">
import Upload from './views/Upload.vue';
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: #f5f5f5;
}

.app {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

header {
  text-align: center;
  padding: 20px 0;
}

header h1 {
  color: #333;
}
</style>
