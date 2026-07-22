# Product Requirements Document (PRD)

## PharmacyOS — Cloud-Native Pharmacy Operating System

---

## 1. Executive Summary

The Indian pharmacy software market is dominated by legacy desktop applications and basic cloud systems, leaving room for a modern, AI-enabled, cloud-native product. **PharmacyOS** is designed to fill this gap — a multi-tenant, offline-first SaaS platform that goes beyond traditional billing to become an intelligent operating system for pharmacy operations.

PharmacyOS targets independent pharmacies and pharmacy chains across India, offering a unified platform for inventory management, billing, compliance, AI-powered insights, and future integration into a broader retail healthcare ecosystem.

---

## 2. Problem Statement

- Most existing pharmacy solutions are outdated desktop applications with limited functionality.
- Basic cloud systems lack intelligence, automation, and modern UX.
- Pharmacies struggle with:
  - Expiry management and batch tracking
  - GST compliance and reporting
  - Manual purchase forecasting
  - Prescription handling
  - Multi-store coordination
- No existing product offers AI-powered features like demand forecasting, OCR prescription reading, or voice billing.

---

## 3. Target Audience

| Segment | Description |
|---|---|
| Independent Pharmacies | Single-store operators needing affordable, easy-to-use software |
| Pharmacy Chains | Multi-store operators requiring centralised control and reporting |
| Wholesale Distributors | Downstream integration for supply chain management |

---

## 4. User Personas

| Persona | Role | Needs |
|---|---|---|
| Owner | Business owner | Profit reports, dashboards, multi-store visibility |
| Pharmacist | Dispensing medicines | Billing, prescription handling, stock checks |
| Cashier | Front-desk billing | Fast billing, barcode scanning, payment handling |
| Manager | Store operations | Inventory control, purchase orders, returns |
| Admin | System administration | User management, audit logs, configuration |

---

## 5. Core Modules

### 5.1 Dashboard

Real-time operational overview displaying:

- Today's Sales
- Today's Purchase
- Profit summary
- Expiring medicines
- Out of Stock items
- Fast Moving Items
- Pending Supplier Payments
- Customer Credit balances

### 5.2 Masters

#### Medicines
| Field | Description |
|---|---|
| Brand Name | e.g., Crocin |
| Generic Name | e.g., Paracetamol |
| Strength | e.g., 650 mg |
| Form | Tablet, Syrup, Injection, Cream, etc. |
| Schedule | H, H1, X, etc. |
| Manufacturer | e.g., Sun Pharma |
| Supplier | Linked supplier record |
| GST % | Applicable GST rate |
| HSN Code | As per GST classification |
| Barcode | Product barcode |
| Batch Enabled | Toggle for batch tracking |
| Expiry Enabled | Toggle for expiry tracking |
| MRP | Maximum Retail Price |
| Purchase Price | Cost price |
| Selling Price | Retail price |

#### Manufacturer
- Name, Address, Contact
- Drug License Number

#### Supplier
- Company Name
- GSTIN
- Drug License Number
- Contact Person
- Credit Days
- Address, Phone, Email

#### Customers
- Name, Mobile, Address
- Linked Doctor (optional)
- Loyalty Points
- Credit Balance

#### Doctors
- Name, Speciality
- Clinic/Hospital
- Contact Information
- Prescription tracking

### 5.3 Purchase Management

End-to-end purchase workflow:

```
Supplier Invoice → Receive Stock → Batch Entry → Expiry → MRP → Purchase Cost → GST → Inventory Update
```

- Each medicine can have multiple batches with different:
  - Batch number
  - Expiry date
  - Quantity
  - MRP
  - Purchase cost
- Batches coexist in inventory (e.g., Paracetamol Batch A001 exp 06/2028 qty 100 + Batch A002 exp 11/2028 qty 150)

### 5.4 Inventory

Real-time stock tracking with:

- Batch number
- Expiry date
- Rack / Shelf location
- Purchase cost
- MRP
- Available quantity
- Reserved quantity

### 5.5 Sales (Billing)

Billing workflow:

```
Search Medicine → Scan Barcode → Select Batch (FIFO / Nearest Expiry) → Bill → Print Invoice → Reduce Stock
```

Payment modes supported:
- Cash
- UPI
- Credit / Debit Card
- Credit Sale (customer credit)

### 5.6 Prescription Billing

- Attach doctor information
- Upload / scan prescription image
- Link patient details
- Store scanned prescription for compliance

### 5.7 Barcode

- Generate shelf labels
- Generate barcode labels for medicines
- Barcode scanning during billing

### 5.8 Returns

#### Customer Return
- Validate original sale
- Increase stock
- Process refund

#### Supplier Return
- Return expired or damaged medicines
- Generate credit note

### 5.9 Expiry Management

Categorized alerts:

| Period | Action |
|---|---|
| 30 days | Warning |
| 60 days | Monitor |
| 90 days | Review |
| Expired | Immediate action required |

### 5.10 Purchase Suggestions

Auto-generated purchase recommendations based on:

- Current stock level
- Average daily sale
- Lead time from supplier
- Safety stock buffer
- Recommended order quantity

### 5.11 GST

Automated GST compliance reports:

- GST Sales Report
- GST Purchase Report
- HSN-wise Summary
- GSTR-1 / GSTR-3B ready data

### 5.12 Financial Reports

