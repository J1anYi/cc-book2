<template>
  <div class="pdf-reader">
    <div class="canvas-container">
      <canvas ref="pdfCanvas"></canvas>
    </div>
    <div class="controls">
      <button @click="prevPage" :disabled="currentPage <= 1">上一页</button>
      <span>{{ currentPage }} / {{ totalPages }}</span>
      <button @click="nextPage" :disabled="currentPage >= totalPages">下一页</button>
      <input type="number" v-model.number="jumpPage" min="1" :max="totalPages" @change="goToPage" placeholder="跳转" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import * as pdfjsLib from 'pdfjs-dist';
import { saveProgress, getProgress } from '../api/reading';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const props = defineProps<{
  bookId: number;
  fileUrl: string;
}>();

const emit = defineEmits<{
  (e: 'progress', data: { page: number; percent: number }): void;
}>();

const pdfCanvas = ref<HTMLCanvasElement | null>(null);
const pdfDoc = ref<pdfjsLib.PDFDocumentProxy | null>(null);
const currentPage = ref(1);
const totalPages = ref(0);
const jumpPage = ref<number | null>(null);
const scale = ref(1.5);

onMounted(async () => {
  try {
    const loadingTask = pdfjsLib.getDocument(props.fileUrl);
    pdfDoc.value = await loadingTask.promise;
    totalPages.value = pdfDoc.value.numPages;

    const progress = await getProgress(props.bookId);
    if (progress && progress.current_page) {
      currentPage.value = progress.current_page;
    }

    renderPage(currentPage.value);
  } catch (error) {
    console.error('Failed to load PDF:', error);
  }
});

async function renderPage(pageNum: number) {
  if (!pdfDoc.value || !pdfCanvas.value) return;

  const page = await pdfDoc.value.getPage(pageNum);
  const viewport = page.getViewport({ scale: scale.value });

  const canvas = pdfCanvas.value;
  const context = canvas.getContext('2d');
  if (!context) return;

  canvas.height = viewport.height;
  canvas.width = viewport.width;

  await page.render({
    canvasContext: context,
    viewport: viewport,
    canvas: canvas
  }).promise;

  saveProgress({
    book_id: props.bookId,
    current_page: currentPage.value,
    progress_percent: (currentPage.value / totalPages.value) * 100
  });

  emit('progress', {
    page: currentPage.value,
    percent: (currentPage.value / totalPages.value) * 100
  });
}

function prevPage() {
  if (currentPage.value > 1) {
    currentPage.value--;
    renderPage(currentPage.value);
  }
}

function nextPage() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    renderPage(currentPage.value);
  }
}

function goToPage() {
  if (jumpPage.value && jumpPage.value >= 1 && jumpPage.value <= totalPages.value) {
    currentPage.value = jumpPage.value;
    renderPage(currentPage.value);
    jumpPage.value = null;
  }
}
</script>

<style scoped>
.pdf-reader {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.canvas-container {
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content: center;
  background: #333;
}

.canvas-container canvas {
  display: block;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
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

.controls input {
  width: 60px;
  padding: 5px;
  text-align: center;
}
</style>
