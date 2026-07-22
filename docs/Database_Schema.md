# Database Schema Design

## PharmacyOS — Cloud-Native Pharmacy Operating System

---

## 1. Schema Overview

### 1.1 Entity Relationship Diagram (Textual)

```
┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   tenants    │1──N──▶│     stores       │1──N──▶│     users        │
└──────────────┘       └──────────────────┘       └──────────────────┘
                              │ 1                        │ 1
                              │                          │
                              │ N                        │ N
                              ▼                          ▼
                       ┌──────────────┐          ┌──────────────┐
                       │   batches    │          │  audit_logs  │
                       └──────────────┘          └──────────────┘
                              │ N
                              │
                    ┌─────────┴─────────┐
                    │                   │
              ┌──────────┐       ┌──────────────┐
              │medicines │1──N──▶│  stock_bins  │
              └──────────┘       └──────────────┘
                    │ 1                │ N
                    │                  │
                    │ N                │ 1
              ┌──────────┐       ┌──────────────┐
              │categories│       │   racks      │
              └──────────┘       └──────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│  manufacturers   │1──N──▶│   medicines      │N──M──▶│   suppliers      │
└──────────────────┘       └──────────────────┘       └──────────────────┘
                                   │ 1                        │ 1
                                   │                          │
                                   │ N                        │ N
                                   ▼                          ▼
                            ┌──────────────┐          ┌──────────────┐
                            │   batches    │          │purchase_orders│
                            └──────────────┘          └──────────────┘
                                   │ N                       │ 1
                                   │                         │
                                   │ 1                       │ N
                            ┌──────────────┐          ┌──────────────┐
                            │purchase_items│          │purchase_invoices
                            └──────────────┘          └──────────────┘

┌──────────────┐       ┌──────────────────┐       ┌──────────────────┐
│   customers  │1──N──▶│   sales_bills    │1──N──▶│  sales_items     │
└──────────────┘       └──────────────────┘       └──────────────────┘
                              │ 1                        │ N
                              │                          │
                              │ N                        │ 1
                              ▼                          ▼
                       ┌──────────────┐          ┌──────────────┐
                       │  payments    │          │   batches    │
                       └──────────────┘          └──────────────┘

┌──────────────┐       ┌──────────────────┐
│   doctors    │1──N──▶│  prescriptions   │
└──────────────┘       └──────────────────┘
                              │ 1
                              │
                              │ N
                              ▼
                       ┌──────────────┐
                       │ sales_bills  │
                       └──────────────┘
```

---

## 2. Global / Public Schema Tables

These tables reside in the `public` schema and are shared across all tenants.

### 2.1 tenants

Stores information about each tenant (pharmacy chain/independent pharmacy).

```sql
CREATE TABLE public.tenants (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    subdomain           VARCHAR(100) UNIQUE NOT NULL,
    custom_domain       VARCHAR(255) UNIQUE,
    logo_url            TEXT,
    address_line1       VARCHAR(255),
    address_line2       VARCHAR(255),
    city                VARCHAR(100),
    state               VARCHAR(100),
    pincode             VARCHAR(10),
    country             VARCHAR(100) DEFAULT 'India',
    phone               VARCHAR(20),
    email               VARCHAR(255),
    gstin               VARCHAR(15),
    drug_license_no     VARCHAR(50),
    license_expiry_date DATE,
    is_active           BOOLEAN DEFAULT true,
    subscription_plan   VARCHAR(50) DEFAULT 'basic',  -- basic, professional, enterprise
    subscription_status VARCHAR(50) DEFAULT 'active', -- active, expired, suspended
    subscription_start  TIMESTAMPTZ,
    subscription_end    TIMESTAMPTZ,
    max_stores          INTEGER DEFAULT 1,
    max_users           INTEGER DEFAULT 5,
    features            JSONB DEFAULT '{}',           -- feature flags
    settings            JSONB DEFAULT '{}',           -- tenant-level settings
    schema_name         VARCHAR(100) UNIQUE NOT NULL, -- PostgreSQL schema name
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_tenants_subdomain ON public.tenants(subdomain) WHERE deleted_at IS NULL;
CREATE INDEX idx_tenants_status ON public.tenants(subscription_status) WHERE deleted_at IS NULL;
```

---

## 3. Per-Tenant Schema Tables

Each tenant gets its own PostgreSQL schema (e.g., `tenant_abc123`). All tables below are created within that schema.

### 3.1 stores

Multi-store support. Each tenant can have multiple stores/branches.

```sql
CREATE TABLE stores (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code            VARCHAR(50) UNIQUE NOT NULL,       -- e.g., "STORE-001"
    name            VARCHAR(255) NOT NULL,
    address_line1   VARCHAR(255),
    address_line2   VARCHAR(255),
    city            VARCHAR(100),
    state           VARCHAR(100),
    pincode         VARCHAR(10),
    phone           VARCHAR(20),
    email           VARCHAR(255),
    gstin           VARCHAR(15),
    drug_license_no VARCHAR(50),
    is_active       BOOLEAN DEFAULT true,
    is_head_office  BOOLEAN DEFAULT false,
    opening_time    TIME DEFAULT '09:00:00',
    closing_time    TIME DEFAULT '21:00:00',
    settings        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_stores_code ON stores(code) WHERE deleted_at IS NULL;
CREATE INDEX idx_stores_city ON stores(city) WHERE deleted_at IS NULL;
```

### 3.2 users

All users belonging to the tenant.

