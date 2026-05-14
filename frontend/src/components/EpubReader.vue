<template>
  <div class="epub-reader">
    <div ref="bookContainer" class="book-container"></div>

    <!-- Highlight Color Picker -->
    <div v-if="showColorPicker" class="color-picker" :style="colorPickerStyle">
      <div class="color-picker-header">
        <span>选择高亮颜色</span>
        <button class="close-picker" @click="showColorPicker = false">✕</button>
      </div>
      <div class="color-options">
        <button
          v-for="color in highlightColors"
          :key="color.value"
          class="color-btn"
          :style="{ background: color.bg }"
          :title="color.label"
          @click="applyHighlight(color.value)"
        ></button>
      </div>
    </div>

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
import { getHighlights, addHighlight, deleteHighlight } from '../api/highlights';

const props = defineProps<{
  bookId: number;
  fileUrl: string;
}>();

const emit = defineEmits<{
  (e: 'progress', data: { page: number; chapter: string; percent: number }): void;
  (e: 'highlight-added', highlight: any): void;
  (e: 'highlight-removed', id: number): void;
}>();

const bookContainer = ref<HTMLDivElement | null>(null);
const book = ref<Book | null>(null);
const rendition = ref<Rendition | null>(null);
const currentChapter = ref(0);
const totalChapters = ref(0);
const canGoPrev = ref(false);
const canGoNext = ref(false);

// Highlight state
const showColorPicker = ref(false);
const colorPickerStyle = ref<{ top: string; left: string }>({ top: '0px', left: '0px' });
const pendingSelection = ref<{ cfiRange: string; selectedText: string } | null>(null);
const highlights = ref<Map<string, number>>(new Map()); // cfiRange -> highlightId

const highlightColors = [
  { value: 'yellow', label: '黄色', bg: '#FFEB3B' },
  { value: 'green', label: '绿色', bg: '#4CAF50' },
  { value: 'blue', label: '蓝色', bg: '#2196F3' },
  { value: 'pink', label: '粉色', bg: '#E91E63' },
  { value: 'purple', label: '紫色', bg: '#9C27B0' }
];

const colorMap: Record<string, string> = {
  yellow: '#FFEB3B',
  green: '#4CAF50',
  blue: '#2196F3',
  pink: '#E91E63',
  purple: '#9C27B0'
};

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

    // Load existing highlights
    await loadHighlights();

    // Handle text selection for highlighting
    rendition.value.on('selected', (cfiRange: string, contents: any) => {
      const selection = contents.window.getSelection();
      const selectedText = selection?.toString().trim();

      if (selectedText && selectedText.length > 0) {
        // Get selection position for color picker
        const range = selection?.getRangeAt(0);
        if (range) {
          // Get the rect from the iframe's document
          const rect = range.getBoundingClientRect();

          // Get the iframe element position
          const iframe = bookContainer.value?.querySelector('iframe');
          if (iframe && bookContainer.value) {
            const iframeRect = iframe.getBoundingClientRect();
            const containerRect = bookContainer.value.getBoundingClientRect();

            // Calculate position relative to the epub-reader container
            // rect is relative to iframe viewport, iframeRect is relative to page
            colorPickerStyle.value = {
              top: `${iframeRect.top - containerRect.top + rect.bottom + 10}px`,
              left: `${iframeRect.left - containerRect.left + rect.left}px`
            };
          }
        }

        pendingSelection.value = { cfiRange, selectedText };
        showColorPicker.value = true;
      }
    });

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

async function loadHighlights() {
  try {
    const savedHighlights = await getHighlights(props.bookId);
    for (const h of savedHighlights) {
      // Apply highlight to rendition
      if (rendition.value) {
        rendition.value.annotations.highlight(h.cfi_range, {}, (_e: MouseEvent, _contents: any) => {
          // Click on highlight - show delete option
          if (confirm('删除此高亮？')) {
            removeHighlight(h.id, h.cfi_range);
          }
        }, undefined, { 'background-color': colorMap[h.color] || colorMap.yellow, 'mix-blend-mode': 'multiply' });
      }
      highlights.value.set(h.cfi_range, h.id);
    }
  } catch (error) {
    console.error('Failed to load highlights:', error);
  }
}

async function applyHighlight(color: string) {
  if (!pendingSelection.value || !rendition.value) return;

  const { cfiRange, selectedText } = pendingSelection.value;

  try {
    // Save to backend
    const highlight = await addHighlight({
      book_id: props.bookId,
      cfi_range: cfiRange,
      selected_text: selectedText,
      color
    });

    // Apply visual highlight
    rendition.value.annotations.highlight(
      cfiRange,
      {},
      (_e: MouseEvent, _contents: any) => {
        if (confirm('删除此高亮？')) {
          removeHighlight(highlight.id, cfiRange);
        }
      },
      undefined,
      {
        'background-color': colorMap[color] || colorMap.yellow,
        'mix-blend-mode': 'multiply'
      }
    );

    highlights.value.set(cfiRange, highlight.id);
    emit('highlight-added', highlight);

  } catch (error) {
    console.error('Failed to add highlight:', error);
  }

  showColorPicker.value = false;
  pendingSelection.value = null;
}

async function removeHighlight(id: number, cfiRange: string) {
  try {
    await deleteHighlight(id);

    // Remove visual highlight
    if (rendition.value) {
      rendition.value.annotations.remove(cfiRange, 'highlight');
    }

    highlights.value.delete(cfiRange);
    emit('highlight-removed', id);

  } catch (error) {
    console.error('Failed to remove highlight:', error);
  }
}

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

.color-picker {
  position: absolute;
  z-index: 100;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-3);
  min-width: 200px;
}

.color-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  font-weight: var(--font-weight-medium);
}

.close-picker {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
  padding: var(--spacing-1);
}

.close-picker:hover {
  color: var(--text-primary);
}

.color-options {
  display: flex;
  gap: var(--spacing-2);
}

.color-btn {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  border: 2px solid var(--border-light);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.color-btn:hover {
  transform: scale(1.15);
  border-color: var(--text-primary);
}
</style>
