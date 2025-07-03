# AI STUDIO – Style Guidelines

> Last updated: 2025-06-25

This document defines the visual design system for AI STUDIO front-end work. Follow these rules for all features going forward.

---

## 1. Brand Palette

| Role | Color | Hex |
|------|-------|-----|
| Primary | Dark Teal | `#006d77` |
| Primary Variant | Teal 600 | `#009688` |
| Secondary | Lime Yellow (≈ Material Lime 500) | `#cddc39` |
| Accent / Gradient End | Lime 200 | `#e9d842` |

### Gradient
`linear-gradient(90deg, #006d77 0%, #009688 25%, #8bc34a 75%, #e9d842 100%)`

---

## 2. Typography

• Headings: **Montserrat**, 600-700 weight  
• Body / UI: **Roboto** (or system-ui fallback)  
• Font-size scale: use MUI defaults (`rem`-based) – override only where necessary.

---

## 3. Layout & Radius

• Base unit: 8 px grid.  
• Border-radius: `12px` universally.  
• Spacing: multiples of 4 px for fine grain, 8 px grid for components.

---

## 4. Elevation & Glassmorphism

Use Material elevation levels *(0–24)*. Combine with a subtle glass effect for surfaces.

### Glass Surface Tokens
| Mode | Background | Blur |
|------|------------|------|
| Light | `rgba(255,255,255,0.6)` | `20px` |
| Dark | `rgba(255,255,255,0.1)` | `12px` |

Apply on elements with `backdrop-filter: blur(<token>)` + `background`. Elevation shadows layer on top.

---

## 5. Interaction / Motion

Follow Material default motion duration & easing. For components:

• **Hover**: elevation ↑ by 2, background shade +10% lightness.  
• **Pressed**: elevation 0, element scale `0.98`.  
• Ripple / focus handled by MUI defaults.

---

## 6. Light vs Dark Mode Tokens

| Token | Light | Dark |
|-------|-------|------|
| Background | `#fafafa` | `#121212` |
| Surface | `rgba(255,255,255,0.6)` (blur 20px) | `rgba(255,255,255,0.1)` (blur 12px) |
| Text Primary | `rgba(0,0,0,0.87)` | `rgba(255,255,255,0.87)` |
| Primary | `#006d77` | `#006d77` |
| Primary Hover | lighten 10% | lighten 10% |
| Secondary | `#cddc39` | `#cddc39` |
| Divider | `rgba(0,0,0,0.12)` | `rgba(255,255,255,0.12)` |

---

## 7. Components

### Buttons
```
<Button variant="contained" color="primary">Action</Button>
```
MUI defaults give ripple + elevation 2 → 4 on hover.

### Inputs / Cards / Dialogs
Surfaces use glass background token + elevation 1 by default. Increase to 8 for modals.

### Icons
Use Material Icons outlined set (`@mui/icons-material`). Color inherits current text or `theme.palette.action.active`.

---

## 8. Usage Tips

1. Never override MUI transitions unless absolutely required.  
2. Prefer `sx` prop for one-off tweaks; for global tokens extend `Theme` object.  
3. Keep accessibility in mind – ensure at least 4.5:1 contrast for text.  
4. When in doubt, *follow Material 3 spec*. 