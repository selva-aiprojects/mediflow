# Cashier User Manual — MediFlow PharmacyOS

---

## 1. Overview

The **Cashier** role is designed for front-desk billing. Cashiers create sales bills, process payments, and handle customer interactions. This is the most focused role with access limited to billing and basic customer management.

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

| Group | Modules Available to Cashier |
|---|---|
| **Workspace** | Overview, Point of Sale |
| **Masters** | Customers |
| **Management** | Notifications |

> **Note:** The Cashier role has the most restricted access. Medicines (create/edit), Inventory, Suppliers, Doctors, Purchase Orders, Goods Receipt, Returns, Barcode Labels, Reports, Invoices, Team Members, Stores, and Settings are **not accessible**.

---

## 4. Dashboard (Overview)

### Summary Cards
- Today's sales, orders fulfilled, total customers, inventory value.

These cards give a quick overview of the day's performance.

---

## 5. Point of Sale (Sales) — Primary Workflow

> **Path:** Workspace > Point of Sale

This is the main screen for a cashier. The workflow is optimised for speed.

### 5.1 Viewing Sales Bills

- Table: Bill No., Date, Customer, Payment Status, Items, Total.
- All previously created bills are listed here.

### 5.2 Creating a New Sale

1. Click **New sale** (or use the **New sale** button on the dashboard).
2. **Customer selection:**
   - Use the dropdown to select an existing customer.
   - Leave blank for a walk-in customer (no account needed).
3. **Adding medicines:**
   - Type in the **search box** — you can search by:
     - Brand name (e.g., "Crocin")
     - Generic name (e.g., "Paracetamol")
     - Barcode (scan or type)
   - Click on a medicine from the results to add it to the cart.
   - **Out-of-stock items** are automatically blocked and cannot be added.
4. **Managing the cart:**
   - The cart shows: Medicine Name, Batch No., Quantity, Unit Price, GST%, Total.
   - **Change quantity** by clicking the quantity field and typing a new number.
   - **Remove an item** by clicking the trash icon on that row.
5. **Review totals:**
   - **Subtotal** (before tax)
   - **GST** (calculated per item)
   - **Grand Total**
6. **Payment:**
   - Select a **Payment Mode**:
     - **Cash** — Customer pays in cash.
     - **UPI** — Customer pays via UPI (Google Pay, PhonePe, etc.).
     - **Card** — Customer pays via debit/credit card.
     - **Credit** — Customer pays later (only available for credit-approved customers).
   - Add optional **Notes** (e.g., "Paid via 500 note, change 37").
7. Click **Complete sale**.
8. A success toast confirms the sale is complete.
9. **Stock is automatically decremented** using FIFO (first-in, first-out) batch allocation — the batch closest to expiry is dispensed first.

### 5.3 End-of-Day Tips

- Check the **Notifications** module for any low-stock or expiry alerts.
- Use the dashboard to review the day's total sales and bills completed.
- If a customer requests a return, inform your manager — returns require manager/pharmacist privileges.

---

## 6. Customers

> **Path:** Masters > Customers

Cashiers can create and manage basic customer profiles for billing purposes.

### 6.1 Viewing Customers

- Table: Name, Customer Code, Mobile, City, Loyalty Points, Credit Enabled.
- Use the search bar to find a customer by name or mobile.

### 6.2 Adding a Customer

1. Click **Add Customer**.
2. Fill in:
   - **First Name** (required)
   - **Last Name**
   - **Mobile** (required — used as the primary identifier)
   - **Email**, **Address**, **City**, **State**
   - **Gender** (dropdown)
3. Toggle **Allow Credit** only if the customer has been approved for credit sales by a manager.
4. Click **Create**.

### 6.3 Editing a Customer

- Click **Edit** on the customer row to update details (e.g., phone number, address).

### 6.4 When to Create a New Customer

- A new patient walks in without an existing profile.
- A customer's mobile number has changed.
- You need to enable credit sales for an approved customer.

---

## 7. Notifications

> **Path:** Management > Notifications

- View system alerts such as low-stock warnings or expiry notifications.
- Click **Mark read** or click the row to acknowledge.

---

## 8. Quick Reference: Cashier Permissions

| Module | View | Create | Edit | Delete | Notes |
|---|---|---|---|---|---|
| Dashboard | Yes | — | — | — | Summary metrics only |
| Point of Sale | Yes | Yes | — | — | Create sales bills |
| Customers | Yes | Yes | Yes | No | Basic customer management |
| Notifications | Yes | — | — | — | Mark as read |
| Medicines | No | No | No | No | Restricted (read via POS search only) |
| Inventory | No | No | No | No | Restricted |
| Suppliers | No | No | No | No | Restricted |
| Doctors | No | No | No | No | Restricted |
| Purchase Orders | No | No | No | No | Restricted |
| Goods Receipt | No | No | No | No | Restricted |
| Returns | No | No | No | No | Restricted — ask manager |
| Barcode Labels | No | No | No | No | Restricted |
| Invoices | No | No | No | No | Restricted |
| Reports | No | No | No | No | Restricted |
| Team Members | No | No | No | No | Restricted |
| Stores | No | No | No | No | Restricted |
| Settings | No | No | No | No | Restricted |

---

## 9. Common Workflows — Step by Step

### Workflow A: Quick Cash Sale

1. Log in → Dashboard loads.
2. Click **New sale**.
3. Type "Crocin" in search → click the result → it enters the cart.
4. Change quantity to 2.
5. Payment Mode: Cash.
6. Click **Complete sale**.
7. Done. Bill created, stock updated.

### Workflow B: Walk-In Customer with UPI

1. Click **New sale**.
2. Leave customer blank (walk-in).
3. Scan barcode or search medicine → add to cart.
4. Repeat for additional items.
5. Payment Mode: UPI.
6. Click **Complete sale**.

### Workflow C: Registered Customer on Credit

1. Click **New sale**.
2. Search and select the customer from the dropdown.
3. Add medicines to the cart.
4. Payment Mode: Credit.
5. Click **Complete sale**.
6. The customer's credit balance is updated.

### Workflow D: New Customer Registration

1. Go to **Masters > Customers**.
2. Click **Add Customer**.
3. Fill in name and mobile (minimum required).
4. Toggle **Allow Credit** if approved.
5. Click **Create**.
6. The customer now appears in the POS customer dropdown.

---

## 10. Frequently Asked Questions

**Q: I added the wrong medicine to the cart. How do I fix it?**
A: Click the trash icon on that cart row to remove it, then add the correct medicine.

**Q: A customer wants to return a product. Can I process it?**
A: No, returns require manager or pharmacist privileges. Please escalate to your manager.

**Q: Can I see stock quantities while billing?**
A: Yes, the medicine search results show stock levels, and the cart displays batch availability.

**Q: What if a barcode scan doesn't find anything?**
A: The barcode may not be registered in the system. Try searching by brand name instead, or ask a manager to create a barcode label.

**Q: Can I edit a completed sale?**
A: No, completed sales are final. Use Returns for post-sale adjustments (requires manager approval).

**Q: How do I handle a credit sale?**
A: Select the customer, choose Credit as the payment mode, and complete the sale. Only customers with "Allow Credit" enabled can use this option.
