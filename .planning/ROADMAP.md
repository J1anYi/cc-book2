# Roadmap — 书籍观看系统 v0.3

## Overview

**Milestone:** v0.3 阅读器入口与书籍信息展示
**Total Phases:** 2
**Total Requirements:** 18
**Starting Phase:** Phase 7 (继续v0.2编号)

---

## Phase Summary

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|------------------|
| 7 | 书库首页与阅读入口 | 实现书库卡片展示和阅读入口 | LIBRARY-01~06, READER-01~04 | 6 |
| 8 | 书籍详情与导航优化 | 实现详情页和导航优化 | DETAILS-01~05, UPLOAD-01~03 | 5 |

---

## Phase 7: 书库首页与阅读入口

**Goal:** 将首页从上传页面改为书库页面，以卡片形式展示书籍，提供直接进入阅读器的入口

### Requirements

- LIBRARY-01: 用户访问首页时看到书库页面（而非上传页面）
- LIBRARY-02: 书库页面以卡片形式展示所有已上传书籍
- LIBRARY-03: 每张书籍卡片显示封面、标题、作者、文件类型
- LIBRARY-04: 书籍卡片显示阅读进度百分比
- LIBRARY-05: 用户可以按分类筛选书籍
- LIBRARY-06: 用户可以搜索书籍（标题、作者）
- READER-01: 用户点击书籍卡片可直接进入阅读器
- READER-02: 书库首页显示"继续阅读"区域，展示最近阅读的书籍
- READER-03: 点击"继续阅读"书籍，自动跳转到上次阅读位置
- READER-04: 阅读器页面有明确的返回书库按钮

### Success Criteria

1. 访问 / 显示书库页面而非上传页面
2. 书籍以卡片形式展示，每张卡片包含封面、标题、作者、类型、进度
3. 点击卡片直接进入阅读器阅读
4. 首页显示"继续阅读"区域，包含最近阅读的书籍
5. 阅读器有明确的返回书库按钮
6. 支持按分类筛选和搜索

### Technical Notes

- 创建 Library.vue 替代 Upload.vue 作为首页
- 创建 BookCard.vue 组件展示书籍卡片
- 修改路由配置，将 / 指向 Library
- 使用现有 API: GET /api/books, GET /api/reading/history
- 需要后端 API 支持分类筛选（已有）

---

## Phase 8: 书籍详情与导航优化

**Goal:** 实现书籍详情页，优化导航结构，完善上传入口体验

### Requirements

- DETAILS-01: 用户可从书籍卡片进入书籍详情页
- DETAILS-02: 详情页显示书籍完整元数据（标题、作者、分类、标签、上传时间）
- DETAILS-03: 详情页显示阅读进度和时间
- DETAILS-04: 详情页提供"开始阅读"或"继续阅读"按钮
- DETAILS-05: 详情页可以编辑书籍信息（分类、标签）
- UPLOAD-01: 上传功能从首页移至独立页面或导航入口
- UPLOAD-02: 上传成功后显示书籍预览并可立即开始阅读
- UPLOAD-03: 导航栏清晰展示：书库、上传、管理

### Success Criteria

1. 点击书籍卡片可进入详情页 /book/:id
2. 详情页显示完整书籍信息和阅读进度
3. 详情页有开始/继续阅读按钮
4. 详情页可编辑分类和标签
5. 导航栏清晰展示：书库、上传、管理
6. 上传成功后显示预览并可立即阅读

### Technical Notes

- 创建 BookDetail.vue 详情页
- 创建 NavBar.vue 导航组件
- 修改 Upload.vue 为独立页面 /upload
- 上传成功后跳转到详情页或直接打开阅读器
- 使用现有 API: GET /api/books/:id, PUT /api/books/:id

---

## Requirement Coverage

| Category | Total | Phase 7 | Phase 8 |
|----------|-------|---------|---------|
| LIBRARY | 6 | 6 | - |
| READER | 4 | 4 | - |
| DETAILS | 5 | - | 5 |
| UPLOAD | 3 | - | 3 |
| **Total** | **18** | **10** | **8** |

✅ 100% requirement coverage

---

## Build Order

Phase 7 → Phase 8

Phase 7 必须先完成，因为它建立了书库首页和阅读入口的基础架构。
Phase 8 在此基础上添加详情页和导航优化。

---

*Last updated: 2026-05-13*
