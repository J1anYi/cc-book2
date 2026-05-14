<template>
  <div class="book-card" @click="goToReader">
    <button class="detail-btn" @click.stop="goToDetail" title="查看详情">
      <span>ℹ️</span>
    </button>
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
        <span class="file-type-tag">{{ book.file_type.toUpperCase() }}</span>
        <span v-if="book.category" class="category-tag">{{ book.category }}</span>
      </div>
      <div v-if="progress > 0" class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
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
  return `/api/files/covers/${coverPath}`;
}

function goToReader() {
  router.push(`/read/${props.book.id}`);
}

function goToDetail() {
  router.push(`/book/${props.book.id}`);
}
</script>

<style scoped>
.book-card {
  position: relative;
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: transform var(--transition-normal), box-shadow var(--transition-normal);
}

.book-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: var(--shadow-xl);
}

.detail-btn {
  position: absolute;
  top: var(--spacing-2);
  right: var(--spacing-2);
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-full);
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(4px);
  cursor: pointer;
  z-index: 10;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.detail-btn:hover {
  background: var(--bg-primary);
  transform: scale(1.1);
  box-shadow: var(--shadow-md);
}

.card-cover {
  height: 200px;
  background: linear-gradient(135deg, var(--color-primary-400) 0%, var(--color-secondary-400) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.cover-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-slow);
}

.book-card:hover .cover-image {
  transform: scale(1.05);
}

.cover-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-type-icon {
  font-size: 56px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.card-content {
  padding: var(--spacing-4);
}

.card-title {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  margin: 0 0 var(--spacing-1) 0;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-author {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-3) 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.card-meta {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-3);
  flex-wrap: wrap;
}

.file-type-tag {
  font-size: var(--font-size-xs);
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-neutral-100);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

.category-tag {
  font-size: var(--font-size-xs);
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-primary-100);
  color: var(--color-primary-700);
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
}

.progress-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500));
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.progress-text {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
  min-width: 32px;
  text-align: right;
}
</style>
