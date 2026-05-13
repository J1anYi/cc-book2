---
phase: 7
name: 书库首页与阅读入口
wave: 1
depends_on: []
files_modified:
  - frontend/src/views/Library.vue
  - frontend/src/views/Upload.vue
  - frontend/src/components/BookCard.vue
  - frontend/src/components/NavBar.vue
  - frontend/src/router/index.ts
  - frontend/src/App.vue
  - frontend/src/api/books.ts
  - frontend/src/api/reading.ts
requirements: [LIBRARY-01, LIBRARY-02, LIBRARY-03, LIBRARY-04, LIBRARY-05, LIBRARY-06, READER-01, READER-02, READER-03, READER-04]
autonomous: true
---

# Phase 7: 书库首页与阅读入口

**Goal:** 将首页从上传页面改为书库页面，以卡片形式展示书籍，提供直接进入阅读器的入口

## Tasks

### Task 1: 创建 NavBar 导航组件

<read_first>
- frontend/src/App.vue (当前布局结构)
- frontend/src/router/index.ts (当前路由配置)
</read_first>

<action>
创建 frontend/src/components/NavBar.vue 导航组件，包含以下导航项：
- 书库 (Library) → /
- 上传 (Upload) → /upload
- 管理 (Admin) → /admin

组件要求：
- 使用 Vue 3 Composition API + TypeScript
- 导航项使用 router-link，当前路由高亮显示
- 响应式设计，移动端可折叠（可选）
- 样式与 App.vue 现有风格保持一致
</action>

<acceptance_criteria>
- frontend/src/components/NavBar.vue 文件存在
- 组件包含书库、上传、管理三个导航链接
- router-link 绑定正确的路由路径
- 当前路由项有高亮样式
</acceptance_criteria>

---

### Task 2: 创建 BookCard 书籍卡片组件

<read_first>
- frontend/src/views/Upload.vue (现有书籍列表样式参考)
- frontend/src/api/books.ts (Book 类型定义)
</read_first>

<action>
创建 frontend/src/components/BookCard.vue 书籍卡片组件：

Props:
- book: Book (书籍对象，包含 id, title, author, file_type, cover_path, category 等)
- progress: number (阅读进度百分比，默认 0)

功能:
- 显示书籍封面（cover_path 或默认占位图）
- 显示标题、作者、文件类型
- 显示阅读进度条和百分比
- 点击卡片跳转到阅读器 /read/:id
- 卡片有悬停效果

样式:
- 卡片式布局，带阴影和圆角
- 响应式，一行可显示多张卡片
- 进度条使用渐变色
</action>

<acceptance_criteria>
- frontend/src/components/BookCard.vue 文件存在
- 组件接收 book 和 progress props
- 显示封面、标题、作者、类型、进度
- 点击卡片导航到 /read/:id
- 卡片有悬停动效
</acceptance_criteria>

---

### Task 3: 创建 Library 书库首页

<read_first>
- frontend/src/views/Upload.vue (现有书籍加载逻辑)
- frontend/src/api/books.ts (API 调用方法)
- frontend/src/api/reading.ts (阅读历史 API)
</read_first>

<action>
创建 frontend/src/views/Library.vue 书库首页：

布局:
1. 顶部: 搜索栏 + 分类筛选
2. "继续阅读"区域: 最近阅读的书籍横向滚动列表
3. "书库"区域: 所有书籍的网格卡片展示

功能:
- 搜索框实时筛选（标题、作者）
- 分类下拉筛选
- 加载书籍列表（调用 GET /api/books）
- 加载阅读历史（调用 GET /api/reading/history）
- 空状态显示"暂无书籍，去上传"
- 点击书籍卡片进入阅读器

API 调用:
- getBooks() 获取书籍列表
- getReadingHistory() 获取阅读历史
</action>

