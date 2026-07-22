# Owner User Manual — MediFlow PharmacyOS

---

## 1. Overview

The **Owner** role has full, unrestricted access to every module in MediFlow PharmacyOS. As the business owner, you can view all dashboards, manage all operations, configure the system, and oversee all staff activity. This manual covers every screen and action available to you.

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

The Owner has access to **all modules** across all sidebar groups:

| Group | All Modules |
|---|---|
| **Workspace** | Overview, Point of Sale, Inventory, Medicines |
| **Masters** | Suppliers, Customers, Doctors |
| **Operations** | Purchase Orders, Goods Receipt, Returns, Barcode Labels |
| **Management** | Team Members, Stores, Reports, Invoices, Notifications, Settings |

No module is restricted for the Owner role.

---

## 4. Dashboard (Overview)

The dashboard is your command centre for business performance.

### Summary Cards
| Card | Description |
|---|---|
| Today's sales | Total revenue collected today |
| Orders fulfilled | Number of bills completed today |
| Total customers | Customer records on file |
| Inventory value | Total value of current stock (with low-stock count) |

### Charts & Widgets
- **Sales & Profit Chart** — 7-day bar chart of sales, profit, and bill counts.
- **Inventory Alerts** — Low-stock items and medicines approaching expiry.
- **Best Sellers** — Top medicines by quantity and revenue.
- **Quick Actions** — Start a new sale or create a purchase order.

---

## 5. Business Intelligence & Reports

> **Path:** Management > Reports

### 5.1 Daily Summaries

Cards showing daily performance metrics:
- Date, Store, Total Sales, Profit, Bill Count.
- Compare day-over-day trends.

### 5.2 Audit Log

A complete record of every critical action in the system:
- **Columns:** Action, Entity Type, User, Timestamp.
- **Tracked events:** Price changes, bill edits/deletions, stock adjustments, user changes, discount applications.
- Each entry includes the timestamp, user who performed the action, entity affected, and before/after values.

### 5.3 Purchase Suggestions

AI-generated reorder recommendations:
- **Medicine Name** — Which item to reorder.
- **Current Stock** — How many units are on hand.
- **Suggested Reorder Qty** — Recommended order quantity based on sales history, lead time, and safety stock.
- **Priority** — Critical (stock out imminent), High (low stock), or Low (monitor).

---

## 6. Team Members (User Management)

> **Path:** Management > Team Members

Full control over user accounts.

### 6.1 Viewing Users

- Table: Name, Contact, Role, Status, Last Login.
- Search by name, email, or role.

### 6.2 Adding a User

1. Click **Add User**.
2. Fill in: First Name, Last Name, Email, Phone, Role.
3. Roles available: **Admin**, **Manager**, **Pharmacist**, **Cashier**.
4. Click **Create**.

### 6.3 Editing / Deactivating

- Click **Edit** to update any user's details or role.
- Click **Delete** to soft-deactivate a user account.

---

## 7. Stores (Multi-Store Management)

> **Path:** Management > Stores

Manage all pharmacy branches.

### 7.1 Viewing Stores

- Table: Store Name, Code, City, Phone, Status, User Count.

### 7.2 Adding a Store

1. Click **Add Store**.
2. Fill in: Store Code, Store Name, Address, City, State, Phone, Email, GSTIN, Drug License.
3. Click **Create**.

### 7.3 Editing a Store

- Click **Edit** to update store details.

---

## 8. Medicines

> **Path:** Workspace > Medicines

Full CRUD for the medicine catalog. See the Admin manual for complete field details.

- Add, edit, and delete medicine records.
- Toggle batch tracking, expiry tracking, and prescription-required flags.

---

## 9. Inventory

> **Path:** Workspace > Inventory

### 9.1 Viewing Stock Levels

- Table: Medicine Name, Batch No., Store, Supplier, Quantity, Expiry Date, MRP, Purchase Price.
- Red quantities = low stock. Red/amber expiry = attention needed.

### 9.2 Stock Adjustment

- Click **Adjust** to add or reduce stock with a mandatory reason.
- All adjustments are logged in the audit trail.

---

## 10. Suppliers

> **Path:** Masters > Suppliers

Full supplier management — create, edit, and delete supplier records.

---

## 11. Customers

> **Path:** Masters > Customers

Full customer management — create, edit, and delete customer profiles.

---

## 12. Doctors

> **Path:** Masters > Doctors

Full doctor management — create, edit, and delete doctor records.

---

## 13. Point of Sale

