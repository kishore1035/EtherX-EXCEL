# Dashboard Redesign - Visual Reference Guide

## Color Palette Reference

```
┌─────────────────────────────────────────────────┐
│ PRIMARY COLORS                                   │
├─────────────────────────────────────────────────┤
│ Primary Yellow       #FFCF40 rgb(255, 207, 64)  │ ← Main accent
│ Yellow Hover         #E6B800 rgb(230, 184, 0)   │ ← Button hover
│ Yellow Light         FFCF40 @ 10% opacity       │ ← Backgrounds
│                                                 │
│ SECONDARY COLORS                                │
│ Secondary Blue       #3B82F6 rgb(59, 130, 246)  │ ← Status colors
│ Blue Light           3B82F6 @ 10% opacity       │ ← Backgrounds
│                                                 │
│ BACKGROUNDS                                     │
│ Dark Background      #000000                    │ ← Page background
│ Card Background      rgba(0, 0, 0, 0.95/0.85)   │ ← Card gradient
│ Input Background     rgba(15, 15, 15, 0.85)     │ ← Input fields
│                                                 │
│ TEXT                                            │
│ Text Primary         #FFFFFF                    │ ← Main text
│ Text Secondary       rgba(180, 180, 180, 0.7)   │ ← Muted text
│ Text Muted           rgba(140, 140, 140, 0.6)   │ ← Very muted
│                                                 │
│ BORDERS                                         │
│ Border Primary       rgba(255, 207, 64, 0.2)    │ ← Main border
│ Border Secondary     rgba(40, 40, 40, 0.6)      │ ← Input border
│ Border Light         rgba(255, 255, 255, 0.05)  │ ← Inset border
└─────────────────────────────────────────────────┘
```

## Typography Scale

```
Size        Usage                    Weight    Line Height
─────────────────────────────────────────────────────────
48px        Large Headings          700       1.2
36px        Section Headings        700       1.2
32px        Page Title              700       1.2
28px        Card Titles             600       1.3
20px        Subheadings             600       1.4
16px        Body Text (default)     400       1.5
14px        Small Text              400       1.5
12px        Captions                400       1.4
11px        Badges/Tags             600       1.0
10px        Tiny Text               600       1.0
```

## Spacing Scale (8px base)

```
Scale   Pixels   Usage
────────────────────────────────────────────────
1       4px      Icon padding, tight spacing
2       8px      Default padding, gaps
3       12px     Larger gaps between elements
4       16px     Card padding, section spacing
5       20px     Large gaps
6       24px     Section separation
8       32px     Major section spacing
10      40px     Large container spacing
12      48px     Extra large spacing
16      64px     Hero sections, top padding
```

## Border Radius System

```
Preset    Pixels    Usage
──────────────────────────────────────────
sm        4px       Tiny elements
md        8px       Buttons, small cards
lg        12px      Cards (PRIMARY)
xl        16px      Large containers
2xl       20px      Modal dialogs
full      9999px    Circular elements
```

## Shadow Presets

```
Depth     Shadow Definition                         Usage
───────────────────────────────────────────────────────────────
sm        0 2px 8px rgba(255,207,64, 0.1)          Subtle hover
md        0 4px 14px rgba(255,207,64, 0.2)         Standard hover
lg        0 6px 20px rgba(255,207,64, 0.3)         Enhanced hover
xl        0 20px 60px rgba(0,0,0, 0.3)             Depth/modals
card      0 20px 60px +inset +backdrop              Card depth
button    0 4px 14px rgba(255,207,64, 0.3)         Button default
btnHover  0 6px 20px rgba(255,207,64, 0.4)         Button hover
```

## Component Dimensions

### DashboardCard
```
┌─────────────────────────┐
│ ┌─────────┐             │
│ │    📦   │ Title       │ ← 12x12 spacing (spacing[6])
│ └─────────┘ Description │
│                         │
│  ┌─────────────────┐    │
│  │  Button Text    │    │ ← Full width button
│  └─────────────────┘    │
└─────────────────────────┘
  Padding: 24px (spacing[6]) all sides
  Border Radius: 12px (lg)
  Border: 1px solid rgba(255,207,64, 0.2)
  Shadow: 0 4px 14px rgba(255,207,64, 0.2)
  Width: 280px minimum, 1fr flexible
```