<acceptance_criteria>
- frontend/src/views/Library.vue 文件存在
- 页面包含搜索栏和分类筛选
- 页面显示"继续阅读"区域，展示最近阅读的书籍
- 页面显示"书库"区域，所有书籍以卡片形式展示
- 搜索和筛选功能正常工作
- 点击卡片跳转到阅读器
</acceptance_criteria>

---

### Task 4: 更新路由配置

<read_first>
- frontend/src/router/index.ts (当前路由配置)
- frontend/src/views/Library.vue (新创建)
</read_first>

<action>
修改 frontend/src/router/index.ts：

路由变更:
- / 路由从 Upload 改为 Library
- /upload 路由指向 Upload 组件
- /library 重定向到 /
- /read/:id 保持不变
- /admin 保持不变

路由守卫:
- 保持现有的认证守卫逻辑
</action>

<acceptance_criteria>
- 访问 / 显示书库页面 Library
- 访问 /upload 显示上传页面
- /library 重定向到 /
- 路由守卫正常工作
</acceptance_criteria>

---

### Task 5: 更新 App.vue 布局

<read_first>
- frontend/src/App.vue (当前布局)
- frontend/src/components/NavBar.vue (新导航组件)
</read_first>

<action>
修改 frontend/src/App.vue：

变更:
- 引入 NavBar 组件
- 在 header 区域使用 NavBar 替换现有导航链接
- 保持 router-view 位置不变
- 调整样式，使导航栏和内容区域协调
</action>

<acceptance_criteria>
- App.vue 包含 NavBar 组件
- 导航栏显示书库、上传、管理三个链接
- 当前路由高亮显示
- 页面布局协调美观
</acceptance_criteria>

---

### Task 6: 增强 reading API

<read_first>
- frontend/src/api/reading.ts (现有 API)
</read_first>

<action>
确保 frontend/src/api/reading.ts 包含以下 API：

- getReadingHistory(): 获取阅读历史列表
  - GET /api/reading/history
  - 返回包含书籍信息的阅读进度列表

如果缺失则添加。
</action>

<acceptance_criteria>
- reading.ts 包含 getReadingHistory 函数
- 函数正确调用后端 API
- 返回类型正确
</acceptance_criteria>

---

### Task 7: 更新 Upload 页面导航

<read_first>
- frontend/src/views/Upload.vue (当前上传页面)
</read_first>

<action>
修改 frontend/src/views/Upload.vue：

变更:
- 上传成功后显示成功提示
- 添加"查看书库"按钮，点击跳转到 /
- 添加"立即阅读"按钮，点击跳转到 /read/:id
- 保持现有上传功能不变
</action>

<acceptance_criteria>
- 上传成功后显示成功消息
- 显示"查看书库"按钮
- 显示"立即阅读"按钮
- 按钮正确跳转
</acceptance_criteria>

---

### Task 8: 更新 Reader 页面返回按钮

<read_first>
- frontend/src/views/Reader.vue (现有阅读器)
</read_first>

<action>
修改 frontend/src/views/Reader.vue：

变更:
- 确保返回按钮跳转到 / (书库) 而不是 Upload
- 如果当前跳转正确则无需修改
</action>

<acceptance_criteria>
- 阅读器返回按钮跳转到书库首页 /
</acceptance_criteria>

---

## Verification Criteria

1. 访问 http://localhost:5173/ 显示书库页面，而非上传页面
2. 书库页面以卡片形式展示所有已上传书籍
3. 每张卡片显示封面、标题、作者、类型、进度
4. 点击卡片直接进入阅读器
5. "继续阅读"区域显示最近阅读的书籍
6. 导航栏清晰展示：书库、上传、管理
7. 上传页面在上传成功后可跳转到书库或立即阅读
8. 阅读器有明确的返回书库按钮

## Must Haves

- 书库首页必须作为默认首页 (/)
- 书籍必须以卡片形式展示
- 点击卡片必须能进入阅读器
- 导航栏必须有书库、上传、管理三个入口
