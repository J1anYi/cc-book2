# Requirements — 书籍观看系统

## v1 Requirements

### 书籍上传 (UPLOAD)

- [ ] **UPLOAD-01**: 用户可以上传 EPUB 格式的书籍文件
- [ ] **UPLOAD-02**: 用户可以上传 PDF 格式的书籍文件
- [ ] **UPLOAD-03**: 用户可以上传 TXT 格式的书籍文件
- [ ] **UPLOAD-04**: 系统自动提取书籍元数据（标题、作者、封面）
- [ ] **UPLOAD-05**: 上传的书籍保存到 data 目录

### 书籍管理 (MANAGE)

- [ ] **MANAGE-01**: 用户可以查看书库列表
- [ ] **MANAGE-02**: 用户可以搜索书籍（按标题/作者）
- [ ] **MANAGE-03**: 用户可以删除书籍
- [ ] **MANAGE-04**: 用户可以为书籍添加分类/标签
- [ ] **MANAGE-05**: 管理后台有简单密码认证

### 在线阅读 (READ)

- [ ] **READ-01**: 用户可以在浏览器中打开并阅读 EPUB 书籍
- [ ] **READ-02**: 用户可以在浏览器中打开并阅读 PDF 书籍
- [ ] **READ-03**: 用户可以在浏览器中打开并阅读 TXT 书籍
- [ ] **READ-04**: 阅读器支持翻页功能（上一页/下一页/跳转）
- [ ] **READ-05**: 系统自动保存阅读进度
- [ ] **READ-06**: 用户可以添加书签
- [ ] **READ-07**: 用户可以添加笔记/标注

### 前后端架构 (ARCH)

- [ ] **ARCH-01**: 前端 Vue3 + Vite + TypeScript 独立项目
- [ ] **ARCH-02**: 后端 Express + TypeScript REST API
- [ ] **ARCH-03**: SQLite 数据库存储书籍元数据和用户数据
- [ ] **ARCH-04**: 前后端分离部署

---

## v2 Requirements (Deferred)

- 多用户注册系统
- 云端同步
- 社交分享功能
- 阅读统计报告
- 自定义主题

---

## Out of Scope

- **用户注册系统** — 个人书库，简单密码认证即可
- **云端同步** — 本地部署为主
- **社交功能** — 非社区平台
- **移动端 App** — Web 端优先

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| UPLOAD-01~05 | Phase 1 | Pending |
| ARCH-01~04 | Phase 1 | Pending |
| MANAGE-01~05 | Phase 2 | Pending |
| READ-01~07 | Phase 3 | Pending |

---
*Last updated: 2026-04-29*
