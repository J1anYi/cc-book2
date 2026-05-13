# PLAN — Phase 2: 书籍管理后台

## 目标

实现书库管理和简单认证功能。

---

## Requirements 覆盖

| ID | Requirement | 状态 |
|----|-------------|------|
| MANAGE-01 | 用户可以查看书库列表 | 待实现 |
| MANAGE-02 | 用户可以搜索书籍（按标题/作者） | 待实现 |
| MANAGE-03 | 用户可以删除书籍 | 待实现 |
| MANAGE-04 | 用户可以为书籍添加分类/标签 | 待实现 |
| MANAGE-05 | 管理后台有简单密码认证 | 待实现 |

---

## 技术方案

### 后端扩展

```
backend/
├── src/
│   ├── routes/
│   │   ├── books.ts      # 扩展：搜索、删除
│   │   └── admin.ts      # 新增：管理认证
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   └── auth.ts       # 新增：密码认证中间件
│   └── models/
│       ├── book.ts       # 扩展：分类/标签字段
│       └── category.ts   # 新增：分类模型
```

### 前端扩展

```
frontend/
├── src/
│   ├── views/
│   │   ├── Upload.vue    # 已有
│   │   └── Admin.vue     # 新增：管理后台
│   ├── api/
│   │   └── books.ts      # 扩展：搜索、删除、分类
│   └── router/
│       └── index.ts      # 新增：路由配置
```

### 数据库扩展

```sql
-- 添加分类/标签字段
ALTER TABLE books ADD COLUMN category TEXT;
ALTER TABLE books ADD COLUMN tags TEXT;

-- 分类表
CREATE TABLE categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

---

## 任务分解

### Task 1: 实现管理员认证 (30min)

- [ ] 创建 `backend/src/middleware/auth.ts`
- [ ] 实现简单密码验证
- [ ] 添加 `/api/admin/login` 端点
- [ ] 返回 session token

### Task 2: 扩展书籍 API (45min)

- [ ] 添加搜索功能 (GET /api/books?search=xxx)
- [ ] 添加删除功能 (DELETE /api/books/:id)
- [ ] 添加分类/标签字段

### Task 3: 实现分类 API (30min)

- [ ] 创建分类表
- [ ] CRUD API (GET, POST, PUT, DELETE)
- [ ] 书籍-分类关联

### Task 4: 实现管理后台前端 (1h)

- [ ] 创建 `Admin.vue` 组件
- [ ] 登录页面
- [ ] 书库管理页面（列表、搜索、删除）
- [ ] 分类管理页面

### Task 5: 添加路由 (20min)

- [ ] 配置 Vue Router
- [ ] 路由守卫（认证检查）

### Task 6: 集成测试 (30min)

- [ ] 测试管理员登录
- [ ] 测试书籍搜索
- [ ] 测试删除功能
- [ ] 测试分类管理

---

## 风险评估

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 简单认证安全性有限 | 中 | 仅限本地使用，生产环境需升级 |
| 分类功能复杂度 | 低 | 简化实现，标签用逗号分隔存储 |

---

## 验收标准

1. ✅ 管理员可以通过密码登录
2. ✅ 书库列表支持搜索和分页
3. ✅ 可以删除书籍
4. ✅ 可以为书籍添加分类/标签
5. ✅ 未登录无法访问管理后台

---

## 下一步

审查通过后，由 phase-executor 执行实现。
