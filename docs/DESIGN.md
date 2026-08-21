# ArvanCloud Reseller (`arv-seller`) — Frontend & Admin UI / Design System Specification
**Version:** 3.2.0  
**Theme Mode:** **Light Mode (Default & Universal across User Storefront & Admin Back-Office)**  
**Technology Stack:** React 19/18 + TypeScript + TailwindCSS + shadcn/ui  
**Design Standard:** Google Material Design 3 (M3 — https://m3.material.io/) + ArvanCloud Sorkhab UI  
**Orientation:** Universal Bi-Directional (RTL-First for Persian/Arabic & LTR for English/Turkish/Chinese/Russian)  
**Target Routes:**
- Storefront Virtual Canvas: `/cloud-services/*`
- WordPress Admin Back-Office: `/wp-admin/admin.php?page=arvan-reseller*`

---

## 1. Executive Summary & Design Vision

Both the **Frontend Storefront Portal** and the **WordPress Admin Management Hub** deliver an enterprise-grade, high-performance, and visually captivating cloud management experience rendered in a crisp, modern **Light Mode**. Built with **React TypeScript**, **TailwindCSS**, and **shadcn/ui** component primitives according to **Material Design 3 (M3)** specifications, they ensure:

1. **Zero CSS/Theme Conflicts**: Renders within dedicated virtual canvas containers (`#arvan-cloud-app` on frontend and `#arvan-admin-root` in WP-Admin).
2. **Material Design 3 (M3) Light Mode Elevation & Tonal Surfaces**: 6 distinct tonal surface levels (`surface-0` to `surface-5`) with soft neutral slates, pure white cards, crisp borders, and subtle drop-shadows.
3. **shadcn/ui Accessible Component Primitives**: Unstyled Radix UI primitives with Tailwind variant authority (`cva`) for buttons, cards, sliders, dialogs, tabs, and toast snackbars.
4. **Bi-Directional Excellence**: Pixel-perfect native layouts for Persian (`fa`), English (`en`), Arabic (`ar`), Turkish (`tr`), Chinese (`zh`), and Russian (`ru`).
5. **High-Contrast Readability**: Dark charcoal headings (`text-slate-900`), medium slate subtitles (`text-slate-600`), accessible teal brand accents (`#008b8b`), and crisp borders (`border-slate-200`).

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                       REACT TS + TAILWINDCSS + SHADCN/UI + M3 LIGHT ARCHITECTURE                       │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  1. Storefront Shell: Brand Logo • Navigation Pills • Multi-Lang Dropdown • Live Wallet Chip • Avatar  │
│     ├── 🚀 /cloud-services/server/   &rarr; Split 8:4 Configurator + Sticky Real-time Order Summary Panel │
│     └── 📊 /cloud-services/dashboard/&rarr; Financial KPI Cards + Server Lifecycle Table + Ledger Logs   │
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  2. Admin Back-Office: Top App Bar • Reseller Sub-Tabs • Multi-Lang Switcher • Toast Alerts            │
│     ├── ⚙️ Settings & API            &rarr; Live API Test, Sandbox Toggle, Markup Engine, Store Branding │
│     ├── ☁️ Cloud Resources           &rarr; Master VM Grid, Run Metering Trigger, Emergency Purge/Power │
│     └── 💼 Customer Wallets          &rarr; Financial KPI Stats, Master Balances, Manual Ledger Modal    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Material Design 3 (M3) Color System & Tonal Tokens (Light Mode)

### 2.1 M3 Tonal Surface Elevation Palette
| Surface Level | Tailwind Class | Hex Value | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| **Surface 0** | `bg-m3-surface` | `#f8fafc` | Clean root background canvas |
| **Surface 1** | `bg-m3-surface-1` | `#ffffff` | Elevated cards, main view containers, table bodies |
| **Surface 2** | `bg-m3-surface-2` | `#f1f5f9` | Input backgrounds, table headers, option tracks |
| **Surface 3** | `bg-m3-surface-3` | `#ffffff` | Floating dialog modals, dropdown menus |
| **Surface 4** | `bg-m3-surface-4` | `#e2e8f0` | Slider track background, subtle active containers |
| **Surface 5** | `bg-m3-surface-5` | `#cbd5e1` | Outlines and borders |

### 2.2 Sorkhab Brand & M3 Accent Tokens
| Token Name | Tailwind Class | Hex Value | Purpose / Usage |
| :--- | :--- | :--- | :--- |
| **Primary (Teal)** | `text-arvan-teal` / `bg-arvan-teal` | `#008b8b` | Primary brand CTA buttons, selected card borders |
| **Primary Container** | `bg-m3-primary-container` | `#e6f7f7` | Active selection tint for radio cards |
| **Secondary (Pink)** | `text-arvan-pink` / `bg-arvan-pink` | `#e11d48` | Promotional badges, "Most Popular" tags |
| **Warning (Amber)** | `text-arvan-amber` / `bg-arvan-amber` | `#d97706` | Low balance alert, suspended status |
| **Success (Emerald)** | `text-arvan-emerald` / `bg-arvan-emerald`| `#059669` | Running status, positive wallet credits |
| **Danger (Rose)** | `text-arvan-rose` / `bg-arvan-rose` | `#dc2626` | Server destruction, zero-balance lockout |
| **Info (Blue)** | `text-arvan-blue` / `bg-arvan-blue` | `#2563eb` | DNS zone records, SSL active badge |

---

## 3. Typography & Bi-Directional Layout Rules

```css
/* Persian & Arabic (RTL) */
.lang-fa, .lang-ar, [dir="rtl"] {
    font-family: "Vazirmatn", "Tahoma", -apple-system, sans-serif !important;
}

/* English, Turkish & European (LTR) */
.lang-en, .lang-tr, [dir="ltr"] {
    font-family: "Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif !important;
}

/* Chinese Simplified (LTR) */
.lang-zh {
    font-family: "PingFang SC", "Microsoft YaHei", "Noto Sans SC", -apple-system, sans-serif !important;
}

/* Russian Cyrillic (LTR) */
.lang-ru {
    font-family: "Plus Jakarta Sans", "Roboto", sans-serif !important;
}
```

---

## 4. Admin Management Hub Specifications (`src/admin/`)

The plugin's WordPress Admin interface is mounted directly at `#arvan-admin-root` in clean Light Mode:

### 4.1 Settings & Monetization View (`AdminSettingsView.tsx`)
- **API Credentials & Live Test:** Master Machine User API key input with an interactive "Test Connection" button calling ArvanCloud API in real time.
- **Sandbox Mode Switch:** Interactive toggle allowing administrators to simulate provisioning and testing without calling live billing.
- **Dynamic Pricing Engine:** Configurable percentage markup and fixed margin addition sliders with instant live calculation examples.
- **White-Label Branding & Storefront Launchpad:** Custom store name, support contacts, and direct launch buttons for standalone storefront canvas views (Server Configurator & Customer Dashboard).

### 4.2 Cloud Resources Oversight View (`AdminResourcesView.tsx`)
- **Master Metrics:** Total VMs, Active Running Instances, Suspended (0 Balance) Accounts, and Total Monthly Run Rate (MRR).
- **Interactive Multi-Filter Table:** Instant live search and status filters (All, Active, Suspended, Stopped).
- **Emergency Actions & Metering:** Instant administrative "Power Off", "Purge", and "Run Metering Cycle Now" controls.

### 4.3 Customer Wallets & Master Ledger View (`AdminWalletsView.tsx`)
- **Financial KPI Cards:** Active Wallets Count, Total Outstanding Credit, Cumulative Deposits, and Metered Burn Total.
- **Wallets Master Ledger:** User ID, Name, Email, Balance in Toman, Hourly Burn, and Creation date.
- **Manual Balance Adjustment Modal:** Credit (+) or Debit (-) selector, Amount input, Audit note logging, and instantaneous AJAX ledger updating.
