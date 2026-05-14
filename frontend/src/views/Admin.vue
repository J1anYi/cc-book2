<template>
  <div class="admin">
    <!-- Login Form -->
    <div v-if="!isLoggedIn" class="login-form">
      <div class="login-header">
        <span class="login-icon">🔐</span>
        <h2>管理员登录</h2>
      </div>
      <form @submit.prevent="handleLogin">
        <input
          v-model="password"
          type="password"
          placeholder="请输入密码"
          required
        />
        <button type="submit">登录</button>
        <p v-if="loginError" class="error">{{ loginError }}</p>
      </form>
    </div>

    <!-- Admin Panel -->
    <div v-else class="admin-panel">
      <div class="tabs">
        <button :class="{ active: activeTab === 'books' }" @click="activeTab = 'books'">
          <span class="tab-icon">📚</span>
          书库管理
        </button>
        <button :class="{ active: activeTab === 'categories' }" @click="activeTab = 'categories'">
          <span class="tab-icon">🏷️</span>
          分类管理
        </button>
        <button class="logout" @click="handleLogout">
          <span class="tab-icon">🚪</span>
          退出
        </button>
      </div>

      <!-- Books Management -->
      <div v-if="activeTab === 'books'" class="books-management">
        <div class="search-bar">
          <span class="search-icon">🔍</span>
          <input
            v-model="searchQuery"
            placeholder="搜索书籍标题或作者..."
            @input="handleSearch"
          />
        </div>

        <div class="books-list">
          <div v-for="book in books" :key="book.id" class="book-item">
            <div class="book-info">
              <h3>{{ book.title }}</h3>
              <p>作者: {{ book.author || '未知' }}</p>
              <p>类型: {{ book.file_type.toUpperCase() }}</p>
              <p>分类: {{ book.category || '未分类' }}</p>
              <p>标签: {{ book.tags || '无' }}</p>
            </div>
            <div class="book-actions">
              <button class="edit-btn" @click="editBook(book)">编辑</button>
              <button class="delete-btn" @click="handleDeleteBook(book.id)">删除</button>
            </div>
          </div>
        </div>

        <!-- Edit Modal -->
        <div v-if="editingBook" class="modal" @click.self="editingBook = null">
          <div class="modal-content">
            <h3>编辑书籍</h3>
            <div class="form-group">
              <label>分类:</label>
              <select v-model="editForm.category">
                <option value="">未分类</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.name">
                  {{ cat.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>标签 (逗号分隔):</label>
              <input v-model="editForm.tags" placeholder="小说, 科幻" />
            </div>
            <div class="modal-actions">
              <button class="save-btn" @click="saveBook">保存</button>
              <button class="cancel-btn" @click="editingBook = null">取消</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories Management -->
      <div v-if="activeTab === 'categories'" class="categories-management">
        <div class="add-category">
          <input v-model="newCategory" placeholder="新分类名称" />
          <button @click="addCategory">添加分类</button>
        </div>

        <div class="categories-list">
          <div v-for="category in categories" :key="category.id" class="category-item">
            <span class="category-name">{{ category.name }}</span>
            <button class="delete-btn" @click="handleDeleteCategory(category.id)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {
  login,
  logout,
  getBooks,
  deleteBook as apiDeleteBook,
  updateBook,
  getCategories,
  createCategory,
  deleteCategory as apiDeleteCategory,
  type Book,
  type Category
} from '../api/books';

const isLoggedIn = ref(false);
const password = ref('');
const loginError = ref('');
const activeTab = ref('books');
const searchQuery = ref('');
const books = ref<Book[]>([]);
const categories = ref<Category[]>([]);
const editingBook = ref<Book | null>(null);
const editForm = ref({ category: '', tags: '' });
const newCategory = ref('');

onMounted(() => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    isLoggedIn.value = true;
    loadData();
  }
});

async function handleLogin() {
  try {
    const result = await login(password.value);
    if (result.success && result.token) {
      localStorage.setItem('adminToken', result.token);
      isLoggedIn.value = true;
      loginError.value = '';
      loadData();
    } else {
      loginError.value = '密码错误';
    }
  } catch (error) {
    loginError.value = '登录失败';
  }
}

async function handleLogout() {
  try {
    await logout();
  } catch (error) {
    // Ignore logout errors
  }
  localStorage.removeItem('adminToken');
  isLoggedIn.value = false;
  password.value = '';
}

async function loadData() {
  await Promise.all([loadBooks(), loadCategories()]);
}

async function loadBooks() {
  try {
    books.value = await getBooks();
  } catch (error) {
    console.error('Failed to load books:', error);
  }
}

async function loadCategories() {
  try {
    categories.value = await getCategories();
  } catch (error) {
    console.error('Failed to load categories:', error);
  }
}

async function handleSearch() {
  try {
    books.value = await getBooks(searchQuery.value || undefined);
  } catch (error) {
    console.error('Search failed:', error);
  }
}

function editBook(book: Book) {
  editingBook.value = book;
  editForm.value = {
    category: book.category || '',
    tags: book.tags || ''
  };
}

async function saveBook() {
  if (!editingBook.value) return;

  try {
    await updateBook(editingBook.value.id, editForm.value);
    editingBook.value = null;
    loadBooks();
  } catch (error) {
    console.error('Failed to update book:', error);
  }
}

