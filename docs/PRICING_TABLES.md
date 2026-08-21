# ArvanCloud Official Pricing Models & Reseller Markup Engine

## 1. Official Pricing Architecture

ArvanCloud utilizes a **Pay-As-You-Go (PAYG)** metered billing model with sub-hourly resolution. Prices are quoted in **Iranian Tomans (IRT)** and **Iranian Rials (IRR)**.

* **Reference Official Pricing Portal:** `https://www.arvancloud.ir/fa/pricing/all`
* **Real-time Price Calculator:** `https://panel.arvancloud.ir/calculator`

---

## 2. Wholesale Unit Rates (Base Pricing)

### 2.1 Cloud Server (ECC / IaaS) Rates
* **Compute (vCPU):** ~`120 IRT / vCPU / Hour`
* **Memory (RAM):** ~`50 IRT / GB / Hour`
* **Fast NVMe Block Storage:** ~`4 IRT / GB / Hour` (~`2,880 IRT / GB / Month`)
* **Dedicated IPv4 Address:** ~`15 IRT / Hour` (~`10,800 IRT / Month`)
* **Outbound Internet Traffic:** First tier free / ~`180 IRT / GB`

#### Standard Server Flavor Pricing Matrix

| Flavor Tier | vCPU | RAM | Base NVMe Disk | Base Wholesale (Hourly) | Base Wholesale (Monthly) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **g1-1-2 (General)** | 1 vCPU | 2 GB | 20 GB | **250 IRT** | **180,000 IRT** |
| **g1-2-4 (General)** | 2 vCPU | 4 GB | 40 GB | **450 IRT** | **324,000 IRT** |
| **g1-4-8 (General)** | 4 vCPU | 8 GB | 60 GB | **890 IRT** | **640,800 IRT** |
| **g1-8-16 (General)** | 8 vCPU | 16 GB | 100 GB | **1,750 IRT** | **1,260,000 IRT** |
| **c1-4-4 (Compute)** | 4 vCPU | 4 GB | 40 GB | **690 IRT** | **496,800 IRT** |
| **m1-2-8 (Memory)** | 2 vCPU | 8 GB | 50 GB | **650 IRT** | **468,000 IRT** |

---

## 3. Reseller Dynamic Markup Calculation Engine

The plugin calculates retail customer prices dynamically using the formulas implemented in [Arvan_API_Client::calculate_price_with_markup()](file:///c:/Users/reza2/Local%20Sites/seller/app/public/wp-content/plugins/arv-seller/includes/class-arvan-api-client.php#L386-L398):

$$\text{Retail Price} = \text{Base Wholesale Cost} \times \left( 1 + \frac{\text{Markup Percentage}}{100} \right) + \text{Fixed Margin}$$

### Example Calculation ($20\%$ Reseller Markup):
* **Base Wholesale Rate:** `450 IRT / Hour` (`324,000 IRT / Month`)
* **Reseller Markup ($20\%$):** $+90\text{ IRT / Hour}$ ($+64,800\text{ IRT / Month}$)
* **Customer Retail Price:** **`540 IRT / Hour`** (**`388,800 IRT / Month`**)
* **Reseller Profit Per Active VM:** **`64,800 IRT / Month`**

---

## 4. Frontend Dynamic Spec Calculator Implementation
In the virtual configurator ([storefront-server.php](file:///c:/Users/reza2/Local%20Sites/seller/app/public/wp-content/plugins/arv-seller/public/views/storefront-server.php)), client-side JavaScript listens to slider events and option selections to recalculate costs in real time:

```javascript
function recalculateTotal() {
    const baseHourly = selectedFlavor.hourly_price;
    const extraDiskGb = Math.max(0, currentDisk - selectedFlavor.disk);
    const extraDiskHourly = extraDiskGb * 4; // 4 IRT per GB per hour
    
    const wholesaleHourly = baseHourly + extraDiskHourly;
    const markupMultiplier = 1 + (window.ArvanConfig.markupPct / 100);
    
    const customerHourly = Math.round(wholesaleHourly * markupMultiplier);
    const customerMonthly = customerHourly * 720; // 720 hours in 30-day month
    
    document.getElementById('arvan-summary-hourly').textContent = customerHourly.toLocaleString('fa-IR') + ' تومان';
    document.getElementById('arvan-summary-monthly').textContent = customerMonthly.toLocaleString('fa-IR') + ' تومان';
}
```