- Profit & Margin Analysis
- Fast Moving / Slow Moving / Dead Stock
- Monthly Sales Trend
- Purchase Trend

### 5.13 Multi-Store

- Store A ↔ Store B stock transfer
- Centralised reporting across stores
- Unified or per-store inventory view

### 5.14 User Management

Role-Based Access Control (RBAC):

| Role | Permissions |
|---|---|
| Cashier | Billing only |
| Pharmacist | Billing, prescription, stock view |
| Manager | Inventory, purchases, returns, reports |
| Owner | Full access |
| Admin | System configuration, user management |

### 5.15 Audit Log

Every critical action must be logged:

- Edited bill
- Deleted bill
- Discount applied
- Price change
- Stock adjustment

Log includes: timestamp, user, action type, before/after values.

---

## 6. AI Features (Key Differentiator)

### 6.1 AI Purchase Forecast
Predict next month's demand using historical sales data, seasonality, and trends.

### 6.2 AI Expiry Prediction
Identify stock likely to expire before being sold, enabling proactive discounting or returns.

### 6.3 AI Profit Advisor
Recommend optimal selling prices while maintaining target margins.

### 6.4 AI OCR Prescription Reader
Upload a doctor's handwritten prescription → AI extracts medicine names → Populates billing screen for pharmacist verification.

### 6.5 AI Generic Substitute Assistant
Suggest equivalent generic medicines where regulations and pharmacy policies allow.

### 6.6 AI Voice Billing
Pharmacist speaks: *"Crocin 650, 10 tablets; Shelcal 15 tablets."* → System prepares the bill.

### 6.7 AI WhatsApp Ordering
- Customer sends prescription image via WhatsApp
- AI recognises medicines
- Pharmacist reviews
- Invoice generated
- Customer pays
- Delivery arranged

### 6.8 AI Smart Alerts
Proactive notifications for:
- Medicines nearing expiry
- Slow-moving inventory
- Low stock items
- High-value stock sitting idle

---

## 7. Technical Architecture

```
┌─────────────────────────────────────────────────┐
│                   Clients                        │
│  Web (React/Next.js) │ Mobile │ Tablet │ Desktop │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                 API Gateway                       │
└──────┬──────┬──────┬──────┬──────┬──────┬───────┘
       │      │      │      │      │      │
┌──────▼┐ ┌──▼───┐ ┌▼────┐ ┌▼────┐ ┌▼────┐ ┌▼──────┐
│Inventory│Billing│Purchase│Customer│Supplier│  AI   │
│ Service │Service│ Service│ Service│ Service│Service│
└────────┘ └──────┘ └─────┘ └─────┘ └─────┘ └───────┘
       │      │      │      │      │      │
┌──────▼──────▼──────▼──────▼──────▼──────▼───────┐
│                 PostgreSQL                        │
├──────────────────────────────────────────────────┤
│                    Redis                          │
├──────────────────────────────────────────────────┤
│              Object Storage                       │
├──────────────────────────────────────────────────┤
│           OpenAI / Local LLM                      │
└──────────────────────────────────────────────────┘
```

### Key Technical Requirements

| Requirement | Description |
|---|---|
| Multi-tenant SaaS | Isolated tenant data with shared infrastructure |
| Offline-first | Local data sync with intermittent connectivity support |
| Responsive UI | Works on mobile, tablet, and desktop |
| Microservices | Loosely coupled services for scalability |
| API-first | Open APIs for ERP, distributors, labs, and EMR integration |

---

## 8. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Availability | 99.9% uptime |
| Response Time | < 500ms for 95% of API calls |
| Concurrent Users | Support 1000+ concurrent users per tenant |
| Data Security | End-to-end encryption, RBAC, audit trails |
| Backup | Automated daily backups with point-in-time recovery |
| Compliance | Drug licence management, GST compliance, data localisation |

---

## 9. Future Roadmap

Once PharmacyOS is stable, extend into a complete retail healthcare platform:

1. Pharmacy POS
2. Inventory Management
3. Distribution & Wholesale
4. Online Medicine Ordering
5. Doctor App
6. Patient App
7. Delivery Partner App
8. Loyalty & CRM
9. e-Prescriptions
10. Lab Integration
11. EMR Integration (including HealthSynapse EMR)
12. Analytics Dashboard
13. AI Copilot for pharmacy operations

---

## 10. Success Metrics

| Metric | Target |
|---|---|
| Monthly Active Pharmacies | 500 in Year 1 |
| Average Daily Bills per Store | 100+ |
| AI Feature Adoption | 40% of active users |
| Customer Satisfaction (CSAT) | > 4.5 / 5 |
| Stock Accuracy | > 98% |
| Expiry Loss Reduction | 30% reduction |

---

## 11. Appendix

### 11.1 Operational Flow

```
Supplier
   │
   ▼
Purchase Order
   │
   ▼
Goods Received
   │
   ▼
Purchase Invoice
   │
   ▼
Inventory Updated
   │
   ▼
Shelf Storage
   │
   ▼
Customer Walk-in / Prescription
   │
   ▼
Billing
   │
   ▼
GST Invoice
   │
   ▼
Payment
   │
   ▼
Stock Reduced
```

### 11.2 Concurrent Processes

- Expiry monitoring
- Batch tracking
- Supplier returns
- Customer returns
- Daily cash closing
- GST reports
- Drug licence compliance

---

*Document Version: 1.0*
*Prepared for: Cognivectra*