# Manager User Manual — MediFlow PharmacyOS

---

## 1. Overview

The **Manager** role handles day-to-day store operations: inventory control, purchasing, stock management, returns, and operational reporting. Managers have broad access to all operational modules but cannot manage user accounts or system settings.

---

## 2. Getting Started

### 2.1 Logging In

1. Open the application URL.
2. Enter your **email** and **password**.
3. Click **Sign in securely**.
4. You will land on the **Overview** (Dashboard) page.

### 2.2 Logging Out

1. Click **Sign out** at the bottom of the left sidebar.
2. Your session is cleared.

---

## 3. Navigation

| Group | Modules Available to Manager |
|---|---|
| **Workspace** | Overview, Point of Sale, Inventory, Medicines |
| **Masters** | Suppliers, Customers, Doctors |
| **Operations** | Purchase Orders, Goods Receipt, Returns, Barcode Labels |
| **Management** | Reports, Invoices, Notifications |

> **Note:** Team Members, Stores, and Settings are **not accessible** to the Manager role. These are restricted to Admin/Owner.

---

## 4. Dashboard (Overview)

Provides a real-time summary of pharmacy operations.

### Summary Cards
- **Today's sales** — Revenue collected today.
- **Orders fulfilled** — Bills completed today.
- **Total customers** — Customer records on file.
- **Inventory value** — Current stock value with low-stock count.

### Charts & Alerts
- **Sales & Profit Chart** — 7-day bar chart.
- **Inventory Alerts** — Low-stock and expiring items flagged for review.
- **Best Sellers** — Top-selling medicines.
- **Quick Actions** — Start a new sale or create a purchase order.

---

## 5. Medicines (Medicine Master)

> **Path:** Workspace > Medicines

Full CRUD for the medicine catalog.

### 5.1 Viewing Medicines

- Table: Brand Name, Generic Name, Form, Schedule, GST%, MRP, Stock Qty.
- **Search** by brand name, generic name, or barcode.

### 5.2 Adding a Medicine

1. Click **Add Medicine**.
2. Fill in required fields:
   - Brand Name, Generic Name, Strength, Form, Schedule, GST%, HSN Code, Barcode, Unit Type.
3. Toggle **Batch Tracking**, **Expiry Tracking**, **Prescription Required** as needed.
4. Click **Create**.

### 5.3 Editing a Medicine

1. Click **Edit** on the row.
2. Update fields and click **Save**.

### 5.4 Deleting a Medicine

1. Click **Delete** on the row.
2. Confirm in the dialog.

---

## 6. Inventory

> **Path:** Workspace > Inventory

View stock levels and perform stock adjustments.

### 6.1 Viewing Inventory

- Table: Medicine Name, Batch No., Store, Supplier, Quantity, Expiry Date, MRP, Purchase Price.
- **Red quantity** = low stock (10 or fewer units).
- **Red expiry** = expired batch.
- **Amber expiry** = expiring within 60 days.

### 6.2 Adjusting Stock

1. Click **Adjust** on any inventory row.
2. Enter a **positive number** to add stock, or a **negative number** to reduce it.
3. Enter a **reason** (mandatory) — e.g., "Damaged goods", "Physical count correction".
4. Click **Confirm**.
5. The quantity updates immediately and an audit entry is created in the Reports > Audit Log.

---

## 7. Suppliers

> **Path:** Masters > Suppliers

Manage distributor records.

### 7.1 Viewing Suppliers

- Table: Company Name, Contact Person, GSTIN, Phone, City, Lead Time, Balance.

### 7.2 Adding a Supplier

1. Click **Add Supplier**.
2. Fill in: Company Name, Contact Person, GSTIN, Drug License, Phone, Email, Address, City, State, Credit Days, Lead Time Days.
3. Click **Create**.

### 7.3 Editing / Deleting

- Click **Edit** to update, **Delete** to soft-remove.

---

## 8. Customers

> **Path:** Masters > Customers

Manage patient/customer profiles.

### 8.1 Viewing Customers

- Table: Name, Code, Mobile, City, Loyalty Points, Credit Enabled.

### 8.2 Adding a Customer

1. Click **Add Customer**.
2. Fill in: First Name, Last Name, Mobile, Email, Address, City, State, Gender.
3. Toggle **Allow Credit** if applicable.
4. Click **Create**.

### 8.3 Editing / Deleting

- Click **Edit** to modify, **Delete** to soft-remove.

---

## 9. Doctors

> **Path:** Masters > Doctors

Maintain doctor references for prescription billing.

### 9.1 Viewing Doctors

- Table: Name, Speciality, Clinic/Hospital, Registration No., Mobile, Status.

### 9.2 Adding a Doctor

1. Click **Add Doctor**.
2. Fill in: Name, Speciality, Clinic/Hospital, Registration No., Mobile, Email, Address.
3. Click **Create**.

### 9.3 Editing / Deleting

- Click **Edit** to update, **Delete** to remove.

---

## 10. Point of Sale (Sales)

> **Path:** Workspace > Point of Sale

Create and manage sales bills.

### 10.1 Viewing Sales Bills

- Table: Bill No., Date, Customer, Payment Status, Items, Total.

### 10.2 Creating a New Sale

