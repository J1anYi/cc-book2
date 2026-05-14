# Requirements: 书籍观看系统 v0.6

**Defined:** 2026-05-14
**Core Value:** 上传书籍 → 在线阅读 → 管理收藏
**Milestone:** v0.6 书库管理增强

---

## v1 Requirements

### Collections (收藏夹系统)

- [ ] **COLL-01**: 用户可以创建、删除、重命名收藏夹
- [ ] **COLL-02**: 用户可以为收藏夹设置图标和颜色
- [ ] **COLL-03**: 用户可以将书籍添加到收藏夹（一本书可属于多个收藏夹）
- [ ] **COLL-04**: 用户可以从收藏夹移除书籍
- [ ] **COLL-05**: 用户可以按收藏夹筛选书籍列表
- [ ] **COLL-06**: 收藏夹列表显示书籍数量

### Reading Status (阅读状态)

- [ ] **STAT-01**: 书籍有三种阅读状态：想读、在读、已读
- [ ] **STAT-02**: 用户可以手动切换书籍的阅读状态
- [ ] **STAT-03**: 打开书籍阅读时自动将状态设为"在读"
- [ ] **STAT-04**: 用户可以按阅读状态筛选书籍列表

### Tags (多标签系统)

- [ ] **TAG-01**: 用户可以创建、删除、重命名标签
- [ ] **TAG-02**: 用户可以为标签设置颜色
- [ ] **TAG-03**: 用户可以为书籍添加多个标签
- [ ] **TAG-04**: 用户可以从书籍移除标签
- [ ] **TAG-05**: 用户可以按标签筛选书籍列表（支持多标签组合筛选）
- [ ] **TAG-06**: 标签列表显示使用次数

### Series (系列分组)

- [ ] **SERI-01**: 用户可以创建、删除、重命名系列
- [ ] **SERI-02**: 用户可以将书籍分配到系列并设置顺序
- [ ] **SERI-03**: 用户可以按系列查看书籍列表
- [ ] **SERI-04**: 系统可以从书名自动检测系列信息（可选实现）

---

## v2 Requirements (未来版本)

### 智能分组增强

- **GROUP-01**: 按作者分组查看
- **GROUP-02**: 按出版社分组查看
- **GROUP-03**: 按年份分组查看

### 阅读统计

- **STAT-05**: 显示阅读天数统计
- **STAT-06**: 显示完成书籍数量
- **STAT-07**: 年度阅读目标设置

### 收藏夹增强

- **COLL-07**: 嵌套收藏夹（子收藏夹）
- **COLL-08**: 收藏夹排序（自定义顺序）

### 标签增强

- **TAG-07**: 标签云可视化展示
- **TAG-08**: 标签自动补全（输入时建议）
- **TAG-09**: 标签合并功能

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| 多用户系统 | 个人书库，单用户即可 |
| 云端同步 | 本地部署优先 |
| 社交功能 | 非社区平台 |
| 移动端 App | Web 端优先 |
| 全文搜索 | 技术复杂度高，后续版本 |
| 阅读统计图表 | 后续版本 |
| 嵌套收藏夹 | 简化实现，v2 考虑 |

---

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| COLL-01 | Phase 14 | Pending |
| COLL-02 | Phase 14 | Pending |
| COLL-03 | Phase 14 | Pending |
| COLL-04 | Phase 14 | Pending |
| COLL-05 | Phase 14 | Pending |
| COLL-06 | Phase 14 | Pending |
| STAT-01 | Phase 15 | Pending |
| STAT-02 | Phase 15 | Pending |
| STAT-03 | Phase 15 | Pending |
| STAT-04 | Phase 15 | Pending |
| TAG-01 | Phase 16 | Pending |
| TAG-02 | Phase 16 | Pending |
| TAG-03 | Phase 16 | Pending |
| TAG-04 | Phase 16 | Pending |
| TAG-05 | Phase 16 | Pending |
| TAG-06 | Phase 16 | Pending |
| SERI-01 | Phase 17 | Pending |
| SERI-02 | Phase 17 | Pending |
| SERI-03 | Phase 17 | Pending |
| SERI-04 | Phase 17 | Pending |

**Coverage:**
- v1 requirements: 20 total
- Mapped to phases: 20
- Unmapped: 0 ✓

---

*Requirements defined: 2026-05-14*
*Last updated: 2026-05-14 after initial definition*
