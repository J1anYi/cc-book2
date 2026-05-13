<template>
  <div class="library">
    <!-- Search and Filter -->
    <div class="library-header">
      <div class="search-box">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="搜索书籍（标题、作者）..."
          @input="filterBooks"
        />
      </div>
      <div class="filter-box">
        <select v-model="selectedCategory" @change="filterBooks">
          <option value="">全部分类</option>
          <option v-for="cat in categories" :key="cat.id" :value="cat.name">
            {{ cat.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Continue Reading Section -->
    <section v-if="recentBooks.length > 0" class="continue-reading">
      <h2>继续阅读</h2>
      <div class="recent-scroll">
        <div
          v-for="item in recentBooks"
          :key="item.book_id"
          class="recent-item"
          @click="goToReader(item.book_id)"
        >
          <div class="recent-cover">
            <span class="file-icon">{{ getFileIcon(item.file_type) }}</span>
          </div>
          <div class="recent-info">
            <h4>{{ item.title }}</h4>
            <p>{{ item.author || '未知作者' }}</p>
            <div class="recent-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: `${item.progress_percent}%` }"></div>
              </div>
              <span>{{ Math.round(item.progress_percent) }}%</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Book Library Grid -->
    <section class="book-grid-section">
      <h2>书库</h2>
      <div v-if="filteredBooks.length === 0" class="empty-state">
        <p>暂无书籍</p>
        <router-link to="/upload" class="upload-link">去上传</router-link>
      </div>
      <div v-else class="book-grid">
        <BookCard
          v-for="book in filteredBooks"
          :key="book.id"
          :book="book"
          :progress="getBookProgress(book.id)"
        />
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import BookCard from '../components/BookCard.vue';
import { getBooks, getCategories, type Book, type Category } from '../api/books';
import { getReadingHistory } from '../api/reading';

const router = useRouter();

const books = ref<Book[]>([]);
const categories = ref<Category[]>([]);
const readingHistory = ref<any[]>([]);
const searchQuery = ref('');
const selectedCategory = ref('');

const recentBooks = computed(() => {
  // Get books with reading progress, sorted by last_read_at
  return readingHistory.value
    .filter(h => h.progress_percent > 0)
    .sort((a, b) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime())
    .slice(0, 5);
});

const filteredBooks = computed(() => {
  let result = books.value;

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(book =>
      book.title.toLowerCase().includes(query) ||
      (book.author && book.author.toLowerCase().includes(query))
    );
  }

  // Filter by category
  if (selectedCategory.value) {
    result = result.filter(book => book.category === selectedCategory.value);
  }

  return result;
});

function filterBooks() {
  // Reactive filtering via computed property
}

function getBookProgress(bookId: number): number {
  const history = readingHistory.value.find(h => h.book_id === bookId);
  return history?.progress_percent ?? 0;
}

function getFileIcon(fileType: string): string {
  switch (fileType.toLowerCase()) {
    case 'epub': return '📖';
    case 'pdf': return '📄';
    case 'txt': return '📝';
    default: return '📚';
  }
}

function goToReader(bookId: number) {
  router.push(`/read/${bookId}`);
}

async function loadData() {
  try {
    const [booksData, categoriesData, historyData] = await Promise.all([
      getBooks(),
      getCategories(),
      getReadingHistory()
    ]);
    books.value = booksData;
    categories.value = categoriesData;
    readingHistory.value = historyData;
  } catch (error) {
    console.error('Failed to load library data:', error);
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.library {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.library-header {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.search-box {
  flex: 1;
}

.search-box input {
  width: 100%;
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  transition: border-color 0.2s;
}

.search-box input:focus {
  outline: none;
  border-color: #42b883;
}

.filter-box select {
  padding: 12px 16px;
  font-size: 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

/* Continue Reading Section */
.continue-reading {
  margin-bottom: 40px;
}

.continue-reading h2 {
  margin-bottom: 15px;
  color: #333;
}

.recent-scroll {
  display: flex;
  gap: 15px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.recent-item {
  display: flex;
  gap: 12px;
  min-width: 280px;
  padding: 15px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.recent-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.recent-cover {
  width: 60px;
  height: 80px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.file-icon {
  font-size: 24px;
}

.recent-info {
  flex: 1;
}

.recent-info h4 {
  margin: 0 0 5px 0;
  font-size: 14px;
  color: #333;
}

.recent-info p {
  margin: 0 0 8px 0;
  font-size: 12px;
  color: #666;
}

.recent-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.recent-progress .progress-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.recent-progress .progress-fill {
  height: 100%;
  background: #42b883;
}

.recent-progress span {
  font-size: 12px;
  color: #666;
}

/* Book Grid Section */
.book-grid-section h2 {
  margin-bottom: 20px;
  color: #333;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
}

.empty-state p {
  font-size: 18px;
  color: #666;
  margin-bottom: 20px;
}

.upload-link {
  display: inline-block;
  padding: 12px 24px;
  background: #42b883;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
}

.upload-link:hover {
  background: #3aa876;
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}
</style>