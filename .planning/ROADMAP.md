# Roadmap — 书籍观看系统 v0.6

## Overview

**Milestone:** v0.6 书库管理增强
**Total Phases:** 4
**Total Requirements:** 20
**Starting Phase:** Phase 14

---

## Phase Summary

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|------------------|
| 14 | 收藏夹系统 | 实现多收藏夹管理 | COLL-01~06 | 6 |
| 15 | 阅读状态 | 三状态追踪和自动更新 | STAT-01~04 | 4 |
| 16 | 多标签系统 | 结构化标签和筛选 | TAG-01~06 | 6 |
| 17 | 系列分组 | 系列管理和智能检测 | SERI-01~04 | 4 |

---

## Phase 14: 收藏夹系统 ✓ COMPLETE

**Goal:** 实现多收藏夹管理，支持书籍归属多个收藏夹
**Status:** ✅ Complete (2026-05-14)
**Plans:** 14-01 (Backend), 14-02 (Frontend)

### Requirements

- COLL-01: 创建、删除、重命名收藏夹
- COLL-02: 收藏夹图标和颜色设置
- COLL-03: 书籍添加到收藏夹（多对多）
- COLL-04: 从收藏夹移除书籍
- COLL-05: 按收藏夹筛选书籍列表
- COLL-06: 收藏夹列表显示书籍数量

### Success Criteria

1. 用户可以创建和命名收藏夹
2. 收藏夹可设置图标和颜色
3. 一本书可以属于多个收藏夹
4. 书籍列表可以按收藏夹筛选
5. 收藏夹显示包含的书籍数量
6. 删除收藏夹不影响书籍本身

### Technical Notes

**数据库扩展：**
```sql
CREATE TABLE collections (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  color TEXT,
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

**API 设计：**
- `GET /api/collections` - 获取收藏夹列表
- `POST /api/collections` - 创建收藏夹
- `PUT /api/collections/:id` - 更新收藏夹
- `DELETE /api/collections/:id` - 删除收藏夹
- `POST /api/collections/:id/books/:bookId` - 添加书籍
- `DELETE /api/collections/:id/books/:bookId` - 移除书籍

---

## Phase 15: 阅读状态 ✓ COMPLETE

**Goal:** 实现三状态追踪和自动状态更新
**Status:** ✅ Complete (2026-05-15)
**Plans:** 15-01 (Backend), 15-02 (Frontend)

### Requirements

- STAT-01: 三种阅读状态（想读、在读、已读）
- STAT-02: 手动切换阅读状态
- STAT-03: 打开书籍自动设为在读
- STAT-04: 按状态筛选书籍列表

### Success Criteria

1. 书籍有三种状态：想读、在读、已读
2. 用户可以手动切换状态
3. 打开阅读器时自动更新为在读
4. 书籍列表可按状态筛选
5. 状态筛选视图清晰易用

### Technical Notes

**数据库扩展：**
```sql
ALTER TABLE books ADD COLUMN reading_status TEXT DEFAULT 'want_to_read'
  CHECK(reading_status IN ('want_to_read', 'reading', 'read'));
```

**API 设计：**
- `PUT /api/books/:id/status` - 更新阅读状态
- `GET /api/books?status=reading` - 按状态筛选

**自动状态更新：**
- 在 Reader.vue 的 onMounted 中检测并更新状态
- 如果状态为 'want_to_read'，打开时自动设为 'reading'

---

## Phase 16: 多标签系统

**Goal:** 实现结构化标签和多标签筛选

### Requirements

- TAG-01: 创建、删除、重命名标签
- TAG-02: 标签颜色设置
- TAG-03: 为书籍添加多个标签
- TAG-04: 从书籍移除标签
- TAG-05: 按标签筛选（支持组合）
- TAG-06: 标签列表显示使用次数

### Success Criteria

1. 用户可以管理标签
2. 标签可设置颜色
3. 一本书可以有多个标签
4. 支持多标签组合筛选（AND/OR）
5. 标签列表显示使用次数
6. 标签编辑交互流畅

### Technical Notes

**数据库扩展：**
```sql
CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  color TEXT,
  created_at DATETIME
);

CREATE TABLE book_tags (
  book_id INTEGER,
  tag_id INTEGER,
  PRIMARY KEY (book_id, tag_id),
  FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);
```

**数据迁移：**
- 将现有 books.tags TEXT 字段迁移到 book_tags 表
- 解析逗号分隔的标签，创建对应记录

**API 设计：**
- `GET /api/tags` - 获取标签列表（含使用次数）
- `POST /api/tags` - 创建标签
- `PUT /api/tags/:id` - 更新标签
- `DELETE /api/tags/:id` - 删除标签
- `POST /api/books/:id/tags` - 设置书籍标签
- `GET /api/books?tags=1,2,3` - 按标签筛选

---

## Phase 17: 系列分组

**Goal:** 实现系列管理和智能检测

### Requirements

- SERI-01: 创建、删除、重命名系列
- SERI-02: 书籍分配到系列并设置顺序
- SERI-03: 按系列查看书籍列表
- SERI-04: 自动检测系列信息（可选）

### Success Criteria

1. 用户可以管理系列
2. 书籍可以分配到系列
3. 系列内书籍可排序
4. 可以按系列查看书籍
5. 可选：自动检测书名中的系列信息

### Technical Notes

**数据库扩展：**
```sql
CREATE TABLE series (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at DATETIME
);

ALTER TABLE books ADD COLUMN series_id INTEGER;
ALTER TABLE books ADD COLUMN series_index REAL;
```

**自动检测规则：**
- 匹配 "XXX 第N卷" 或 "XXX Vol.N" 模式
- 匹配 "XXX 1" "XXX 2" 等数字后缀
- 提取系列名和序号

**API 设计：**
- `GET /api/series` - 获取系列列表
- `POST /api/series` - 创建系列
- `PUT /api/series/:id` - 更新系列
- `DELETE /api/series/:id` - 删除系列
- `PUT /api/books/:id/series` - 设置书籍系列

---

## Requirement Coverage

| Category | Total | Phase 14 | Phase 15 | Phase 16 | Phase 17 |
|----------|-------|----------|----------|----------|----------|
| COLL | 6 | 6 | - | - | - |
| STAT | 4 | - | 4 | - | - |
| TAG | 6 | - | - | 6 | - |
| SERI | 4 | - | - | - | 4 |
| **Total** | **20** | **6** | **4** | **6** | **4** |

✅ 100% requirement coverage

---

## Build Order

Phase 14 → Phase 15 → Phase 16 → Phase 17

**依赖关系：**
- Phase 14 (收藏夹) 和 Phase 15 (阅读状态) 可并行
- Phase 16 (标签) 需要迁移现有 tags 数据
- Phase 17 (系列) 相对独立，可最后实现

---

*Last updated: 2026-05-15*