### RecentSheetCard
```
┌──────────────────────────────────────┐
│ ┌───┐ Title                    ✕ ┌─┐ │
│ │📄 │ Last modified date     hover└─┘ │
│ └───┘                               │
│ ┌─────────┐ ┌────────┐             │
│ │ Edited  │ │Reopened│             │
│ └─────────┘ └────────┘             │
└──────────────────────────────────────┘
  Padding: 16px (spacing[4])
  Min Height: 140px
  Border Radius: 12px (lg)
  Border: 1px solid rgba(255,207,64, 0.2)
  Shadow: 0 2px 8px rgba(255,207,64, 0.1)
```

## Grid Layouts

### Feature Cards Grid
```
Desktop (1200px+)          Tablet (1024px)         Mobile (640px)
┌──────────────────────┐  ┌────────────────┐    ┌──────────────┐
│ Card │ Card │ Card   │  │ Card │ Card    │    │ Card         │
└──────────────────────┘  │ Card │ Card    │    │ Card         │
  3 columns               │      │ Card    │    │ Card         │
  gap: 24px (spacing[6])  └────────────────┘    └──────────────┘
                            2 columns            1 column
                            gap: 24px
```

### Recent Sheets Grid
```
Desktop (1200px+)          Tablet (1024px)         Mobile (640px)
┌──────────────────────┐  ┌────────────────┐    ┌──────────────┐
│ Sheet │ Sheet │Sheet │  │ Sheet │ Sheet  │    │ Sheet        │
│ Sheet │ Sheet │Sheet │  │ Sheet │ Sheet  │    │ Sheet        │
└──────────────────────┘  │ Sheet │ Sheet  │    │ Sheet        │
  3-4 columns             │       │ Sheet  │    │ Sheet        │
  gap: 16px (spacing[4])  └────────────────┘    └──────────────┘
                            2 columns            1 column
                            gap: 16px
```

## Transition Timings

```
Interaction       Duration    Easing                      Effect
────────────────────────────────────────────────────────────────
Hover (fast)      150ms       cubic-bezier(0.4,0,0.2,1)  Quick feedback
Standard          200ms       cubic-bezier(0.4,0,0.2,1)  Smooth change
Slow              300ms       cubic-bezier(0.4,0,0.2,1)  Entrance animation
Entrance          400ms       cubic-bezier(0.4,0,0.2,1)  Page load (motion/react)
Stagger           50-100ms    -                          Between items
```

## Animation Effects

### Card Entrance (cardSlideIn)
```
From:  opacity: 0,  translateY(20px)
To:    opacity: 1,  translateY(0)
Duration: 500ms
Easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Hover Lift Effect
```
From:  translateY(0)
To:    translateY(-4px)
Duration: 200ms
Shadow: Enhanced to lg
```

### Subtle Glow (on cards)
```
0%, 100%: opacity 0.4
50%: opacity 0.6
Duration: 3s infinite
Creates: Gentle pulsing effect
```

## Status Badge Colors

### "Edited" Badge
```
Background: rgba(255, 207, 64, 0.15)    ← Yellow at 15%
Border:     rgba(255, 207, 64, 0.3)     ← Yellow at 30%
Text:       rgb(255, 207, 64)           ← Full yellow
Font Size:  10px (0.625rem)
Padding:    2px 8px (spacing[1] spacing[2])
Border Radius: 4px (sm)
Font Weight: 600 (semibold)
```

### "Reopened" Badge
```
Background: rgba(59, 130, 246, 0.15)    ← Blue at 15%
Border:     rgba(59, 130, 246, 0.3)     ← Blue at 30%
Text:       rgb(59, 130, 246)           ← Full blue
Font Size:  10px (0.625rem)
Padding:    2px 8px (spacing[1] spacing[2])
Border Radius: 4px (sm)
Font Weight: 600 (semibold)
```

## Icon Styling

### Feature Card Icons
```
Size:         24-28px (icon prop)
Color:        rgb(255, 207, 64) (primary yellow)
Stroke Width: 1.5
Container:
  - Size: 48px (spacing[12]) square
  - Border Radius: 12px (lg)
  - Background: linear-gradient(
      135deg,
      rgba(255,207,64,0.1) 0%,
      rgba(59,130,246,0.1) 100%
    )
  - Border: 1px solid rgba(255,207,64,0.1)
