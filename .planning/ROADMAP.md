# Roadmap — 书籍观看系统 v0.4

## Overview

**Milestone:** v0.4 前端 UI/UX 优化
**Total Phases:** 3
**Total Requirements:** 22
**Starting Phase:** Phase 9

---

## Phase Summary

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|------------------|
| 9 | 设计系统与全局样式 | 建立统一的设计系统 | DESIGN-01~04 | 4 |
| 10 | 核心组件优化 | 优化导航、卡片、首页 | NAVBAR-01~03, CARD-UI-01~05, LIBRARY-UI-01~04 | 12 |
| 11 | 页面完善优化 | 优化详情、阅读器、上传、管理 | DETAIL-UI-01~04, READER-UI-01~03, UPLOAD-UI-01~03, ADMIN-UI-01~03 | 13 |

---

## Phase 9: 设计系统与全局样式

**Goal:** 建立统一的设计系统，定义颜色、字体、间距变量

### Requirements

- DESIGN-01: 建立统一的设计系统（颜色、字体、间距变量）
- DESIGN-02: 定义清新的配色方案（主色、辅色、背景色）
- DESIGN-03: 统一字体系统（标题、正文、小字）
- DESIGN-04: 定义间距和圆角规范

### Success Criteria

1. 创建 CSS 变量文件，定义所有设计 token
2. 颜色系统完整（主色、辅色、背景、文字、边框）
3. 字体系统完整（标题、正文、小字）
4. 间距和圆角规范定义

### Technical Notes

- 创建 `src/styles/design-system.css` 或 `src/styles/variables.css`
- 使用 CSS 自定义属性（CSS Variables）
- 在 App.vue 或 main.ts 中引入

---

## Phase 10: 核心组件优化

**Goal:** 优化导航栏、书籍卡片、书库首页的视觉效果

### Requirements

- NAVBAR-01: 现代化导航栏设计（毛玻璃效果/阴影）
- NAVBAR-02: 品牌标识优化（logo + 名称）
- NAVBAR-03: 导航项交互优化（hover/active 状态）
- CARD-UI-01: 卡片阴影和圆角优化
- CARD-UI-02: 封面占位图优化（渐变背景）
- CARD-UI-03: 卡片信息层次优化（标题、作者、标签）
- CARD-UI-04: 进度条视觉优化
- CARD-UI-05: 卡片 hover 动画优化
- LIBRARY-UI-01: 搜索框现代化设计（图标、圆角、阴影）
- LIBRARY-UI-02: 分类筛选器优化（标签式/下拉式）
- LIBRARY-UI-03: 继续阅读区域卡片优化
- LIBRARY-UI-04: 书籍网格响应式优化

### Success Criteria

1. 导航栏视觉现代化
2. 书籍卡片视觉优化
3. 书库首页搜索和筛选优化
4. 响应式布局优化

### Technical Notes

- 修改 NavBar.vue, BookCard.vue, Library.vue
- 使用设计系统变量
- 添加过渡动画

---

## Phase 11: 页面完善优化

**Goal:** 优化详情页、阅读器、上传页、管理页的视觉效果

### Requirements

- DETAIL-UI-01: 详情页布局优化（两栏/卡片式）
- DETAIL-UI-02: 书籍信息展示优化
- DETAIL-UI-03: 操作按钮样式优化
- DETAIL-UI-04: 编辑表单样式优化
- READER-UI-01: 阅读器控制栏优化
- READER-UI-02: 翻页按钮样式优化
- READER-UI-03: 阅读器工具栏（书签、笔记按钮）
- UPLOAD-UI-01: 上传区域拖拽优化
- UPLOAD-UI-02: 上传进度展示优化
- UPLOAD-UI-03: 成功反馈动画
- ADMIN-UI-01: 管理页面布局优化
- ADMIN-UI-02: 表格样式优化
- ADMIN-UI-03: 操作按钮统一

### Success Criteria

1. 详情页视觉优化
2. 阅读器控制栏优化
3. 上传页体验优化
4. 管理页视觉统一

### Technical Notes

- 修改 BookDetail.vue, Reader.vue, Upload.vue, Admin.vue
- 修改阅读器组件 EpubReader.vue, PdfReader.vue, TxtReader.vue
- 统一按钮和表单样式

---

## Requirement Coverage

| Category | Total | Phase 9 | Phase 10 | Phase 11 |
|----------|-------|---------|----------|----------|
| DESIGN | 4 | 4 | - | - |
| NAVBAR | 3 | - | 3 | - |
| CARD-UI | 5 | - | 5 | - |
| LIBRARY-UI | 4 | - | 4 | - |
| DETAIL-UI | 4 | - | - | 4 |
| READER-UI | 3 | - | - | 3 |
| UPLOAD-UI | 3 | - | - | 3 |
| ADMIN-UI | 3 | - | - | 3 |
| **Total** | **29** | **4** | **12** | **13** |

✅ 100% requirement coverage

---

## Build Order

Phase 9 → Phase 10 → Phase 11

Phase 9 必须先完成，建立设计系统基础。
Phase 10 在设计系统基础上优化核心组件。
Phase 11 最后完成所有页面的优化。

---

*Last updated: 2026-05-14*
