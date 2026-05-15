<template>
  <div class="library">
    <!-- Search and Filter -->
    <div class="library-header">
      <div class="search-box">
        <span class="search-icon">🔍</span>
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
      <div class="filter-box">
        <select v-model="selectedCollection" @change="handleCollectionChange">
          <option :value="null">全部收藏夹</option>
          <option v-for="col in collections" :key="col.id" :value="col.id">
            {{ col.icon || '📁' }} {{ col.name }} ({{ col.book_count }})
          </option>
        </select>
      </div>
      <div class="filter-box">
        <select v-model="selectedStatus" @change="handleStatusChange">
          <option :value="null">全部状态</option>
          <option value="want_to_read">📖 想读</option>
          <option value="reading">📚 在读</option>
          <option value="read">✅ 已读</option>
        </select>
      </div>
    </div>

    <!-- Tag Filter -->
    <div class="tag-filter-box">
      <div class="tag-filter-header">
        <span>标签筛选</span>
        <button
          @click="toggleTagMode"
          :class="['mode-toggle', { active: tagFilterMode === 'AND' }]"
        >
          {{ tagFilterMode }}
        </button>
      </div>
      <div class="tag-chips">
        <button
          v-for="tag in tags"
          :key="tag.id"
          :class="['tag-chip', { active: selectedTags.has(tag.id) }]"
          :style="{ borderColor: tag.color || 'var(--border-light)' }"
          @click="toggleTag(tag.id)"
        >
          {{ tag.name }} ({{ tag.usage_count }})
        </button>
      </div>
      <p v-if="selectedTags.size > 0" class="tag-hint">
        已选择 {{ selectedTags.size }} 个标签 ({{ tagFilterMode === 'AND' ? '同时满足' : '满足任一' }})
      </p>
    </div>

    <!-- Continue Reading Section -->
    <section v-if="recentBooks.length > 0" class="continue-reading">
      <h2>
        <span class="section-icon">📖</span>
        继续阅读
      </h2>
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
      <h2>
        <span class="section-icon">📚</span>
        书库
      </h2>
      <div v-if="filteredBooks.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无书籍</p>
        <router-link to="/upload" class="upload-link">
          <span>📤</span>
          去上传
        </router-link>
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
import { getCollections, type Collection } from '../api/collections';
import { getReadingHistory } from '../api/reading';
import { getTags, type Tag } from '../api/tags';

const router = useRouter();

const books = ref<Book[]>([]);
const categories = ref<Category[]>([]);
const collections = ref<Collection[]>([]);
const readingHistory = ref<any[]>([]);
const searchQuery = ref('');
const selectedCategory = ref('');
const selectedCollection = ref<number | null>(null);
const selectedStatus = ref<string | null>(null);
const tags = ref<Tag[]>([]);
const selectedTags = ref<Set<number>>(new Set());
const tagFilterMode = ref<'AND' | 'OR'>('OR');

const recentBooks = computed(() => {
  return readingHistory.value
    .filter(h => h.progress_percent > 0)
    .sort((a, b) => new Date(b.last_read_at).getTime() - new Date(a.last_read_at).getTime())
    .slice(0, 5);
});

const filteredBooks = computed(() => {
  let result = books.value;

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(book =>
      book.title.toLowerCase().includes(query) ||
      (book.author && book.author.toLowerCase().includes(query))
    );
  }

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

function toggleTag(tagId: number) {
  // Create new Set to trigger Vue reactivity
  const newSet = new Set(selectedTags.value);
  if (newSet.has(tagId)) {
    newSet.delete(tagId);
  } else {
    newSet.add(tagId);
  }
  selectedTags.value = newSet;
  handleTagChange();
}

async function handleTagChange() {
  try {
    const tagIds = Array.from(selectedTags.value).join(',');
    const booksData = await getBooks(
      undefined,
      selectedCollection.value || undefined,
      selectedStatus.value || undefined,
      tagIds || undefined,
      tagFilterMode.value
    );
    books.value = booksData;
  } catch (error) {
    console.error('Failed to filter by tags:', error);
  }
}

function toggleTagMode() {
  tagFilterMode.value = tagFilterMode.value === 'AND' ? 'OR' : 'AND';
  if (selectedTags.value.size > 0) {
    handleTagChange();
  }
}

async function loadData() {
  try {
    const [booksData, categoriesData, collectionsData, tagsData, historyData] = await Promise.all([
      getBooks(),
      getCategories(),
      getCollections(),
      getTags(),
      getReadingHistory()
    ]);
    books.value = booksData;
    categories.value = categoriesData;
    collections.value = collectionsData;
    tags.value = tagsData;
    readingHistory.value = historyData;
  } catch (error) {
    console.error('Failed to load library data:', error);
  }
}

async function handleCollectionChange() {
  try {
    const tagIds = Array.from(selectedTags.value).join(',');
    const booksData = await getBooks(
      undefined,
      selectedCollection.value,
      selectedStatus.value || undefined,
      tagIds || undefined,
      tagFilterMode.value
    );
    books.value = booksData;
  } catch (error) {
    console.error('Failed to filter by collection:', error);
  }
}

async function handleStatusChange() {
  try {
    const tagIds = Array.from(selectedTags.value).join(',');
    const booksData = await getBooks(
      undefined,
      selectedCollection.value || undefined,
      selectedStatus.value,
      tagIds || undefined,
      tagFilterMode.value
    );
    books.value = booksData;
  } catch (error) {
    console.error('Failed to filter by status:', error);
  }
}

onMounted(() => {
  loadData();
});
</script>

<style scoped>
.library {
  max-width: var(--container-xl);
  margin: 0 auto;
}

.library-header {
  display: flex;
  gap: var(--spacing-4);
  margin-bottom: var(--spacing-8);
}

.search-box {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: var(--spacing-4);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--font-size-lg);
  pointer-events: none;
}