```

### Recent Sheet Icons
```
Size:         20px
Color:        rgb(255, 207, 64)
Stroke Width: 1.5
Container:
  - Size: 32px (spacing[8]) square
  - Border Radius: 8px (md)
  - Background: (same gradient as feature cards)
  - Border: 1px solid rgba(255,207,64,0.1)
```

## Button Styles

### Primary Button (Feature Cards)
```
Background:     rgb(255, 207, 64)
Text Color:     #0a0a0a (dark)
Font Weight:    600 (semibold)
Font Size:      14px (0.875rem)
Padding:        8px 16px (spacing[2] spacing[4])
Border Radius:  8px (md)
Width:          100% (full width)
Box Shadow:     0 4px 14px rgba(255,207,64, 0.3)

Hover:
  Background:   rgb(230, 184, 0)
  Box Shadow:   0 6px 20px rgba(255,207,64, 0.4)
  Transform:    translateY(-2px)

Active:
  Box Shadow:   0 2px 8px rgba(255,207,64, 0.3)
  Transform:    translateY(0)

Disabled:
  Opacity:      0.6
  Cursor:       not-allowed
```

## Navbar Layout

```
┌──────────────────────────────────────────────────────────────┐
│ Logo EtherX   │  [Space]  │  🌙 Notifications 👤 Profile    │
│ 40px height   │           │  Each 40px square                │
│ Gap: 12px     │           │  Gap: 12px                       │
└──────────────────────────────────────────────────────────────┘
Height: 56px (includes padding)
Padding: 16px all sides (spacing[4])
Border Bottom: 1px solid rgba(255,207,64, 0.2)
Background: rgba(0,0,0, 0.6) with 32px blur backdrop
Backdrop Filter: blur(32px)
Position: sticky, top: 0, z-index: 40
```

## Empty State

```
┌─────────────────────────────────────────┐
│                                         │
│         📄 (48px, muted 50%)            │
│                                         │
│    No recent sheets yet                 │
│    (16px gap from icon)                 │
│                                         │
│    Create a new spreadsheet or          │
│    import a file to get started         │
│    (12px gap from title)                │
│                                         │
└─────────────────────────────────────────┘
Padding: 48px all sides (spacing[12])
Border: 2px dashed rgba(255,207,64, 0.2)
Border Radius: 12px (lg)
Background: linear-gradient(
  135deg,
  rgba(255,207,64,0.05) 0%,
  rgba(59,130,246,0.05) 100%
)
Text Align: center
```

---

## Quick Reference Table

| Property | Value | Token |
|----------|-------|-------|
| Primary Color | #FFCF40 | `colors.primary.yellow` |
| Dark BG | #000000 | `colors.background.dark` |
| Card BG | rgba(0,0,0,0.95-0.85) | `colors.background.darkCard` |
| White Text | #FFFFFF | `colors.text.primary` |
| Muted Text | rgba(180,180,180,0.7) | `colors.text.secondary` |
| Card Border | rgba(255,207,64,0.2) | `colors.border.primary` |
| Card Shadow | (see shadows) | `colors.shadow.md` |
| Border Radius | 12px | `borderRadius.lg` |
| Standard Padding | 16px | `spacing[4]` |
| Standard Gap | 24px | `spacing[6]` |
| Transition Speed | 200ms | `transitions.base` |

---

**Design Tokens Version**: 1.0
**Last Updated**: 2025-01-26
**Format**: Complete visual reference with measurements and specifications
