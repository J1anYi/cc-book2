<template>
  <div class="txt-reader">
    <div class="text-container" ref="container">
      <pre>{{ currentContent }}</pre>
    </div>
    <div class="controls">
      <button @click="prevPage" :disabled="currentPage <= 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { saveProgress, getProgress } from '../api/reading';

const props = defineProps<{
  bookId: number;
  fileUrl: string;
}>();

const emit = defineEmits<{
  (e: 'progress', data: { page: number; percent: number }): void;
}>();

const container = ref<HTMLDivElement | null>(null);
const fullText = ref('');
const currentPage = ref(1);
const charsPerPage = 3000;

const totalPages = computed(() => Math.ceil(fullText.value.length / charsPerPage));

const currentContent = computed(() => {
  const start = (currentPage.value - 1) * charsPerPage;
  const end = start + charsPerPage;
  return fullText.value.slice(start, end);
});

onMounted(async () => {
  try {
    const response = await fetch(props.fileUrl);
    fullText.value = await response.text();

    const progress = await getProgress(props.bookId);
    if (progress && progress.current_page) {
      currentPage.value = progress.current_page;
    }
  } catch (error) {
    console.error('Failed to load TXT:', error);
  }
});

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    saveProgressHandler();
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    saveProgressHandler();
  }
}

function saveProgressHandler() {
  saveProgress({
    book_id: props.bookId,
    current_page: currentPage.value,
    progress_percent: (currentPage.value / totalPages.value) * 100
  });

  emit('progress', {
    page: currentPage.value,
    percent: (currentPage.value / totalPages.value) * 100
  });

  if (container.value) {
    container.value.scrollTop = 0;
  }
}
</script>

<style scoped>
.txt-reader {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.text-container {
  flex: 1;
  overflow: auto;
  padding: 20px;
  background: #fff;
}

.text-container pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: serif;
  font-size: 18px;
  line-height: 1.8;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding: 10px;
  background: #f5f5f5;
}

.controls button {
  padding: 8px 16px;
  cursor: pointer;
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
