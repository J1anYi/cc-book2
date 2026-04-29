# Roadmap — 书籍观看系统

## Overview

**Project:** 书籍观看系统  
**Phases:** 3  
**Requirements:** 17  
**Strategy:** 基础设施 → 管理功能 → 阅读体验

---

## Phases

### Phase 1: 项目基础与书籍上传

**Goal:** 搭建前后端基础架构，实现书籍上传功能

**Requirements:** UPLOAD-01, UPLOAD-02, UPLOAD-03, UPLOAD-04, UPLOAD-05, ARCH-01, ARCH-02, ARCH-03, ARCH-04

**Success Criteria:**
1. 用户可以通过前端页面上传 EPUB/PDF/TXT 文件
2. 后端 API 正确接收并保存文件到 data 目录
3. SQLite 数据库正确存储书籍元数据
4. 前后端可以独立启动和运行

**Plans:**
1. 初始化后端项目（Express + TypeScript + SQLite）
2. 初始化前端项目（Vue3 + Vite + TypeScript）
3. 实现书籍上传 API
4. 实现书籍上传前端页面

---

### Phase 2: 书籍管理后台

**Goal:** 实现书库管理和简单认证

**Requirements:** MANAGE-01, MANAGE-02, MANAGE-03, MANAGE-04, MANAGE-05

**Success Criteria:**
1. 管理员可以通过密码登录后台
2. 用户可以查看、搜索、删除书籍
3. 用户可以为书籍添加分类/标签
4. 书库列表支持分页和排序

**Plans:**
1. 实现管理员认证中间件
2. 实现书籍 CRUD API
3. 实现书库管理前端页面
4. 实现分类/标签功能

---

### Phase 3: 在线阅读器

**Goal:** 实现三种格式书籍的在线阅读和阅读辅助功能

**Requirements:** READ-01, READ-02, READ-03, READ-04, READ-05, READ-06, READ-07

**Success Criteria:**
1. 用户可以在浏览器中阅读 EPUB/PDF/TXT 书籍
2. 阅读器支持翻页和跳转
3. 系统自动保存阅读进度
4. 用户可以添加书签和笔记

**Plans:**
1. 实现 EPUB 阅读器（使用 epub.js）
2. 实现 PDF 阅读器（使用 pdf.js）
3. 实现 TXT 阅读器
4. 实现阅读进度保存
5. 实现书签和笔记功能

---

## Requirement Coverage

| Phase | Requirements | Count |
|-------|--------------|-------|
| Phase 1 | UPLOAD-01~05, ARCH-01~04 | 9 |
| Phase 2 | MANAGE-01~05 | 5 |
| Phase 3 | READ-01~07 | 7 |
| **Total** | | **21** |

✓ All v1 requirements covered

---
*Last updated: 2026-04-29*
