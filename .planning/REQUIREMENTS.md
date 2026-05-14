# Requirements — 书籍观看系统 v0.5

## v0.5 Requirements - 深色模式与高亮标注

### 深色模式 (DARK)

- [ ] **DARK-01**: 定义深色主题颜色变量（背景、文字、主色、边框）
- [ ] **DARK-02**: 实现主题切换机制（CSS class 切换）
- [ ] **DARK-03**: 添加主题切换按钮（导航栏或设置）
- [ ] **DARK-04**: 支持系统主题跟随（prefers-color-scheme）
- [ ] **DARK-05**: 主题偏好持久化（localStorage）

### 高亮标注 (HIGHLIGHT)

- [ ] **HIGHLIGHT-01**: EPUB 文本选择和高亮功能
- [ ] **HIGHLIGHT-02**: 高亮颜色选择（黄、绿、蓝、粉、紫）
- [ ] **HIGHLIGHT-03**: 高亮数据持久化（后端 API + 数据库）
- [ ] **HIGHLIGHT-04**: 高亮列表展示（侧边栏）
- [ ] **HIGHLIGHT-05**: 高亮关联笔记功能
- [ ] **HIGHLIGHT-06**: 高亮删除功能

---

## 设计方向

### 深色模式

**颜色方案：**

| 用途 | 浅色模式 | 深色模式 |
|------|----------|----------|
| 背景 | #F8FAFC | #0F172A |
| 卡片 | #FFFFFF | #1E293B |
| 文字 | #0F172A | #F8FAFC |
| 次要文字 | #64748B | #94A3B8 |
| 主色 | #10B981 | #34D399 |
| 边框 | #E2E8F0 | #334155 |

**切换逻辑：**
1. 默认跟随系统 (`prefers-color-scheme`)
2. 用户手动切换后覆盖系统设置
3. 选择保存到 `localStorage`
4. 页面加载时读取并应用

### 高亮标注

**颜色方案：**

| 颜色 | 用途 | 色值 |
|------|------|------|
| 黄色 | 重点 | #FEF08A / #CA8A04 |
| 绿色 | 认同 | #BBF7D0 / #16A34A |
| 蓝色 | 信息 | #BFDBFE / #2563EB |
| 粉色 | 疑问 | #FBCFE8 / #DB2777 |
| 紫色 | 洞见 | #DDD6FE / #7C3AED |

**交互流程：**
1. 长按/选择文本 → 显示高亮菜单
2. 选择颜色 → 应用高亮 + 保存
3. 点击高亮 → 显示详情（可添加笔记）
4. 侧边栏 → 高亮列表

---

## Technical Notes

### 深色模式实现

```css
/* design-system.css 扩展 */
:root {
  /* Light theme (default) */
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8FAFC;
  --text-primary: #0F172A;
  /* ... */
}

[data-theme="dark"] {
  --bg-primary: #1E293B;
  --bg-secondary: #0F172A;
  --text-primary: #F8FAFC;
  /* ... */
}
```

```typescript
// theme.ts
const theme = ref<'light' | 'dark' | 'system'>('system')

function applyTheme(t: string) {
  const isDark = t === 'dark' || 
    (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
}
```

### 高亮标注实现

**数据库扩展：**
```sql
CREATE TABLE highlights (
  id INTEGER PRIMARY KEY,
  book_id INTEGER NOT NULL,
  cfi_range TEXT NOT NULL,      -- EPUB CFI 位置
  selected_text TEXT NOT NULL,  -- 选中文本
  color TEXT NOT NULL,          -- 颜色
  note TEXT,                    -- 关联笔记
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES books(id)
);
```

**API 设计：**
- `GET /api/highlights/:bookId` - 获取书籍高亮
- `POST /api/highlights` - 添加高亮
- `PUT /api/highlights/:id` - 更新高亮（添加笔记）
- `DELETE /api/highlights/:id` - 删除高亮

**epubjs 高亮：**
```typescript
rendition.annotations.highlight(cfi, {}, (e) => {
  // 点击高亮回调
}, 'highlight', { 'fill': color })
```

---

*Last updated: 2026-05-14*
