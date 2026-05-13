# Requirements — 书籍观看系统

## v0.3 Requirements

### 书库首页 (LIBRARY)

- [ ] **LIBRARY-01**: 用户访问首页时看到书库页面（而非上传页面）
- [ ] **LIBRARY-02**: 书库页面以卡片形式展示所有已上传书籍
- [ ] **LIBRARY-03**: 每张书籍卡片显示封面、标题、作者、文件类型
- [ ] **LIBRARY-04**: 书籍卡片显示阅读进度百分比
- [ ] **LIBRARY-05**: 用户可以按分类筛选书籍
- [ ] **LIBRARY-06**: 用户可以搜索书籍（标题、作者）

### 阅读入口 (READER)

- [ ] **READER-01**: 用户点击书籍卡片可直接进入阅读器
- [ ] **READER-02**: 书库首页显示"继续阅读"区域，展示最近阅读的书籍
- [ ] **READER-03**: 点击"继续阅读"书籍，自动跳转到上次阅读位置
- [ ] **READER-04**: 阅读器页面有明确的返回书库按钮

### 书籍详情 (DETAILS)

- [ ] **DETAILS-01**: 用户可从书籍卡片进入书籍详情页
- [ ] **DETAILS-02**: 详情页显示书籍完整元数据（标题、作者、分类、标签、上传时间）
- [ ] **DETAILS-03**: 详情页显示阅读进度和时间
- [ ] **DETAILS-04**: 详情页提供"开始阅读"或"继续阅读"按钮
- [ ] **DETAILS-05**: 详情页可以编辑书籍信息（分类、标签）

### 上传入口 (UPLOAD)

- [ ] **UPLOAD-01**: 上传功能从首页移至独立页面或导航入口
- [ ] **UPLOAD-02**: 上传成功后显示书籍预览并可立即开始阅读
- [ ] **UPLOAD-03**: 导航栏清晰展示：书库、上传、管理

---

## v0.2 Requirements (Completed)

### 安全加固 (SECURITY)

- [x] **SECURITY-01**: 使用JWT替换硬编码凭证进行认证
- [x] **SECURITY-02**: 登录端点添加速率限制防止暴力破解
- [x] **SECURITY-03**: 配置CORS限制允许的源
- [x] **SECURITY-04**: 添加helmet安全头中间件
- [x] **SECURITY-05**: 实现输入验证（使用Zod或Joi）
- [x] **SECURITY-06**: 文件上传时验证真实文件类型（magic number检查）
- [x] **SECURITY-07**: 实现完整的登出功能（token失效）

### 功能完善 (FEATURES)

- [x] **FEATURE-01**: 书籍列表分页（默认每页20条）
- [x] **FEATURE-02**: EPUB元数据提取（标题、作者、封面）
- [x] **FEATURE-03**: PDF元数据提取（标题、作者）
- [x] **FEATURE-04**: 数据库添加搜索索引优化
- [x] **FEATURE-05**: 异步文件操作（非阻塞事件循环）
- [x] **FEATURE-06**: 环境变量配置支持（端口、数据库路径等）

### 质量保障 (QUALITY)

- [x] **QUALITY-01**: 引入Vitest测试框架
- [x] **QUALITY-02**: 编写后端API单元测试
- [x] **QUALITY-03**: 统一错误处理中间件应用到所有路由
- [x] **QUALITY-04**: 统一API响应格式
- [x] **QUALITY-05**: 添加请求日志记录

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

## v2 Requirements (Future)

### 书架功能 (SHELF)

- **SHELF-01**: 用户可以创建自定义书架
- **SHELF-02**: 用户可以将书籍添加到多个书架
- **SHELF-03**: 书架可以排序和自定义封面

### 阅读统计 (STATS)

- **STATS-01**: 统计总阅读时间
- **STATS-02**: 显示阅读历史图表
- **STATS-03**: 统计已完成书籍数量

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| 社交分享 | 个人书库，非社区平台 |
| 云端同步 | 本地部署为主 |
| 移动端 App | Web 端优先 |
| 多用户系统 | 单用户或小团队使用 |
| PostgreSQL迁移 | SQLite足以满足当前规模 |
| Redis会话 | 单服务器架构无需分布式会话 |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| v0.1 Requirements | Phase 1-3 | ✅ Complete |
| v0.2 Requirements | Phase 4-6 | ✅ Complete |
| LIBRARY-01~06 | Phase 7 | Pending |
| READER-01~04 | Phase 7 | Pending |
| DETAILS-01~05 | Phase 8 | Pending |
| UPLOAD-01~03 | Phase 8 | Pending |

**Coverage:**
- v0.3 requirements: 18 total
- Mapped to phases: 18
- Unmapped: 0 ✓

---
*Last updated: 2026-05-13*
