# ArvanCloud Reseller WordPress Plugin — Product Idea & Technical Specification

## Executive Summary

An independent, white-label WordPress plugin that allows website owners to resell **ArvanCloud** infrastructure services seamlessly. By communicating directly with ArvanCloud REST APIs under a reseller account, the plugin automates service provisioning, injects customizable profit markups, manages customer wallets, and enforces credit-based service lifecycle policies without requiring external plugins or themes.

---

## Core Target Services

The plugin auto-generates dedicated storefront, configuration, and provisioning interfaces for three primary ArvanCloud offerings:

* **Cloud Server (سرور ابری):** Virtual instance sizing, OS image selection, SSH key management, and real-time lifecycle controls (start, stop, reboot).
* **CDN (شبکه توزیع محتوا):** Domain registration, DNS record management, custom caching rules, and SSL certificate provisioning.
* **Object Storage (فضای ابری):** S3-compatible bucket creation, storage quota allocation, and access/secret key management.

---

## Architecture & End-to-End Workflow

```
[ End Customer ]
       │  (1) Registers, Tops Up Wallet, Places Order with Reseller Markup
       ▼
[ WordPress Reseller Portal ]
       │  (2) Deducts Balance & Dispatches Authenticated REST Request
       ▼
[ ArvanCloud Infrastructure APIs ]
       │  (3) Provisions Resource in Reseller Account & Returns Metadata
       ▼
[ End Customer Dashboard ] (Receives Instance IP, Bucket Keys, or CDN Nameservers)

```

* **Zero External Dependencies:** Built completely standalone—no dependencies on WooCommerce, third-party frameworks, or specific active themes.
* **Direct REST Integration:** All background provisioning, monitoring, and deprovisioning operations execute via ArvanCloud's official REST API endpoints.

---

## Detailed Functional Modules

### 1. Reseller Onboarding & Settings

* **API Key & Access Token Validation:** Input panel for ArvanCloud API key(s) with token hash verification.
* **Multi-Cluster Key Management:** Support for managing distinct API keys across different regional or service clusters.
* **Storefront Branding:** White-label customization options for company name, logo, "About Us", and contact metadata.

### 2. Service Catalog & Dynamic Pricing Engine

* **Standalone Page Generator:** Automated creation of 3 responsive landing and ordering pages (CDN, Storage, Server).
* **Markup Management:** Flexible profit margin settings (percentage or fixed addition on top of base ArvanCloud pricing).
* **Dynamic Spec Calculators:** Real-time pricing calculations based on user-selected CPU, RAM, disk, traffic, and storage parameters.

### 3. Customer Wallet & Metered Billing

* **Internal User Balance:** Dedicated ledger tracking customer deposits, credits, and historical billing transactions.
* **Pay-As-You-Go & Hourly Metering:** Internal cron-driven balance deduction engine aligned with active resource consumption rates.
* **Customer Resource Dashboard:** Single-pane view for customers to view active services, connection endpoints, credentials, and live resource status.

### 4. Lifecycle & Service Termination Engine

Implements strict compliance with ArvanCloud's service termination policies based on customer wallet balance:

* **Threshold Alerts:** Automated notification when balance drops below critical levels.
* **Read-Only / Lock Mode:** Suspends modification rights and downgrades services when credits reach zero.
* **Deactivation & Purge:** Automated API calls to stop virtual instances, detach DNS routing, or lock storage buckets once grace periods expire.

### 5. UI/UX & Sorkhab Design Compliance

* **Design System Integration:** Component design aligned with the **Sorkhab UI** (`sorkhab.arvancloud.ir`) style guidelines.
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

* **Technical API Docs:** `[https://www.arvancloud.ir/fa/dev/api](https://www.arvancloud.ir/fa/dev/api)`
* **Official Pricing Tables:** `[https://www.arvancloud.ir/fa/pricing/all](https://www.arvancloud.ir/fa/pricing/all)`
* **Service Termination Policies:** `[https://www.arvancloud.ir/fa/legal/service-termination](https://www.arvancloud.ir/fa/legal/service-termination)`
* **Sorkhab Design System:** `[https://sorkhab.arvancloud.ir](https://sorkhab.arvancloud.ir)`

---

## Judging Criteria & Scoring Breakdown

| Criteria | Points | Focus |
| --- | --- | --- |
| **Feature Completeness** | **120** | Full REST API coverage, sales pipeline, instant resource provisioning, and lifecycle enforcement. |
| **UI/UX & Responsiveness** | **70** | Sorkhab UI fidelity, onboarding smoothness, and dual-device (desktop/mobile) responsiveness. |
| **Security & Hardening** | **70** | Nonce verification, strict capability checks, input/output sanitization, and credential security. |
| **Presentation & Demo** | **40** | Coherent walkthrough, clear technical explanation, and smooth execution across devices. |
| **Total** | **300** |  |

---

## Submission Deliverables & Demo Checklist

* [ ] **GitHub Repository:** Clean code structure, zero external plugin dependencies, and detailed setup guide in `README.md`.
* [ ] **Demo Video Requirements ($\ge$ 5 Minutes):**
* Presenter voiceover clearly explaining the technical architecture and user experience.
* Complete end-to-end user scenario:
1. Plugin installation & API key configuration.
2. Pricing markup setup.
3. Customer registration & wallet balance top-up.
4. Service selection, customization, and instant provisioning.
5. Balance depletion and termination/lockout enforcement test.


* Side-by-side or sequential demonstration on **Desktop** and **Mobile** viewports.