```sql
CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID REFERENCES stores(id),
    employee_code   VARCHAR(50) UNIQUE,
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100),
    email           VARCHAR(255) UNIQUE NOT NULL,
    phone           VARCHAR(20) UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    role            VARCHAR(50) NOT NULL DEFAULT 'cashier',  -- super_admin, owner, manager, pharmacist, cashier
    is_active       BOOLEAN DEFAULT true,
    is_first_login  BOOLEAN DEFAULT true,
    last_login_at   TIMESTAMPTZ,
    profile_pic_url TEXT,
    preferences     JSONB DEFAULT '{}',
    refresh_token   TEXT,                                    -- stored hashed
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_store ON users(store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_role ON users(role) WHERE deleted_at IS NULL;
```

### 3.3 categories

Medicine categories / therapeutic classifications.

```sql
CREATE TABLE categories (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    parent_id       UUID REFERENCES categories(id),     -- self-referencing for subcategories
    is_active       BOOLEAN DEFAULT true,
    sort_order      INTEGER DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_categories_parent ON categories(parent_id) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX uq_categories_name ON categories(name) WHERE deleted_at IS NULL;
```

### 3.4 manufacturers

Medicine manufacturers.

```sql
CREATE TABLE manufacturers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    address_line1       VARCHAR(255),
    address_line2       VARCHAR(255),
    city                VARCHAR(100),
    state               VARCHAR(100),
    pincode             VARCHAR(10),
    phone               VARCHAR(20),
    email               VARCHAR(255),
    drug_license_no     VARCHAR(50),
    gstin               VARCHAR(15),
    contact_person      VARCHAR(255),
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE UNIQUE INDEX uq_manufacturers_name ON manufacturers(name) WHERE deleted_at IS NULL;
```

### 3.5 suppliers

Medicine suppliers / distributors.

```sql
CREATE TABLE suppliers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name        VARCHAR(255) NOT NULL,
    contact_person      VARCHAR(255),
    gstin               VARCHAR(15),
    drug_license_no     VARCHAR(50),
    address_line1       VARCHAR(255),
    address_line2       VARCHAR(255),
    city                VARCHAR(100),
    state               VARCHAR(100),
    pincode             VARCHAR(10),
    phone               VARCHAR(20),
    email               VARCHAR(255),
    credit_days         INTEGER DEFAULT 0,
    credit_limit        DECIMAL(12,2) DEFAULT 0,
    opening_balance     DECIMAL(12,2) DEFAULT 0,
    current_balance     DECIMAL(12,2) DEFAULT 0,
    is_active           BOOLEAN DEFAULT true,
    payment_terms       VARCHAR(100),
    lead_time_days      INTEGER DEFAULT 3,              -- average lead time for purchase suggestions
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_suppliers_name ON suppliers(company_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_suppliers_gstin ON suppliers(gstin) WHERE deleted_at IS NULL;
```

### 3.6 medicines

Master medicine catalog.

```sql
CREATE TABLE medicines (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id         UUID REFERENCES categories(id),
    manufacturer_id     UUID REFERENCES manufacturers(id),
    brand_name          VARCHAR(255) NOT NULL,
    generic_name        VARCHAR(255),
    strength            VARCHAR(50),                    -- e.g., "650 mg", "500 mg + 65 mg"
    form                VARCHAR(50) NOT NULL,            -- Tablet, Syrup, Injection, Cream, Ointment, Drops, Inhaler, etc.
    schedule            VARCHAR(10),                     -- H, H1, X, G, etc.
    package_size        VARCHAR(50),                     -- e.g., "10x10", "30 ml", "1x5"
    unit_type           VARCHAR(50) DEFAULT 'strip',     -- strip, bottle, vial, tube, box, piece
    units_per_package   INTEGER DEFAULT 1,               -- e.g., 10 tablets per strip
    hsn_code            VARCHAR(10),
    gst_percent         DECIMAL(5,2) DEFAULT 0,
    is_batch_enabled    BOOLEAN DEFAULT true,
    is_expiry_enabled   BOOLEAN DEFAULT true,
    is_prescription_required BOOLEAN DEFAULT false,
    is_active           BOOLEAN DEFAULT true,
    rack_id             UUID,                            -- default rack/shelf location
    min_stock_level     INTEGER DEFAULT 10,              -- low stock alert threshold
    max_stock_level     INTEGER DEFAULT 500,
    reorder_level       INTEGER DEFAULT 50,
    safety_stock        INTEGER DEFAULT 20,
    lead_time_days      INTEGER DEFAULT 2,
    image_url           TEXT,
    barcode             VARCHAR(100) UNIQUE,
    alternate_barcodes  TEXT[],                          -- array of alternate barcodes
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

-- Full-text search index for medicine search
CREATE INDEX idx_medicines_brand_name ON medicines(brand_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_medicines_generic_name ON medicines(generic_name) WHERE deleted_at IS NULL;
CREATE INDEX idx_medicines_category ON medicines(category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_medicines_manufacturer ON medicines(manufacturer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_medicines_barcode ON medicines(barcode) WHERE deleted_at IS NULL;
CREATE INDEX idx_medicines_form ON medicines(form) WHERE deleted_at IS NULL;
CREATE INDEX idx_medicines_schedule ON medicines(schedule) WHERE deleted_at IS NULL;

-- Full-text search
CREATE INDEX idx_medicines_fts ON medicines USING GIN (
    to_tsvector('english', coalesce(brand_name, '') || ' ' || coalesce(generic_name, '') || ' ' || coalesce(strength, ''))
);
```

### 3.7 medicine_suppliers

Many-to-many relationship between medicines and suppliers.

