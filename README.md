# 📦 Modern Warehouse Management System (WMS)

A robust, full-stack modular Warehouse Management System featuring multi-level RBAC security, automated volume calculations, and real-time inventory tracking.

[![Node.js](https://img.shields.io/badge/Node.js-LTS-green)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-Backend-blue)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Database-brightgreen)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)

---

## ✨ Key Features

- 🔐 **Advanced RBAC:** Defined roles for Super Admin, Manager, Worker, and Supplier.
- 📉 **Automated Logstics:** Automatic shelf volume calculations and storage cost estimation.
- 📋 **Audit Logs:** Full system transparency with comprehensive action logging.
- 🛡️ **Security:** Secure authentication via JWT and Bcrypt password hashing.
- 🚚 **Inventory Lifecycle:** Manage items from request -> verification/scanning -> outgoing shipment.
- 🔄 **Refund Queue:** Dedicated tracking for defective or rejected items needing pickup.

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js, Mongoose (MongoDB)
- **Frontend:** Vanilla HTML5, Modern CSS (Custom properties), ES6+ JavaScript
- **Validation:** Joi (Schema validation)
- **Logging:** Morgan & Custom Audit Middleware
- **Deployment:** Docker & Docker Compose

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- Docker (Optional)

### 2. Environment Setup
Copy `.env-example` to `.env` and fill in your credentials:
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/wms
JWT_SECRET=your_super_secret_key
```

### 3. Running Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Running with Docker
```bash
# Build and start services
docker-compose up --build
```
Access the application at `http://localhost:5000`.

---

## 👥 User Roles & Permissions

| Role | Access Level | Description |
| :--- | :--- | :--- |
| **Super Admin** | Global | Manages warehouses, registers managers, and views global logs. |
| **Manager** | Warehouse | Manages staff and inventory within a specific warehouse. |
| **Worker** | Operations | Handles item scanning, verification, and shipments. |
| **Supplier** | Client | Creates item requests and manages their own inventory/refunds. |

---

## 📂 Project Structure

```text
├── backend/            # Express application source
│   ├── src/
│   │   ├── controller/ # Request handlers
│   │   ├── middleware/ # Auth & Validation
│   │   ├── models/     # Mongoose schemas
│   │   ├── repository/ # Data access layer
│   │   ├── routes/     # API endpoints
│   │   └── service/    # Business logic
├── frontend/           # Static assets (HTML, CSS, JS)
├── API.md              # Detailed API Documentation
└── Dockerfile          # Container configuration
```

---

## 📘 API Documentation

For detailed information on available endpoints, request bodies, and responses, please refer to [API.md](./API.md).

---

## 📝 License

Distributed under the ISC License. See `LICENSE` for more information.
