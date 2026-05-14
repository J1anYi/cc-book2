<template>
  <div class="upload">
    <h2>
      <span class="title-icon">📤</span>
      上传书籍
    </h2>

    <div
      class="upload-area"
      :class="{ 'drag-over': isDragOver }"
      @dragover.prevent="isDragOver = true"
      @dragleave="isDragOver = false"
      @drop.prevent="handleDrop"
    >
      <input type="file" ref="fileInput" @change="handleFileSelect" accept=".epub,.pdf,.txt" hidden />
      <div class="upload-icon">📁</div>
      <button @click="() => fileInput?.click()">选择文件</button>
      <p>支持 EPUB, PDF, TXT 格式</p>
      <p class="drag-hint">或拖拽文件到此处</p>
    </div>

    <div v-if="selectedFile" class="file-info">
      <span class="file-icon">📄</span>
      <p>{{ selectedFile.name }}</p>
      <button @click="uploadFile" :disabled="uploading" class="upload-btn">
        <span v-if="uploading" class="spinner"></span>
        {{ uploading ? '上传中...' : '上传' }}
      </button>
    </div>

    <div v-if="message" :class="['message', messageType]">
      <span class="message-icon">{{ messageType === 'success' ? '✅' : '❌' }}</span>
      {{ message }}
      <div v-if="lastUploadedBook" class="post-upload-actions">
        <router-link to="/" class="btn btn-secondary">
          <span>📚</span>
          查看书库
        </router-link>
        <router-link :to="`/read/${lastUploadedBook.id}`" class="btn btn-primary">
          <span>📖</span>
          立即阅读
        </router-link>
      </div>
    </div>

    <div class="book-list">
      <h3>
        <span class="section-icon">📚</span>
        已上传书籍
      </h3>
      <ul>
        <li v-for="book in books" :key="book.id">
          <strong>{{ book.title }}</strong>
          <span class="book-author">- {{ book.author || '未知作者' }}</span>
          <span class="book-type">({{ book.file_type }})</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { uploadBook, getBooks } from '../api/books';

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | null>(null);
const uploading = ref(false);
const message = ref('');
const messageType = ref<'success' | 'error'>('success');
const books = ref<any[]>([]);
const lastUploadedBook = ref<any>(null);
const isDragOver = ref(false);

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

const handleDrop = (e: DragEvent) => {
  isDragOver.value = false;
  if (e.dataTransfer?.files[0]) {
    selectedFile.value = e.dataTransfer.files[0];
  }
};

const uploadFile = async () => {
  if (!selectedFile.value) return;

  uploading.value = true;
  message.value = '';

  try {
    const result = await uploadBook(selectedFile.value);
    message.value = `上传成功: ${result.title}`;
    messageType.value = 'success';
    lastUploadedBook.value = result;
    selectedFile.value = null;
    await loadBooks();
  } catch (error: any) {
    message.value = error.response?.data?.error || '上传失败';
    messageType.value = 'error';
  } finally {
    uploading.value = false;
  }
};

const loadBooks = async () => {
  try {
    books.value = await getBooks();
  } catch (error) {
    console.error('Failed to load books:', error);
  }
};

onMounted(() => {
  loadBooks();
});
</script>

<style scoped>
.upload {
  background: var(--bg-primary);
  padding: var(--spacing-8);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
}

.upload h2 {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: 0 0 var(--spacing-6) 0;
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.title-icon,
.section-icon {
  font-size: var(--font-size-2xl);
}

.upload-area {
  border: 3px dashed var(--border-default);
  padding: var(--spacing-10);
  text-align: center;
  margin: var(--spacing-6) 0;
  border-radius: var(--radius-xl);
  background: var(--bg-secondary);
  transition: all var(--transition-fast);
}

.upload-area.drag-over {
  border-color: var(--color-primary-500);
  background: var(--color-primary-50);
}

.upload-icon {
  font-size: 64px;
  margin-bottom: var(--spacing-4);
}

.upload-area button {
  padding: var(--spacing-3) var(--spacing-6);
  font-size: var(--font-size-base);
  cursor: pointer;
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.upload-area button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.upload-area p {
  margin: var(--spacing-2) 0;
  color: var(--text-secondary);
}

.drag-hint {
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}

.file-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  margin: var(--spacing-6) 0;
  padding: var(--spacing-4);
  background: var(--bg-tertiary);
  border-radius: var(--radius-lg);
}

.file-icon {
  font-size: var(--font-size-2xl);
}

.file-info p {
  flex: 1;
  margin: 0;
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.upload-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
}

.upload-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.message {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  margin: var(--spacing-4) 0;
  border-radius: var(--radius-lg);
  flex-wrap: wrap;
}

.message-icon {
  font-size: var(--font-size-lg);
}

.message.success {
  background: var(--color-success-light);
  color: #166534;
}

.message.error {
  background: var(--color-error-light);
  color: #991b1b;
}

.post-upload-actions {
  display: flex;
  gap: var(--spacing-3);
  margin-top: var(--spacing-4);
  width: 100%;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--radius-md);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  transition: all var(--transition-fast);
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
  box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.btn-secondary {
  background: var(--bg-primary);
  color: var(--text-primary);
  border: 1px solid var(--border-light);
}

.btn-secondary:hover {
  background: var(--bg-tertiary);
}

.book-list {
  margin-top: var(--spacing-8);
}

.book-list h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: 0 0 var(--spacing-4) 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.book-list ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.book-list li {
  padding: var(--spacing-3) var(--spacing-4);
  border-bottom: 1px solid var(--border-light);
  display: flex;
  gap: var(--spacing-2);
  align-items: baseline;
}

.book-list li:last-child {
  border-bottom: none;
}

.book-list strong {
  color: var(--text-primary);
}

.book-author {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.book-type {
  color: var(--text-tertiary);
  font-size: var(--font-size-xs);
}
</style>
