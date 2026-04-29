# 书籍观看系统

## What This Is

个人书库管理系统，支持上传、管理和在线阅读电子书。

**核心价值：** 上传书籍 → 在线阅读 → 管理收藏

## Core Value

用户可以上传自己的电子书，在浏览器中阅读，管理个人书库。

## Context

### Technical Context

- **前端：** Vue3 + Vite + TypeScript
- **后端：** Express + TypeScript  
- **数据库：** SQLite
- **书籍格式：** EPUB, PDF, TXT
- **架构：** 前后端分离，REST API

### User Context

- 单用户或小团队使用
- 本地部署为主
- 简单认证即可

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] 用户可以上传书籍文件（EPUB/PDF/TXT）
- [ ] 用户可以在浏览器中阅读书籍
- [ ] 用户可以管理书库（分类、删除、搜索）
- [ ] 阅读器支持翻页、进度保存、书签/笔记
- [ ] 管理后台有简单认证保护

### Out of Scope

- 多用户注册系统 — 个人书库，简单认证即可
- 云端同步 — 本地部署为主
- 社交功能 — 非社区平台

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Node.js 全栈 | 前后端统一语言，EPUB/PDF 库丰富 | — Pending |
| SQLite | 轻量数据库，无需额外服务 | — Pending |
| Vue3 + Vite | 现代前端工具链，开发体验好 | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-04-29 after initialization*
