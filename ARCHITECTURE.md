# Architecture & Technical Documentation

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER (Browser)                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ index.html   │  │ admin.html   │  │  pos.html    │      │
│  │ (Landing)    │  │ (Dashboard)  │  │ (Cashier)    │      │
│  │              │  │              │  │              │      │
│  │ - Showcase   │  │ - JWT Login  │  │ - POS Form   │      │
│  │ - Booking    │  │ - Stats      │  │ - Receipt    │      │
│  │ - WhatsApp   │  │ - Booking    │  │ - Summary    │      │
│  │   Redirect   │  │   Manage     │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└──────────────────┬───────────────────────────────────────────┘
                   │ HTTP/HTTPS (REST API)
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVER LAYER (Node.js)                   │
├─────────────────────────────────────────────────────────────┤
│                  Express.js Application                     │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ API Endpoints (Protected & Public)                   │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ POST   /api/auth/login         → JWT Token          │  │
│  │ GET    /api/bookings           → All Bookings       │  │
│  │ POST   /api/bookings           → Create Booking     │  │
│  │ DELETE /api/bookings/:id       → Delete Booking     │  │
│  │ GET    /api/sales              → All Sales          │  │
│  │ POST   /api/sales              → Create Sale        │  │
│  │ DELETE /api/sales/:id          → Delete Sale        │  │
│  │ GET    /api/export/sales       → Export CSV         │  │
│  │ GET    /api/export/bookings    → Export CSV         │  │
│  │ GET    /api/summary            → Daily Summary      │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Middleware & Services                                │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │ ✓ authenticate()       → JWT verification           │  │
│  │ ✓ validateInput()      → Input sanitization         │  │
│  │ ✓ backupDatabase()     → Auto backup 24h            │  │
│  │ ✓ exportCSV()          → Generate CSV reports       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└──────────────────┬───────────────────────────────────────────┘
                   │ SQLite Driver
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                   DATA LAYER (SQLite)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Database: backend/database.db                        │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │                                                       │  │
│  │  TABLE: users                                        │  │
│  │  ├─ id (PK)                                          │  │
│  │  ├─ username (UNIQUE)                               │  │
│  │  ├─ password (bcrypt hash)                           │  │
│  │  └─ role (admin, cashier)                           │  │
│  │                                                       │  │
│  │  TABLE: bookings                                     │  │
│  │  ├─ id (PK)                                          │  │
│  │  ├─ name, motor, wa, package                        │  │
│  │  ├─ message, date, status                           │  │
│  │  └─ Indexed by: date                                │  │
│  │                                                       │  │
│  │  TABLE: sales                                        │  │
│  │  ├─ id (PK)                                          │  │
│  │  ├─ receipt_no, customer, motor, plate             │  │
│  │  ├─ package, addons (JSON), total, cash            │  │
│  │  ├─ change_amount, date, timestamp                 │  │
│  │  └─ Indexed by: date                                │  │
│  │                                                       │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │ Backup Storage: backend/backups/                    │  │
│  │ - Auto-backup every 24 hours                        │  │
│  │ - Retention: 30 days                                │  │
│  │ - Restore: node backup.js restore <file>           │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📡 Data Flow Diagram

### 1. Booking Online Flow
```
Customer (Landing)
    │
    ▼
┌─────────────────────────────────────┐
│ 1. Fill Booking Form                │
│    - Name, motor, WA, package       │
└─────────────────────────────────────┘
    │
    ▼ POST /api/bookings (validate input)
┌─────────────────────────────────────┐
│ 2. Backend Validation               │
│    - Check: name length, WA format  │
│    - Generate timestamp             │
└─────────────────────────────────────┘
    │
    ▼ INSERT INTO bookings
┌─────────────────────────────────────┐
│ 3. Save to Database                 │
│    - SQLite INSERT                  │
│    - Set status: Pending            │
└─────────────────────────────────────┘
    │
    ▼ 
┌─────────────────────────────────────┐
│ 4. Redirect to WhatsApp             │
│    - Send booking details to admin  │
└─────────────────────────────────────┘
    │
    ▼ (Admin accepts booking)
┌─────────────────────────────────────┐
│ 5. Admin Dashboard Update           │
│    - Shows in "Antrean Booking"    │
│    - Admin can confirm/delete       │
└─────────────────────────────────────┘
```