```sql
CREATE TABLE medicine_suppliers (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id     UUID NOT NULL REFERENCES medicines(id),
    supplier_id     UUID NOT NULL REFERENCES suppliers(id),
    supplier_code   VARCHAR(100),                       -- supplier's product code
    purchase_price  DECIMAL(12,2),                      -- negotiated price with this supplier
    is_preferred    BOOLEAN DEFAULT false,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE(medicine_id, supplier_id)
);

CREATE INDEX idx_med_suppliers_medicine ON medicine_suppliers(medicine_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_med_suppliers_supplier ON medicine_suppliers(supplier_id) WHERE deleted_at IS NULL;
```

### 3.8 racks

Rack/shelf location management.

```sql
CREATE TABLE racks (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id        UUID NOT NULL REFERENCES stores(id),
    code            VARCHAR(50) NOT NULL,               -- e.g., "RACK-A1", "SHELF-B2"
    name            VARCHAR(255),
    description     TEXT,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at      TIMESTAMPTZ,
    UNIQUE(store_id, code)
);

CREATE INDEX idx_racks_store ON racks(store_id) WHERE deleted_at IS NULL;
```

### 3.9 batches

Batch-level inventory tracking. This is the core inventory table.

```sql
CREATE TABLE batches (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medicine_id         UUID NOT NULL REFERENCES medicines(id),
    store_id            UUID NOT NULL REFERENCES stores(id),
    supplier_id         UUID REFERENCES suppliers(id),
    rack_id             UUID REFERENCES racks(id),
    batch_no            VARCHAR(100) NOT NULL,
    mrp                 DECIMAL(12,2) NOT NULL,
    purchase_price      DECIMAL(12,2) NOT NULL,
    selling_price       DECIMAL(12,2) NOT NULL,
    gst_percent         DECIMAL(5,2) DEFAULT 0,
    quantity            INTEGER NOT NULL DEFAULT 0,      -- current available quantity
    reserved_quantity   INTEGER NOT NULL DEFAULT 0,      -- quantity reserved in pending bills
    initial_quantity    INTEGER NOT NULL DEFAULT 0,      -- quantity when received
    manufacture_date    DATE,
    expiry_date         DATE,
    is_expired          BOOLEAN GENERATED ALWAYS AS (expiry_date < CURRENT_DATE) STORED,
    days_to_expiry      INTEGER GENERATED ALWAYS AS (expiry_date - CURRENT_DATE) STORED,
    location            VARCHAR(100),                    -- specific location within rack
    is_active           BOOLEAN DEFAULT true,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(medicine_id, store_id, batch_no)
);

CREATE INDEX idx_batches_medicine ON batches(medicine_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_batches_store ON batches(store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_batches_expiry ON batches(expiry_date) WHERE deleted_at IS NULL AND quantity > 0;
CREATE INDEX idx_batches_supplier ON batches(supplier_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_batches_rack ON batches(rack_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_batches_active ON batches(medicine_id, store_id) WHERE deleted_at IS NULL AND quantity > 0;
```

### 3.10 customers

Customer master.

```sql
CREATE TABLE customers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID REFERENCES stores(id),
    customer_code       VARCHAR(50) UNIQUE,
    first_name          VARCHAR(100) NOT NULL,
    last_name           VARCHAR(100),
    mobile              VARCHAR(20) UNIQUE NOT NULL,
    email               VARCHAR(255),
    address_line1       VARCHAR(255),
    address_line2       VARCHAR(255),
    city                VARCHAR(100),
    state               VARCHAR(100),
    pincode             VARCHAR(10),
    date_of_birth       DATE,
    gender              VARCHAR(10),
    loyalty_points      INTEGER DEFAULT 0,
    total_purchases     DECIMAL(12,2) DEFAULT 0,
    total_bills         INTEGER DEFAULT 0,
    credit_balance      DECIMAL(12,2) DEFAULT 0,         -- outstanding credit amount
    credit_limit        DECIMAL(12,2) DEFAULT 0,
    is_credit_allowed   BOOLEAN DEFAULT false,
    is_active           BOOLEAN DEFAULT true,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_customers_mobile ON customers(mobile) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_store ON customers(store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_customers_name ON customers(first_name, last_name) WHERE deleted_at IS NULL;
```

### 3.11 doctors

Doctor master for prescription tracking.

```sql
CREATE TABLE doctors (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                VARCHAR(255) NOT NULL,
    speciality          VARCHAR(255),
    clinic_hospital     VARCHAR(255),
    registration_no     VARCHAR(100),
    mobile              VARCHAR(20),
    email               VARCHAR(255),
    address             TEXT,
    is_active           BOOLEAN DEFAULT true,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_doctors_name ON doctors(name) WHERE deleted_at IS NULL;
CREATE INDEX idx_doctors_speciality ON doctors(speciality) WHERE deleted_at IS NULL;
```

### 3.12 prescriptions

Prescription records linked to sales bills.

```sql
CREATE TABLE prescriptions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id             UUID,                            -- linked after billing
    customer_id         UUID REFERENCES customers(id),
    doctor_id           UUID REFERENCES doctors(id),
    prescription_date   DATE NOT NULL DEFAULT CURRENT_DATE,
    image_url           TEXT,                            -- S3/MinIO URL of scanned prescription
    image_thumbnail_url TEXT,
    notes               TEXT,
    ai_ocr_text         TEXT,                            -- raw OCR output from AI
    ai_medicines        JSONB,                           -- AI-extracted medicines [{name, strength, dosage, duration}]
    ai_verified_at      TIMESTAMPTZ,                     -- when pharmacist verified AI output
    ai_verified_by      UUID REFERENCES users(id),
    status              VARCHAR(50) DEFAULT 'pending',   -- pending, verified, billed, cancelled
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_prescriptions_customer ON prescriptions(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_prescriptions_doctor ON prescriptions(doctor_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_prescriptions_date ON prescriptions(prescription_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_prescriptions_status ON prescriptions(status) WHERE deleted_at IS NULL;
```

