<template>
  <div class="reader-page">
    <div class="header">
      <router-link to="/" class="back-btn">
        <span>←</span>
        返回
      </router-link>
      <h2>{{ book?.title || '加载中...' }}</h2>
      <div class="toolbar">
        <button @click="showHighlights = !showHighlights" :class="{ active: showHighlights }">
          <span>💡</span>
          高亮
        </button>
        <button @click="showBookmarks = !showBookmarks" :class="{ active: showBookmarks }">
          <span>🔖</span>
          书签
        </button>
        <button @click="showNotes = !showNotes" :class="{ active: showNotes }">
          <span>📝</span>
          笔记
        </button>
      </div>
    </div>

    <div class="reader-container">
      <EpubReader
        v-if="book?.file_type === 'epub'"
        :bookId="bookId"
        :fileUrl="fileUrl"
        @progress="handleProgress"
        @highlight-added="handleHighlightAdded"
        @highlight-removed="handleHighlightRemoved"
      />
      <PdfReader
        v-else-if="book?.file_type === 'pdf'"
        :bookId="bookId"
        :fileUrl="fileUrl"
        @progress="handleProgress"
      />
      <TxtReader
        v-else-if="book?.file_type === 'txt'"
        :bookId="bookId"
        :fileUrl="fileUrl"
        @progress="handleProgress"
      />
    </div>

    <!-- Bookmarks Panel -->
    <div v-if="showBookmarks" class="side-panel">
      <div class="panel-header">
        <h3>
          <span>🔖</span>
          书签
        </h3>
        <button class="close-btn" @click="showBookmarks = false">✕</button>
      </div>
      <button class="add-btn" @click="addBookmarkHandler">
        <span>+</span>
        添加书签
      </button>
      <ul>
        <li v-for="bm in bookmarks" :key="bm.id">
          <span class="bookmark-page">第 {{ bm.page_number }} 页</span>
          <button class="delete-btn" @click="deleteBookmarkHandler(bm.id)">删除</button>
        </li>
      </ul>
    </div>

    <!-- Notes Panel -->
    <div v-if="showNotes" class="side-panel">
      <div class="panel-header">
        <h3>
          <span>📝</span>
          笔记
        </h3>
        <button class="close-btn" @click="showNotes = false">✕</button>
      </div>
      <textarea v-model="newNote" placeholder="添加笔记..."></textarea>
      <button class="add-btn" @click="addNoteHandler">
        <span>+</span>
        添加
      </button>
      <ul>
        <li v-for="note in notes" :key="note.id">
          <p>{{ note.content }}</p>
          <button class="delete-btn" @click="deleteNoteHandler(note.id)">删除</button>
        </li>
      </ul>
    </div>

    <!-- Highlights Panel -->
    <div v-if="showHighlights" class="side-panel">
      <div class="panel-header">
        <h3>
          <span>💡</span>
          高亮
        </h3>
        <button class="close-btn" @click="showHighlights = false">✕</button>
      </div>
      <div v-if="highlights.length === 0" class="empty-state">
        <p>暂无高亮</p>
        <p class="hint">选中文字即可添加高亮</p>
      </div>
      <ul v-else>
        <li v-for="hl in highlights" :key="hl.id" class="highlight-item">
          <div class="highlight-color" :style="{ background: getHighlightColor(hl.color) }"></div>
          <div class="highlight-content">
            <p class="highlight-text">{{ hl.selected_text }}</p>
            <span class="highlight-date">{{ formatDate(hl.created_at) }}</span>
          </div>
          <button class="delete-btn" @click="deleteHighlightHandler(hl.id)">删除</button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getBook, type Book } from '../api/books';
import { getFileUrl, getBookmarks, addBookmark, deleteBookmark, getNotes, addNote, deleteNote } from '../api/reading';
import { getHighlights, deleteHighlight, type Highlight } from '../api/highlights';
import EpubReader from '../components/EpubReader.vue';
import PdfReader from '../components/PdfReader.vue';
import TxtReader from '../components/TxtReader.vue';

const route = useRoute();
const bookId = computed(() => Number(route.params.id));

const book = ref<Book | null>(null);
const fileUrl = computed(() => getFileUrl(bookId.value));
const showHighlights = ref(false);
const showBookmarks = ref(false);
const showNotes = ref(false);
const highlights = ref<Highlight[]>([]);
const bookmarks = ref<any[]>([]);
const notes = ref<any[]>([]);
const newNote = ref('');
const currentProgress = ref({ page: 0, percent: 0 });

