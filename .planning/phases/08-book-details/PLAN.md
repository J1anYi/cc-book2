# Phase 8: 书籍详情与导航优化

**Goal:** 实现书籍详情页，优化导航结构，完善上传入口体验

**Status:** ✅ COMPLETE

---

## Requirements

- DETAILS-01: 用户可从书籍卡片进入书籍详情页
- DETAILS-02: 详情页显示书籍完整元数据（标题、作者、分类、标签、上传时间）
- DETAILS-03: 详情页显示阅读进度和时间
- DETAILS-04: 详情页提供"开始阅读"或"继续阅读"按钮
- DETAILS-05: 详情页可以编辑书籍信息（分类、标签）
- UPLOAD-01: 上传功能从首页移至独立页面或导航入口 ✅ (Phase 7完成)
- UPLOAD-02: 上传成功后显示书籍预览并可立即开始阅读 ✅ (Phase 7完成)
- UPLOAD-03: 导航栏清晰展示：书库、上传、管理 ✅ (Phase 7完成)

---

## Current State Analysis

### Already Completed (Phase 7)

| Item | Status | Notes |
|------|--------|-------|
| NavBar.vue | ✅ | 书库、上传、管理导航 |
| Upload.vue 独立页面 | ✅ | /upload 路由 |
| 上传成功后预览/阅读 | ✅ | 显示"查看书库"和"立即阅读"按钮 |
| BookCard.vue | ✅ | 但点击直接进入阅读器 |
| Library.vue | ✅ | 书库首页 |

### Needs Implementation

| Item | Description |
|------|-------------|
| BookDetail.vue | 书籍详情页组件 |
| /book/:id 路由 | 详情页路由 |
| BookCard 修改 | 添加详情页入口（或区分点击区域） |
| 后端 PATCH /api/books/:id | 更新书籍分类、标签的 API |

---

## Tasks

### Task 1: 后端添加书籍更新 API
**File:** `backend/src/routes/books.ts`

添加 PATCH /api/books/:id 路由，支持更新 category 和 tags。

```typescript
router.patch('/:id', authMiddleware, validateParams(idParamSchema), async (req, res) => {
  const { category, tags } = req.body;
  const database = db();
  // 更新书籍信息
});
```

**Verification:**
- [ ] PATCH /api/books/:id 返回更新后的书籍信息
- [ ] 未认证请求返回 401
- [ ] 书籍不存在返回 404

---

### Task 2: 创建 BookDetail.vue 详情页
**File:** `frontend/src/views/BookDetail.vue`

组件功能：
1. 显示书籍完整信息（标题、作者、分类、标签、文件类型、上传时间）
2. 显示阅读进度百分比和最后阅读时间
3. "开始阅读"或"继续阅读"按钮
4. 编辑分类和标签的表单
5. 保存按钮

**Verification:**
- [ ] 显示书籍元数据
- [ ] 显示阅读进度
- [ ] 有阅读按钮
- [ ] 可编辑并保存分类/标签

---

### Task 3: 添加详情页路由
**File:** `frontend/src/router/index.ts`

添加路由：
```typescript
{
  path: '/book/:id',
  name: 'BookDetail',
  component: () => import('../views/BookDetail.vue')
}
```

**Verification:**
- [ ] /book/1 显示书籍详情页

---

### Task 4: 修改 BookCard 组件添加详情入口
**File:** `frontend/src/components/BookCard.vue`

方案：添加一个小的"详情"图标按钮，点击进入详情页。
主卡片点击仍然进入阅读器。

实现：
1. 添加一个 info 图标按钮 (ℹ️ 或 SVG)
2. 点击图标阻止冒泡，跳转到 /book/:id
3. 样式：右上角或右下角的小按钮

**Verification:**
- [ ] 点击卡片主体进入阅读器
- [ ] 点击详情图标进入详情页

---

### Task 5: 更新 Library.vue 集成详情页
**File:** `frontend/src/views/Library.vue`

确保 Library 页面可以正确导航到详情页。

**Verification:**
- [ ] 从书库卡片可以进入详情页

---

## Success Criteria

1. ✅ 点击书籍卡片的详情图标可进入详情页 /book/:id
2. ✅ 详情页显示完整书籍信息和阅读进度
3. ✅ 详情页有开始/继续阅读按钮
4. ✅ 详情页可编辑分类和标签
5. ✅ 导航栏清晰展示：书库、上传、管理（Phase 7已完成）
6. ✅ 上传成功后显示预览并可立即阅读（Phase 7已完成）

---

## Files Modified

| File | Action |
|------|--------|
| `backend/src/routes/books.ts` | Modify - 添加 PATCH 路由 |
| `frontend/src/views/BookDetail.vue` | Create - 详情页组件 |
| `frontend/src/router/index.ts` | Modify - 添加详情页路由 |
| `frontend/src/components/BookCard.vue` | Modify - 添加详情入口按钮 |

---

## Dependencies

- Phase 7 必须完成 ✅
- 后端需要 authMiddleware（已有）

---

*Created: 2026-05-13*
