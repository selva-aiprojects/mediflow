# Admin User Manual — MediFlow PharmacyOS

---

## 1. Overview

The **Admin** role is the system administrator for MediFlow. Admins have full access to every module in the platform, including user management, system configuration, and audit logs. This manual covers every screen and action available to the Admin role.

---

## 2. Getting Started

### 2.1 Logging In

1. Open the application URL in your browser.
2. Enter your **email** and **password**.
3. Click **Sign in securely**.
4. You will land on the **Overview** (Dashboard) page.

**Default admin credentials (seed):**
- Email: `admin@pharmacyos.com`
- Password: `admin123`

### 2.2 Logging Out

1. Click **Sign out** at the bottom of the left sidebar.
2. Your session is cleared and you are returned to the login page.

---

## 3. Navigation

The left sidebar organises all modules into four groups:

| Group | Modules |
|---|---|
| **Workspace** | Overview, Point of Sale, Inventory, Medicines |
| **Masters** | Suppliers, Customers, Doctors |
| **Operations** | Purchase Orders, Goods Receipt, Returns, Barcode Labels |
| **Management** | Team Members, Stores, Reports, Invoices, Notifications, Settings |

- Click any item to navigate to that module.
- The active module is highlighted in green.
- The sidebar can be collapsed to icon-only mode using the chevron button.

---

## 4. Dashboard (Overview)

The dashboard provides a real-time summary of pharmacy operations.

### Summary Cards
| Card | Description |
|---|---|
| Today's sales | Total revenue collected today |
| Orders fulfilled | Number of bills completed today |
| Total customers | Customer records on file |
| Inventory value | Total value of current stock (with low-stock item count) |

### Charts & Widgets
- **Sales & Profit Chart** — 7-day bar chart showing sales, profit, and bill counts.
- **Inventory Alerts** — Low-stock items and expiring medicines flagged for action.
- **Best Sellers** — Top-selling medicines by quantity and revenue.
- **Quick Actions** — Links to start a new sale or create a purchase order.

---

## 5. Team Members (User Management)

> **Path:** Management > Team Members

This module lets you create, view, edit, and deactivate user accounts.

### 5.1 Viewing Users

- The table shows: Name, Contact (email/phone), Role, Status (active/inactive), Last Login.
- Use the **search bar** to filter by name, email, or role.

### 5.2 Adding a User

1. Click **Add User** in the top-right corner.
2. Fill in the form fields:
   - **First Name** (required)
   - **Last Name** (required)
   - **Email** (required, must be unique)
   - **Phone**
   - **Role** (dropdown: Admin, Manager, Pharmacist, Cashier)
3. Click **Create** to save.
4. The new user appears in the table immediately.

### 5.3 Editing a User

1. Click **Edit** on any user row.
2. Modify the fields in the modal.
3. Click **Save** to apply changes.

### 5.4 Deactivating a User

1. Click **Delete** (or the more menu) on the user row.
2. Confirm the action in the dialog.
3. The user is soft-deleted (deactivated) and can no longer log in.

---

## 6. Stores (Multi-Store Management)

> **Path:** Management > Stores

Manage pharmacy branch locations.

### 6.1 Viewing Stores

- Table columns: Store Name, Code, City, Phone, Status, User Count.
- Search by name or city.

### 6.2 Adding a Store

1. Click **Add Store**.
2. Fill in:
   - **Store Code** (unique identifier, e.g., "BR01")
   - **Store Name** (e.g., "Downtown Branch")
   - **Address**, **City**, **State**
   - **Phone**, **Email**
   - **GSTIN**, **Drug License Number**
3. Click **Create**.

### 6.3 Editing a Store

1. Click **Edit** on any store row.
2. Update fields and click **Save**.

---

## 7. Medicines (Medicine Master)

> **Path:** Workspace > Medicines

Full CRUD for the medicine catalog.

### 7.1 Viewing Medicines

- Table shows: Brand Name, Generic Name, Form, Schedule, GST%, MRP, Stock Qty.
- Search by brand name, generic name, or barcode.

### 7.2 Adding a Medicine

1. Click **Add Medicine**.
2. Fill in the required fields:
   - **Brand Name** (e.g., "Crocin Advance")
   - **Generic Name** (e.g., "Paracetamol")
   - **Strength** (e.g., "650 mg")
   - **Form** (Tablet, Capsule, Syrup, Injection, Cream, Ointment, Drops, Inhaler, Gel, Powder)
   - **Schedule** (General, H, H1, X)
   - **GST %** (0, 5, 12, 18, 28)
   - **HSN Code**
   - **Barcode**
   - **Unit Type** (Strip, Bottle, Vial, Tube, Pack, Box)
3. Toggle tracking options:
   - **Batch Tracking** — Enable if the medicine is tracked by batch numbers.
   - **Expiry Tracking** — Enable if expiry dates must be recorded.
   - **Prescription Required** — Flag if a prescription is needed to dispense.
4. Click **Create**.

