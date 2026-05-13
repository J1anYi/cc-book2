# PLAN — Phase 3: 在线阅读器

## 目标

实现三种格式书籍的在线阅读和阅读辅助功能。

---

## Requirements 覆盖

| ID | Requirement | 状态 |
|----|-------------|------|
| READ-01 | 用户可以在浏览器中打开并阅读 EPUB 书籍 | 待实现 |
| READ-02 | 用户可以在浏览器中打开并阅读 PDF 书籍 | 待实现 |
| READ-03 | 用户可以在浏览器中打开并阅读 TXT 书籍 | 待实现 |
| READ-04 | 阅读器支持翻页功能（上一页/下一页/跳转） | 待实现 |
| READ-05 | 系统自动保存阅读进度 | 待实现 |
| READ-06 | 用户可以添加书签 | 待实现 |
| READ-07 | 用户可以添加笔记/标注 | 待实现 |

---

## 技术方案

### 后端扩展

```
backend/
├── src/
│   ├── routes/
│   │   ├── books.ts        # 扩展：文件读取、进度保存
│   │   ├── reading.ts      # 新增：阅读进度、书签、笔记 API
│   │   └── files.ts        # 新增：静态文件服务
│   └── models/
│       ├── readingProgress.ts  # 新增：阅读进度模型
│       ├── bookmark.ts         # 新增：书签模型
│       └── note.ts             # 新增：笔记模型
```

### 前端扩展

```
frontend/
├── src/
│   ├── views/
│   │   ├── Upload.vue      # 已有
│   │   ├── Admin.vue       # 已有
│   │   └── Reader.vue      # 新增：阅读器页面
│   ├── components/
│   │   ├── EpubReader.vue  # 新增：EPUB 阅读器组件
│   │   ├── PdfReader.vue   # 新增：PDF 阅读器组件
│   │   ├── TxtReader.vue   # 新增：TXT 阅读器组件
│   │   └── ReaderToolbar.vue  # 新增：阅读器工具栏
│   ├── api/
│   │   ├── books.ts        # 已有
│   │   └── reading.ts      # 新增：阅读相关 API
│   └── router/
│       └── index.ts        # 扩展：添加阅读器路由
```

### 数据库扩展

```sql
-- 阅读进度表
CREATE TABLE reading_progress (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  current_page INTEGER DEFAULT 0,
  current_chapter TEXT,
  progress_percent REAL DEFAULT 0,
  last_read_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- 书签表
CREATE TABLE bookmarks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  page_number INTEGER,
  chapter TEXT,
  position TEXT,
  note TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id)
);

-- 笔记表
CREATE TABLE notes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  book_id INTEGER NOT NULL,
  page_number INTEGER,
  chapter TEXT,
  position TEXT,
  content TEXT NOT NULL,
  color TEXT DEFAULT 'yellow',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id)
);
```

### 第三方库

**前端：**
- `epubjs` - EPUB 阅读器
- `pdfjs-dist` - PDF 阅读器
- 无需额外库处理 TXT

**后端：**
- 无需额外库

---

## 任务分解

### Task 1: 安装前端依赖 (10min)

- [ ] 安装 epubjs
- [ ] 安装 pdfjs-dist

### Task 2: 扩展数据库模型 (20min)

- [ ] 创建 reading_progress 表
- [ ] 创建 bookmarks 表
- [ ] 创建 notes 表

### Task 3: 实现阅读进度 API (30min)

- [ ] GET /api/reading/progress/:bookId - 获取阅读进度
- [ ] POST /api/reading/progress - 保存阅读进度
- [ ] GET /api/reading/history - 获取阅读历史

### Task 4: 实现书签 API (30min)

- [ ] GET /api/reading/bookmarks/:bookId - 获取书签列表
- [ ] POST /api/reading/bookmarks - 添加书签
- [ ] DELETE /api/reading/bookmarks/:id - 删除书签

### Task 5: 实现笔记 API (30min)

- [ ] GET /api/reading/notes/:bookId - 获取笔记列表
- [ ] POST /api/reading/notes - 添加笔记
- [ ] PUT /api/reading/notes/:id - 更新笔记
- [ ] DELETE /api/reading/notes/:id - 删除笔记

### Task 6: 实现文件服务 API (20min)

- [ ] GET /api/files/:id - 获取书籍文件（支持 Range 请求）

### Task 7: 实现 EPUB 阅读器组件 (1h)

- [ ] 创建 EpubReader.vue
- [ ] 集成 epubjs
- [ ] 实现翻页功能
- [ ] 实现进度保存
- [ ] 实现书签和笔记

### Task 8: 实现 PDF 阅读器组件 (1h)

- [ ] 创建 PdfReader.vue
- [ ] 集成 pdfjs-dist
- [ ] 实现翻页功能
- [ ] 实现进度保存
- [ ] 实现书签和笔记

### Task 9: 实现 TXT 阅读器组件 (30min)

- [ ] 创建 TxtReader.vue
- [ ] 实现文本分页
- [ ] 实现翻页功能
- [ ] 实现进度保存

### Task 10: 实现阅读器主页面 (1h)

- [ ] 创建 Reader.vue
- [ ] 根据文件类型切换阅读器组件
- [ ] 实现工具栏（书签、笔记、进度）
- [ ] 添加路由配置

### Task 11: 集成测试 (30min)

- [ ] 测试 EPUB 阅读功能
- [ ] 测试 PDF 阅读功能
- [ ] 测试 TXT 阅读功能
- [ ] 测试进度保存
- [ ] 测试书签和笔记

---

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| epubjs 兼容性问题 | 中 | 使用稳定版本 0.3.x |
| PDF 渲染性能 | 中 | 使用 Web Worker 优化 |
| TXT 分页精度 | 低 | 按字符数分页，简单实现 |

---

## 验收标准

1. ✅ 用户可以打开并阅读 EPUB 书籍
2. ✅ 用户可以打开并阅读 PDF 书籍
3. ✅ 用户可以打开并阅读 TXT 书籍
4. ✅ 阅读器支持翻页和跳转
5. ✅ 系统自动保存阅读进度
6. ✅ 用户可以添加书签
7. ✅ 用户可以添加笔记

---

## 下一步

审查通过后，由 phase-executor 执行实现。
