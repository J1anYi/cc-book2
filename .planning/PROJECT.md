# 书籍观看系统

## What This Is

个人书库管理系统，支持上传、管理和在线阅读电子书。

**核心价值：** 上传书籍 → 在线阅读 → 管理收藏

## Current Milestone: v0.4 前端 UI/UX 优化

**Goal:** 优化前端界面，采用清新、现代风格

**Target features:**
- 统一的设计系统（颜色、字体、间距）
- 导航栏现代化设计
- 书籍卡片视觉优化
- 书库首页布局优化
- 详情页、阅读器、上传页、管理页优化

## Requirements

### Active (v0.4)

- DESIGN-01~04: 设计系统建立
- NAVBAR-01~03: 导航栏优化
- CARD-UI-01~05: 卡片优化
- LIBRARY-UI-01~04: 书库首页优化
- DETAIL-UI-01~04: 详情页优化
- READER-UI-01~03: 阅读器优化
- UPLOAD-UI-01~03: 上传页优化
- ADMIN-UI-01~03: 管理页优化

### Validated (Previous)

- ✓ 书籍上传功能（EPUB/PDF/TXT） — v0.1
- ✓ 在线阅读器（三种格式） — v0.1
- ✓ 书库管理（分类、删除、搜索） — v0.1
- ✓ 阅读辅助功能（进度保存、书签、笔记） — v0.1
- ✓ 管理后台认证 — v0.1
- ✓ JWT认证替换硬编码凭证 — v0.2
- ✓ 速率限制、输入验证、CORS配置 — v0.2
- ✓ 书籍列表分页、元数据提取 — v0.2
- ✓ 书库首页展示 — v0.3
- ✓ 书籍详情页 — v0.3
- ✓ 导航优化 — v0.3

### Out of Scope

- 多用户注册系统 — 个人书库，简单认证即可
- 云端同步 — 本地部署为主
- 社交功能 — 非社区平台
- 移动端 App — Web 端优先
- 深色模式 — 后续版本
- 主题切换 — 后续版本

## Technical Context

- **前端：** Vue 3 + Vite + TypeScript
- **后端：** Express + TypeScript
- **数据库：** SQLite (better-sqlite3)
- **书籍格式：** EPUB, PDF, TXT
- **架构：** 前后端分离，REST API
- **阅读器库：** epubjs, pdfjs-dist

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Node.js 全栈 | 前后端统一语言，EPUB/PDF 库丰富 | ✓ Good |
| SQLite | 轻量数据库，无需额外服务 | ✓ Good |
| Vue3 + Vite | 现代前端工具链，开发体验好 | ✓ Good |
| epubjs + pdfjs-dist | 成熟的阅读器库，社区活跃 | ✓ Good |
| CSS Variables | 设计系统实现方式 | ✓ Modern |

## Evolution

<details>
<summary>v0.4 (2026-05-14)</summary>

**Goal:** 前端 UI/UX 优化

**Focus:**
- 清新、现代风格
- 统一设计系统
- 组件视觉优化

**Stats:** 3 phases, 29 requirements

</details>

<details>
<summary>v0.3 (2026-05-14)</summary>

**Goal:** 阅读器入口与书籍信息展示

**Accomplishments:**
- 书库首页重构为卡片式展示
- 书籍详情页实现
- 导航优化
- EPUB阅读器修复（章节导航）

**Stats:** 2 phases, 18 requirements, +3,740/-639 lines

</details>

<details>
<summary>v0.2 (2026-05-01)</summary>

**Goal:** 安全加固与功能完善

**Stats:** 3 phases, 18 requirements

</details>

<details>
<summary>v0.1 (2026-04-29)</summary>

**Goal:** 初始版本

**Stats:** 3 phases

</details>

---

*Last updated: 2026-05-14*