async function handleDeleteBook(id: number) {
  if (!confirm('确定要删除这本书吗？')) return;

  try {
    await apiDeleteBook(id);
    loadBooks();
  } catch (error) {
    console.error('Failed to delete book:', error);
  }
}

async function addCategory() {
  if (!newCategory.value.trim()) return;

  try {
    await createCategory(newCategory.value.trim());
    newCategory.value = '';
    loadCategories();
  } catch (error) {
    console.error('Failed to create category:', error);
  }
}

async function handleDeleteCategory(id: number) {
  if (!confirm('确定要删除这个分类吗？')) return;

  try {
    await apiDeleteCategory(id);
    loadCategories();
  } catch (error) {
    console.error('Failed to delete category:', error);
  }
}
</script>

<style scoped>
.admin {
  padding: var(--spacing-6);
}

.login-form {
  max-width: 400px;
  margin: 80px auto;
  padding: var(--spacing-8);
  background: var(--bg-primary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.login-header {
  text-align: center;
  margin-bottom: var(--spacing-6);
}

.login-icon {
  font-size: 48px;
  display: block;
  margin-bottom: var(--spacing-2);
}

.login-form h2 {
  margin: 0;
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.login-form input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  margin-bottom: var(--spacing-4);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.login-form input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 4px var(--color-primary-100);
}

.login-form button {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.login-form button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.error {
  color: var(--color-error);
  text-align: center;
  margin-top: var(--spacing-3);
}

.tabs {
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-6);
  padding-bottom: var(--spacing-3);
  border-bottom: 2px solid var(--border-light);
}

.tabs button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  background: var(--bg-tertiary);
  cursor: pointer;
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.tab-icon {
  font-size: var(--font-size-base);
}

.tabs button:hover {
  background: var(--color-neutral-200);
}

.tabs button.active {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
}

.tabs button.logout {
  margin-left: auto;
  background: var(--color-error);
  color: var(--text-inverse);
}

.tabs button.logout:hover {
  background: #dc2626;
}

.search-bar {
  position: relative;
  margin-bottom: var(--spacing-6);
}

.search-icon {
  position: absolute;
  left: var(--spacing-4);
  top: 50%;
  transform: translateY(-50%);
  font-size: var(--font-size-lg);
}

.search-bar input {
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-3) var(--spacing-10);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
  transition: all var(--transition-fast);
}

.search-bar input:focus {
  outline: none;
  border-color: var(--color-primary-500);
  box-shadow: 0 0 0 4px var(--color-primary-100);
}

.books-list {
  display: grid;
  gap: var(--spacing-4);
}

.book-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-4);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
  transition: all var(--transition-fast);
}

.book-item:hover {
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-200);
}

.book-info h3 {
  margin: 0 0 var(--spacing-1) 0;
  color: var(--text-primary);
  font-weight: var(--font-weight-semibold);
}

.book-info p {
  margin: var(--spacing-1) 0;
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
}

.book-actions {
  display: flex;
  gap: var(--spacing-2);
}

.book-actions button {
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  transition: all var(--transition-fast);
}

.edit-btn {
  background: var(--color-primary-100);
  color: var(--color-primary-700);
}

.edit-btn:hover {
  background: var(--color-primary-200);
}

.delete-btn {
  background: var(--color-error-light);
  color: var(--color-error);
}

.delete-btn:hover {
  background: var(--color-error);
  color: var(--text-inverse);
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: var(--z-modal);
}

.modal-content {
  background: var(--bg-primary);
  padding: var(--spacing-6);
  border-radius: var(--radius-xl);
  min-width: 400px;
  box-shadow: var(--shadow-xl);
}

.modal-content h3 {
  margin: 0 0 var(--spacing-4) 0;
  color: var(--text-primary);
}

.form-group {
  margin-bottom: var(--spacing-4);
}

.form-group label {
  display: block;
  margin-bottom: var(--spacing-2);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.form-group input,
.form-group select {
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-md);
  font-size: var(--font-size-base);
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-3);
  justify-content: flex-end;
  margin-top: var(--spacing-4);
}

.modal-actions button {
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.save-btn {
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
}

.cancel-btn {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.add-category {
  display: flex;
  gap: var(--spacing-3);
  margin-bottom: var(--spacing-6);
}

.add-category input {
  flex: 1;
  padding: var(--spacing-3) var(--spacing-4);
  border: 2px solid var(--border-light);
  border-radius: var(--radius-lg);
  font-size: var(--font-size-base);
}

.add-category input:focus {
  outline: none;
  border-color: var(--color-primary-500);
}

.add-category button {
  padding: var(--spacing-3) var(--spacing-5);
  background: linear-gradient(135deg, var(--color-primary-500) 0%, var(--color-primary-600) 100%);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-lg);
  cursor: pointer;
  font-weight: var(--font-weight-medium);
}

.categories-list {
  display: grid;
  gap: var(--spacing-3);
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-3) var(--spacing-4);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-light);
}

.category-name {
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
}

.category-item button.delete-btn {
  padding: var(--spacing-1) var(--spacing-3);
}
</style>