### 7.3 Editing a Medicine

1. Click **Edit** on the medicine row.
2. Update any field and click **Save**.

### 7.4 Deleting a Medicine

1. Click **Delete** on the medicine row.
2. Confirm the action in the dialog.

---

## 8. Suppliers

> **Path:** Masters > Suppliers

Manage distributor and supplier records.

### 8.1 Viewing Suppliers

- Table: Company Name, Contact Person, GSTIN, Phone, City, Lead Time, Balance.

### 8.2 Adding a Supplier

1. Click **Add Supplier**.
2. Fill in:
   - **Company Name**, **Contact Person**
   - **GSTIN**, **Drug License Number**
   - **Phone**, **Email**, **Address**, **City**, **State**
   - **Credit Days**, **Lead Time Days**
3. Click **Create**.

### 8.3 Editing / Deleting

- Click **Edit** to update, or **Delete** to soft-remove a supplier.

---

## 9. Customers

> **Path:** Masters > Customers

Manage patient and customer profiles.

### 9.1 Viewing Customers

- Table: Name, Customer Code, Mobile, City, Loyalty Points, Credit Enabled.

### 9.2 Adding a Customer

1. Click **Add Customer**.
2. Fill in: First Name, Last Name, Mobile, Email, Address, City, State, Gender.
3. Toggle **Allow Credit** if the customer is permitted to buy on credit.
4. Click **Create**.

### 9.3 Editing / Deleting

- Click **Edit** to modify, **Delete** to soft-remove.

---

## 10. Doctors

> **Path:** Masters > Doctors

Maintain doctor references for prescription billing.

### 10.1 Viewing Doctors

- Table: Name, Speciality, Clinic/Hospital, Registration No., Mobile, Status.

### 10.2 Adding a Doctor

1. Click **Add Doctor**.
2. Fill in: Name, Speciality, Clinic/Hospital, Registration No., Mobile, Email, Address.
3. Click **Create**.

### 10.3 Editing / Deleting

- Click **Edit** to update, **Delete** to remove.

---

## 11. Inventory

> **Path:** Workspace > Inventory

View and adjust stock levels across all batches.

### 11.1 Viewing Inventory

- Table: Medicine Name, Batch No., Store, Supplier, Quantity (red if low), Expiry Date (red if expired, amber if near expiry), MRP, Purchase Price.

### 11.2 Adjusting Stock

1. Click **Adjust** on any inventory row.
2. Enter the **adjustment quantity** (positive to add, negative to reduce).
3. Enter a **reason** (mandatory — e.g., "Damaged stock write-off").
4. Click **Confirm**.
5. The on-hand quantity updates immediately and an audit entry is created.

---

## 12. Point of Sale (Sales)

> **Path:** Workspace > Point of Sale

Create and manage sales bills.

### 12.1 Viewing Sales Bills

- Table: Bill No., Date, Customer, Payment Status, Items, Total.

### 12.2 Creating a New Sale

1. Click **New sale** (top-right of the page or from the dashboard).
2. **Select customer** from the dropdown (or leave blank for a walk-in).
3. **Search for a medicine** by name, generic name, or barcode:
   - Click on a result to add it to the cart.
   - Out-of-stock items cannot be added.
4. In the **cart table**, adjust quantities inline or remove items.
5. The summary shows **Subtotal**, **GST**, and **Total**.
6. Select a **Payment Mode**: Cash, UPI, Card, or Credit.
7. Add optional **Notes**.
8. Click **Complete sale**.
9. A success toast confirms the sale. Stock is automatically decremented using FIFO (first-in, first-out) batch allocation.

---

## 13. Purchase Orders

> **Path:** Operations > Purchase Orders

Create and manage supplier purchase orders.

### 13.1 Viewing POs

- Table: PO Number, Date, Supplier, Status (Draft/Submitted/Received), Items, Total.

### 13.2 Creating a Purchase Order

1. Click **Create PO**.
2. Select a **Supplier** from the dropdown.
3. Add line items:
   - Select a **Medicine**.
   - Enter **Quantity** and **Unit Price**.
   - GST% is auto-populated from the medicine record.
4. Click **+ Add item** to add more lines.
5. Add optional **Notes**.
6. Click **Create PO**.
7. The PO is created with status **Draft**.

### 13.3 Submitting a PO

- Click **Submit** on a Draft PO row to change its status to **Submitted**.

---

## 14. Goods Receipt

> **Path:** Operations > Goods Receipt

Record stock received from suppliers.

### 14.1 Viewing GRNs

- Table: GRN Number, Date, Supplier, Invoice No., Status, Total Qty.

### 14.2 Receiving Stock

1. Click **Receive stock**.
2. Select a **Supplier** and enter the **Invoice Number**.
3. Add batch line items:
   - Select a **Medicine**.
   - Enter **Batch Number**, **Expiry Date**, **MRP**, **Cost Price**, **Quantity**.
4. Click **+ Add batch** for additional batches.
5. Add optional **Notes**.
6. Click **Complete receipt**.
7. Inventory is updated with the new batches.