1. Click **New sale**.
2. Select a **Customer** (or leave blank for walk-in).
3. **Search** for a medicine by name, generic name, or barcode.
4. Click on a result to add it to the cart. Out-of-stock items are blocked.
5. Adjust quantities in the cart or remove items.
6. Review **Subtotal**, **GST**, and **Total**.
7. Select **Payment Mode**: Cash, UPI, Card, or Credit.
8. Add optional **Notes**.
9. Click **Complete sale**.
10. Stock is decremented automatically using FIFO batch allocation.

---

## 11. Purchase Orders

> **Path:** Operations > Purchase Orders

### 11.1 Viewing POs

- Table: PO Number, Date, Supplier, Status, Items, Total.

### 11.2 Creating a Purchase Order

1. Click **Create PO**.
2. Select a **Supplier**.
3. Add line items: Medicine, Quantity, Unit Price.
4. Click **+ Add item** for more lines.
5. Add optional **Notes**.
6. Click **Create PO**.

### 11.3 Submitting a PO

- Click **Submit** on a Draft PO to change status to **Submitted**.

---

## 12. Goods Receipt

> **Path:** Operations > Goods Receipt

### 12.1 Viewing GRNs

- Table: GRN Number, Date, Supplier, Invoice No., Status, Total Qty.

### 12.2 Receiving Stock

1. Click **Receive stock**.
2. Select a **Supplier** and enter the **Invoice Number**.
3. Add batch line items: Medicine, Batch Number, Expiry Date, MRP, Cost Price, Quantity.
4. Click **+ Add batch** for additional entries.
5. Click **Complete receipt**.
6. Inventory is updated with the new batches.

---

## 13. Returns

> **Path:** Operations > Returns

### 13.1 Customer Return

1. Click **Customer return**.
2. Select the original **Sales Bill**.
3. Add return items (medicine, quantity, unit price).
4. Enter a **Reason** (mandatory).
5. Click **Submit**.
6. Stock is restored and a refund/credit note is generated.

### 13.2 Supplier Return

1. Click **Supplier return**.
2. Select a **Supplier**.
3. Add return items.
4. Enter a **Reason**.
5. Click **Submit**.
6. Stock is removed and a supplier credit note is generated.

---

## 14. Barcode Labels

> **Path:** Operations > Barcode Labels

### 14.1 Generating a Label

1. Click **Generate label**.
2. Select a **Medicine**, choose **Label Type** (Medicine/Batch/Shelf).
3. Enter or scan **Barcode Data**.
4. Select **Format**: CODE128, EAN-13, or QR.
5. Click **Create**.

### 14.2 Deleting a Label

- Click **Delete** and confirm.

---

## 15. Invoices (Purchase Invoices)

> **Path:** Management > Invoices

### 15.1 Viewing Invoices

- Table: Invoice No., Supplier, Status (Paid/Unpaid/Partial), Due Date, Total, Balance.

### 15.2 Recording an Invoice

1. Click **Record invoice**.
2. Fill in: Supplier, Invoice Number, Invoice Date, Due Date, Total Amount, Paid Amount.
3. Click **Create**.

---

## 16. Reports

> **Path:** Management > Reports

Read-only analytics module with three tabs.

### 16.1 Daily Summaries
- Cards: Date, Store, Total Sales, Profit, Bill Count.

### 16.2 Audit Log
- Table: Action, Entity Type, User, Timestamp.
- Tracks price changes, bill edits, stock adjustments, etc.

### 16.3 Purchase Suggestions
- Cards: Medicine Name, Current Stock, Suggested Reorder Qty, Priority.
- Auto-generated from sales history.

---

## 17. Notifications

> **Path:** Management > Notifications

### 17.1 Viewing Alerts

- Table: Title, Type, Message, Read/Unread, Date.

### 17.2 Marking as Read

- Click **Mark read** or click the row.

---

## 18. Quick Reference: Manager Permissions

| Module | View | Create | Edit | Delete | Notes |
|---|---|---|---|---|---|
| Dashboard | Yes | — | — | — | Full metrics access |
| Medicines | Yes | Yes | Yes | Yes | Full catalog management |
| Inventory | Yes | Yes (adjust) | — | — | Stock adjustment with reason |
| Suppliers | Yes | Yes | Yes | Yes | Full supplier CRUD |
| Customers | Yes | Yes | Yes | Yes | Full customer CRUD |
| Doctors | Yes | Yes | Yes | Yes | Full doctor CRUD |
| Point of Sale | Yes | Yes | — | — | Create sales bills |
| Purchase Orders | Yes | Yes | Yes | Yes | Full PO lifecycle |
| Goods Receipt | Yes | Yes | Yes | — | Receive and verify stock |
| Returns | Yes | Yes | Yes | — | Customer and supplier returns |
| Barcode Labels | Yes | Yes | — | Yes | Generate and delete labels |
| Invoices | Yes | Yes | Yes | — | Track supplier payments |
| Reports | Yes | — | — | — | Read-only (includes audit log) |
| Notifications | Yes | — | — | — | Mark as read |
| Team Members | No | No | No | No | Restricted |
| Stores | No | No | No | No | Restricted |
| Settings | No | No | No | No | Restricted |

---

## 19. Frequently Asked Questions

**Q: Why can I not add a new user?**
A: User management is restricted to the Admin and Owner roles. Contact your administrator.

**Q: How do I correct a stock count?**
A: Go to Inventory, click Adjust on the relevant batch, enter the correction amount and a reason.

**Q: Can I void a completed sale?**
A: Use the Returns module to process a customer return against the original bill. Direct voiding is not available.

**Q: How do I handle expired stock?**
A: Create a Supplier Return to return expired batches to the supplier, which generates a credit note.
