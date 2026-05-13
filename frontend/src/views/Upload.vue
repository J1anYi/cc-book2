<template>
  <div class="upload">
    <h2>上传书籍</h2>

    <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
      <input type="file" ref="fileInput" @change="handleFileSelect" accept=".epub,.pdf,.txt" hidden />
      <button @click="() => fileInput?.click()">选择文件</button>
      <p>支持 EPUB, PDF, TXT 格式</p>
    </div>

    <div v-if="selectedFile" class="file-info">
      <p>已选择: {{ selectedFile.name }}</p>
      <button @click="uploadFile" :disabled="uploading">
        {{ uploading ? '上传中...' : '上传' }}
      </button>
    </div>

    <div v-if="message" :class="['message', messageType]">
      {{ message }}
      <div v-if="lastUploadedBook" class="post-upload-actions">
        <router-link to="/" class="btn btn-secondary">查看书库</router-link>
        <router-link :to="`/read/${lastUploadedBook.id}`" class="btn btn-primary">立即阅读</router-link>
      </div>
    </div>

    <div class="book-list">
      <h3>已上传书籍</h3>
      <ul>
        <li v-for="book in books" :key="book.id">
          <strong>{{ book.title }}</strong> - {{ book.author || '未知作者' }} ({{ book.file_type }})
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

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
  }
};

const handleDrop = (e: DragEvent) => {
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
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.upload-area {
  border: 2px dashed #ddd;
  padding: 40px;
  text-align: center;
  margin: 20px 0;
  border-radius: 8px;
}

.upload-area button {
  padding: 10px 20px;
  font-size: 16px;
  cursor: pointer;
}

.file-info {
  margin: 20px 0;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 4px;
}

.message {
  padding: 10px;
  margin: 10px 0;
  border-radius: 4px;
}

.message.success {
  background: #d4edda;
  color: #155724;
}

.message.error {
  background: #f8d7da;
  color: #721c24;
}

.book-list {
  margin-top: 30px;
}

.book-list ul {
  list-style: none;
  padding: 0;
}

.book-list li {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.post-upload-actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
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
</style>
