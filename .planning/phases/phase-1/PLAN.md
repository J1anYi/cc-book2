# PLAN — Phase 1: 项目基础与书籍上传

## 目标

搭建前后端基础架构，实现书籍上传功能。

---

## Requirements 覆盖

| ID | Requirement | 状态 |
|----|-------------|------|
| UPLOAD-01 | 用户可以上传 EPUB 格式的书籍文件 | 待实现 |
| UPLOAD-02 | 用户可以上传 PDF 格式的书籍文件 | 待实现 |
| UPLOAD-03 | 用户可以上传 TXT 格式的书籍文件 | 待实现 |
| UPLOAD-04 | 系统自动提取书籍元数据 | 待实现 |
| UPLOAD-05 | 上传的书籍保存到 data 目录 | 待实现 |
| ARCH-01 | 前端 Vue3 + Vite + TypeScript 独立项目 | 待实现 |
| ARCH-02 | 后端 Express + TypeScript REST API | 待实现 |
| ARCH-03 | SQLite 数据库存储书籍元数据 | 待实现 |
| ARCH-04 | 前后端分离部署 | 待实现 |

---

## 技术方案

### 后端架构

```
backend/
├── src/
│   ├── index.ts          # 入口文件
│   ├── routes/
│   │   └── books.ts      # 书籍 API 路由
│   ├── middleware/
│   │   └── upload.ts     # 文件上传中间件
│   ├── models/
│   │   └── book.ts       # 书籍数据模型
│   └── utils/
│       └── metadata.ts   # 元数据提取工具
├── package.json
└── tsconfig.json
```

### 前端架构

```
frontend/
├── src/
│   ├── App.vue           # 根组件
│   ├── views/
│   │   └── Upload.vue    # 上传页面
│   ├── api/
│   │   └── books.ts      # API 调用
│   └── main.ts
├── package.json
└── vite.config.ts
```

### 数据库设计

```sql
CREATE TABLE books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  author TEXT,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,  -- EPUB/PDF/TXT
  cover_path TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 任务分解

### Task 1: 初始化后端项目 (1h)

- [ ] 创建 backend/ 目录
- [ ] 初始化 npm 项目
- [ ] 配置 TypeScript
- [ ] 安装 Express, multer, sqlite3, better-sqlite3
- [ ] 创建基础服务器结构

### Task 2: 初始化前端项目 (1h)

- [ ] 创建 frontend/ 目录
- [ ] 使用 Vite 创建 Vue3 + TS 项目
- [ ] 安装 axios 用于 API 调用
- [ ] 配置开发服务器代理

### Task 3: 实现数据库和模型 (30min)

- [ ] 创建 SQLite 数据库文件
- [ ] 创建 books 表
- [ ] 实现基本的 CRUD 操作

### Task 4: 实现上传 API (1.5h)

- [ ] 配置 multer 文件上传中间件
- [ ] POST /api/books - 上传书籍
- [ ] 保存文件到 data/ 目录
- [ ] 提取元数据（标题、作者）

### Task 5: 实现上传前端页面 (1h)

- [ ] 创建上传组件
- [ ] 文件选择和预览
- [ ] 调用上传 API
- [ ] 显示上传进度和结果

### Task 6: 集成测试 (30min)

- [ ] 测试 EPUB 上传
- [ ] 测试 PDF 上传
- [ ] 测试 TXT 上传
- [ ] 验证数据存储

---

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| EPUB 元数据提取复杂 | 中 | 先实现基础功能，复杂元数据后期优化 |
| 文件上传大小限制 | 低 | 配置合理的文件大小限制 (50MB) |
| 前后端跨域问题 | 低 | Vite 代理 + Express CORS |

---

## 验收标准

1. ✅ 后端服务可以独立启动 (npm run dev)
2. ✅ 前端服务可以独立启动 (npm run dev)
3. ✅ 用户可以通过前端上传 EPUB/PDF/TXT 文件
4. ✅ 文件保存到 data/ 目录
5. ✅ 元数据保存到 SQLite 数据库
6. ✅ 可以通过 API 查询已上传的书籍列表

---

## 下一步

计划完成后，由 phase-reviewer 审查，审查通过后 phase-executor 执行实现。
