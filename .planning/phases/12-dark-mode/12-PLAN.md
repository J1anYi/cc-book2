# Phase 12: 深色模式

## Goal

实现深色主题，支持系统跟随和手动切换

## Requirements

- DARK-01: 定义深色主题颜色变量（背景、文字、主色、边框）
- DARK-02: 实现主题切换机制（CSS class 切换）
- DARK-03: 添加主题切换按钮（导航栏或设置）
- DARK-04: 支持系统主题跟随（prefers-color-scheme）
- DARK-05: 主题偏好持久化（localStorage）

## Approach

基于现有 CSS Variables 设计系统，添加深色主题变量和切换机制：

1. **扩展 design-system.css** - 添加 `[data-theme="dark"]` 规则
2. **创建 useTheme.ts** - Vue composable 管理主题状态
3. **更新 NavBar** - 添加主题切换按钮
4. **更新 App.vue** - 应用主题属性

## Tasks

### Task 1: 扩展设计系统

**File:** `frontend/src/styles/design-system.css`

添加深色主题变量覆盖：
- 背景色：深色背景
- 文字色：浅色文字
- 主色：调整亮度
- 边框：深色边框

### Task 2: 创建主题管理 composable

**File:** `frontend/src/composables/useTheme.ts`

功能：
- 读取/保存 localStorage
- 监听系统主题变化
- 提供 toggle 方法

### Task 3: 更新 NavBar 添加切换按钮

**File:** `frontend/src/components/NavBar.vue`

添加主题切换按钮，显示当前主题图标。

### Task 4: 更新 App.vue 应用主题

**File:** `frontend/src/App.vue`

在根元素应用 `data-theme` 属性。

## Design Tokens

### 深色主题颜色

```css
[data-theme="dark"] {
  /* Background */
  --bg-primary: #1E293B;
  --bg-secondary: #0F172A;
  --bg-tertiary: #334155;
  --bg-elevated: #1E293B;

  /* Text */
  --text-primary: #F8FAFC;
  --text-secondary: #94A3B8;
  --text-tertiary: #64748B;
  --text-inverse: #0F172A;

  /* Border */
  --border-light: #334155;
  --border-default: #475569;
  --border-dark: #64748B;
}
```

## Success Criteria

1. ✅ 深色主题颜色变量定义完整
2. ✅ 主题切换机制正常工作
3. ✅ 导航栏有主题切换按钮
4. ✅ 系统主题变化时自动跟随
5. ✅ 刷新页面后主题保持

---

*Created: 2026-05-14*
