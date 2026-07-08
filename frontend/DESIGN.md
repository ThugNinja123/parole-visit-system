---
name: Sentinel Command
colors:
  surface: '#f7f9fb'
  surface-dim: '#d8dadc'
  surface-bright: '#f7f9fb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f6'
  surface-container: '#eceef0'
  surface-container-high: '#e6e8ea'
  surface-container-highest: '#e0e3e5'
  on-surface: '#191c1e'
  on-surface-variant: '#44474d'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f3'
  outline: '#75777e'
  outline-variant: '#c5c6ce'
  surface-tint: '#4f5e7e'
  primary: '#041632'
  on-primary: '#ffffff'
  primary-container: '#1b2b48'
  on-primary-container: '#8393b5'
  inverse-primary: '#b7c7eb'
  secondary: '#9d4300'
  on-secondary: '#ffffff'
  secondary-container: '#fd761a'
  on-secondary-container: '#5c2400'
  tertiary: '#06172a'
  on-tertiary: '#ffffff'
  tertiary-container: '#1c2c40'
  on-tertiary-container: '#8393ac'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#b7c7eb'
  on-primary-fixed: '#091b37'
  on-primary-fixed-variant: '#374765'
  secondary-fixed: '#ffdbca'
  secondary-fixed-dim: '#ffb690'
  on-secondary-fixed: '#341100'
  on-secondary-fixed-variant: '#783200'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f7f9fb'
  on-background: '#191c1e'
  surface-variant: '#e0e3e5'
typography:
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-margin: 24px
  gutter: 12px
  cell-padding-v: 8px
  cell-padding-h: 12px
---

## Brand & Style

The design system is engineered for high-stakes operational environments where clarity, speed of cognition, and data integrity are paramount. The brand personality is **authoritative, vigilant, and systematic**, reflecting the critical nature of parole monitoring and public safety.

The visual style follows a **Corporate / Modern** approach with elements of **High-Density Utility**. It prioritizes information density over white space, ensuring that officers have immediate access to comprehensive data sets without excessive scrolling. The aesthetic is "strictly professional," utilizing a structured grid and a rigorous color-coded status system to minimize human error during data entry and review.

## Colors

This design system utilizes a structured palette designed for maximum contrast and immediate recognition of risk levels.

- **Primary (Security Blue):** Used for persistent navigation, headers, and primary actions. It establishes a foundation of stability and authority.
- **Secondary (Safety Orange):** Reserved exclusively for critical alerts, high-risk status indicators, and emergency notifications. Use sparingly to maintain its psychological impact.
- **Neutral (Slate & Stone):** A range of cool grays provides the scaffolding for data-heavy tables, ensuring that the background recedes and the data remains the focal point.
- **Status Tiers:**
    - **Violation (Red):** Immediate action required.
    - **Compliant (Green):** Standard operational status.
    - **Pending (Yellow):** Requires review or scheduled follow-up.

## Typography

The typography system relies on **Inter**, chosen for its exceptional legibility in data-intensive interfaces. To maximize screen real estate, the system uses tight line-heights and slightly smaller base font sizes than standard consumer apps.

**Tabular Numerals:** For all data tables, visit logs, and ID numbers, ensure `font-variant-numeric: tabular-nums` is active. This ensures that columns of numbers align vertically, allowing officers to scan and compare values rapidly. 

**Hierarchy:** Headlines are bold and concise. Labels use uppercase with slight tracking to differentiate metadata from user-generated content.

## Layout & Spacing

The layout utilizes a **Fixed Grid** system for desktop (1280px container) to ensure data tables do not stretch to unreadable widths on ultra-wide monitors. 

- **Side Navigation:** A fixed 240px sidebar provides constant access to the core modules: Dashboard, Directory, Inventory, and Map.
- **Data Density:** A 4px base spacing unit allows for "Compact" and "Standard" density modes. Table rows should be kept to a maximum height of 40px in standard view.
- **Breakpoints:**
    - **Desktop (1280px+):** Full sidebar and multi-column data views.
    - **Tablet (768px - 1279px):** Collapsed sidebar (icons only), stacked table headers for critical fields.
    - **Mobile (Below 768px):** Cards replace table rows for field-use accessibility.

## Elevation & Depth

This design system uses **Tonal Layers and Low-Contrast Outlines** rather than heavy shadows to maintain a clean, "document-like" feel.

- **Level 0 (Background):** Neutral Gray (#F8FAFC). Used for the canvas.
- **Level 1 (Cards/Tables):** Pure White with a 1px border (#E2E8F0). This is the primary surface for data entry.
- **Level 2 (Modals/Overlays):** A subtle 4px blur shadow with 5% opacity is used to separate active task windows (like visit logs) from the background dashboard.
- **Interactive States:** Buttons and rows use a slight background tint (#F1F5F9) on hover rather than an elevation increase.

## Shapes

The shape language is **Soft** but professional. A 4px (0.25rem) radius is applied to buttons, input fields, and containers. This slight rounding provides a modern feel without sacrificing the "serious" architectural tone required for a law enforcement application. Larger containers like maps or dashboard sections use an 8px (0.5rem) radius for clear containment.

## Components

- **Data Tables:** Columns must support "Sticky" positioning for Parolee Names and Actions. Use alternating row stripes (Zebra striping) for readability in 50+ row datasets.
- **Status Badges:** Compact pills with high-contrast text. Use the status colors defined in the palette. Badges for "High Risk" should include a small alert icon.
- **Input Fields:** Use "Top Aligned" labels to maximize horizontal space in forms. Required fields are marked with a Security Blue asterisk.
- **Primary Buttons:** Solid Security Blue background with white text.
- **Action Menus:** Inline "meatball" (three dots) menus at the end of each table row for quick actions like "Log Visit," "View Profile," or "Flag Violation."
- **Map Interface:** Integrated maps should use a "Light" or "Grayscale" map style to allow the Safety Orange (Violation) and Security Blue (Officer Location) markers to stand out.
- **Visit Log Form:** A multi-step stepper component at the top of the form keeps the officer oriented during lengthy data entry sessions.