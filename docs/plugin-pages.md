# ArvanCloud Reseller WordPress Plugin (`arv-seller`)
## Complete UI Pages & Component Specification (`plugin-pages.md`)

This document outlines all user interface pages, virtual views, admin panels, modals, and micro-components required for the **ArvanCloud Reseller WordPress Plugin**, focusing on the **Cloud Server (ECC / IaaS — سرور ابری)** product, customer wallet engine, and reseller administrative back-office.

---

## 1. Architecture Overview: Dual Interface Model

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                ARVAN RESELLER UI ARCHITECTURE                          │
├────────────────────────────────────────────┬───────────────────────────────────────────┤
│    1. FRONTEND VIRTUAL CANVAS              │    2. WORDPRESS ADMIN BACK-OFFICE         │
│    (Isolated Standalone App-Like UX)       │    (Standard WP Admin Dashboard)          │
│    URL: /cloud-services/*                  │    URL: /wp-admin/admin.php?page=arvan-*  │
│                                            │                                           │
│  ├── Canvas Shell (Header, Nav, Footer)   │  ├── Settings & API Credentials           │
│  ├── Server Configurator (/server/)        │  ├── Global Cloud Resources Oversight     │
│  └── Customer Dashboard (/dashboard/)      │  └── Wallets & Master Ledger Audit        │
└────────────────────────────────────────────┴───────────────────────────────────────────┘
```

---

## 2. Frontend Virtual Storefront & Customer Portal (`/cloud-services/*`)

All frontend pages render through the isolated template [frontend-canvas.php](file:///c:/Users/reza2/Local%20Sites/seller/app/public/wp-content/plugins/arv-seller/templates/frontend-canvas.php), completely bypassing the active WordPress theme to guarantee zero CSS conflicts, full **Sorkhab UI** styling compliance, and Persian RTL-first orientation.

---

### 2.1 Page 1: Standalone Canvas Shell Header & Navigation
* **Location / Template:** [frontend-canvas.php](file:///c:/Users/reza2/Local%20Sites/seller/app/public/wp-content/plugins/arv-seller/templates/frontend-canvas.php)
* **Target Audience:** All visitors and logged-in cloud customers.
* **Key UI Components:**
  * **Brand Identity Area:** Reseller company logo, company name, and subtle "Powered by ArvanCloud" badge.
  * **Navigation Links:**
    * 🚀 **Deploy Server (سفارش سرور ابری):** Links to `/cloud-services/server/`
    * 📊 **Dashboard (داشبورد مدیریت):** Links to `/cloud-services/dashboard/`
    * 🌐 **CDN / DNS:** Links to `/cloud-services/cdn/`
    * 📦 **Object Storage:** Links to `/cloud-services/storage/`
  * **User Profile & Quick Balance Chip (When Logged In):**
    * Live wallet balance in Persian numerals (e.g. `۱۲۵,۰۰۰ تومان`).
    * Direct "Top Up (+)" shortcut button.
    * User avatar / display name and dropdown with Logout.
  * **Login / Register CTA (When Guest):**
    * Prominent "Sign In / Register" button redirecting to login with automatic return callback.
  * **Footer Area:** White-label copyright, support phone and email, and system status indicator.

---

### 2.2 Page 2: Cloud Server Configurator & Storefront (`/cloud-services/server/`)
* **Location / View:** [storefront-server.php](file:///c:/Users/reza2/Local%20Sites/seller/app/public/wp-content/plugins/arv-seller/public/views/storefront-server.php)
* **Target Audience:** Customers selecting, sizing, and deploying a new cloud virtual machine.
* **Layout Structure:** 2-Column Split Layout (8-Column Main Configurator + 4-Column Sticky Live Summary).

#### Main Configurator (Left / Center Column):
1. **Step 1: Datacenter Region Selector (انتخاب دیتاسنتر):**
   * Visual radio selection cards for active regions:
     * 🇮🇷 **Tehran &mdash; Forough (`ir-thr-c2`):** Low latency IXP direct connection.
     * 🇮🇷 **Tehran &mdash; Shahryar (`ir-thr-sh1`):** Tier III enterprise datacenter.
     * 🇮🇷 **Tabriz &mdash; Northwest (`ir-tbz-dc1`):** Geo-redundant disaster recovery site.
   * Latency indicator badge and operational status pulsing dot (`.arvan-dot-green`).

2. **Step 2: Hardware Flavor & Compute Tier Picker (مشخصات سخت‌افزاری سرور):**
   * Categorized tab filters: *All Plans*, *General Purpose*, *Compute Optimized*, *Memory Optimized*.
   * Hardware cards with distinct visual hierarchy:
     * **Starter Eco (`g1-1-2`):** 1 vCPU, 2 GB RAM, 25 GB NVMe &mdash; Entry level.
     * **Standard General (`g1-2-4`):** 2 vCPU, 4 GB RAM, 50 GB NVMe &mdash; Highlighted with *"Most Popular (پیشنهاد ویژه)"* badge.
     * **Performance Pro (`g1-4-8`):** 4 vCPU, 8 GB RAM, 100 GB NVMe &mdash; High workload.
     * **Enterprise Ultra (`g1-8-16`):** 8 vCPU, 16 GB RAM, 200 GB NVMe &mdash; Maximum capacity.
     * **Compute Master (`c1-4-4`):** 4 vCPU, 4 GB RAM, 40 GB NVMe &mdash; Dedicated CPU.
     * **Memory Master (`m1-2-8`):** 2 vCPU, 8 GB RAM, 50 GB NVMe &mdash; Database / caching.
   * Clear display of unit hourly and monthly rates formatted in Persian Toman.

3. **Step 3: Interactive NVMe Storage Slider (فضای ذخیره‌سازی NVMe):**
   * Base NVMe disk included with the selected flavor.
   * Tactile gradient range slider allowing storage expansion (e.g. $25\text{ GB} \rightarrow 500\text{ GB}$).
   * Real-time cost preview ($+4\text{ IRT / GB / Hour}$).

4. **Step 4: Operating System Distribution Picker (سیستم‌عامل سرور):**
   * OS logo badges, release versions, and 64-bit architecture tags:
     * 🐧 **Ubuntu 22.04 LTS (Jammy Jellyfish)** &mdash; Default recommended.
     * 🐧 **Ubuntu 24.04 LTS (Noble Numbat)** &mdash; Latest modern release.
     * 🌀 **Debian 12 (Bookworm)** &mdash; Ultra-stable Linux.
     * 📦 **AlmaLinux 9 / CentOS Stream** &mdash; RHEL enterprise compatible.
     * 🪟 **Windows Server 2022 Standard** &mdash; GUI & RDP enabled.

5. **Step 5: Instance Authentication & Naming (تنظیمات دسترسی و شناسه):**
   * **Server Hostname Input:** Auto-suggested sanitized name (e.g. `srv-web-01`).
   * **Authentication Method Toggle:**
     * **Option A: SSH Public Key (کلید عمومی SSH):** Textarea for `ssh-rsa` key with validation.
     * **Option B: Root Password (رمز عبور ریشه):** Password field with one-click "Generate Strong Password" tool and copy button.

#### Sticky Live Summary & Pricing Panel (Right Column):
* **Live Configuration Summary:**
  * Selected Region, Hardware Specs (vCPU, RAM, Total NVMe Disk), OS Distribution, Public Dedicated IPv4 (`Included 1x`).
* **Dynamic Price Breakdown Box:**
  * **Hourly Rate:** Prominent bold rate (e.g. `۶۸۰ تومان / ساعت`).
  * **Estimated Monthly Rate:** Calculated on 720 hours (e.g. `۴۸۹,۶۰۰ تومان / ماه`).
  * Includes reseller markup margin automatically.
* **Customer Wallet Balance Status:**
  * Current available balance display.
  * Real-time validation warning if balance $< 24\text{ hours}$ run cost.
* **CTA Deploy Button (`#arvan-deploy-btn`):**
  * High-visibility Sorkhab Teal button with launch icon.
  * AJAX loading state with animated spinner.
  * If wallet has insufficient funds, triggers the **Quick Top-Up Modal** without losing form data.

---

### 2.3 Page 3: Customer Portal & Server Management Dashboard (`/cloud-services/dashboard/`)
* **Location / View:** [dashboard-customer.php](file:///c:/Users/reza2/Local%20Sites/seller/app/public/wp-content/plugins/arv-seller/public/views/dashboard-customer.php)
* **Target Audience:** Authenticated customers managing active servers, funding wallets, and reviewing audit logs.

#### UI Sections & Components:
1. **Wallet Balance & Quick Deposit Card (کیف پول و افزایش موجودی):**
   * Large balance readout in Iranian Toman.
   * Account health badge (`.arvan-badge-active` with green dot).
   * **Quick Top-Up Presets:** One-click chips for `50,000`, `100,000`, `200,000`, `500,000` Tomans.
   * **Custom Amount Input & Dynamic Sandbox Gateway Button:**
     * Submits deposit request, executes dynamic sandbox payment verification, generates a RefID (`TRX-XXXXXXXX`), atomically credits the balance, and re-renders the UI instantly without page reload.

2. **Lifecycle Warning & Status Banners:**
   * ⚠️ **Low Balance Alert (هشدار موجودی ناکافی):** Amber alert shown when balance $< 12\text{ hours}$ total hourly burn rate, prompting top-up.
   * 🚫 **Suspension & Lock Notice (سرویس‌های شما تعلیق شده‌اند):** High-priority red alert shown when balance hits $\le 0$, notifying user that servers are powered off and settings locked to Read-Only mode until top-up is completed.

3. **Active Cloud Servers Table & Management Cards (مدیریت سرورهای ابری فعال):**
   * **Server Identification:** Instance Name, Arvan UUID, Assigned Public Dedicated IPv4 (with copy-to-clipboard).
   * **Hardware & Location:** Region flag & title (Tehran/Tabriz), Specs badge (e.g. `4 vCPU / 8 GB / 100 GB`).
   * **Hourly Burn Rate:** Current billing rate (e.g. `۱,۳۲۰ تومان/ساعت`).
   * **Live Runtime Status Badge (`.arvan-badge-status`):**
     * 🟢 **Running (در حال اجرا):** Pulsing green dot.
     * 🟡 **Suspended / Locked (معلق به علت عدم موجودی):** Pulsing amber dot.
     * 🔴 **Stopped (خاموش):** Red dot.
     * 🔵 **Building / Provisioning (در حال راه‌اندازی):** Animated blue spinner.
   * **Interactive Power Lifecycle Controls (`.arvan-btn-group`):**
     * ▶️ **Power On (روشن کردن):** Single-click boot. Enables instant recovery after balance top-up.
     * ⏸️ **Power Off (خاموش کردن):** Gracefully stops the virtual machine.
     * 🔄 **Reboot (راه‌اندازی مجدد):** Soft reboot instance via ArvanCloud API.
     * 🗑️ **Delete / Terminate (حذف دائم سرور):** Triggers two-step confirmation modal to prevent accidental data loss.

4. **Atomic Ledger Transactions History (تاریخچه تراکنش‌های کیف پول):**
   * Tabular audit log with columns:
     * **Date & Time:** Persian formatted date/time.
     * **Transaction Type:** Colored tags (`Top-up / افزایش موجودی`, `Hourly Charge / کسر ساعتی`, `Refund / بازگشت وجه`).
     * **Description & Reference ID:** Gateway authority or server UUID.
     * **Amount:** Green `+50,000` for credits, Red `-680` for hourly deductions.
     * **Balance After Snapshot:** Financial balance recorded at the exact moment of transaction.

---

## 3. WordPress Admin Back-Office Pages (`/wp-admin/admin.php?page=arvan-*`)

---

### 3.1 Admin Page 1: Reseller Settings & API Configuration
* **Menu Path:** `WP Admin > Arvan Reseller > Settings & API`
* **Location / View:** [admin-settings.php](file:///c:/Users/reza2/Local%20Sites/seller/app/public/wp-content/plugins/arv-seller/admin/views/admin-settings.php)
* **Target Audience:** Store Administrator configuring credentials and pricing.

#### Form Sections & Controls:
1. **ArvanCloud API Connection Card:**
   * **API Key Field:** Masked password input for ArvanCloud API token (`Apikey YOUR_TOKEN`).
   * **Test Connection Button (`#arvan-test-api-btn`):** Dispatches AJAX call to `GET /ecc/v1/regions` on ArvanCloud API.
   * **Live Connection Status:** Real-time feedback badge:
     * 🟢 *Connected & Authenticated (اتصال به سرورهای ابر آروان برقرار است)*
     * 🔴 *Authentication Error / Invalid Key (خطا در احراز هویت کلید API)*
2. **Pricing & Monetization Engine Settings:**
   * **Reseller Markup Percentage (%):** Global markup added to base wholesale rates (e.g. `20%`).
   * **Currency Selector:** Toman (`IRT`), Rial (`IRR`), or US Dollar (`USD`).
3. **Infrastructure Defaults:**
   * **Default Datacenter Region:** Dropdown selector (`ir-thr-c2`, `ir-thr-sh1`, `ir-tbz-dc1`).
4. **Storefront White-Label Branding:**
   * Store Name, Support Contact Email, Support Phone, Custom Logo URL.
5. **Virtual Storefront Quick Links Panel:**
   * Direct links to standalone customer views for quick testing.

---

### 3.2 Admin Page 2: Global Cloud Resources Oversight
* **Menu Path:** `WP Admin > Arvan Reseller > All Resources`
* **Controller:** [class-arvan-admin.php](file:///c:/Users/reza2/Local%20Sites/seller/app/public/wp-content/plugins/arv-seller/admin/class-arvan-admin.php)
* **Target Audience:** Administrator monitoring all customer-provisioned infrastructure.

#### UI Elements:
1. **Summary KPI Metric Cards:**
   * **Total Provisioned Servers:** Total active VM count across all users.
   * **Total Reseller MRR / Run Rate:** Cumulative hourly and estimated monthly billing revenue.
   * **Suspended Accounts:** Count of servers currently powered off due to zero balance.
2. **Master Resources Data Table:**
   * Columns: `ID`, `Customer (User ID & Email)`, `Server Name`, `Arvan UUID`, `Region`, `Specs`, `Hourly Rate`, `Status`, `Last Metered At`.
   * **Admin Emergency Actions:**
     * Force Power Off / Suspend.
     * Force Delete / Purge on ArvanCloud API.
     * Manual Metering Trigger button (runs `Arvan_Metering::run_manual_cycle()` on demand).

---

### 3.3 Admin Page 3: Customer Wallets & Master Ledger Audit
* **Menu Path:** `WP Admin > Arvan Reseller > Wallets Ledger`
* **Controller:** [class-arvan-admin.php](file:///c:/Users/reza2/Local%20Sites/seller/app/public/wp-content/plugins/arv-seller/admin/class-arvan-admin.php)
* **Target Audience:** Administrator reviewing finances, customer balances, and ledger adjustments.

#### UI Elements:
1. **Financial Metrics Summary:**
   * Total Customer Deposited Funds.
   * Total Platform Unspent Credit Balance.
   * Total Consumed Metered Charges.
2. **Customer Wallets Table:**
   * `Wallet ID`, `Customer Name`, `Email`, `Current Balance`, `Status (Active / Frozen)`, `Created Date`.
   * **Action: Manual Balance Adjustment Modal:**
     * Admin can manually credit or debit funds with an audit reason note.

---

## 4. Modals, Alerts & Micro-Component Specifications

### 4.1 Server Deletion Two-Step Confirmation Modal
* **Trigger:** Clicking the Delete icon on a server card.
* **Content:**
  * ⚠️ Red warning icon and title: *"Are you sure you want to permanently delete this Cloud Server?"*
  * Description: *"This action will destroy all data, disks, and detach the IP address on ArvanCloud infrastructure. This cannot be undone."*
  * Input field requiring user to type server name to confirm.
  * **Buttons:** "Cancel" and "Confirm Permanent Deletion" (Red).

### 4.2 Insufficient Balance Deploy Modal
* **Trigger:** Submitting server deployment when wallet balance $< 24\text{ hours}$ cost.
* **Content:**
  * Sorkhab Amber alert icon.
  * Summary: *"To deploy this server, a minimum wallet balance of X Toman is required."*
  * Quick top-up preset buttons inside modal.
  * "Deposit & Continue Deploying" button.

### 4.3 Interactive Toast Notification System
* Floating notification container in top-right / top-center for AJAX operations:
  * **Success Toast (Green):** *"Server deployed successfully! IP assigned: 185.143.232.45"*
  * **Info Toast (Blue):** *"Reboot command dispatched to ArvanCloud."*
  * **Warning Toast (Amber):** *"Wallet balance credited with 100,000 Tomans."*
  * **Error Toast (Red):** *"Operation failed: API error from ArvanCloud."*

---

## 5. Summary Mapping Table: Pages, Views & API Endpoints

| UI View / Page | URL / Entry Point | Template / View File | Associated REST Endpoints |
| :--- | :--- | :--- | :--- |
| **Canvas Shell** | `/cloud-services/*` | `templates/frontend-canvas.php` | N/A (Router Shell) |
| **Server Configurator** | `/cloud-services/server/` | `public/views/storefront-server.php` | `GET /ecc/v1/regions`<br>`GET /ecc/v1/regions/{region}/sizes`<br>`GET /ecc/v1/regions/{region}/images`<br>`POST /ecc/v1/regions/{region}/servers` |
| **Customer Dashboard** | `/cloud-services/dashboard/` | `public/views/dashboard-customer.php` | `GET /ecc/v1/regions/{region}/servers/{id}`<br>`POST /ecc/v1/regions/.../power-on`<br>`POST /ecc/v1/regions/.../power-off`<br>`POST /ecc/v1/regions/.../reboot`<br>`DELETE /ecc/v1/regions/.../{id}` |
| **Admin Settings** | `WP Admin > Settings` | `admin/views/admin-settings.php` | `GET /ecc/v1/regions` (Test Connection) |
| **Admin Resources** | `WP Admin > Resources` | `admin/class-arvan-admin.php` | Master index + Emergency power controls |
| **Admin Wallets** | `WP Admin > Wallets` | `admin/class-arvan-admin.php` | Atomic ledger management |