### 3.13 sales_bills

Sales invoice/bill header.

```sql
CREATE TABLE sales_bills (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES stores(id),
    customer_id         UUID REFERENCES customers(id),
    prescription_id     UUID REFERENCES prescriptions(id),
    bill_no             VARCHAR(50) NOT NULL,             -- sequential per store, e.g., "INV-2026-00001"
    bill_date           DATE NOT NULL DEFAULT CURRENT_DATE,
    bill_time           TIME NOT NULL DEFAULT CURRENT_TIME,
    subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0,
    discount_percent    DECIMAL(5,2) DEFAULT 0,
    discount_amount     DECIMAL(12,2) DEFAULT 0,
    taxable_amount      DECIMAL(12,2) DEFAULT 0,
    gst_amount          DECIMAL(12,2) DEFAULT 0,
    cgst_amount         DECIMAL(12,2) DEFAULT 0,         -- Central GST (half of GST)
    sgst_amount         DECIMAL(12,2) DEFAULT 0,         -- State GST (half of GST)
    igst_amount         DECIMAL(12,2) DEFAULT 0,         -- Inter-state GST
    round_off           DECIMAL(5,2) DEFAULT 0,
    total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount         DECIMAL(12,2) DEFAULT 0,
    balance_amount      DECIMAL(12,2) DEFAULT 0,
    payment_mode        VARCHAR(50) DEFAULT 'cash',       -- cash, upi, card, credit, mixed
    payment_status      VARCHAR(50) DEFAULT 'pending',    -- pending, paid, partially_paid, refunded
    bill_status         VARCHAR(50) DEFAULT 'active',     -- active, held, cancelled, returned
    is_credit_sale      BOOLEAN DEFAULT false,
    is_printed          BOOLEAN DEFAULT false,
    print_count         INTEGER DEFAULT 0,
    notes               TEXT,
    cancelled_at        TIMESTAMPTZ,
    cancelled_by        UUID REFERENCES users(id),
    cancel_reason       TEXT,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(store_id, bill_no)
);

CREATE INDEX idx_bills_store ON sales_bills(store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bills_customer ON sales_bills(customer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_bills_date ON sales_bills(bill_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_bills_status ON sales_bills(bill_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_bills_payment ON sales_bills(payment_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_bills_created_by ON sales_bills(created_by) WHERE deleted_at IS NULL;
```

### 3.14 sales_items

Individual line items within a sales bill.

```sql
CREATE TABLE sales_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id             UUID NOT NULL REFERENCES sales_bills(id),
    medicine_id         UUID NOT NULL REFERENCES medicines(id),
    batch_id            UUID REFERENCES batches(id),
    batch_no            VARCHAR(100),
    expiry_date         DATE,
    item_no             INTEGER NOT NULL,                 -- line item number
    medicine_name       VARCHAR(255) NOT NULL,            -- snapshot at time of billing
    generic_name        VARCHAR(255),
    strength            VARCHAR(50),
    form                VARCHAR(50),
    hsn_code            VARCHAR(10),
    quantity            INTEGER NOT NULL,
    unit_type           VARCHAR(50),
    mrp                 DECIMAL(12,2),
    unit_price          DECIMAL(12,2) NOT NULL,           -- selling price per unit
    discount_percent    DECIMAL(5,2) DEFAULT 0,
    discount_amount     DECIMAL(12,2) DEFAULT 0,
    taxable_amount      DECIMAL(12,2) DEFAULT 0,
    gst_percent         DECIMAL(5,2) DEFAULT 0,
    gst_amount          DECIMAL(12,2) DEFAULT 0,
    cgst_amount         DECIMAL(12,2) DEFAULT 0,
    sgst_amount         DECIMAL(12,2) DEFAULT 0,
    igst_amount         DECIMAL(12,2) DEFAULT 0,
    total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    purchase_cost       DECIMAL(12,2),                    -- cost price for profit calculation
    profit_amount       DECIMAL(12,2) GENERATED ALWAYS AS (total_amount - (purchase_cost * quantity)) STORED,
    is_returned         BOOLEAN DEFAULT false,
    returned_quantity   INTEGER DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sales_items_bill ON sales_items(bill_id);
CREATE INDEX idx_sales_items_medicine ON sales_items(medicine_id);
CREATE INDEX idx_sales_items_batch ON sales_items(batch_id);
```

### 3.15 payments

Payment records for sales bills.

```sql
CREATE TABLE payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bill_id             UUID NOT NULL REFERENCES sales_bills(id),
    payment_no          VARCHAR(50) NOT NULL,
    payment_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_mode        VARCHAR(50) NOT NULL,             -- cash, upi, card, credit, neft, rtgs
    amount              DECIMAL(12,2) NOT NULL,
    reference_no        VARCHAR(100),                     -- UPI ref, card last 4 digits, cheque no
    bank_name           VARCHAR(255),
    card_type           VARCHAR(50),
    card_last_four      VARCHAR(4),
    upi_id              VARCHAR(255),
    is_verified         BOOLEAN DEFAULT true,
    notes               TEXT,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_payments_bill ON payments(bill_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_date ON payments(payment_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_payments_mode ON payments(payment_mode) WHERE deleted_at IS NULL;
```

### 3.16 purchase_orders

Purchase order header.

