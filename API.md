# Warehouse Management System API Documentation

Base URL: `/api`

## Authentication

### Register
`POST /auth/register`
- **Description:** Register a new user (defaults to `supplier` role).
- **Body:**
  ```json
  {
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response:** `201 Created`

### Login
`POST /auth/login`
- **Description:** Authenticate user and receive JWT.
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response:** `200 OK` with JWT token and user details.

### Get Profile
`GET /auth/profile`
- **Auth:** Required (JWT)
- **Success Response:** `200 OK` with user profile.

---

## Admin Endpoints
*Requires `super_admin` role.*

### Create Warehouse
`POST /admin/warehouses`
- **Body:** `name`, `address`, `shelf_length`, `shelf_width`, `shelf_height`.

### Get All Warehouses
`GET /admin/warehouses`
- **Access:** All roles.

### Delete Warehouse
`DELETE /admin/warehouses/:id`

### Register Manager
`POST /admin/register-manager`
- **Description:** Register a new manager for a specific warehouse.

### Get All Items
`GET /admin/all-items`

### Get All Users
`GET /admin/all-users`

### Audit Logs
`GET /admin/audit-logs`
- **Access:** All roles.
- **Behavior:** 
  - `super_admin`: Sees all logs.
  - `manager`/`worker`: Sees logs related to their assigned warehouse.
  - `supplier`: Sees logs related to their own items.

---

## Manager Endpoints
*Requires `manager` role (and partially `super_admin`).*

### Register Worker
`POST /manager/register-worker`
- **Body:** `username`, `email`, `password`.

### Get Warehouse Staff
`GET /manager/staff`
- **Description:** Get all workers assigned to the manager's warehouse.

### Get Warehouse Items
`GET /manager/items`
- **Description:** Get all items stored/pending in the manager's warehouse.

### Get My Warehouse Details
`GET /manager/warehouse`

---

## Worker Endpoints
*Requires `worker` role.*

### Get Pending Items
`GET /worker/pending-items`
- **Description:** Items waiting for verification/scanning in the worker's warehouse.

### Scan/Accept Item
`PUT /worker/items/:id/scan`
- **Description:** Mark item as accepted or rejected.
- **Body:**
  ```json
  {
    "status": "accepted",
    "quantity": 10,
    "defects": 2
  }
  ```
  *If rejected:* `{"status": "rejected", "rejection_reason": "Broken packaging"}`

### Outgoing Item
`POST /worker/items/outgoing`
- **Description:** Process item shipment.
- **Body:** `{"itemId": "...", "quantity": 5}`

---

## Supplier Endpoints
*Requires `supplier` role.*

### Create Item Request
`POST /supplier/items`
- **Body:** `name`, `warehouse_id`, `quantity`, `length`, `width`, `height`.

### Get My Items
`GET /supplier/items`

### Pickup Item
`PUT /supplier/items/:id/pickup`
- **Description:** Pick up items from refund storage (items with defects or rejected).

### Matching Warehouses
`GET /supplier/matching-warehouses?length=10&width=10&height=10`
- **Query Params:** `length`, `width`, `height` (Numbers).
- **Description:** Find warehouses where the individual shelf volume can accommodate the item's dimensions.
