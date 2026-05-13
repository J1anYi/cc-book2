<template>
  <div class="book-card" @click="goToReader">
    <div class="card-cover">
      <img
        v-if="book.cover_path"
        :src="getCoverUrl(book.cover_path)"
        :alt="book.title"
        class="cover-image"
      />
      <div v-else class="cover-placeholder">
        <span class="file-type-icon">{{ fileTypeIcon }}</span>
      </div>
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ book.title }}</h3>
      <p class="card-author">{{ book.author || '未知作者' }}</p>
      <div class="card-meta">
        <span class="file-type">{{ book.file_type.toUpperCase() }}</span>
        <span v-if="book.category" class="category">{{ book.category }}</span>
      </div>
      <div v-if="progress > 0" class="progress-bar">
        <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        <span class="progress-text">{{ Math.round(progress) }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import type { Book } from '../api/books';

const props = defineProps<{
  book: Book;
  progress?: number;
}>();

const router = useRouter();

const progress = computed(() => props.progress ?? 0);

const fileTypeIcon = computed(() => {
  const type = props.book.file_type.toLowerCase();
  switch (type) {
    case 'epub': return '📖';
    case 'pdf': return '📄';
    case 'txt': return '📝';
    default: return '📚';
  }
});

function getCoverUrl(coverPath: string | null): string {
  if (!coverPath) return '';
  // Assuming covers are served from /api/files/covers/
  return `/api/files/covers/${coverPath}`;
}

function goToReader() {
  router.push(`/read/${props.book.id}`);
}
</script>

<style scoped>
.book-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-cover {
  height: 180px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-type-icon {
  font-size: 48px;
  color: white;
}

.card-content {
  padding: 15px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 5px 0;
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-author {
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.file-type {
  font-size: 12px;
  padding: 2px 8px;
  background: #f0f0f0;
  border-radius: 4px;
  color: #666;
}

.category {
  font-size: 12px;
  padding: 2px 8px;
  background: #42b883;
  border-radius: 4px;
  color: white;
}

.progress-bar {
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  position: relative;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #35495e);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  color: #333;
  font-weight: 500;
}
</style>