```sql
CREATE TABLE purchase_orders (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES stores(id),
    supplier_id         UUID NOT NULL REFERENCES suppliers(id),
    po_no               VARCHAR(50) NOT NULL,             -- sequential per store
    po_date             DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_delivery   DATE,
    status              VARCHAR(50) DEFAULT 'draft',      -- draft, pending_approval, approved, sent, partially_received, received, cancelled
    subtotal            DECIMAL(12,2) DEFAULT 0,
    discount_amount     DECIMAL(12,2) DEFAULT 0,
    tax_amount          DECIMAL(12,2) DEFAULT 0,
    total_amount        DECIMAL(12,2) DEFAULT 0,
    notes               TEXT,
    approved_by         UUID REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(store_id, po_no)
);

CREATE INDEX idx_po_store ON purchase_orders(store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_po_supplier ON purchase_orders(supplier_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_po_status ON purchase_orders(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_po_date ON purchase_orders(po_date) WHERE deleted_at IS NULL;
```

### 3.17 purchase_order_items

Line items within a purchase order.

```sql
CREATE TABLE purchase_order_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    po_id               UUID NOT NULL REFERENCES purchase_orders(id),
    medicine_id         UUID NOT NULL REFERENCES medicines(id),
    item_no             INTEGER NOT NULL,
    quantity_ordered    INTEGER NOT NULL,
    quantity_received   INTEGER DEFAULT 0,
    unit_price          DECIMAL(12,2) NOT NULL,
    mrp                 DECIMAL(12,2),
    discount_percent    DECIMAL(5,2) DEFAULT 0,
    discount_amount     DECIMAL(12,2) DEFAULT 0,
    gst_percent         DECIMAL(5,2) DEFAULT 0,
    gst_amount          DECIMAL(12,2) DEFAULT 0,
    total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_po_items_po ON purchase_order_items(po_id);
CREATE INDEX idx_po_items_medicine ON purchase_order_items(medicine_id);
```

### 3.18 goods_receipt_notes

Goods receipt note (GRN) for received purchase orders.

```sql
CREATE TABLE goods_receipt_notes (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES stores(id),
    po_id               UUID REFERENCES purchase_orders(id),
    grn_no              VARCHAR(50) NOT NULL,
    grn_date            DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_no          VARCHAR(100),                     -- supplier invoice number
    invoice_date        DATE,
    supplier_id         UUID NOT NULL REFERENCES suppliers(id),
    status              VARCHAR(50) DEFAULT 'pending',    -- pending, completed, cancelled
    total_quantity      INTEGER DEFAULT 0,
    total_amount        DECIMAL(12,2) DEFAULT 0,
    notes               TEXT,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(store_id, grn_no)
);

CREATE INDEX idx_grn_store ON goods_receipt_notes(store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_grn_po ON goods_receipt_notes(po_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_grn_supplier ON goods_receipt_notes(supplier_id) WHERE deleted_at IS NULL;
```

### 3.19 goods_receipt_items

Line items within a GRN, including batch details.

```sql
CREATE TABLE goods_receipt_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    grn_id              UUID NOT NULL REFERENCES goods_receipt_notes(id),
    po_item_id          UUID REFERENCES purchase_order_items(id),
    medicine_id         UUID NOT NULL REFERENCES medicines(id),
    batch_no            VARCHAR(100) NOT NULL,
    expiry_date         DATE NOT NULL,
    manufacture_date    DATE,
    mrp                 DECIMAL(12,2) NOT NULL,
    unit_price          DECIMAL(12,2) NOT NULL,
    quantity            INTEGER NOT NULL,
    free_quantity       INTEGER DEFAULT 0,                -- free/sample items
    discount_percent    DECIMAL(5,2) DEFAULT 0,
    discount_amount     DECIMAL(12,2) DEFAULT 0,
    gst_percent         DECIMAL(5,2) DEFAULT 0,
    gst_amount          DECIMAL(12,2) DEFAULT 0,
    total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    selling_price       DECIMAL(12,2),                    -- suggested selling price
    rack_id             UUID REFERENCES racks(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_grn_items_grn ON goods_receipt_items(grn_id);
CREATE INDEX idx_grn_items_medicine ON goods_receipt_items(medicine_id);
CREATE INDEX idx_grn_items_batch ON goods_receipt_items(batch_no, medicine_id);
```

### 3.20 purchase_invoices

Supplier purchase invoices (for accounting).

```sql
CREATE TABLE purchase_invoices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES stores(id),
    grn_id              UUID REFERENCES goods_receipt_notes(id),
    po_id               UUID REFERENCES purchase_orders(id),
    supplier_id         UUID NOT NULL REFERENCES suppliers(id),
    invoice_no          VARCHAR(100) NOT NULL,
    invoice_date        DATE NOT NULL,
    due_date            DATE,
    subtotal            DECIMAL(12,2) DEFAULT 0,
    discount_amount     DECIMAL(12,2) DEFAULT 0,
    taxable_amount      DECIMAL(12,2) DEFAULT 0,
    gst_amount          DECIMAL(12,2) DEFAULT 0,
    cgst_amount         DECIMAL(12,2) DEFAULT 0,
    sgst_amount         DECIMAL(12,2) DEFAULT 0,
    igst_amount         DECIMAL(12,2) DEFAULT 0,
    total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    paid_amount         DECIMAL(12,2) DEFAULT 0,
    balance_amount      DECIMAL(12,2) DEFAULT 0,
    payment_status      VARCHAR(50) DEFAULT 'unpaid',     -- unpaid, partially_paid, paid
    status              VARCHAR(50) DEFAULT 'pending',    -- pending, verified, cancelled
    notes               TEXT,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(store_id, invoice_no, supplier_id)
);

CREATE INDEX idx_pi_store ON purchase_invoices(store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pi_supplier ON purchase_invoices(supplier_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_pi_status ON purchase_invoices(payment_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_pi_date ON purchase_invoices(invoice_date) WHERE deleted_at IS NULL;
```

