# Roadmap — 书籍观看系统 v0.5

## Overview

**Milestone:** v0.5 深色模式与高亮标注
**Total Phases:** 2
**Total Requirements:** 11
**Starting Phase:** Phase 12

---

## Phase Summary

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|------------------|
| 12 | 深色模式 | 实现深色主题切换 | DARK-01~05 | 5 |
| 13 | 高亮标注 | EPUB文本高亮和笔记 | HIGHLIGHT-01~06 | 6 |

---

## Phase 12: 深色模式

**Goal:** 实现深色主题，支持系统跟随和手动切换

### Requirements

- DARK-01: 定义深色主题颜色变量（背景、文字、主色、边框）
- DARK-02: 实现主题切换机制（CSS class 切换）
- DARK-03: 添加主题切换按钮（导航栏或设置）
- DARK-04: 支持系统主题跟随（prefers-color-scheme）
- DARK-05: 主题偏好持久化（localStorage）

### Success Criteria

1. 深色主题颜色变量定义完整
2. 主题切换机制正常工作
3. 导航栏有主题切换按钮
4. 系统主题变化时自动跟随（除非用户手动设置）
5. 刷新页面后主题保持

### Technical Notes

- 扩展 `design-system.css` 添加 `[data-theme="dark"]` 规则
- 创建 `composables/useTheme.ts` 管理主题状态
- 在 NavBar 添加主题切换按钮
- 监听 `prefers-color-scheme` 变化

---

## Phase 13: 高亮标注

**Goal:** EPUB 阅读器文本高亮和笔记关联

### Requirements

- HIGHLIGHT-01: EPUB 文本选择和高亮功能
- HIGHLIGHT-02: 高亮颜色选择（黄、绿、蓝、粉、紫）
- HIGHLIGHT-03: 高亮数据持久化（后端 API + 数据库）
- HIGHLIGHT-04: 高亮列表展示（侧边栏）
- HIGHLIGHT-05: 高亮关联笔记功能
- HIGHLIGHT-06: 高亮删除功能

### Success Criteria

1. 选择文本后显示高亮菜单
2. 可选择 5 种高亮颜色
3. 高亮数据保存到后端
4. 刷新后高亮仍然显示
5. 侧边栏展示高亮列表
6. 可为高亮添加笔记
7. 可删除高亮

### Technical Notes

- 数据库添加 `highlights` 表
- 后端添加 highlights API
- EpubReader 使用 `rendition.annotations.highlight()`
- Reader.vue 添加高亮列表面板

---

## Requirement Coverage

| Category | Total | Phase 12 | Phase 13 |
|----------|-------|----------|----------|
| DARK | 5 | 5 | - |
| HIGHLIGHT | 6 | - | 6 |
| **Total** | **11** | **5** | **6** |

✅ 100% requirement coverage

---

## Build Order

Phase 12 → Phase 13

Phase 12 先完成深色模式，为阅读器提供良好的夜间阅读体验基础。
Phase 13 在深色模式基础上实现高亮标注，增强笔记功能。

---

*Last updated: 2026-05-14*
