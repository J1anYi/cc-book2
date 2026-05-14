# 书籍观看系统

## What This Is

个人书库管理系统，支持上传、管理和在线阅读电子书。

**核心价值：** 上传书籍 → 在线阅读 → 管理收藏

## Current State: v0.4 ✅

**Last Shipped:** v0.4 前端 UI/UX 优化 (2026-05-14)

**Key Features:**
- 统一设计系统（翠绿主色 #10B981、靛蓝辅色 #6366F1）
- 现代化导航栏和书籍卡片
- 响应式布局
- 所有页面视觉优化

## Next Milestone Goals

待定 - 运行 `/gsd-new-milestone` 开始规划

## Requirements

### Validated (All Milestones)

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
- ✓ 统一设计系统 — v0.4
- ✓ 前端 UI/UX 优化 — v0.4

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
- **设计系统：** CSS Variables

## Evolution

<details>
<summary>v0.4 (2026-05-14)</summary>

**Goal:** 前端 UI/UX 优化

**Accomplishments:**
- 设计系统建立（翠绿主色、靛蓝辅色）
- 核心组件优化（NavBar、BookCard、Library）
- 页面视觉统一（BookDetail、Upload、Admin、Reader）

**Stats:** 3 phases, 29 requirements, +2,351/-547 lines

</details>

<details>
<summary>v0.3 (2026-05-14)</summary>

**Goal:** 阅读器入口与书籍信息展示

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