### 3.21 purchase_payments

Payments made to suppliers.

```sql
CREATE TABLE purchase_payments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    purchase_invoice_id UUID NOT NULL REFERENCES purchase_invoices(id),
    payment_no          VARCHAR(50) NOT NULL,
    payment_date        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    payment_mode        VARCHAR(50) NOT NULL,             -- cash, bank_transfer, cheque, upi
    amount              DECIMAL(12,2) NOT NULL,
    reference_no        VARCHAR(100),
    bank_name           VARCHAR(255),
    cheque_no           VARCHAR(50),
    cheque_date         DATE,
    notes               TEXT,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_pp_invoice ON purchase_payments(purchase_invoice_id) WHERE deleted_at IS NULL;
```

### 3.22 customer_returns

Customer return transactions.

```sql
CREATE TABLE customer_returns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES stores(id),
    bill_id             UUID NOT NULL REFERENCES sales_bills(id),
    return_no           VARCHAR(50) NOT NULL,
    return_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    reason              VARCHAR(255) NOT NULL,
    status              VARCHAR(50) DEFAULT 'pending',    -- pending, approved, completed, rejected
    refund_amount       DECIMAL(12,2) DEFAULT 0,
    refund_mode         VARCHAR(50),                      -- cash, bank, credit_note
    notes               TEXT,
    approved_by         UUID REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(store_id, return_no)
);

CREATE INDEX idx_cr_bill ON customer_returns(bill_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_cr_date ON customer_returns(return_date) WHERE deleted_at IS NULL;
```

### 3.23 customer_return_items

Items being returned by customer.

```sql
CREATE TABLE customer_return_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id           UUID NOT NULL REFERENCES customer_returns(id),
    sales_item_id       UUID NOT NULL REFERENCES sales_items(id),
    medicine_id         UUID NOT NULL REFERENCES medicines(id),
    batch_id            UUID REFERENCES batches(id),
    quantity            INTEGER NOT NULL,
    unit_price          DECIMAL(12,2) NOT NULL,
    total_amount        DECIMAL(12,2) NOT NULL,
    reason              VARCHAR(255),
    condition           VARCHAR(50) DEFAULT 'good',       -- good, damaged, expired
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cri_return ON customer_return_items(return_id);
```

### 3.24 supplier_returns

Returns to suppliers.

```sql
CREATE TABLE supplier_returns (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES stores(id),
    supplier_id         UUID NOT NULL REFERENCES suppliers(id),
    purchase_invoice_id UUID REFERENCES purchase_invoices(id),
    return_no           VARCHAR(50) NOT NULL,
    return_date         DATE NOT NULL DEFAULT CURRENT_DATE,
    reason              VARCHAR(255) NOT NULL,             -- expired, damaged, wrong_item, excess
    status              VARCHAR(50) DEFAULT 'pending',    -- pending, approved, completed, rejected
    credit_note_no      VARCHAR(100),
    credit_amount       DECIMAL(12,2) DEFAULT 0,
    notes               TEXT,
    approved_by         UUID REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(store_id, return_no)
);

CREATE INDEX idx_sr_supplier ON supplier_returns(supplier_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sr_status ON supplier_returns(status) WHERE deleted_at IS NULL;
```

### 3.25 supplier_return_items

Items being returned to supplier.

```sql
CREATE TABLE supplier_return_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    return_id           UUID NOT NULL REFERENCES supplier_returns(id),
    medicine_id         UUID NOT NULL REFERENCES medicines(id),
    batch_id            UUID NOT NULL REFERENCES batches(id),
    quantity            INTEGER NOT NULL,
    unit_price          DECIMAL(12,2) NOT NULL,
    total_amount        DECIMAL(12,2) NOT NULL,
    reason              VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sri_return ON supplier_return_items(return_id);
```

### 3.26 stock_transfers

Inter-store stock transfers (multi-store).

```sql
CREATE TABLE stock_transfers (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_no         VARCHAR(50) NOT NULL,
    from_store_id       UUID NOT NULL REFERENCES stores(id),
    to_store_id         UUID NOT NULL REFERENCES stores(id),
    transfer_date       DATE NOT NULL DEFAULT CURRENT_DATE,
    status              VARCHAR(50) DEFAULT 'draft',      -- draft, pending, approved, in_transit, received, cancelled
    total_items         INTEGER DEFAULT 0,
    notes               TEXT,
    approved_by         UUID REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    received_by         UUID REFERENCES users(id),
    received_at         TIMESTAMPTZ,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(from_store_id, transfer_no)
);

CREATE INDEX idx_st_from ON stock_transfers(from_store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_st_to ON stock_transfers(to_store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_st_status ON stock_transfers(status) WHERE deleted_at IS NULL;
```

### 3.27 stock_transfer_items

Items within a stock transfer.

```sql
CREATE TABLE stock_transfer_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transfer_id         UUID NOT NULL REFERENCES stock_transfers(id),
    medicine_id         UUID NOT NULL REFERENCES medicines(id),
    batch_id            UUID NOT NULL REFERENCES batches(id),
    quantity            INTEGER NOT NULL,
    unit_cost           DECIMAL(12,2),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sti_transfer ON stock_transfer_items(transfer_id);
```

### 3.28 stock_adjustments

Stock adjustments (write-offs, corrections).