### 2. POS Transaction Flow
```
Cashier (POS Interface)
    │
    ▼
┌─────────────────────────────────────┐
│ 1. Input Transaction Data           │
│    - Package, addon, customer info  │
└─────────────────────────────────────┘
    │
    ▼ Validate & Calculate
┌─────────────────────────────────────┐
│ 2. Frontend Validation              │
│    - Check: name length, amount     │
│    - Calculate total & change       │
└─────────────────────────────────────┘
    │
    ▼ Click "Proses Transaksi"
┌─────────────────────────────────────┐
│ 3. Send to Backend (POST /api/sales)│
│    - Include receipt number         │
└─────────────────────────────────────┘
    │
    ▼ Backend Validation
┌─────────────────────────────────────┐
│ 4. Server-Side Validation           │
│    - Validate all fields            │
│    - Check amount range             │
└─────────────────────────────────────┘
    │
    ▼ INSERT INTO sales
┌─────────────────────────────────────┐
│ 5. Save Transaction                 │
│    - Store in SQLite                │
│    - Record timestamp               │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 6. Display Receipt                  │
│    - Show on screen                 │
│    - Allow print to paper           │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 7. Admin Dashboard Sync             │
│    - Appears in Riwayat Transaksi  │
│    - Update statistics (omzet, etc) │
└─────────────────────────────────────┘
```

### 3. Admin Dashboard Flow
```
Admin (Login)
    │
    ▼ POST /api/auth/login
┌─────────────────────────────────────┐
│ 1. Authenticate User                │
│    - Verify username/password       │
│    - Hash & compare with bcrypt     │
└─────────────────────────────────────┘
    │
    ▼ JWT Token Generated
┌─────────────────────────────────────┐
│ 2. Create JWT Token                 │
│    - Sign with secret key           │
│    - Expiry: 8 hours                │
│    - Store in localStorage          │
└─────────────────────────────────────┘
    │
    ▼ GET /api/bookings + /api/sales
┌─────────────────────────────────────┐
│ 3. Fetch Data (Protected)           │
│    - Include Authorization header   │
│    - Verify token validity          │
└─────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────┐
│ 4. Display Dashboard                │
│    - Show stats (booking, sales)    │
│    - List bookings & transactions   │
│    - Allow manage (delete, export)  │
└─────────────────────────────────────┘
```

---

## 🔐 Security Architecture

### Authentication & Authorization

```
┌──────────────────────────────────────────┐
│           LOGIN REQUEST                  │
│  POST /api/auth/login                    │
│  Body: { username, password }            │
└──────────────────────────────┬───────────┘
                               │
                      ▼ Validate Input
              ┌──────────────────────────┐
              │ Input Validation         │
              │ - Username: 3-50 char    │
              │ - Password: 6+ char      │
              │ - Trim & sanitize        │
              └──────────────┬───────────┘
                             │
                    ▼ Query Database
              ┌──────────────────────────┐
              │ SELECT * FROM users      │
              │ WHERE username = ?       │
              │ (prepared statement)     │
              └──────────────┬───────────┘
                             │
                    ▼ Verify Password
              ┌──────────────────────────┐
              │ bcrypt.compare()         │
              │ - Compare input hash     │
              │ - DB stored hash         │
              └──────────────┬───────────┘
                             │
                    ▼ Generate Token
              ┌──────────────────────────┐
              │ JWT Token Creation       │
              │ - Payload:               │
              │   { id, username, role } │
              │ - Secret: env variable   │
              │ - Expiry: 8 hours        │
              └──────────────┬───────────┘
                             │
                    ▼ Return Token
              ┌──────────────────────────┐
              │ Response:                │
              │ { token, user }          │
              │ Client stores in         │
              │ localStorage             │
              └──────────────────────────┘
```

### Protected Endpoint Flow

