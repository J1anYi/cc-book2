<template>
  <div class="epub-reader">
    <div ref="bookContainer" class="book-container"></div>
    <div class="controls">
      <button @click="prevPage" :disabled="!canGoPrev">上一页</button>
      <span>第 {{ currentLocation }} 页</span>
      <button @click="nextPage" :disabled="!canGoNext">下一页</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ePub from 'epubjs';
import type { Book, Rendition, Location } from 'epubjs';
import { saveProgress, getProgress } from '../api/reading';

const props = defineProps<{
  bookId: number;
  fileUrl: string;
}>();

const emit = defineEmits<{
  (e: 'progress', data: { page: number; chapter: string; percent: number }): void;
}>();

const bookContainer = ref<HTMLDivElement | null>(null);
const book = ref<Book | null>(null);
const rendition = ref<Rendition | null>(null);
const currentLocation = ref(0);
const totalLocations = ref(0);
const canGoPrev = ref(false);
const canGoNext = ref(false);

onMounted(async () => {
  try {
    // Fetch the EPUB file as ArrayBuffer (more reliable than Blob URL)
    const response = await fetch(props.fileUrl);
    const arrayBuffer = await response.arrayBuffer();

    book.value = ePub(arrayBuffer);
    await book.value.ready;

    // Get spine items count
    const spine = book.value.spine;
    totalLocations.value = spine ? spine.length : 0;

    rendition.value = book.value.renderTo(bookContainer.value!, {
      width: '100%',
      height: '100%',
      spread: 'none'
    });

    // Load saved progress
    const progress = await getProgress(props.bookId);
    const startChapter = progress && progress.current_chapter ? progress.current_chapter : undefined;

    await rendition.value.display(startChapter);

    // Update initial location
    const location = rendition.value.currentLocation();
    if (location && location.start) {
      currentLocation.value = location.start.index;
      canGoPrev.value = currentLocation.value > 0;
      canGoNext.value = currentLocation.value < totalLocations.value - 1;
    }

    // Update location on navigation
    rendition.value.on('locationChanged', (location: Location) => {
      if (location && location.start) {
        currentLocation.value = location.start.index;
        canGoPrev.value = currentLocation.value > 0;
        canGoNext.value = currentLocation.value < totalLocations.value - 1;

        // Save progress
        saveProgress({
          book_id: props.bookId,
          current_page: location.start.index,
          current_chapter: location.start.href,
          progress_percent: (location.start.index / totalLocations.value) * 100
        });

        emit('progress', {
          page: location.start.index,
          chapter: location.start.href,
          percent: (location.start.index / totalLocations.value) * 100
        });
      }
    });

    // Apply saved theme
    rendition.value.themes.default({
      body: {
        'font-family': 'serif',
        'font-size': '18px',
        'line-height': '1.6'
      }
    });

  } catch (error) {
    console.error('Failed to load EPUB:', error);
  }
});

onUnmounted(() => {
  if (book.value) {
    book.value.destroy();
  }
});

function prevPage() {
  rendition.value?.prev();
}

function nextPage() {
  rendition.value?.next();
}
</script>

<style scoped>
.epub-reader {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.book-container {
  flex: 1;
  overflow: hidden;
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
