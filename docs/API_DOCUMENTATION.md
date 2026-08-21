# ArvanCloud REST API Complete Technical Reference

## 1. Overview & Authentication

ArvanCloud provides RESTful APIs for programmatic provisioning and management of its cloud infrastructure services. All endpoints communicate over HTTPS using standard HTTP verbs, JSON payloads, and standard HTTP response status codes.

* **Base API Gateway URL:** `https://napi.arvancloud.ir`
* **Alternative / Redoc Documentation Portal:** `https://www.arvancloud.ir/fa/dev/api`
* **API Versioning:** Versioned per service domain (e.g., `/ecc/v1`, `/cdn/4.0`, `/storage/v1`, `/paas/1.25`, `/vod/2.0`).

### 1.1 Authentication & Request Headers
Authentication is performed via API Keys (Machine User Tokens) generated in the ArvanCloud User Panel under **User Profile > API Keys / Machine Users**.

All incoming requests must include the `Authorization` header with the `Apikey` prefix:

```http
GET /ecc/v1/regions HTTP/1.1
Host: napi.arvancloud.ir
Authorization: Apikey YOUR_ARVAN_API_KEY
Content-Type: application/json
Accept: application/json
```

> **Note:** Bearer token authentication (`Authorization: Bearer <TOKEN>`) is also accepted for OAuth2 / User session contexts.

### 1.2 Standard HTTP Response Codes
* `200 OK`: Request succeeded.
* `201 Created`: Resource successfully provisioned.
* `202 Accepted`: Asynchronous task scheduled (e.g. VM provisioning or snapshot creation).
* `204 No Content`: Resource deleted or updated without body response.
* `400 Bad Request`: Validation failure or malformed JSON payload.
* `401 Unauthorized`: Invalid or missing API key.
* `403 Forbidden`: Insufficient account permissions or service locked due to credit terms.
* `404 Not Found`: Target resource does not exist.
* `422 Unprocessable Entity`: Business logic or parameter constraint validation failed.
* `429 Too Many Requests`: Rate limit exceeded.
* `500 Internal Server Error`: Cloud infrastructure backend error.

---

## 2. Cloud Server / IaaS (ECC) API Reference

**Base Path:** `/ecc/v1`

### 2.1 Get Available Regions
Returns the list of active datacenter regions and their operational status.

```http
GET /ecc/v1/regions
```

**Response (`200 OK`):**
```json
{
  "data": [
    {
      "id": "ir-thr-c2",
      "name": "Tehran - Forough",
      "city": "Tehran",
      "country": "Iran",
      "flag": "🇮🇷",
      "status": "active"
    },
    {
      "id": "ir-thr-sh1",
      "name": "Tehran - Shahryar",
      "city": "Tehran",
      "country": "Iran",
      "flag": "🇮🇷",
      "status": "active"
    },
    {
      "id": "ir-tbz-dc1",
      "name": "Tabriz - Northwest",
      "city": "Tabriz",
      "country": "Iran",
      "flag": "🇮🇷",
      "status": "active"
    }
  ]
}
```

---

### 2.2 Get Server Hardware Sizes / Flavors
Retrieves the list of virtual instance flavors (CPU, RAM, Disk, Price) for a specified datacenter region.

```http
GET /ecc/v1/regions/{region}/sizes
```

**Parameters:**
* `region` (path, string): Datacenter identifier (e.g., `ir-thr-c2`).

**Response (`200 OK`):**
```json
{
  "data": [
    {
      "id": "g1-2-4",
      "name": "General 2C-4G",
      "vcpus": 2,
      "ram": 4096,
      "disk": 25,
      "hourly_price": 450,
      "monthly_price": 324000,
      "category": "general"
    },
    {
      "id": "g1-4-8",
      "name": "General 4C-8G",
      "vcpus": 4,
      "ram": 8192,
      "disk": 50,
      "hourly_price": 890,
      "monthly_price": 640800,
      "category": "general"
    },
    {
      "id": "c1-8-16",
      "name": "Compute 8C-16G",
      "vcpus": 8,
      "ram": 16384,
      "disk": 100,
      "hourly_price": 1750,
      "monthly_price": 1260000,
      "category": "compute_optimized"
    }
  ]
}
```