.search-box input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-3) var(--spacing-10);
  font-size: var(--font-size-base);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-sm);
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-md), 0 0 0 4px var(--color-primary-100);
}

.search-box input::placeholder {
  color: var(--text-tertiary);
}

.filter-box select {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-base);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  background: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all var(--transition-fast);
  min-width: 140px;
}

.filter-box select:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-md);
}

/* Tag Filter */
.tag-filter-box {
  margin-top: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.tag-filter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.mode-toggle {
  padding: var(--spacing-1) var(--spacing-2);
  font-size: var(--font-size-xs);
  font-weight: 600;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mode-toggle:hover {
  background: var(--color-primary-100);
}

.mode-toggle.active {
  background: var(--color-primary-500);
  color: white;
  border-color: var(--color-primary-500);
}

.tag-chips {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}

.tag-chip {
  display: inline-flex;
  align-items: center;
  padding: var(--spacing-1) var(--spacing-3);
  font-size: var(--font-size-sm);
  background: var(--bg-primary);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tag-chip:hover {
  background: var(--bg-tertiary);
}

.tag-chip.active {
  background: var(--color-primary-100);
  border-color: var(--color-primary-500);
  color: var(--color-primary-700);
}

.tag-hint {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  margin-top: var(--spacing-2);
}

/* Continue Reading Section */
.continue-reading {
  margin-bottom: var(--spacing-10);
}

.continue-reading h2,
.book-grid-section h2 {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-4);
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
}

.section-icon {
  font-size: var(--font-size-2xl);
}

.recent-scroll {
  display: flex;
  gap: var(--spacing-4);
  overflow-x: auto;
  padding-bottom: var(--spacing-2);
  margin: 0 calc(-1 * var(--spacing-6));
  padding-left: var(--spacing-6);
  padding-right: var(--spacing-6);
}

.recent-item {
  display: flex;
  gap: var(--spacing-3);
  min-width: 300px;
  padding: var(--spacing-4);
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-md);
  cursor: pointer;
  transition: all var(--transition-normal);
  border: 1px solid var(--border-light);
}

.recent-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
  border-color: var(--color-primary-200);
}

.recent-cover {
  width: 64px;
  height: 80px;
  background: linear-gradient(135deg, var(--color-primary-400) 0%, var(--color-secondary-400) 100%);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.file-icon {
  font-size: var(--font-size-2xl);
}

.recent-info {
  flex: 1;
  min-width: 0;
}

.recent-info h4 {
  margin: 0 0 var(--spacing-1) 0;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.recent-info p {
  margin: 0 0 var(--spacing-2) 0;
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
}

.recent-progress {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.recent-progress .progress-bar {
  flex: 1;
  height: 6px;
  background: var(--color-neutral-100);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.recent-progress .progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-primary-500), var(--color-secondary-500));
}

.recent-progress span {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  font-weight: var(--font-weight-medium);
}

/* Book Grid Section */
.book-grid-section {
  margin-top: var(--spacing-8);
}

.empty-state {
  text-align: center;
  padding: var(--spacing-16) var(--spacing-4);
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.empty-icon {
  font-size: 64px;
  display: block;
  margin-bottom: var(--spacing-4);
}

.empty-state p {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-6);
}

.upload-link {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-3) var(--spacing-6);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
  text-decoration: none;
  border-radius: var(--radius-lg);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
  box-shadow: var(--shadow-md);
}

.upload-link:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.book-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-6);
}

/* Responsive */
@media (max-width: 768px) {
  .library-header {
    flex-direction: column;
  }

  .book-grid {
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: var(--spacing-4);
  }
}

@media (max-width: 480px) {
  .book-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--spacing-3);
  }
}
</style>
