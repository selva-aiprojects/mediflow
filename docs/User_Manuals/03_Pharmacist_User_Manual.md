# Pharmacist User Manual — MediFlow PharmacyOS

---

## 1. Overview

The **Pharmacist** role focuses on dispensing medicines, prescription handling, and stock awareness. Pharmacists can create sales bills, view inventory, manage medicine records, and process customer returns. They have read access to most master data but limited access to purchasing and administrative functions.

---

## 2. Getting Started

### 2.1 Logging In

1. Open the application URL.
2. Enter your **email** and **password**.
3. Click **Sign in securely**.
4. You will land on the **Overview** (Dashboard) page.

### 2.2 Logging Out

1. Click **Sign out** at the bottom of the left sidebar.

---

## 3. Navigation

| Group | Modules Available to Pharmacist |
|---|---|
| **Workspace** | Overview, Point of Sale, Inventory, Medicines |
| **Masters** | Suppliers (view only), Customers, Doctors |
| **Operations** | Returns (customer returns) |
| **Management** | Invoices, Notifications |

> **Note:** Purchase Orders, Goods Receipt, Barcode Labels, Reports, Team Members, Stores, and Settings are **not accessible** to the Pharmacist role.

---

## 4. Dashboard (Overview)

### Summary Cards
- Today's sales, orders fulfilled, total customers, inventory value.

### Alerts
- Inventory alerts for low-stock and expiring items.

---

## 5. Medicines

> **Path:** Workspace > Medicines

### 5.1 Viewing Medicines

- Table: Brand Name, Generic Name, Form, Schedule, GST%, MRP, Stock Qty.
- Search by brand name, generic name, or barcode.

### 5.2 Adding a Medicine

1. Click **Add Medicine**.
2. Fill in: Brand Name, Generic Name, Strength, Form, Schedule, GST%, HSN Code, Barcode, Unit Type.
3. Toggle Batch Tracking, Expiry Tracking, Prescription Required.
4. Click **Create**.

### 5.3 Editing / Deleting

- Click **Edit** to update or **Delete** to soft-remove.

---

## 6. Inventory

> **Path:** Workspace > Inventory

### 6.1 Viewing Inventory

- Table: Medicine Name, Batch No., Store, Supplier, Quantity, Expiry Date, MRP, Purchase Price.
- Red quantities indicate low stock. Red/amber expiry dates highlight batches needing attention.

### 6.2 Stock Adjustment

- Click **Adjust** on any row to add or reduce stock with a mandatory reason.

---

## 7. Point of Sale (Sales)

> **Path:** Workspace > Point of Sale

This is the primary daily workflow for a pharmacist.

### 7.1 Viewing Sales Bills

- Table: Bill No., Date, Customer, Payment Status, Items, Total.

### 7.2 Creating a New Sale

1. Click **New sale**.
2. **Select a patient/customer** from the dropdown (or walk-in).
3. **Search for a medicine** — type the brand name, generic name, or scan a barcode.
4. Click a result to add to cart. Out-of-stock items are blocked.
5. Adjust quantities or remove items from the cart.
6. Review **Subtotal**, **GST**, and **Total**.
7. Select **Payment Mode**: Cash, UPI, Card, or Credit.
8. Add optional **Notes** (e.g., prescription reference).
9. Click **Complete sale**.
10. Stock is decremented using FIFO (nearest expiry first).

### 7.3 Prescription Billing Workflow

1. Before starting the sale, note the prescription details from the patient.
2. In the **Notes** field, record the prescription number or doctor's name.
3. Search and add the prescribed medicines to the cart.
4. Verify the items match the prescription before checkout.
5. Complete the sale as normal.

---

## 8. Customers

> **Path:** Masters > Customers

### 8.1 Viewing Customers

- Table: Name, Code, Mobile, City, Loyalty Points, Credit Enabled.

### 8.2 Adding a Customer

1. Click **Add Customer**.
2. Fill in: First Name, Last Name, Mobile, Email, Address, City, State, Gender.
3. Toggle **Allow Credit** if applicable.
4. Click **Create**.

### 8.3 Editing / Deleting

- Click **Edit** to modify or **Delete** to soft-remove.

---

## 9. Doctors

> **Path:** Masters > Doctors

### 9.1 Viewing Doctors

- Table: Name, Speciality, Clinic/Hospital, Registration No., Mobile, Status.

### 9.2 Adding a Doctor

1. Click **Add Doctor**.
2. Fill in the required fields.
3. Click **Create**.

### 9.3 Editing / Deleting

- Click **Edit** to update or **Delete** to remove.

---

## 10. Suppliers (View Only)

> **Path:** Masters > Suppliers

Pharmacists can view supplier records for reference (e.g., to check who supplies a particular medicine) but cannot create, edit, or delete suppliers.

---

## 11. Returns

> **Path:** Operations > Returns

### 11.1 Customer Return

1. Click **Customer return**.
2. Select the original **Sales Bill** from the dropdown.
3. Add return items (medicine, quantity, unit price).
4. Enter a **Reason** (mandatory).
5. Click **Submit**.
6. Stock is restored and a refund/credit note is generated.

---

## 12. Invoices

> **Path:** Management > Invoices

### 12.1 Viewing Invoices

- Table: Invoice No., Supplier, Status (Paid/Unpaid/Partial), Due Date, Total, Balance.

### 12.2 Recording an Invoice

1. Click **Record invoice**.
2. Fill in: Supplier, Invoice Number, Invoice Date, Due Date, Total Amount, Paid Amount.
3. Click **Create**.

---

## 13. Notifications

> **Path:** Management > Notifications

- View system alerts (low stock, expiry warnings, etc.).
- Click **Mark read** or click the row to acknowledge alerts.

---

## 14. Quick Reference: Pharmacist Permissions

| Module | View | Create | Edit | Delete | Notes |
|---|---|---|---|---|---|
| Dashboard | Yes | — | — | — | Full metrics |
| Medicines | Yes | Yes | Yes | Yes | Full catalog management |
| Inventory | Yes | Yes (adjust) | — | — | Stock adjustment with reason |
| Suppliers | Yes | No | No | No | View only |
| Customers | Yes | Yes | Yes | Yes | Full customer CRUD |
| Doctors | Yes | Yes | Yes | Yes | Full doctor CRUD |
| Point of Sale | Yes | Yes | — | — | Create sales bills |
| Returns | Yes | Yes (customer) | — | — | Process customer returns |
| Invoices | Yes | Yes | Yes | — | Record purchase invoices |
| Notifications | Yes | — | — | — | Mark as read |
| Purchase Orders | No | No | No | No | Restricted |
| Goods Receipt | No | No | No | No | Restricted |
| Barcode Labels | No | No | No | No | Restricted |
| Reports | No | No | No | No | Restricted |
| Team Members | No | No | No | No | Restricted |
| Stores | No | No | No | No | Restricted |
| Settings | No | No | No | No | Restricted |

---

## 15. Frequently Asked Questions

**Q: Can I create a purchase order?**
A: No, purchase orders are restricted to Manager and Admin roles. Contact your manager.

**Q: How do I handle a patient returning medicine?**
A: Go to Operations > Returns > Customer return, select the original bill, add the items, and submit.

**Q: Can I check supplier details?**
A: Yes, you can view supplier records under Masters > Suppliers, but you cannot modify them.

**Q: How do I verify which batch was dispensed?**
A: The FIFO system automatically allocates the nearest-expiry batch. The batch number is recorded on the sales bill.
