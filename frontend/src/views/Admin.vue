<template>
  <div class="admin">
    <!-- Login Form -->
    <div v-if="!isLoggedIn" class="login-form">
      <h2>管理员登录</h2>
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
        <button :class="{ active: activeTab === 'books' }" @click="activeTab = 'books'">书库管理</button>
        <button :class="{ active: activeTab === 'categories' }" @click="activeTab = 'categories'">分类管理</button>
        <button class="logout" @click="handleLogout">退出</button>
      </div>

      <!-- Books Management -->
      <div v-if="activeTab === 'books'" class="books-management">
        <div class="search-bar">
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
              <button @click="editBook(book)">编辑</button>
              <button class="delete" @click="handleDeleteBook(book.id)">删除</button>
            </div>
          </div>
        </div>

        <!-- Edit Modal -->
        <div v-if="editingBook" class="modal">
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
              <button @click="saveBook">保存</button>
              <button @click="editingBook = null">取消</button>
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
            <span>{{ category.name }}</span>
            <button class="delete" @click="handleDeleteCategory(category.id)">删除</button>
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
  padding: 20px;
}

.login-form {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.login-form h2 {
  text-align: center;
  margin-bottom: 20px;
}

.login-form input {
  width: 100%;
  padding: 12px;
  margin-bottom: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.login-form button {
  width: 100%;
  padding: 12px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.error {
  color: #e74c3c;
  text-align: center;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.tabs button {
  padding: 10px 20px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  border-radius: 4px;
}

.tabs button.active {
  background: #42b883;
  color: white;
}

.tabs button.logout {
  margin-left: auto;
  background: #e74c3c;
  color: white;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.books-list {
  display: grid;
  gap: 15px;
}

.book-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.book-info h3 {
  margin: 0 0 5px 0;
}

.book-info p {
  margin: 3px 0;
  color: #666;
  font-size: 14px;
}

.book-actions button {
  margin-left: 10px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.book-actions button.delete {
  background: #e74c3c;
  color: white;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 8px;
  min-width: 400px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.add-category {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.add-category input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.add-category button {
  padding: 10px 20px;
  background: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.categories-list {
  display: grid;
  gap: 10px;
}

.category-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.category-item button.delete {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
