<template>
  <div class="book-detail">
    <div v-if="loading" class="loading">
      <span class="loading-icon">⏳</span>
      <p>加载中...</p>
    </div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="book" class="detail-content">
      <!-- 返回按钮 -->
      <router-link to="/" class="back-btn">
        <span>←</span>
        返回书库
      </router-link>

      <!-- 书籍信息 -->
      <div class="book-header">
        <div class="book-cover">
          <img
            v-if="book.cover_path"
            :src="`/api/files/covers/${book.cover_path}`"
            :alt="book.title"
            class="cover-image"
          />
          <div v-else class="cover-placeholder">
            <span class="file-type-icon">{{ fileTypeIcon }}</span>
          </div>
        </div>
        <div class="book-info">
          <h1 class="book-title">{{ book.title }}</h1>
          <p class="book-author">{{ book.author || '未知作者' }}</p>
          <div class="book-meta">
            <div class="meta-item">
              <span class="meta-label">文件类型</span>
              <span class="meta-value">{{ book.file_type.toUpperCase() }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">分类</span>
              <span class="meta-value">{{ book.category || '未分类' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">标签</span>
              <span class="meta-value">{{ book.tags || '无' }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">上传时间</span>
              <span class="meta-value">{{ formatDate(book.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 阅读进度 -->
      <div class="progress-section">
        <h2>
          <span class="section-icon">📊</span>
          阅读进度
        </h2>
        <div v-if="progress" class="progress-info">
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: `${progress.progress_percent}%` }"></div>
          </div>
          <p class="progress-text">
            已阅读 {{ Math.round(progress.progress_percent) }}%
            <span v-if="progress.current_page"> · 第 {{ progress.current_page }} 页</span>
          </p>
          <p class="last-read">
            上次阅读: {{ formatDate(progress.last_read_at) }}
          </p>
        </div>
        <div v-else class="no-progress">
          <span class="no-progress-icon">📖</span>
          <p>尚未开始阅读</p>
        </div>
      </div>

      <!-- 阅读按钮 -->
      <div class="action-buttons">
        <router-link :to="`/read/${book.id}`" class="btn btn-primary">
          <span class="btn-icon">{{ progress && progress.progress_percent > 0 ? '📖' : '📚' }}</span>
          {{ progress && progress.progress_percent > 0 ? '继续阅读' : '开始阅读' }}
        </router-link>
      </div>

      <!-- 编辑信息 -->
      <div class="edit-section">
        <h2>
          <span class="section-icon">✏️</span>
          编辑信息
        </h2>
        <div class="edit-form">
          <div class="form-group">
            <label for="category">分类</label>
            <select id="category" v-model="editForm.category">
              <option value="">未分类</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                {{ cat.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label for="tags">标签</label>
            <input
              id="tags"
              v-model="editForm.tags"
              type="text"
              placeholder="多个标签用逗号分隔"
            />
          </div>
          <div class="form-group">
            <label>收藏夹</label>
            <div class="collection-list">
              <button
                v-for="col in collections"
                :key="col.id"
                type="button"
                :class="['collection-chip', { active: bookCollections.has(col.id) }]"
                :style="{ borderColor: col.color || 'var(--border-light)' }"
                @click="toggleCollection(col.id)"
              >
                <span class="chip-icon">{{ col.icon || '📁' }}</span>
                <span class="chip-name">{{ col.name }}</span>
              </button>
            </div>
            <p class="collection-hint">点击添加或移除收藏夹</p>
          </div>
          <button
            @click="saveEdit"
            :disabled="saving"
            class="btn btn-secondary"
          >
            {{ saving ? '保存中...' : '保存修改' }}
          </button>
          <p v-if="saveMessage" :class="['save-message', saveMessageType]">
            {{ saveMessage }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { getBook, getCategories, updateBook, type Book, type Category } from '../api/books';
import { getCollections, addBookToCollection, removeBookFromCollection, type Collection } from '../api/collections';
import { getProgress, type ReadingProgress } from '../api/reading';

const route = useRoute();
const bookId = computed(() => Number(route.params.id));

const book = ref<Book | null>(null);
const progress = ref<ReadingProgress | null>(null);
const categories = ref<Category[]>([]);
const collections = ref<Collection[]>([]);
const bookCollections = ref<Set<number>>(new Set());
const loading = ref(true);
const error = ref('');

const editForm = ref({
  category: '',
  tags: ''
});
const saving = ref(false);
const saveMessage = ref('');
const saveMessageType = ref<'success' | 'error'>('success');

const fileTypeIcon = computed(() => {
  const type = book.value?.file_type.toLowerCase() || '';
  switch (type) {
    case 'epub': return '📖';
    case 'pdf': return '📄';
    case 'txt': return '📝';
    default: return '📚';
  }
});

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

async function loadBook() {
  try {
    loading.value = true;
    error.value = '';

    const [bookData, progressData, categoriesData, collectionsData] = await Promise.all([
      getBook(bookId.value),
      getProgress(bookId.value).catch(() => null),
      getCategories(),
      getCollections()
    ]);

    book.value = bookData;
    progress.value = progressData;
    categories.value = categoriesData;
    collections.value = collectionsData;

    editForm.value = {
      category: bookData.category || '',
      tags: bookData.tags || ''
    };
  } catch (err: any) {
    error.value = err.response?.data?.error || '加载失败';
  } finally {
    loading.value = false;
  }
}

async function toggleCollection(collectionId: number) {
  if (!book.value) return;
  try {
    const isCurrentlyInCollection = bookCollections.value.has(collectionId);
    if (isCurrentlyInCollection) {
      await removeBookFromCollection(collectionId, book.value.id);
      bookCollections.value.delete(collectionId);
    } else {
      await addBookToCollection(collectionId, book.value.id);
      bookCollections.value.add(collectionId);
    }
    // Refresh collections to update book_count
    const collectionsData = await getCollections();
    collections.value = collectionsData;
  } catch (error) {
    console.error('Failed to toggle collection:', error);
  }
}

async function saveEdit() {
  if (!book.value) return;

  try {
    saving.value = true;
    saveMessage.value = '';

    const updated = await updateBook(book.value.id, {
      category: editForm.value.category,
      tags: editForm.value.tags
    });

    book.value = updated;
    saveMessage.value = '保存成功';
    saveMessageType.value = 'success';
  } catch (err: any) {
    saveMessage.value = err.response?.data?.error || '保存失败';
    saveMessageType.value = 'error';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  loadBook();
});
</script>

<style scoped>
.book-detail {
  max-width: 800px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: var(--spacing-16);
}

.loading-icon {
  font-size: 48px;
  display: block;
  margin-bottom: var(--spacing-4);
}

.error {
  text-align: center;
  padding: var(--spacing-8);
  color: var(--color-error);
  font-size: var(--font-size-lg);
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-6);
  color: var(--color-primary-600);
  text-decoration: none;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.back-btn:hover {
  color: var(--color-primary-700);
  transform: translateX(-4px);
}

.book-header {
  display: flex;
  gap: var(--spacing-8);
  margin-bottom: var(--spacing-8);
  padding: var(--spacing-6);
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.book-cover {
  flex-shrink: 0;
  width: 160px;
  height: 220px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-primary-400) 0%, var(--color-secondary-400) 100%);
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
  font-size: 56px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.book-info {
  flex: 1;
}

.book-title {
  font-size: var(--font-size-2xl);
  margin: 0 0 var(--spacing-2) 0;
  color: var(--text-primary);
  font-weight: var(--font-weight-bold);
}

.book-author {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin: 0 0 var(--spacing-4) 0;
}

.book-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-3);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}

.meta-label {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  font-weight: var(--font-weight-medium);
}

.meta-value {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.progress-section,
.edit-section {
  background: var(--bg-primary);
  padding: var(--spacing-6);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-6);
}

.progress-section h2,
.edit-section h2 {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  font-size: var(--font-size-lg);
  margin: 0 0 var(--spacing-4) 0;
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.section-icon {
  font-size: var(--font-size-xl);
}

.progress-bar {
  height: 24px;
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-bottom: var(--spacing-3);
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500));
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

.progress-text,
.last-read {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  margin: var(--spacing-1) 0;
}

.no-progress {
  text-align: center;
  padding: var(--spacing-6);
}

.no-progress-icon {
  font-size: 48px;
  display: block;
  margin-bottom: var(--spacing-2);
}

.no-progress p {
  color: var(--text-tertiary);
}

.action-buttons {
  margin-bottom: var(--spacing-6);
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  border-radius: var(--radius-lg);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-base);
  cursor: pointer;
  border: none;
  transition: all var(--transition-fast);
}

.btn-icon {
  font-size: var(--font-size-lg);
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: var(--color-neutral-200);
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.form-group label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.form-group input,
.form-group select {
  padding: var(--spacing-3);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 4px var(--color-primary-100);
}

.save-message {
  font-size: var(--font-size-sm);
  margin: 0;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-md);
}

.save-message.success {
  color: var(--color-success);
  background: var(--color-success-light);
}

.save-message.error {
  color: var(--color-error);
  background: var(--color-error-light);
}

.collection-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.collection-chip {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-3);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-full);
  background: var(--bg-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  font-size: var(--font-size-sm);
}

.collection-chip:hover {
  background: var(--bg-tertiary);
}

.collection-chip.active {
  background: var(--color-primary-100);
  border-color: var(--color-primary-500);
}

.chip-icon {
  font-size: var(--font-size-base);
}

.chip-name {
  color: var(--text-primary);
}

.collection-hint {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: var(--spacing-2);
}

@media (max-width: 600px) {
  .book-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .book-meta {
    grid-template-columns: 1fr;
    align-items: center;
  }
}
</style>