> **Path:** Workspace > Point of Sale

Create sales bills, process payments, and manage the billing counter. See the Cashier manual for the complete POS workflow.

---

## 14. Purchase Orders

> **Path:** Operations > Purchase Orders

Create, submit, and manage supplier purchase orders. See the Manager manual for the complete PO workflow.

---

## 15. Goods Receipt

> **Path:** Operations > Goods Receipt

Record stock received from suppliers with batch details. See the Manager manual for the complete GRN workflow.

---

## 16. Returns

> **Path:** Operations > Returns

Process both customer returns and supplier returns. See the Manager manual for the complete returns workflow.

---

## 17. Barcode Labels

> **Path:** Operations > Barcode Labels

Generate, view, and delete barcode labels for medicines, batches, and shelves. See the Manager manual for details.

---

## 18. Invoices

> **Path:** Management > Invoices

Track supplier invoices, payment status, and due dates. See the Manager manual for details.

---

## 19. Notifications

> **Path:** Management > Notifications

View and acknowledge system alerts (low stock, expiry warnings, etc.).

---

## 20. Settings

> **Path:** Management > Settings

Review system configuration:
- **Business profile** — Company name, address, contact details.
- **Tax settings** — GST configuration.
- **Print settings** — Invoice print format.
- **Alert thresholds** — Low stock and expiry warning levels.

---

## 21. Quick Reference: Owner Permissions

| Module | View | Create | Edit | Delete | Notes |
|---|---|---|---|---|---|
| Dashboard | Yes | — | — | — | Full metrics |
| Team Members | Yes | Yes | Yes | Yes | Full user management |
| Stores | Yes | Yes | Yes | No | Multi-store management |
| Medicines | Yes | Yes | Yes | Yes | Full catalog control |
| Inventory | Yes | Yes (adjust) | — | — | Stock adjustment + audit |
| Suppliers | Yes | Yes | Yes | Yes | Full supplier CRUD |
| Customers | Yes | Yes | Yes | Yes | Full customer CRUD |
| Doctors | Yes | Yes | Yes | Yes | Full doctor CRUD |
| Point of Sale | Yes | Yes | — | — | Create sales bills |
| Purchase Orders | Yes | Yes | Yes | Yes | Full PO lifecycle |
| Goods Receipt | Yes | Yes | Yes | — | Receive stock |
| Returns | Yes | Yes | Yes | — | Customer + supplier returns |
| Barcode Labels | Yes | Yes | — | Yes | Generate + delete |
| Invoices | Yes | Yes | Yes | — | Track payments |
| Reports | Yes | — | — | — | Full analytics + audit log |
| Notifications | Yes | — | — | — | Mark as read |
| Settings | Yes | — | — | — | Read-only configuration |

---

## 22. Key Business Workflows

### Daily Routine

1. **Morning:** Log in and review the Dashboard — check today's sales summary, low-stock alerts, and expiring items.
2. **During the day:** Monitor sales activity, review purchase suggestions, and handle any escalation from staff.
3. **End of day:** Review Reports > Daily Summaries for the day's performance, check the Audit Log for any unusual activity.

### Weekly Routine

1. Review Purchase Suggestions and create purchase orders for critical/high-priority items.
2. Check inventory for expired batches and initiate supplier returns.
3. Review customer credit balances and follow up on outstanding payments.
4. Audit the team's sales performance through Reports.

### Monthly Routine

1. Review Reports > Daily Summaries for the full month.
2. Analyse profit trends and fast/slow-moving stock.
3. Review and update system settings if needed.
4. Assess team performance and update user roles if necessary.

---

## 23. Frequently Asked Questions

**Q: Can I access everything in the system?**
A: Yes, the Owner role has unrestricted access to all modules and actions.

**Q: How do I set up a new branch?**
A: Go to Management > Stores > Add Store and fill in the branch details.

**Q: Can I view who made changes to the system?**
A: Yes, go to Management > Reports > Audit Log to see all tracked actions with timestamps and user details.

**Q: How do I grant credit sales to a customer?**
A: Edit the customer record and toggle "Allow Credit" on. Only Admin, Manager, and Owner roles can do this.

**Q: Can I run the system from a mobile device?**
A: The interface is responsive and works on tablets and larger mobile screens. For optimal experience, use a desktop or tablet.

**Q: How are purchase suggestions calculated?**
A: Suggestions are based on current stock level, average daily sales, supplier lead time, and safety stock buffer. The system automatically generates these recommendations.
