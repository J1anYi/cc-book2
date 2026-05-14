<template>
  <div class="epub-reader">
    <div ref="bookContainer" class="book-container"></div>
    <div class="controls">
      <button @click="prevChapter" :disabled="!canGoPrev">上一章</button>
      <span>第 {{ currentChapter + 1 }} 章 / 共 {{ totalChapters }} 章</span>
      <button @click="nextChapter" :disabled="!canGoNext">下一章</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import ePub from 'epubjs';
import type { Book, Rendition } from 'epubjs';
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
const currentChapter = ref(0);
const totalChapters = ref(0);
const canGoPrev = ref(false);
const canGoNext = ref(false);

onMounted(async () => {
  try {
    // Fetch the EPUB file as ArrayBuffer
    const response = await fetch(props.fileUrl);
    const arrayBuffer = await response.arrayBuffer();

    book.value = ePub(arrayBuffer);
    await book.value.ready;

    // Get spine items count (chapters)
    const spine = book.value.spine as any;
    totalChapters.value = spine?.spineItems?.length || 0;

    rendition.value = book.value.renderTo(bookContainer.value!, {
      width: '100%',
      height: '100%',
      spread: 'none',
      flow: 'scrolled'  // Use scrolled flow for better reading experience
    });

    // Load saved progress
    const progress = await getProgress(props.bookId);
    const startChapter = progress && progress.current_chapter ? progress.current_chapter : undefined;

    await rendition.value.display(startChapter);

    // Update location on navigation
    rendition.value.on('locationChanged', (location: any) => {
      if (location && typeof location.index === 'number') {
        currentChapter.value = location.index;
        canGoPrev.value = location.index > 0;
        canGoNext.value = location.index < totalChapters.value - 1;

        // Save progress
        saveProgress({
          book_id: props.bookId,
          current_page: location.index,
          current_chapter: location.href || '',
          progress_percent: totalChapters.value > 0
            ? (location.index / totalChapters.value) * 100
            : 0
        });

        emit('progress', {
          page: location.index,
          chapter: location.href || '',
          percent: totalChapters.value > 0
            ? (location.index / totalChapters.value) * 100
            : 0
        });
      }
    });

    // Apply default theme
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

function prevChapter() {
  // Navigate to previous chapter
  const newIndex = currentChapter.value - 1;
  if (newIndex >= 0 && book.value) {
    const spineItem = book.value.spine.get(newIndex);
    if (spineItem) {
      rendition.value?.display(spineItem.href);
    }
  }
}

function nextChapter() {
  // Navigate to next chapter
  const newIndex = currentChapter.value + 1;
  if (newIndex < totalChapters.value && book.value) {
    const spineItem = book.value.spine.get(newIndex);
    if (spineItem) {
      rendition.value?.display(spineItem.href);
    }
  }
}
</script>

<style scoped>
.epub-reader {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
}

.book-container {
  flex: 1;
  overflow: hidden;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--spacing-6);
  padding: var(--spacing-4);
  background: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  box-shadow: var(--shadow-sm);
}

.controls button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.controls button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.controls button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--color-neutral-400);
}

.controls span {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}
</style>
