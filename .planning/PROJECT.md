# 书籍观看系统

## What This Is

个人书库管理系统，支持上传、管理和在线阅读电子书。已实现完整的书籍上传、管理和阅读功能。

**核心价值：** 上传书籍 → 在线阅读 → 管理收藏

## Core Value

用户可以上传自己的电子书，在浏览器中阅读，管理个人书库。

## Context

### Technical Context

- **前端：** Vue 3 + Vite + TypeScript
- **后端：** Express + TypeScript
- **数据库：** SQLite (better-sqlite3)
- **书籍格式：** EPUB, PDF, TXT
- **架构：** 前后端分离，REST API
- **阅读器库：** epubjs, pdfjs-dist

### User Context

- 单用户或小团队使用
- 本地部署为主
- 简单认证即可

## Current Milestone: v0.3 阅读器入口与书籍信息展示

**Goal:** 让用户上传书籍后能看到完整书籍信息，并能直接进入阅读器

**Target features:**
- 书库首页：展示所有已上传书籍的卡片式列表（封面、标题、作者、类型、阅读进度）
- 阅读入口：从书籍卡片直接进入阅读器
- 书籍详情页：查看书籍的完整信息和元数据
- 继续阅读：显示最近阅读的书籍，一键继续
- 前端导航优化：重新组织页面结构，突出书库和阅读功能

## Requirements

### Validated

- ✓ 书籍上传功能（EPUB/PDF/TXT） — v0.1
- ✓ 在线阅读器（三种格式） — v0.1
- ✓ 书库管理（分类、删除、搜索） — v0.1
- ✓ 阅读辅助功能（进度保存、书签、笔记） — v0.1
- ✓ 管理后台认证 — v0.1
- ✓ JWT认证替换硬编码凭证 — v0.2
- ✓ 速率限制、输入验证、CORS配置 — v0.2
- ✓ 书籍列表分页、元数据提取 — v0.2
- ✓ 测试框架、统一错误处理 — v0.2

### Active

v0.3 Requirements:
- 书库首页展示 (LIBRARY)
- 阅读入口体验 (READER)
- 书籍详情页 (DETAILS)

### Out of Scope

- 多用户注册系统 — 个人书库，简单认证即可
- 云端同步 — 本地部署为主
- 社交功能 — 非社区平台
- 移动端 App — Web 端优先

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Node.js 全栈 | 前后端统一语言，EPUB/PDF 库丰富 | ✓ Good |
| SQLite | 轻量数据库，无需额外服务 | ✓ Good |
| Vue3 + Vite | 现代前端工具链，开发体验好 | ✓ Good |
| epubjs + pdfjs-dist | 成熟的阅读器库，社区活跃 | ✓ Good |

## Evolution

This document evolves at phase transitions and milestone boundaries.

---
*Last updated: 2026-05-13 starting v0.3 milestone*
