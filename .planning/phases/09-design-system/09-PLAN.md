# Phase 9: 设计系统与全局样式

## Goal

建立统一的设计系统，定义颜色、字体、间距变量，为后续 UI 优化奠定基础。

## Requirements

- DESIGN-01: 建立统一的设计系统（颜色、字体、间距变量）
- DESIGN-02: 定义清新的配色方案（主色、辅色、背景色）
- DESIGN-03: 统一字体系统（标题、正文、小字）
- DESIGN-04: 定义间距和圆角规范

## Context

当前项目前端样式分散在各组件中，缺乏统一的设计规范。需要建立设计系统来实现：
1. 视觉一致性
2. 易于维护
3. 快速开发

## Approach

使用 CSS Variables (CSS Custom Properties) 建立设计系统，这是现代前端的标准做法：
- 浏览器原生支持，无需额外依赖
- 可在运行时动态修改（为未来主题切换做准备）
- 易于在组件中引用

## Tasks

### Task 1: 创建设计系统文件

**File:** `frontend/src/styles/design-system.css`

创建 CSS 变量文件，包含：
- 颜色变量（主色、辅色、背景、文字、边框、状态色）
- 字体变量（字体族、字号、字重、行高）
- 间距变量（基础间距倍数）
- 圆角变量（不同大小的圆角）
- 阴影变量（不同层级的阴影）

### Task 2: 创建全局样式文件

**File:** `frontend/src/styles/global.css`

创建全局样式文件，包含：
- CSS Reset / Normalize
- 全局盒模型设置
- 基础元素样式（body, html）
- 通用工具类（可选）

### Task 3: 引入样式文件

**File:** `frontend/src/main.ts`

在应用入口引入设计系统和全局样式。

### Task 4: 更新 App.vue

**File:** `frontend/src/App.vue`

使用设计系统变量替换硬编码样式。

## Design Tokens

### Colors (清新现代风格)

```css
/* Primary - 翠绿色系 */
--color-primary-50: #ECFDF5;
--color-primary-100: #D1FAE5;
--color-primary-500: #10B981;  /* 主色 */
--color-primary-600: #059669;
--color-primary-700: #047857;

/* Secondary - 靛蓝色系 */
--color-secondary-50: #EEF2FF;
--color-secondary-100: #E0E7FF;
--color-secondary-500: #6366F1;  /* 辅色 */
--color-secondary-600: #4F46E5;

/* Neutral - 灰色系 */
--color-neutral-50: #F8FAFC;   /* 背景 */
--color-neutral-100: #F1F5F9;
--color-neutral-200: #E2E8F0;  /* 边框 */
--color-neutral-500: #64748B;
--color-neutral-700: #334155;
--color-neutral-900: #0F172A;

/* Semantic */
--color-success: #10B981;
--color-warning: #F59E0B;
--color-error: #EF4444;
--color-info: #3B82F6;
```

### Typography

```css
/* Font Family */
--font-family-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-family-serif: Georgia, 'Times New Roman', serif;

/* Font Size */
--font-size-xs: 0.75rem;    /* 12px */
--font-size-sm: 0.875rem;  /* 14px */
--font-size-base: 1rem;    /* 16px */
--font-size-lg: 1.125rem;  /* 18px */
--font-size-xl: 1.25rem;   /* 20px */
--font-size-2xl: 1.5rem;   /* 24px */
--font-size-3xl: 1.875rem; /* 30px */

/* Font Weight */
--font-weight-normal: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;

/* Line Height */
--line-height-tight: 1.25;
--line-height-normal: 1.5;
--line-height-relaxed: 1.75;
```

### Spacing

```css
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-3: 0.75rem;  /* 12px */
--spacing-4: 1rem;     /* 16px */
--spacing-5: 1.25rem;  /* 20px */
--spacing-6: 1.5rem;   /* 24px */
--spacing-8: 2rem;     /* 32px */
--spacing-10: 2.5rem;  /* 40px */
--spacing-12: 3rem;    /* 48px */
```

### Border Radius

```css
--radius-sm: 0.25rem;  /* 4px */
--radius-md: 0.5rem;   /* 8px */
--radius-lg: 0.75rem;  /* 12px */
--radius-xl: 1rem;     /* 16px */
--radius-full: 9999px; /* 圆形 */
```

### Shadows

```css
--shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
--shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
--shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
--shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
```

## Success Criteria

1. ✅ 创建 `design-system.css` 包含所有设计 token
2. ✅ 创建 `global.css` 包含全局样式
3. ✅ 在 `main.ts` 中正确引入
4. ✅ App.vue 使用设计系统变量
5. ✅ 页面显示正常，无样式破坏

## Verification

- [ ] 所有 CSS 变量正确定义
- [ ] 全局样式正确应用
- [ ] 现有页面无视觉回归
- [ ] 变量可在组件中使用

---

*Created: 2026-05-14*
