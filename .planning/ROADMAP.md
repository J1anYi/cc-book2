# Roadmap — 书籍观看系统 v0.2

## Overview

**Milestone:** v0.2 安全加固与功能完善
**Total Phases:** 3
**Total Requirements:** 18
**Starting Phase:** Phase 4 (继续v0.1编号)

---

## Phase Summary

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|------------------|
| 4 | 安全加固 | 实现JWT认证和安全防护 | SECURITY-01~07 | 5 |
| 5 | 功能完善 | 分页、元数据提取、性能优化 | FEATURES-01~06 | 5 |
| 6 | 质量保障 | 测试框架、错误处理统一 | QUALITY-01~05 | 4 |

---

## Phase 4: 安全加固

**Goal:** 实现JWT认证替换硬编码凭证，添加安全防护措施

### Requirements

- SECURITY-01: 使用JWT替换硬编码凭证进行认证
- SECURITY-02: 登录端点添加速率限制防止暴力破解
- SECURITY-03: 配置CORS限制允许的源
- SECURITY-04: 添加helmet安全头中间件
- SECURITY-05: 实现输入验证（使用Zod或Joi）
- SECURITY-06: 文件上传时验证真实文件类型
- SECURITY-07: 实现完整的登出功能

### Success Criteria

1. 用户登录返回有效JWT token
2. 连续失败登录5次后被锁定15分钟
3. CORS只允许配置的源访问API
4. 所有API响应包含安全头
5. 无效输入返回400错误而非服务器错误

### Technical Notes

- 使用 jsonwebtoken 库生成/验证JWT
- 使用 express-rate-limit 实现速率限制
- 使用 file-type 库检查文件magic number

---

## Phase 5: 功能完善

**Goal:** 实现分页、元数据提取、性能优化

### Requirements

- FEATURES-01: 书籍列表分页（默认每页20条）
- FEATURES-02: EPUB元数据提取（标题、作者、封面）
- FEATURES-03: PDF元数据提取（标题、作者）
- FEATURES-04: 数据库添加搜索索引优化
- FEATURES-05: 异步文件操作
- FEATURES-06: 环境变量配置支持

### Success Criteria

1. 书籍列表API支持page/limit参数
2. 上传EPUB后自动显示标题和封面
3. 上传PDF后自动显示标题
4. 搜索响应时间<100ms（1000本书）
5. 文件操作不阻塞API响应

### Technical Notes

- EPUB使用 epub 库解析元数据
- PDF使用 pdf-parse 提取信息
- 使用 CREATE INDEX 添加数据库索引

---

## Phase 6: 质量保障

**Goal:** 引入测试框架，统一错误处理

### Requirements

- QUALITY-01: 引入Vitest测试框架
- QUALITY-02: 编写后端API单元测试
- QUALITY-03: 统一错误处理中间件应用到所有路由
- QUALITY-04: 统一API响应格式
- QUALITY-05: 添加请求日志记录

### Success Criteria

1. 运行 npm test 执行所有测试
2. 后端核心API测试覆盖率>80%
3. 所有路由使用统一错误处理
4. API响应格式一致 {data, error, message}
5. 请求日志记录到文件

### Technical Notes

- 使用 Vitest + supertest 测试API
- 使用 morgan 记录请求日志
- 错误处理中间件已存在于 middleware/errorHandler.ts

---

## Requirement Coverage

| Category | Total | Phase 4 | Phase 5 | Phase 6 |
|----------|-------|---------|---------|---------|
| SECURITY | 7 | 7 | - | - |
| FEATURES | 6 | - | 6 | - |
| QUALITY | 5 | - | - | 5 |
| **Total** | **18** | **7** | **6** | **5** |

✅ 100% requirement coverage

---

*Last updated: 2026-05-13*
