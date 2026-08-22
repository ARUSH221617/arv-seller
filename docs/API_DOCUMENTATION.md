# ArvanCloud IaaS / Cloud Server REST API Technical Reference

## 1. Overview & Authentication

ArvanCloud provides RESTful APIs for programmatic provisioning and lifecycle management of its Cloud Server (IaaS / ECC) infrastructure. All endpoints communicate over HTTPS using standard HTTP verbs, JSON payloads, and standard HTTP response status codes.

* **IaaS v3 Regional API Gateway:** `https://ecc.{region}.arvanapis.ir/v3` (e.g. `https://ecc.ir-thr-ba1.arvanapis.ir/v3`)
* **Legacy Fallback Gateway:** `https://napi.arvancloud.ir`
* **Official OpenAPI Specification:** [iaas-3.0.0.yaml](file:///c:/Users/reza2/Local%20Sites/seller/app/public/wp-content/plugins/arv-seller/docs/iaas-3.0.0.yaml)
* **API Version:** IaaS v3.0.1 (OpenAPI 3.0.0)

### 1.1 Authentication & Request Headers
Authentication is performed via API Keys (Machine User Tokens) generated in the ArvanCloud User Panel under **User Profile > API Keys / Machine Users**.

All incoming requests must include the `Authorization` header with the `Apikey` prefix or Bearer token:

```http
GET /availability-zones HTTP/1.1
Host: ecc.ir-thr-ba1.arvanapis.ir
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

## 2. Cloud Server / IaaS API Reference

### 2.1 Get Availability Zones
Returns the list of active datacenter availability zones and their operational status.

```http
GET /availability-zones
```

**Response (`200 OK`):**
```json
{
  "message": "Availability zones retrieved successfully",
  "data": [
    {
      "code": "ir-thr-ba1",
      "name": "Bamdad (Tehran)",
      "city": "Tehran",
      "country": "Iran",
      "region": "ir-central1",
      "zone": "ir-thr-ba1",
      "state": "UP",
      "isVolumeBacked": true
    },
    {
      "code": "ir-thr-sh1",
      "name": "Shahryar (Tehran)",
      "city": "Tehran",
      "country": "Iran",
      "region": "ir-central1",
      "zone": "ir-thr-sh1",
      "state": "UP",
      "isVolumeBacked": true
    },
    {
      "code": "ir-tbz-sh1",
      "name": "Shahriar (Tabriz)",
      "city": "Tabriz",
      "country": "Iran",
      "region": "ir-northwest1",
      "zone": "ir-tbz-sh1",
      "state": "UP",
      "isVolumeBacked": true
    }
  ]
}
```

---

### 2.2 Get Server Hardware Flavors / Plans
Retrieves the list of virtual instance flavors (CPU, RAM, Disk, Price) for the target availability zone.

```http
GET /flavors
```

**Response (`200 OK`):**
```json
{
  "message": "Flavors retrieved successfully",
  "data": [
    {
      "id": "g2-1-2-0",
      "name": "Starter Eco G2",
      "cpuCores": 1,
      "memoryMegaBytes": 2048,
      "diskGigaBytes": 25,
      "pricePerHour": 250,
      "pricePerMonth": 180000,
      "generation": "G2",
      "type": "STANDARD",
      "availabilityZone": "ir-thr-ba1"
    },
    {
      "id": "g1-2-4",
      "name": "General 2C-4G",
      "cpuCores": 2,
      "memoryMegaBytes": 4096,
      "diskGigaBytes": 40,
      "pricePerHour": 450,
      "pricePerMonth": 324000,
      "generation": "G2",
      "type": "STANDARD",
      "availabilityZone": "ir-thr-ba1"
    },
    {
      "id": "g1-4-8",
      "name": "General 4C-8G",
      "cpuCores": 4,
      "memoryMegaBytes": 8192,
      "diskGigaBytes": 60,
      "pricePerHour": 890,
      "pricePerMonth": 640800,
      "generation": "G2",
      "type": "STANDARD",
      "availabilityZone": "ir-thr-ba1"
    },
    {
      "id": "c1-4-4",
      "name": "Compute 4C-4G",
      "cpuCores": 4,
      "memoryMegaBytes": 4096,
      "diskGigaBytes": 40,
      "pricePerHour": 690,
      "pricePerMonth": 496800,
      "generation": "C1",
      "type": "COMPUTE",
      "availabilityZone": "ir-thr-ba1"
    },
    {
      "id": "m1-2-8",
      "name": "Memory 2C-8G",
      "cpuCores": 2,
      "memoryMegaBytes": 8192,
      "diskGigaBytes": 50,
      "pricePerHour": 650,
      "pricePerMonth": 468000,
      "generation": "M1",
      "type": "MEMORY",
      "availabilityZone": "ir-thr-ba1"
    }
  ]
}
```

---

### 2.3 Calculate Flavor Price with Extra Volume
Calculates server pricing dynamically when adding extra NVMe volume storage.

```http
POST /flavors/{id}/calculate
```

**Request Body:**
```json
{
  "volumeSize": 50
}
```

**Response (`200 OK`):**
```json
{
  "message": "Price calculated successfully",
  "data": {
    "pricePerHour": 650,
    "pricePerMonth": 468000,
    "volumeSize": 50
  }
}
```

---

### 2.4 Get Operating System Images
Returns standard and custom OS templates available for server provisioning.

```http
GET /images
```

**Response (`200 OK`):**
```json
{
  "message": "Images retrieved successfully",
  "data": [
    {
      "id": "ubuntu-22.04",
      "name": "Ubuntu 22.04 LTS (Jammy Jellyfish)",
      "osType": "LINUX",
      "osVersion": "22.04",
      "minDiskGigaBytes": 20,
      "minRamMegaBytes": 1024,
      "status": "ACTIVE",
      "type": "PUBLIC",
      "availabilityZone": "ir-thr-ba1"
    },
    {
      "id": "ubuntu-24.04",
      "name": "Ubuntu 24.04 LTS (Noble Numbat)",
      "osType": "LINUX",
      "osVersion": "24.04",
      "minDiskGigaBytes": 20,
      "minRamMegaBytes": 1024,
      "status": "ACTIVE",
      "type": "PUBLIC",
      "availabilityZone": "ir-thr-ba1"
    },
    {
      "id": "debian-12",
      "name": "Debian 12 (Bookworm)",
      "osType": "LINUX",
      "osVersion": "12",
      "minDiskGigaBytes": 20,
      "minRamMegaBytes": 1024,
      "status": "ACTIVE",
      "type": "PUBLIC",
      "availabilityZone": "ir-thr-ba1"
    },
    {
      "id": "almalinux-9",
      "name": "AlmaLinux 9 Enterprise",
      "osType": "LINUX",
      "osVersion": "9",
      "minDiskGigaBytes": 20,
      "minRamMegaBytes": 1024,
      "status": "ACTIVE",
      "type": "PUBLIC",
      "availabilityZone": "ir-thr-ba1"
    },
    {
      "id": "windows-server-2022",
      "name": "Windows Server 2022 Standard",
      "osType": "WINDOWS",
      "osVersion": "2022",
      "minDiskGigaBytes": 40,
      "minRamMegaBytes": 2048,
      "status": "ACTIVE",
      "type": "PUBLIC",
      "availabilityZone": "ir-thr-ba1"
    }
  ]
}
```

---

### 2.5 Create Cloud Server Instance
Provisions a new virtual machine instance adhering to the OpenAPI `CreateServer` schema.

```http
POST /servers
```

**Request Body:**
```json
{
  "availabilityZone": "ir-thr-ba1",
  "flavorId": "g1-2-4",
  "imageId": "ubuntu-22.04",
  "name": "web-production-01",
  "rootVolumeSizeGigaBytes": 40,
  "enableIpv4": true,
  "enableIpv6": false,
  "sshKeyName": "admin-ssh-key",
  "firewallNames": ["default-web-firewall"]
}
```

**Response (`201 Created`):**
```json
{
  "message": "Server created successfully",
  "data": {
    "id": "srv-9a8b7c6d-5e4f-3a2b-1c0d-e9f8a7b6c5d4",
    "name": "web-production-01",
    "state": "ACTIVE",
    "taskState": null,
    "availabilityZone": "ir-thr-ba1",
    "flavor": {
      "id": "g1-2-4",
      "name": "General 2C-4G",
      "cpuCores": 2,
      "ramMegaBytes": 4096,
      "rootDiskGigaBytes": 40
    },
    "image": {
      "id": "ubuntu-22.04",
      "name": "Ubuntu 22.04 LTS",
      "os": "Linux",
      "version": "22.04"
    },
    "ipAddresses": [
      {
        "ipAddress": "185.143.232.45",
        "isPublic": true,
        "version": "4",
        "networkName": "public"
      }
    ],
    "createDate": "2026-08-22T08:00:00Z"
  }
}
```

---

### 2.6 Server Lifecycle & Power Controls

#### Power On Server
```http
POST /servers/{id}/power-on
```

#### Power Off Server (Suspend / Stop)
Used by the plugin when customer wallet credits reach zero.
```http
POST /servers/{id}/power-off
```

#### Reboot Server
```http
POST /servers/{id}/reboot
```

#### Rename Server
```http
POST /servers/{id}/rename
```

#### Reset Root Password
```http
POST /servers/{id}/reset-root-password
```

#### Resize Hardware Flavor
```http
POST /servers/{id}/resize
```

#### Rescue & Unrescue Mode
```http
POST /servers/{id}/rescue
POST /servers/{id}/unrescue
```

#### Delete / Purge Server
Permanently destroys the virtual server and detaches associated storage.
```http
DELETE /servers/{id}
```

---

### 2.7 Storage Volumes, Firewalls & Private Networks

#### List Volumes
```http
GET /volumes
```

#### Create Volume
```http
POST /volumes
```
```json
{
  "availabilityZone": "ir-thr-ba1",
  "name": "attached-data-volume",
  "sizeGigaBytes": 100
}
```

#### Attach & Detach Volume
```http
POST /volumes/{volumeId}/attach
POST /volumes/{volumeId}/detach
```

#### Firewalls & Security Groups
```http
GET /firewalls
```

#### Private VPC Networks
```http
GET /networks
```

---

## 3. WordPress Plugin Integration Architecture

The `arv-seller` plugin encapsulates this Cloud Server (IaaS) API specification inside [class-arvan-api-client.php](file:///c:/Users/reza2/Local%20Sites/seller/app/public/wp-content/plugins/arv-seller/includes/class-arvan-api-client.php):

1. **Central Regional Dispatcher:** Uses WordPress native `wp_remote_request()` with dynamic regional endpoint routing (`https://ecc.{region}.arvanapis.ir/v3`).
2. **Transient Caching:** Automatically caches read-only lookups (`GET /availability-zones`, `GET /flavors`, `GET /images`) with configurable TTL (default: 3600 seconds) to ensure sub-100ms response times for frontend configurators.
3. **Error Normalization:** Converts raw API error responses and HTTP status codes into standard `WP_Error` objects for graceful UI handling.
4. **Lifecycle Control:** Dispatches instant power commands (`power-on`, `power-off`, `reboot`, `delete`, `rescue`, `resize`) and synchronizes status with the local `wp_arvan_resources` database.
5. **Sandbox Mock Simulation Engine:** Complete OpenAPI v3 schema-compliant mock engine enabling full offline testing and live fallback.
