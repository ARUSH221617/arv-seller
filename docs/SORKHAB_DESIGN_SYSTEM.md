# ArvanCloud Sorkhab Design System Technical Guide

## 1. Overview & Principles

The **Sorkhab UI Design System** (`https://sorkhab.arvancloud.ir`) is ArvanCloud's official design system for building cloud management portals, developer tools, and web applications.

The `arv-seller` plugin adopts Sorkhab UI principles to ensure a native, visually stunning experience that matches ArvanCloud's branding and user experience standards.

---

## 2. Core Design Tokens & Palette

### 2.1 Brand & Accent Colors
* **Arvan Teal / Cyan (Primary Accent):** `#00baba` / `#20c5ba`
* **Arvan Dark Green:** `#0b3a42` / `#004a4a`
* **Arvan Gold / Amber (Highlights & Alerts):** `#ffb300` / `#ffa000`
* **Arvan Pink / Accent Magenta:** `#f43e88`

### 2.2 Surface & Dark Mode Tokens
* **Dark Background (Canvas Root):** `#0f172a` (Slate 900)
* **Card & Container Background:** `#1e293b` (Slate 800)
* **Elevated / Hover Surface:** `#334155` (Slate 700)
* **Borders & Dividers:** `rgba(255, 255, 255, 0.08)` / `#334155`
* **Glassmorphism Backdrop:** `rgba(30, 41, 59, 0.75)` with `backdrop-filter: blur(12px)`

### 2.3 Semantic Status Colors
* **Success / Running:** `#10b981` (Emerald) &mdash; `rgba(16, 185, 129, 0.15)`
* **Warning / Suspended:** `#f59e0b` (Amber) &mdash; `rgba(245, 158, 11, 0.15)`
* **Danger / Terminated / Error:** `#ef4444` (Rose) &mdash; `rgba(239, 68, 68, 0.15)`
* **Info / In-Progress:** `#3b82f6` (Blue) &mdash; `rgba(59, 130, 246, 0.15)`

---

## 3. Persian RTL & Typography

* **Direction:** 100% Right-to-Left (`direction: rtl; unicode-bidi: embed;`)
* **Font Family Stack:**
  ```css
  font-family: "Vazirmatn", "Shabnam", "Yekan Bakh", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  ```
* **Number Formatting:** Digits in currency and metric values rendered using Persian numeral glyphs (`۱۲۵,۰۰۰ تومان`).
* **Text Hierarchy:**
  * **H1 (Page Title):** `1.75rem` / `28px`, Bold (`700`), Tracking tight.
  * **H2 (Section Header):** `1.25rem` / `20px`, Bold (`700`).
  * **H3 (Card Title):** `1.125rem` / `18px`, Medium (`600`).
  * **Body Text:** `0.875rem` / `14px`, Regular (`400`), Line-height `1.6`.
  * **Caption / Meta:** `0.75rem` / `12px`, Light (`300`), Color Slate 400.

---

## 4. UI Components & Patterns

### 4.1 Step Cards & Configurator Selectors
* Selectable option boxes (e.g., Datacenter Regions, Hardware Flavors, OS Images) use interactive radio card tiles with smooth border transitions and subtle glow on active state:
  ```css
  .arvan-select-box {
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      background: #1e293b;
      transition: all 0.2s ease-in-out;
  }
  .arvan-select-box.active, .arvan-select-box:has(input:checked) {
      border-color: #00baba;
      box-shadow: 0 0 16px rgba(0, 186, 186, 0.2);
  }
  ```

### 4.2 Interactive Sliders
* Custom styled range sliders for disk size selection with filled gradient track and tactile thumb.

### 4.3 Action Badges & Status Indicators
* Pulsing live dots (`.arvan-dot`) indicating active server states (`green` for running, `amber` for suspended, `red` for stopped).

---

## 5. Responsive Viewport Standards

All virtual canvas views are designed with responsive layouts:
* **Mobile Viewport ($< 640px$):** Single column stack, sticky summary bottom sheet, compact 2x2 grid selectors.
* **Tablet Viewport ($640px - 1024px$):** Two-column layout with fluid card wrapping.
* **Desktop Viewport ($> 1024px$):** Split layout with left configurator (8 cols) and right sticky live summary panel (4 cols).
