<template>
  <div class="book-detail">
    <div v-if="loading" class="loading">加载中...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="book" class="detail-content">
      <!-- 返回按钮 -->
      <router-link to="/" class="back-btn">← 返回书库</router-link>

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
            <span class="meta-item">
              <strong>文件类型:</strong> {{ book.file_type.toUpperCase() }}
            </span>
            <span class="meta-item">
              <strong>分类:</strong> {{ book.category || '未分类' }}
            </span>
            <span class="meta-item">
              <strong>标签:</strong> {{ book.tags || '无' }}
            </span>
            <span class="meta-item">
              <strong>上传时间:</strong> {{ formatDate(book.created_at) }}
            </span>
          </div>
        </div>
      </div>

      <!-- 阅读进度 -->
      <div class="progress-section">
        <h2>阅读进度</h2>
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
          <p>尚未开始阅读</p>
        </div>
      </div>

      <!-- 阅读按钮 -->
      <div class="action-buttons">
        <router-link :to="`/read/${book.id}`" class="btn btn-primary">
          {{ progress && progress.progress_percent > 0 ? '继续阅读' : '开始阅读' }}
        </router-link>
      </div>

      <!-- 编辑信息 -->
      <div class="edit-section">
        <h2>编辑信息</h2>
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
import { getProgress, type ReadingProgress } from '../api/reading';

const route = useRoute();
const bookId = computed(() => Number(route.params.id));

const book = ref<Book | null>(null);
const progress = ref<ReadingProgress | null>(null);
const categories = ref<Category[]>([]);
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

    const [bookData, progressData, categoriesData] = await Promise.all([
      getBook(bookId.value),
      getProgress(bookId.value).catch(() => null),
      getCategories()
    ]);

    book.value = bookData;
    progress.value = progressData;
    categories.value = categoriesData;

    // Initialize edit form
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
  padding: 20px;
}

.loading, .error {
  text-align: center;
  padding: 40px;
  font-size: 18px;
}

.error {
  color: #dc3545;
}

.back-btn {
  display: inline-block;
  margin-bottom: 20px;
  color: #42b883;
  text-decoration: none;
  font-size: 16px;
}

.back-btn:hover {
  text-decoration: underline;
}

.book-header {
  display: flex;
  gap: 30px;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.book-cover {
  flex-shrink: 0;
  width: 150px;
  height: 200px;
  border-radius: 8px;
  overflow: hidden;
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

.book-info {
  flex: 1;
}

.book-title {
  font-size: 24px;
  margin: 0 0 10px 0;
  color: #333;
}

.book-author {
  font-size: 16px;
  color: #666;
  margin: 0 0 15px 0;
}

.book-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  font-size: 14px;
  color: #555;
}

.meta-item strong {
  color: #333;
}

.progress-section, .edit-section {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.progress-section h2, .edit-section h2 {
  font-size: 18px;
  margin: 0 0 15px 0;
  color: #333;
}

.progress-bar {
  height: 20px;
  background: #f0f0f0;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #42b883, #35495e);
  border-radius: 10px;
  transition: width 0.3s ease;
}

.progress-text, .last-read {
  font-size: 14px;
  color: #666;
  margin: 5px 0;
}

.no-progress {
  color: #999;
}

.action-buttons {
  margin-bottom: 20px;
}

.btn {
  display: inline-block;
  padding: 12px 24px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  font-size: 16px;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
}

.btn-primary {
  background: #42b883;
  color: white;
}

.btn-primary:hover {
  background: #3aa876;
}

.btn-secondary {
  background: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background: #e0e0e0;
}

.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-group input,
.form-group select {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #42b883;
}

.save-message {
  font-size: 14px;
  margin: 0;
}

.save-message.success {
  color: #28a745;
}

.save-message.error {
  color: #dc3545;
}

@media (max-width: 600px) {
  .book-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .book-meta {
    align-items: center;
  }
}
</style>
