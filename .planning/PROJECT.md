# 书籍观看系统

## What This Is

个人书库管理系统，支持上传、管理和在线阅读电子书。

**核心价值：** 上传书籍 → 在线阅读 → 管理收藏

## Current Milestone: v0.5 深色模式与高亮标注

**Goal:** 提升阅读体验 - 夜间阅读 + 笔记质量

**Target features:**
- 深色模式（系统跟随、手动切换、持久化）
- 高亮标注（划线选择、颜色标记、笔记关联）

## Requirements

### Active (v0.5)

- DARK-01~05: 深色模式实现
- HIGHLIGHT-01~06: 高亮标注功能

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
- ✓ 统一设计系统 — v0.4
- ✓ 前端 UI/UX 优化 — v0.4

### Out of Scope

- 多用户注册系统 — 个人书库，简单认证即可
- 云端同步 — 本地部署为主
- 社交功能 — 非社区平台
- 移动端 App — Web 端优先
- 全文搜索 — 技术复杂度高
- 阅读统计 — 后续版本

## Technical Context

- **前端：** Vue 3 + Vite + TypeScript
- **后端：** Express + TypeScript
- **数据库：** SQLite (better-sqlite3)
- **书籍格式：** EPUB, PDF, TXT
- **架构：** 前后端分离，REST API
- **阅读器库：** epubjs, pdfjs-dist
- **设计系统：** CSS Variables（支持主题切换）

## Evolution

<details>
<summary>v0.5 (2026-05-14)</summary>

**Goal:** 深色模式与高亮标注

**Focus:**
- 深色模式：系统跟随、手动切换、持久化
- 高亮标注：划线选择、颜色标记、笔记关联

**Stats:** 2 phases, 11 requirements (planned)

</details>

<details>
<summary>v0.4 (2026-05-14)</summary>

**Goal:** 前端 UI/UX 优化

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
