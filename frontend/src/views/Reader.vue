<template>
  <div class="reader-page">
    <div class="header">
      <router-link to="/" class="back-btn">← 返回</router-link>
      <h2>{{ book?.title || '加载中...' }}</h2>
      <div class="toolbar">
        <button @click="showBookmarks = !showBookmarks">书签</button>
        <button @click="showNotes = !showNotes">笔记</button>
      </div>
    </div>

    <div class="reader-container">
      <EpubReader
        v-if="book?.file_type === 'epub'"
        :bookId="bookId"
        :fileUrl="fileUrl"
        @progress="handleProgress"
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
      <h3>书签</h3>
      <button @click="addBookmarkHandler">添加书签</button>
      <ul>
        <li v-for="bm in bookmarks" :key="bm.id">
          第 {{ bm.page_number }} 页
          <button @click="deleteBookmarkHandler(bm.id)">删除</button>
        </li>
      </ul>
      <button @click="showBookmarks = false">关闭</button>
    </div>

    <!-- Notes Panel -->
    <div v-if="showNotes" class="side-panel">
      <h3>笔记</h3>
      <textarea v-model="newNote" placeholder="添加笔记..."></textarea>
      <button @click="addNoteHandler">添加</button>
      <ul>
        <li v-for="note in notes" :key="note.id">
          <p>{{ note.content }}</p>
          <button @click="deleteNoteHandler(note.id)">删除</button>
        </li>
      </ul>
      <button @click="showNotes = false">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { getBook, type Book } from '../api/books';
import { getFileUrl, getBookmarks, addBookmark, deleteBookmark, getNotes, addNote, deleteNote } from '../api/reading';
import EpubReader from '../components/EpubReader.vue';
import PdfReader from '../components/PdfReader.vue';
import TxtReader from '../components/TxtReader.vue';

const route = useRoute();
const bookId = computed(() => Number(route.params.id));

const book = ref<Book | null>(null);
const fileUrl = computed(() => getFileUrl(bookId.value));
const showBookmarks = ref(false);
const showNotes = ref(false);
const bookmarks = ref<any[]>([]);
const notes = ref<any[]>([]);
const newNote = ref('');
const currentProgress = ref({ page: 0, percent: 0 });

onMounted(async () => {
  book.value = await getBook(bookId.value);
  await loadBookmarks();
  await loadNotes();
});

async function loadBookmarks() {
  bookmarks.value = await getBookmarks(bookId.value);
}

async function loadNotes() {
  notes.value = await getNotes(bookId.value);
}

function handleProgress(data: { page: number; percent: number }) {
  currentProgress.value = data;
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
  padding: 10px 20px;
  background: #42b883;
  color: white;
}

.header h2 {
  margin: 0;
  font-size: 18px;
}

.back-btn {
  color: white;
  text-decoration: none;
}

.toolbar button {
  margin-left: 10px;
  padding: 5px 10px;
  cursor: pointer;
}

.reader-container {
  flex: 1;
  overflow: hidden;
}

.side-panel {
  position: fixed;
  right: 0;
  top: 0;
  width: 300px;
  height: 100%;
  background: white;
  box-shadow: -2px 0 10px rgba(0,0,0,0.1);
  padding: 20px;
  overflow-y: auto;
}

.side-panel h3 {
  margin-top: 0;
}

.side-panel ul {
  list-style: none;
  padding: 0;
}

.side-panel li {
  padding: 10px 0;
  border-bottom: 1px solid #eee;
}

.side-panel textarea {
  width: 100%;
  height: 80px;
  margin: 10px 0;
}

.side-panel button {
  margin-top: 10px;
  padding: 5px 10px;
  cursor: pointer;
}
</style>