```sql
CREATE TABLE stock_adjustments (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES stores(id),
    adjustment_no       VARCHAR(50) NOT NULL,
    adjustment_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    type                VARCHAR(50) NOT NULL,             -- addition, reduction, write_off, correction
    reason              VARCHAR(255) NOT NULL,
    status              VARCHAR(50) DEFAULT 'pending',    -- pending, approved, completed
    notes               TEXT,
    approved_by         UUID REFERENCES users(id),
    approved_at         TIMESTAMPTZ,
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ,
    UNIQUE(store_id, adjustment_no)
);

CREATE INDEX idx_sa_store ON stock_adjustments(store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_sa_type ON stock_adjustments(type) WHERE deleted_at IS NULL;
CREATE INDEX idx_sa_status ON stock_adjustments(status) WHERE deleted_at IS NULL;
```

### 3.29 stock_adjustment_items

Items within a stock adjustment.

```sql
CREATE TABLE stock_adjustment_items (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    adjustment_id       UUID NOT NULL REFERENCES stock_adjustments(id),
    medicine_id         UUID NOT NULL REFERENCES medicines(id),
    batch_id            UUID NOT NULL REFERENCES batches(id),
    quantity            INTEGER NOT NULL,                 -- positive for addition, negative for reduction
    unit_cost           DECIMAL(12,2),
    reason              VARCHAR(255),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sai_adjustment ON stock_adjustment_items(adjustment_id);
```

### 3.30 audit_logs

Immutable audit trail for critical actions.

```sql
CREATE TABLE audit_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID REFERENCES stores(id),
    user_id             UUID REFERENCES users(id),
    action              VARCHAR(100) NOT NULL,            -- e.g., "BILL_CREATED", "BILL_CANCELLED", "STOCK_ADJUSTED"
    entity_type         VARCHAR(100) NOT NULL,            -- e.g., "sales_bills", "batches", "medicines"
    entity_id           UUID,                             -- ID of the affected record
    description         TEXT,
    before_values       JSONB,                            -- snapshot of values before change
    after_values        JSONB,                            -- snapshot of values after change
    ip_address          VARCHAR(45),
    user_agent          TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_store ON audit_logs(store_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_action ON audit_logs(action);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Partition by month for performance
-- CREATE TABLE audit_logs (...) PARTITION BY RANGE (created_at);
```

### 3.31 barcode_labels

Generated barcode labels.

```sql
CREATE TABLE barcode_labels (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES stores(id),
    medicine_id         UUID NOT NULL REFERENCES medicines(id),
    batch_id            UUID REFERENCES batches(id),
    label_type          VARCHAR(50) NOT NULL,             -- shelf_label, medicine_label, price_label
    barcode_data        VARCHAR(255) NOT NULL,
    barcode_format      VARCHAR(50) DEFAULT 'CODE128',    -- CODE128, EAN13, QR
    label_content       JSONB,                            -- text fields to print on label
    print_count         INTEGER DEFAULT 0,
    last_printed_at     TIMESTAMPTZ,
    image_url           TEXT,                             -- generated barcode image URL
    created_by          UUID NOT NULL REFERENCES users(id),
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_barcode_medicine ON barcode_labels(medicine_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_barcode_store ON barcode_labels(store_id) WHERE deleted_at IS NULL;
```

### 3.32 purchase_suggestions

Auto-generated purchase suggestions.

```sql
CREATE TABLE purchase_suggestions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES stores(id),
    medicine_id         UUID NOT NULL REFERENCES medicines(id),
    supplier_id         UUID REFERENCES suppliers(id),
    suggestion_date     DATE NOT NULL DEFAULT CURRENT_DATE,
    current_stock       INTEGER NOT NULL,
    average_daily_sale  DECIMAL(10,2) DEFAULT 0,
    lead_time_days      INTEGER DEFAULT 0,
    safety_stock        INTEGER DEFAULT 0,
    reorder_level       INTEGER DEFAULT 0,
    suggested_quantity  INTEGER NOT NULL,
    priority            VARCHAR(20) DEFAULT 'medium',     -- low, medium, high, critical
    status              VARCHAR(50) DEFAULT 'pending',    -- pending, ordered, ignored
    notes               TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at          TIMESTAMPTZ
);

CREATE INDEX idx_ps_store ON purchase_suggestions(store_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ps_medicine ON purchase_suggestions(medicine_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_ps_date ON purchase_suggestions(suggestion_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_ps_priority ON purchase_suggestions(priority) WHERE deleted_at IS NULL;
```

### 3.33 daily_summaries

Pre-computed daily sales/purchase summaries for dashboard.

```sql
CREATE TABLE daily_summaries (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID NOT NULL REFERENCES stores(id),
    summary_date        DATE NOT NULL,
    total_sales         DECIMAL(12,2) DEFAULT 0,
    total_purchases     DECIMAL(12,2) DEFAULT 0,
    total_profit        DECIMAL(12,2) DEFAULT 0,
    total_bills         INTEGER DEFAULT 0,
    total_items_sold    INTEGER DEFAULT 0,
    total_customers     INTEGER DEFAULT 0,
    avg_bill_value      DECIMAL(12,2) DEFAULT 0,
    cash_sales          DECIMAL(12,2) DEFAULT 0,
    upi_sales           DECIMAL(12,2) DEFAULT 0,
    card_sales          DECIMAL(12,2) DEFAULT 0,
    credit_sales        DECIMAL(12,2) DEFAULT 0,
    total_discount      DECIMAL(12,2) DEFAULT 0,
    total_tax           DECIMAL(12,2) DEFAULT 0,
    total_returns       DECIMAL(12,2) DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(store_id, summary_date)
);

CREATE INDEX idx_ds_store ON daily_summaries(store_id);
CREATE INDEX idx_ds_date ON daily_summaries(summary_date);
```

### 3.34 user_sessions

Active user sessions for tracking.