---

## 15. Returns

> **Path:** Operations > Returns

Process customer returns and supplier returns.

### 15.1 Customer Return

1. Click **Customer return**.
2. Select the original **Sales Bill** from the dropdown.
3. Add return line items (medicine, quantity, unit price).
4. Enter a **Reason** (mandatory).
5. Click **Submit**.
6. Stock is restored and a refund/credit note is generated.

### 15.2 Supplier Return

1. Click **Supplier return**.
2. Select a **Supplier**.
3. Add return line items.
4. Enter a **Reason**.
5. Click **Submit**.
6. Stock is removed and a supplier credit note is generated.

---

## 16. Barcode Labels

> **Path:** Operations > Barcode Labels

Generate and manage barcode labels for medicines.

### 16.1 Viewing Labels

- Table: Barcode Data, Medicine, Label Type, Print Count, Format.

### 16.2 Generating a Label

1. Click **Generate label**.
2. Select a **Medicine**.
3. Choose a **Label Type**: Medicine, Batch, or Shelf.
4. Enter or scan the **Barcode Data**.
5. Select a **Format**: CODE128, EAN-13, or QR.
6. Click **Create**.

### 16.3 Deleting a Label

- Click **Delete** and confirm.

---

## 17. Invoices (Purchase Invoices)

> **Path:** Management > Invoices

Track supplier invoices and payment status.

### 17.1 Viewing Invoices

- Table: Invoice No., Supplier, Status (Paid/Unpaid/Partial), Due Date, Total, Balance.

### 17.2 Recording an Invoice

1. Click **Record invoice**.
2. Fill in: Supplier, Invoice Number, Invoice Date, Due Date, Total Amount, Paid Amount.
3. Click **Create**.

---

## 18. Reports

> **Path:** Management > Reports

View analytics, audit logs, and purchase suggestions. This is a read-only module.

### 18.1 Daily Summaries

- Cards showing: Date, Store, Total Sales, Profit, Bill Count.

### 18.2 Audit Log

- Table: Action, Entity Type, User, Timestamp.
- Every critical action (price change, bill edit, stock adjustment, user change) is logged.

### 18.3 Purchase Suggestions

- Cards: Medicine Name, Current Stock, Suggested Reorder Qty, Priority (Critical/High/Low).
- Suggestions are auto-generated from sales history and stock levels.

---

## 19. Notifications

> **Path:** Management > Notifications

View and manage system alerts (low stock, expiry warnings, etc.).

### 19.1 Viewing Notifications

- Table: Title, Type, Message, Read/Unread Status, Date.
- Unread items are visually distinct.

### 19.2 Marking as Read

- Click **Mark read** on any unread row.
- Clicking the row also marks it as read.

---

## 20. Settings

> **Path:** Management > Settings

Review system configuration (displayed as read-only cards).

- Setting Name, Owner, Value, Active/Status badge.
- Configuration includes: Business profile, Tax settings, Print settings, Alert thresholds.

---

## 21. Quick Reference: Admin Permissions

| Module | View | Create | Edit | Delete | Notes |
|---|---|---|---|---|---|
| Dashboard | Yes | — | — | — | Full access to all metrics |
| Team Members | Yes | Yes | Yes | Yes (soft delete) | Can manage all roles |
| Stores | Yes | Yes | Yes | No | Can create/edit branches |
| Medicines | Yes | Yes | Yes | Yes | Full catalog control |
| Suppliers | Yes | Yes | Yes | Yes | Full supplier management |
| Customers | Yes | Yes | Yes | Yes | Full customer management |
| Doctors | Yes | Yes | Yes | Yes | Full doctor management |
| Inventory | Yes | Yes (adjust) | — | — | Stock adjustment with audit |
| Point of Sale | Yes | Yes | — | — | Can create sales bills |
| Purchase Orders | Yes | Yes | Yes | Yes | Full PO lifecycle |
| Goods Receipt | Yes | Yes | Yes | — | Receive and verify stock |
| Returns | Yes | Yes | Yes | — | Customer and supplier returns |
| Barcode Labels | Yes | Yes | — | Yes | Generate and delete labels |
| Invoices | Yes | Yes | Yes | — | Track supplier payments |
| Reports | Yes | — | — | — | Read-only analytics |
| Notifications | Yes | — | — | — | Mark as read |
| Settings | Yes | — | — | — | Read-only view |

---

## 22. Frequently Asked Questions

**Q: How do I reset a user's password?**
A: Edit the user record and update the password field (if the UI supports it), or create a new user with a fresh password.

**Q: Can I permanently delete data?**
A: All deletes in MediFlow are soft deletes. Data is deactivated but preserved for audit purposes.

**Q: How do I add a new pharmacy branch?**
A: Go to Management > Stores > Add Store, fill in the store details, and save.

**Q: Who can see the audit log?**
A: Only Admin and Owner roles have access to the Reports > Audit Log tab.