const highlightColors: Record<string, string> = {
  yellow: '#FFEB3B',
  green: '#4CAF50',
  blue: '#2196F3',
  pink: '#E91E63',
  purple: '#9C27B0'
};

onMounted(async () => {
  book.value = await getBook(bookId.value);
  await loadHighlights();
  await loadBookmarks();
  await loadNotes();
});

async function loadHighlights() {
  highlights.value = await getHighlights(bookId.value);
}

async function loadBookmarks() {
  bookmarks.value = await getBookmarks(bookId.value);
}

async function loadNotes() {
  notes.value = await getNotes(bookId.value);
}

function handleProgress(data: { page: number; percent: number }) {
  currentProgress.value = data;
}

function handleHighlightAdded(highlight: Highlight) {
  highlights.value.unshift(highlight);
}

function handleHighlightRemoved(id: number) {
  highlights.value = highlights.value.filter(h => h.id !== id);
}

async function deleteHighlightHandler(id: number) {
  await deleteHighlight(id);
  await loadHighlights();
}

function getHighlightColor(color: string): string {
  return highlightColors[color] || highlightColors.yellow;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

async function addBookmarkHandler() {
  await addBookmark({
    book_id: bookId.value,
    page_number: currentProgress.value.page
  });
  await loadBookmarks();
}

async function deleteBookmarkHandler(id: number) {
  await deleteBookmark(id);
  await loadBookmarks();
}

async function addNoteHandler() {
  if (!newNote.value.trim()) return;
  await addNote({
    book_id: bookId.value,
    page_number: currentProgress.value.page,
    content: newNote.value
  });
  newNote.value = '';
  await loadNotes();
}

async function deleteNoteHandler(id: number) {
  await deleteNote(id);
  await loadNotes();
}
</script>

<style scoped>
.reader-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-6);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
  box-shadow: var(--shadow-md);
}

.header h2 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 50%;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  color: var(--text-inverse);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.back-btn:hover {
  transform: translateX(-4px);
}

.toolbar {
  display: flex;
  gap: var(--spacing-2);
}

.toolbar button {
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
  padding: var(--spacing-2) var(--spacing-3);
  cursor: pointer;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-inverse);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.toolbar button:hover {
  background: rgba(255, 255, 255, 0.25);
}

.toolbar button.active {
  background: rgba(255, 255, 255, 0.3);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.reader-container {
  flex: 1;
  overflow: hidden;
}

.side-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 320px;
  height: 100%;
  background: var(--bg-primary);
  box-shadow: var(--shadow-xl);
  padding: var(--spacing-6);
  overflow-y: auto;
  z-index: var(--z-modal);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.panel-header h3 {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: var(--radius-full);
  background: var(--bg-tertiary);
  cursor: pointer;
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--color-neutral-200);
}

.add-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-1);
  width: 100%;
  padding: var(--spacing-2) var(--spacing-4);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--spacing-4);
}

.side-panel ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.side-panel li {
  padding: var(--spacing-3) 0;
  border-bottom: 1px solid var(--border-light);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bookmark-page {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.side-panel li p {
  flex: 1;
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
}

.delete-btn {
  padding: var(--spacing-1) var(--spacing-2);
  background: var(--color-error-light);
  color: var(--color-error);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}

.delete-btn:hover {
  background: var(--color-error);
  color: var(--text-inverse);
}

.side-panel textarea {
  width: 100%;
  height: 100px;
  margin: var(--spacing-3) 0;
  padding: var(--spacing-3);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  resize: vertical;
}

.side-panel textarea:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-8) var(--spacing-4);
  color: var(--text-secondary);
}

.empty-state p {
  margin: 0;
}

.empty-state .hint {
  font-size: var(--font-size-sm);
  margin-top: var(--spacing-2);
  color: var(--text-tertiary);
}

.highlight-item {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  padding: var(--spacing-3) 0;
  border-bottom: 1px solid var(--border-light);
}

.highlight-color {
  width: 4px;
  min-height: 40px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.highlight-content {
  flex: 1;
  min-width: 0;
}

.highlight-text {
  margin: 0 0 var(--spacing-1) 0;
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

.highlight-date {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
}
</style>
