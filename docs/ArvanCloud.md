# ArvanCloud Reseller WordPress Plugin — Product Idea & Technical Specification

## Executive Summary

An independent, white-label WordPress plugin that allows website owners to resell **ArvanCloud** infrastructure services seamlessly. By communicating directly with ArvanCloud REST APIs under a reseller account, the plugin automates service provisioning, injects customizable profit markups, manages customer wallets, and enforces credit-based service lifecycle policies without requiring external plugins or themes.

---

## Core Target Services

The plugin auto-generates dedicated storefront, configuration, and provisioning interfaces for the primary ArvanCloud compute offering:

* **Cloud Server (سرور ابری — ECC / IaaS):** Virtual instance sizing, multi-tier hardware flavor selection (General, Compute, Memory), OS image template selection (Ubuntu, Debian, AlmaLinux, Windows Server), dynamic NVMe storage expansion slider, SSH key/password management, and real-time lifecycle controls (start, stop, reboot, delete).

---

## Architecture & End-to-End Workflow

```
[ End Customer ]
       │  (1) Registers, Tops Up Wallet, Places Cloud Server Order with Reseller Markup
       ▼
[ WordPress Reseller Portal ]
       │  (2) Deducts Balance & Dispatches Authenticated REST Request
       ▼
[ ArvanCloud Infrastructure APIs (/ecc/v1) ]
       │  (3) Provisions Instance in Reseller Account & Returns IP / UUID
       ▼
[ End Customer Dashboard ] (Receives Instance IP, Specs, and Real-Time Power Controls)

```

* **Zero External Dependencies:** Built completely standalone—no dependencies on WooCommerce, third-party frameworks, or specific active themes.
* **Direct REST Integration:** All background provisioning, monitoring, and deprovisioning operations execute via ArvanCloud's official REST API endpoints (`/ecc/v1`).

---

## Detailed Functional Modules

### 1. Reseller Onboarding & Settings

* **API Key & Access Token Validation:** Input panel for ArvanCloud API key(s) with live connection test to `/ecc/v1/regions`.
* **Multi-Region Cluster Setup:** Support for configuring default datacenter regions (Tehran Forough, Shahryar, Tabriz).
* **Storefront Branding:** White-label customization options for company name, logo, support contact, and branding primary color.

### 2. Service Catalog & Dynamic Pricing Engine

* **Standalone Page Generator:** Automated creation of responsive virtual storefront (`/cloud-services/server/`) and customer portal (`/cloud-services/dashboard/`).
* **Markup Management:** Flexible profit margin settings (percentage or fixed addition on top of base ArvanCloud wholesale pricing).
* **Dynamic Spec Calculators:** Real-time pricing calculations based on user-selected CPU, RAM, NVMe disk, and datacenter region.

### 3. Customer Wallet & Metered Billing

* **Internal User Balance:** Dedicated ledger tracking customer deposits, credits, and historical billing transactions.
* **Pay-As-You-Go & Hourly Metering:** Internal cron-driven balance deduction engine aligned with active resource consumption rates.
* **Customer Resource Dashboard:** Single-pane view for customers to view active virtual machines, assigned dedicated IPs, credentials, and live resource status.

### 4. Lifecycle & Service Termination Engine

Implements strict compliance with ArvanCloud's service termination policies based on customer wallet balance:

* **Threshold Alerts:** Automated warning when wallet balance drops below 12 hours of total run cost.
* **Read-Only / Lock Mode:** Suspends modification rights and powers off virtual instances when credits reach zero.
* **Deactivation & Purge:** Automated API calls to power off virtual instances and flag overdue unpaid resources for permanent deletion.

### 5. UI/UX & Sorkhab Design Compliance

* **Design System Integration:** Component design aligned with the **Sorkhab UI** (`sorkhab.arvancloud.ir`) style guidelines and Google Material Design 3 (M3 Light Mode).
* **Full Viewport Responsiveness:** Optimized interfaces tailored for mobile, tablet, and desktop viewports.

---

## WordPress Security & Code Standards

* **Input Sanitization & Output Escaping:** Strict usage of `sanitize_text_field()`, `wp_kses()`, `esc_html()`, `esc_attr()`, and `esc_url()` across all input points and templates.
* **Nonce & CSRF Protection:** All forms, AJAX calls, and REST endpoints verified with `wp_verify_nonce()` and `check_ajax_referer()`.
* **Access Control & Permissions:** Enforcement of role-based capabilities (`current_user_can('manage_options')` for admin actions; specific customer capability checks for resource management).
* **Secret & Key Protection:** Secure storage and masked display of ArvanCloud API keys and access tokens in `wp_options`.
* **SQL Injection Prevention:** 100% prepared SQL statements utilizing `$wpdb->prepare()`.

---

## Reference Documentation

* **Technical API Docs:** `https://www.arvancloud.ir/fa/dev/api`
* **Official Pricing Tables:** `https://www.arvancloud.ir/fa/pricing/all`
* **Service Termination Policies:** `https://www.arvancloud.ir/fa/legal/service-termination`
* **Sorkhab Design System:** `https://sorkhab.arvancloud.ir`

---

## Judging Criteria & Scoring Breakdown

| Criteria | Points | Focus |
| --- | --- | --- |
| **Feature Completeness** | **120** | Full Cloud Server (ECC) REST API coverage, sales pipeline, instant resource provisioning, and lifecycle enforcement. |
| **UI/UX & Responsiveness** | **70** | Sorkhab UI / M3 Light fidelity, onboarding smoothness, and dual-device (desktop/mobile) responsiveness. |
| **Security & Hardening** | **70** | Nonce verification, strict capability checks, input/output sanitization, and credential security. |
| **Presentation & Demo** | **40** | Coherent walkthrough, clear technical explanation, and smooth execution across devices. |
| **Total** | **300** | |

---

## Submission Deliverables & Demo Checklist

* [ ] **GitHub Repository:** Clean code structure, zero external plugin dependencies, and detailed setup guide in `README.md`.
* [ ] **Demo Video Requirements ($\ge$ 5 Minutes):**
  * Presenter voiceover clearly explaining the technical architecture and user experience.
  * Complete end-to-end user scenario:
    1. Plugin installation & API key configuration.
    2. Pricing markup setup.
    3. Customer registration & wallet balance top-up.
    4. Cloud server selection, customization, and instant provisioning.
    5. Balance depletion and termination/lockout enforcement test.
  * Side-by-side or sequential demonstration on **Desktop** and **Mobile** viewports.