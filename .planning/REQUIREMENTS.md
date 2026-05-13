# Requirements — 书籍观看系统

## v0.2 Requirements

### 安全加固 (SECURITY)

- [ ] **SECURITY-01**: 使用JWT替换硬编码凭证进行认证
- [ ] **SECURITY-02**: 登录端点添加速率限制防止暴力破解
- [ ] **SECURITY-03**: 配置CORS限制允许的源
- [ ] **SECURITY-04**: 添加helmet安全头中间件
- [ ] **SECURITY-05**: 实现输入验证（使用Zod或Joi）
- [ ] **SECURITY-06**: 文件上传时验证真实文件类型（magic number检查）
- [ ] **SECURITY-07**: 实现完整的登出功能（token失效）

### 功能完善 (FEATURES)

- [ ] **FEATURE-01**: 书籍列表分页（默认每页20条）
- [ ] **FEATURE-02**: EPUB元数据提取（标题、作者、封面）
- [ ] **FEATURE-03**: PDF元数据提取（标题、作者）
- [ ] **FEATURE-04**: 数据库添加搜索索引优化
- [ ] **FEATURE-05**: 异步文件操作（非阻塞事件循环）
- [ ] **FEATURE-06**: 环境变量配置支持（端口、数据库路径等）

### 质量保障 (QUALITY)

- [ ] **QUALITY-01**: 引入Vitest测试框架
- [ ] **QUALITY-02**: 编写后端API单元测试
- [ ] **QUALITY-03**: 统一错误处理中间件应用到所有路由
- [ ] **QUALITY-04**: 统一API响应格式
- [ ] **QUALITY-05**: 添加请求日志记录

---

## v0.1 Requirements (Completed)

### 书籍上传 (UPLOAD)

- [x] **UPLOAD-01**: 用户可以上传 EPUB 格式的书籍文件
- [x] **UPLOAD-02**: 用户可以上传 PDF 格式的书籍文件
- [x] **UPLOAD-03**: 用户可以上传 TXT 格式的书籍文件
- [x] **UPLOAD-04**: 系统自动提取书籍元数据（标题、作者、封面）— 部分实现
- [x] **UPLOAD-05**: 上传的书籍保存到 data 目录

### 书籍管理 (MANAGE)

- [x] **MANAGE-01**: 用户可以查看书库列表
- [x] **MANAGE-02**: 用户可以搜索书籍（按标题/作者）
- [x] **MANAGE-03**: 用户可以删除书籍
- [x] **MANAGE-04**: 用户可以为书籍添加分类/标签
- [x] **MANAGE-05**: 管理后台有简单密码认证

### 在线阅读 (READ)

- [x] **READ-01**: 用户可以在浏览器中打开并阅读 EPUB 书籍
- [x] **READ-02**: 用户可以在浏览器中打开并阅读 PDF 书籍
- [x] **READ-03**: 用户可以在浏览器中打开并阅读 TXT 书籍
- [x] **READ-04**: 阅读器支持翻页功能（上一页/下一页/跳转）
- [x] **READ-05**: 系统自动保存阅读进度
- [x] **READ-06**: 用户可以添加书签
- [x] **READ-07**: 用户可以添加笔记/标注

### 前后端架构 (ARCH)

- [x] **ARCH-01**: 前端 Vue3 + Vite + TypeScript 独立项目
- [x] **ARCH-02**: 后端 Express + TypeScript REST API
- [x] **ARCH-03**: SQLite 数据库存储书籍元数据和用户数据
- [x] **ARCH-04**: 前后端分离部署

---

## Out of Scope

- **用户注册系统** — 个人书库，简单认证即可
- **云端同步** — 本地部署为主
- **社交功能** — 非社区平台
- **移动端 App** — Web 端优先
- **PostgreSQL迁移** — SQLite足以满足当前规模
- **Redis会话** — 单服务器架构无需分布式会话

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| v0.1 Requirements | Phase 1-3 | ✅ Complete |
| SECURITY-01~07 | Phase 4 | Pending |
| FEATURES-01~06 | Phase 5 | Pending |
| QUALITY-01~05 | Phase 6 | Pending |

---
*Last updated: 2026-05-13*