```
┌──────────────────────────────────────────┐
│    REQUEST TO PROTECTED ENDPOINT         │
│    GET /api/bookings                     │
│    Header: {                             │
│      Authorization: "Bearer <token>"     │
│    }                                     │
└──────────────────────────────┬───────────┘
                               │
                      ▼ Check Header
              ┌──────────────────────────┐
              │ Middleware: authenticate │
              │ - Get auth header        │
              │ - Extract token          │
              └──────────────┬───────────┘
                             │
                    ▼ Verify Token
              ┌──────────────────────────┐
              │ jwt.verify(token, secret)│
              │ - Check signature        │
              │ - Check expiry           │
              │ - Decode payload         │
              └──────────────┬───────────┘
                             │
                ▼ Valid ✓        ▼ Invalid ✗
         ┌────────────┐      ┌───────────────┐
         │ Process    │      │ Return 403    │
         │ Request    │      │ "Token invalid"│
         │ & Return   │      │ Redirect login│
         │ Data       │      └───────────────┘
         └────────────┘
```

---

## 💾 Database Design

### Entity Relationship Diagram (Conceptual)

```
        ┌─────────────────┐
        │     USERS       │
        ├─────────────────┤
        │ id (PK)         │
        │ username (UQ)   │◄─── Admin Login
        │ password        │
        │ role            │
        └────────┬────────┘
                 │
      (1 admin manages many)
                 │
        ┌────────▼────────┐      ┌─────────────────┐
        │    BOOKINGS     │◄─────┤  ADMIN PANEL    │
        ├─────────────────┤      │  - View All     │
        │ id (PK)         │      │  - Manage       │
        │ name            │      │  - Delete       │
        │ motor           │      │  - Export CSV   │
        │ wa              │      └─────────────────┘
        │ package         │
        │ message         │      ┌─────────────────┐
        │ date (Indexed)  │◄─────┤  PUBLIC WEB     │
        │ status          │      │  - Add booking  │
        └─────────────────┘      │  - WhatsApp link│
                                 └─────────────────┘

        ┌─────────────────┐      ┌─────────────────┐
        │     SALES       │◄─────┤   POS CASHIER   │
        ├─────────────────┤      │  - Input trans  │
        │ id (PK)         │      │  - Print receipt│
        │ receipt_no      │      │  - Calc total   │
        │ customer        │      └─────────────────┘
        │ motor           │
        │ plate           │      ┌─────────────────┐
        │ package         │◄─────┤  ADMIN REPORT   │
        │ addons (JSON)   │      │  - View sales   │
        │ total           │      │  - Export CSV   │
        │ cash            │      │  - Revenue calc │
        │ change_amount   │      └─────────────────┘
        │ date (Indexed)  │
        │ timestamp       │      ┌─────────────────┐
        └─────────────────┘◄─────┤  AUTO BACKUP    │
                                 │  - Daily backup │
                                 │  - 30-day store │
                                 └─────────────────┘
```

---

## 📊 API Response Schemas

### Login Response
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "username": "admin",
    "role": "admin"
  }
}
```

### Get Bookings Response
```json
{
  "bookings": [
    {
      "id": 1,
      "name": "Budi Wijaya",
      "motor": "Honda Beat",
      "wa": "081234567890",
      "package": "Cuci Premium (25rb)",
      "message": "Mau berkilau maksimal",
      "date": "4/6/2024, 10:30:45 AM",
      "status": "Pending"
    }
  ]
}
```

### Get Sales Response
```json
{
  "sales": [
    {
      "id": 1,
      "receipt_no": "STK-2024-06-04-001",
      "customer": "Andi Wijaya",
      "motor": "Honda Beat",
      "plate": "B 1234 XYZ",
      "package": "Cuci Premium (25rb)",
      "addons": ["Semir Roda (5rb)"],
      "total": 30000,
      "cash": 50000,
      "change_amount": 20000,
      "date": "04/06/2024",
      "timestamp": 1717461045000
    }
  ]
}
```

---

## 📈 Performance Considerations

### Query Optimization
- **Indexing:** date columns dalam bookings & sales table
- **Pagination:** Implement untuk data >1000 records
- **Caching:** LocalStorage untuk token & static data

### Scalability
- **Current:** SQLite (good untuk <100k records)
- **Future:** PostgreSQL atau MySQL untuk scale
- **Backup:** Auto-backup every 24h untuk data protection

---

**Architecture Version:** 1.0.0  
**Last Updated:** Juni 2024