---

### 2.3 Get Operating System Images
Returns standard and marketplace OS templates available for server provisioning.

```http
GET /ecc/v1/regions/{region}/images
```

**Response (`200 OK`):**
```json
{
  "data": [
    {
      "id": "ubuntu-22.04",
      "name": "Ubuntu 22.04 LTS (Jammy Jellyfish)",
      "os_family": "ubuntu",
      "version": "22.04",
      "min_disk": 20
    },
    {
      "id": "ubuntu-24.04",
      "name": "Ubuntu 24.04 LTS (Noble Numbat)",
      "os_family": "ubuntu",
      "version": "24.04",
      "min_disk": 20
    },
    {
      "id": "debian-12",
      "name": "Debian 12 (Bookworm)",
      "os_family": "debian",
      "version": "12",
      "min_disk": 20
    },
    {
      "id": "almalinux-9",
      "name": "AlmaLinux 9",
      "os_family": "almalinux",
      "version": "9",
      "min_disk": 20
    },
    {
      "id": "windows-server-2022",
      "name": "Windows Server 2022 Standard",
      "os_family": "windows",
      "version": "2022",
      "min_disk": 40
    }
  ]
}
```

---

### 2.4 Create Cloud Server Instance
Provisions a new virtual machine instance within the specified datacenter region.

```http
POST /ecc/v1/regions/{region}/servers
```

**Request Body:**
```json
{
  "name": "web-production-01",
  "size_id": "g1-2-4",
  "image_id": "ubuntu-22.04",
  "disk_size": 40,
  "ssh_key": "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC... user@example.com",
  "password": "SecurePassword123!",
  "security_groups": ["default"],
  "enable_ipv6": false
}
```

**Response (`201 Created`):**
```json
{
  "data": {
    "id": "srv-9a8b7c6d-5e4f-3a2b-1c0d-e9f8a7b6c5d4",
    "name": "web-production-01",
    "status": "building",
    "region": "ir-thr-c2",
    "ip_address": "185.143.232.45",
    "size": {
      "id": "g1-2-4",
      "vcpus": 2,
      "ram": 4096,
      "disk": 40
    },
    "created_at": "2026-08-20T12:00:00Z"
  }
}
```

---

### 2.5 Server Lifecycle & Power Controls

#### Power On Server
```http
POST /ecc/v1/regions/{region}/servers/{server_id}/power-on
```

#### Power Off Server (Suspend / Stop)
Used by the plugin when customer wallet credits reach zero.
```http
POST /ecc/v1/regions/{region}/servers/{server_id}/power-off
```

#### Reboot Server
```http
POST /ecc/v1/regions/{region}/servers/{server_id}/reboot
```

#### Delete / Purge Server
Permanently destroys the virtual server and detaches associated storage.
```http
DELETE /ecc/v1/regions/{region}/servers/{server_id}
```

---

## 3. WordPress Plugin Integration Architecture

The `arv-seller` plugin encapsulates this Cloud Server (ECC) API specification inside [class-arvan-api-client.php](file:///c:/Users/reza2/Local%20Sites/seller/app/public/wp-content/plugins/arv-seller/includes/class-arvan-api-client.php):

1. **Central Dispatcher:** Uses WordPress native `wp_remote_request()` with timeout safeguards and SSL verification.
2. **Transient Caching:** Automatically caches read-only lookups (`GET /ecc/v1/regions`, `GET /ecc/v1/regions/{region}/sizes`, `GET /ecc/v1/regions/{region}/images`) with configurable TTL (default: 3600 seconds) to ensure sub-100ms response times for frontend configurators.
3. **Error Normalization:** Converts raw API error responses and HTTP status codes into standard `WP_Error` objects for graceful UI handling.
4. **Lifecycle Control:** Dispatches instant power commands (`power-on`, `power-off`, `reboot`, `delete`) and synchronizes status with the local `wp_arvan_resources` database.