```sql
CREATE TABLE user_sessions (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID NOT NULL REFERENCES users(id),
    store_id            UUID REFERENCES stores(id),
    token               TEXT NOT NULL,
    refresh_token       TEXT,
    ip_address          VARCHAR(45),
    user_agent          TEXT,
    device_info         JSONB,
    is_active           BOOLEAN DEFAULT true,
    logged_in_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_activity_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    logged_out_at       TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_us_user ON user_sessions(user_id);
CREATE INDEX idx_us_active ON user_sessions(is_active);
CREATE INDEX idx_us_token ON user_sessions(token);
```

### 3.35 notification_logs

Notification history.

```sql
CREATE TABLE notification_logs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id            UUID REFERENCES stores(id),
    user_id             UUID REFERENCES users(id),
    type                VARCHAR(50) NOT NULL,             -- expiry_alert, low_stock, purchase_suggestion, system
    title               VARCHAR(255) NOT NULL,
    message             TEXT,
    channel             VARCHAR(50) DEFAULT 'in_app',     -- in_app, email, sms, whatsapp
    reference_type      VARCHAR(100),                     -- e.g., "batches", "medicines"
    reference_id        UUID,
    is_read             BOOLEAN DEFAULT false,
    read_at             TIMESTAMPTZ,
    sent_at             TIMESTAMPTZ,
    delivery_status     VARCHAR(50) DEFAULT 'pending',    -- pending, sent, delivered, failed
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nl_user ON notification_logs(user_id);
CREATE INDEX idx_nl_store ON notification_logs(store_id);
CREATE INDEX idx_nl_type ON notification_logs(type);
CREATE INDEX idx_nl_read ON notification_logs(is_read);
CREATE INDEX idx_nl_created ON notification_logs(created_at);
```

---

## 4. Index Strategy Summary

| Table | Key Indexes | Purpose |
|---|---|---|
| tenants | subdomain, status | Tenant lookup, subscription mgmt |
| stores | code, city | Store identification |
| users | email, phone, store_id, role | Authentication, filtering |
| medicines | brand_name, generic_name, barcode, category, manufacturer | Search, lookup, filtering |
| medicines | Full-text search GIN index | Fast autocomplete search |
| batches | (medicine_id, store_id), expiry_date, supplier_id | Stock lookup, FIFO/expiry selection |
| sales_bills | store_id, bill_date, customer_id, status | Billing, reporting |
| sales_items | bill_id, medicine_id | Invoice details, sales analysis |
| purchase_orders | store_id, supplier_id, status | Purchase tracking |
| goods_receipt_notes | store_id, po_id | GRN tracking |
| audit_logs | store_id, user_id, action, entity_type | Audit trail queries |
| daily_summaries | (store_id, summary_date) | Dashboard performance |

---

## 5. Key Relationships Summary

| Relationship | Type | Description |
|---|---|---|
| Tenant → Stores | 1:N | One tenant can have multiple stores |
| Store → Users | 1:N | Users belong to a store |
| Medicine → Categories | N:1 | Medicine belongs to a category |
| Medicine → Manufacturer | N:1 | Medicine manufactured by one company |
| Medicine → Suppliers | N:M | Medicine available from multiple suppliers |
| Medicine → Batches | 1:N | One medicine can have multiple batches |
| Batch → Store | N:1 | Batch belongs to a store |
| Batch → Rack | N:1 | Batch stored in a rack location |
| Sales Bill → Customer | N:1 | Bill belongs to a customer |
| Sales Bill → Sales Items | 1:N | Bill contains multiple line items |
| Sales Item → Batch | N:1 | Item references a specific batch |
| Purchase Order → Supplier | N:1 | PO belongs to a supplier |
| Purchase Order → PO Items | 1:N | PO contains multiple line items |
| GRN → Purchase Order | N:1 | GRN references a PO |
| GRN → GRN Items | 1:N | GRN contains received items |
| GRN Item → Batch | 1:1 | GRN item creates/updates a batch |
| Prescription → Doctor | N:1 | Prescription from a doctor |
| Prescription → Sales Bill | 1:1 | Prescription linked to a bill |

---

## 6. Data Migration & Seeding Strategy

### 6.1 Initial Seed Data
- Default roles and permissions
- Common medicine categories (Analgesics, Antibiotics, Antipyretics, etc.)
- Common medicine forms (Tablet, Capsule, Syrup, Injection, etc.)
- Drug schedules (H, H1, X, G, etc.)
- Default GST rates (5%, 12%, 18%, 28%)

### 6.2 Migration Strategy
- Prisma Migrate for schema versioning
- Each migration is a single, reversible change
- Migrations are tested against a copy of production data
- Zero-downtime migrations using PostgreSQL transactional DDL
- Rollback plan documented for each migration

### 6.3 Data Archival
- Sales bills older than 3 years moved to archive tables
- Audit logs older than 1 year moved to cold storage
- Daily summaries retained indefinitely (aggregated)
- Raw transaction data purged after 7 years (statutory requirement)

---

## 7. Performance Considerations

### 7.1 Partitioning Strategy
- `sales_bills`: Partition by month on `bill_date`
- `sales_items`: Partition by month (aligned with bills)
- `audit_logs`: Partition by month on `created_at`
- `daily_summaries`: No partitioning needed (small table)

### 7.2 Connection Pooling
- PgBouncer for connection pooling
- Min connections: 5 per service
- Max connections: 20 per service
- Statement timeout: 30s
- Idle transaction timeout: 60s

### 7.3 Query Optimization
- All queries use parameterized statements
- Covering indexes for frequent query patterns
- Materialized views for complex dashboard queries
- Query analysis via `EXPLAIN ANALYZE` in development
- Slow query logging (> 500ms) in production

---

*Document Version: 1.0*
*Prepared for: Cognivectra*