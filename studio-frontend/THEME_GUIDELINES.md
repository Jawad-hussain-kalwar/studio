# 🎨 Theme Consistency Guidelines

## ❌ **NEVER Use Hardcoded Colors**

### Forbidden Patterns:
```tsx
// ❌ NEVER do this
sx={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
sx={{ color: '#009688' }}
sx={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}
background: 'linear-gradient(90deg, #009688 0%, #4caf50 100%)'
```

## ✅ **ALWAYS Use Theme Colors**

### 1. **Page Backgrounds**
```tsx
// ✅ Correct
sx={{ backgroundColor: (theme) => theme.palette.pageBackground.default }}
sx={{ backgroundColor: (theme) => theme.palette.pageBackground.transparent }}
```

### 2. **Navigation Components**
```tsx
// ✅ Correct
sx={{ backgroundColor: (theme) => theme.palette.navigation.background }}
sx={{ backgroundColor: (theme) => theme.palette.navigation.backgroundTransparent }}
```

### 3. **Primary/Secondary Colors with Alpha**
```tsx
// ✅ Correct
sx={{ backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1) }}
sx={{ borderColor: (theme) => alpha(theme.palette.secondary.main, 0.2) }}
```

### 4. **Auth Page Styling**
```tsx
// ✅ Correct for auth pages
sx={{
  bgcolor: (theme) => theme.palette.auth.inputBackground,
  borderColor: (theme) => theme.palette.auth.inputBorder,
  color: (theme) => theme.palette.auth.inputLabel,
}}
```

### 5. **Gradients**
```tsx
// ✅ Correct
sx={{ background: (theme) => theme.customGradients.brand }}
sx={{ background: (theme) => theme.customGradients.primary }}
sx={{ background: (theme) => theme.customGradients.welcome }}
```

### 6. **Chart Colors**
```tsx
// ✅ Correct
const color = theme.palette.chart.colors[index % theme.palette.chart.colors.length];
```

### 7. **Code Blocks**
```tsx
// ✅ Correct
sx={{ bgcolor: (theme) => theme.palette.codeBlock.background }}
```

## 🔧 **Available Theme Properties**

### Standard MUI Palette:
- `theme.palette.primary.main/dark/light`
- `theme.palette.secondary.main/dark/light`
- `theme.palette.background.default/paper`
- `theme.palette.text.primary/secondary`
- `theme.palette.error/warning/info/success.main`
- `theme.palette.divider`
- `theme.palette.action.hover/disabled`

### Custom Extended Palette:
```tsx
theme.palette.navigation.background          // Navigation solid colors
theme.palette.navigation.backgroundTransparent  // Navigation transparent

theme.palette.pageBackground.default        // Page backgrounds
theme.palette.pageBackground.transparent    // Page backgrounds with transparency

theme.palette.auth.inputBackground          // Auth form styling
theme.palette.auth.inputBorder
theme.palette.auth.inputLabel
theme.palette.auth.buttonHover
theme.palette.auth.glassPanel
theme.palette.auth.glassBorder

theme.palette.chart.colors[]                // Chart color array
theme.palette.codeBlock.background          // Code block backgrounds
```

### Custom Gradients:
```tsx
theme.customGradients.brand     // Full brand gradient
theme.customGradients.primary   // Primary color gradient  
theme.customGradients.welcome   // Welcome page gradient
```

## 🚨 **Enforcement Rules**

1. **Code Review Checklist**: Always check for hardcoded colors
2. **ESLint Rule** (recommended): Add custom rule to detect hardcoded colors
3. **Pre-commit Hook**: Scan for rgba(), rgb(), # color patterns
4. **Documentation**: Update this file when adding new theme properties

## 🔍 **How to Add New Colors**

1. **Extend ThemeProvider.tsx** with new color definitions
2. **Update TypeScript declarations** in `types/index.ts`
3. **Test both light and dark modes**
4. **Update this documentation**

## ✨ **Benefits of This System**

- ✅ **Consistent theming** across all components
- ✅ **Automatic dark/light mode** support
- ✅ **Centralized color management**
- ✅ **Easy brand color updates**
- ✅ **TypeScript type safety**
- ✅ **Maintainable codebase** 