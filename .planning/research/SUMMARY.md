# Research Summary: 书库管理增强 (v0.6)

**Research Date:** 2026-05-14
**Focus:** 分类/收藏夹、多标签、阅读状态、智能分组

---

## 1. 行业最佳实践

### Calibre (黄金标准)

Calibre 是最成熟的开源电子书管理软件，有以下关键特性：

**组织功能：**
- **Library Views**: 按封面、标题、标签、作者、出版社等浏览
- **Custom Columns**: 用户自定义字段（可创建任意元数据字段）
- **Tags**: 多标签系统，一本书可有多个标签
- **Series**: 系列支持，自动排序
- **Advanced Search**: 基于标签、作者、评论等的复杂搜索

**元数据管理：**
- 自动下载元数据（标题、作者、ISBN、封面、简介）
- 编辑/创建自定义元数据字段
- 追踪已读/喜欢的书

### 阅读追踪应用 (Bookmory, Bookly, Literal, Goodreads)

**阅读状态 (Reading Status):**
- Want to Read (想读)
- Reading (在读)
- Read (已读)

**进度追踪：**
- 年度/每日阅读目标
- 页数/分钟追踪
- 阅读计时器
- 阅读连续天数 (streak)
- 日历视图
- 统计数据

### Tags vs Collections 对比

| 特性 | Tags (标签) | Collections (收藏夹) |
|------|-------------|---------------------|
| 数量 | 每项可有多个 | 每项通常在一个或少数几个 |
| 用途 | 灵活标记、跨类型分组 | 大类分组、文件夹式组织 |
| UI | 标签云、多选 | 文件夹列表、单选或多选 |
| 典型例子 | "技术", "前端", "推荐" | "技术书", "小说", "历史" |

---

## 2. 当前系统分析

### 现有数据结构

```sql
-- books 表
category TEXT,        -- 旧字段？
category_id INTEGER,  -- 外键到 categories
tags TEXT,            -- 文本字段，非结构化

-- categories 表
id INTEGER PRIMARY KEY,
name TEXT NOT NULL UNIQUE,
description TEXT

-- reading_progress 表
book_id INTEGER,
current_page INTEGER,
progress_percent REAL,
last_read_at DATETIME
-- 缺少 reading_status 字段
```

### 现有问题

1. **tags 字段是 TEXT 类型** - 无法高效查询，无法建立关联
2. **缺少 reading_status** - 无法区分"想读/在读/已读"
3. **category_id 是单选** - 一本书只能属于一个分类
4. **缺少 series 支持** - 无法按系列组织

---

## 3. 建议的数据结构

### 3.1 Collections (收藏夹) - 多对多

```sql
CREATE TABLE collections (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,           -- emoji 或图标名
  color TEXT,          -- 主题色
  sort_order INTEGER,  -- 自定义排序
  created_at DATETIME
);

CREATE TABLE book_collections (
  book_id INTEGER,
  collection_id INTEGER,
  added_at DATETIME,
  PRIMARY KEY (book_id, collection_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
);
```

### 3.2 Tags (标签) - 多对多

```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,          -- 标签颜色
  usage_count INTEGER DEFAULT 0  -- 用于排序/推荐
);

CREATE TABLE book_tags (
  book_id INTEGER,
  tag_id INTEGER,
  PRIMARY KEY (book_id, tag_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

### 3.3 Reading Status (阅读状态)

```sql
-- 方案 A: 在 reading_progress 表添加字段
ALTER TABLE reading_progress ADD COLUMN status TEXT 
  CHECK(status IN ('want_to_read', 'reading', 'read'));

-- 方案 B: 在 books 表添加字段 (推荐)
ALTER TABLE books ADD COLUMN reading_status TEXT DEFAULT 'want_to_read'
  CHECK(reading_status IN ('want_to_read', 'reading', 'read'));
```

### 3.4 Series (系列)

```sql
CREATE TABLE series (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT
);

-- 在 books 表添加
ALTER TABLE books ADD COLUMN series_id INTEGER;
ALTER TABLE books ADD COLUMN series_index REAL;  -- 支持小数如 1.5
```

---

## 4. 功能优先级建议

基于用户反馈（分类整理功能弱是最大短板）：

| 优先级 | 功能 | 复杂度 | 价值 |
|--------|------|--------|------|
| P0 | Collections (收藏夹) | 中 | 高 |
| P1 | Reading Status (阅读状态) | 低 | 高 |
| P2 | Tags (多标签) | 中 | 中 |
| P3 | Series (系列分组) | 中 | 中 |
| P4 | Smart Grouping (智能分组) | 高 | 中 |

---

## 5. 实现建议

### Phase 14: Collections (收藏夹系统)
- 数据库: collections + book_collections 表
- 后端: CRUD API
- 前端: 收藏夹列表、添加/移除书籍、按收藏夹筛选

### Phase 15: Reading Status (阅读状态)
- 数据库: books.reading_status 字段
- 后端: 更新状态 API
- 前端: 状态切换按钮、状态筛选视图

### Phase 16: Tags (多标签系统)
- 数据库: tags + book_tags 表
- 后端: CRUD API、标签自动补全
- 前端: 标签编辑、标签云、按标签筛选

### Phase 17: Series (系列分组) - 可选
- 数据库: series 表、books 系列字段
- 后端: 系列管理 API
- 前端: 系列视图、自动检测系列

---

## 6. 技术注意事项

1. **数据迁移**: 需要将现有 tags TEXT 字段迁移到 book_tags 表
2. **向后兼容**: 保留 category_id 但推荐使用 collections
3. **性能**: 为 book_collections 和 book_tags 创建索引
4. **UI 设计**: 参考 Calibre 的三栏视图（收藏夹列表 | 书籍网格 | 详情）

---

*Research completed: 2026-05-14*
