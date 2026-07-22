# MediFlow PharmacyOS — Role-Based Access Control Quick Reference

---

## Role Summary

| Role | Primary Function | Access Level |
|---|---|---|
| **Owner** | Business oversight and strategy | Full (all modules) |
| **Admin** | System administration | Full (all modules) |
| **Manager** | Store operations management | Operational modules |
| **Pharmacist** | Dispensing and prescriptions | Billing + limited masters |
| **Cashier** | Front-desk billing | Billing only |

---

## RBAC Matrix

| Module | Owner | Admin | Manager | Pharmacist | Cashier |
|---|---|---|---|---|---|
| **Dashboard** | Full | Full | Full | Full | Summary only |
| **Point of Sale** | Create | Create | Create | Create | Create |
| **Inventory** | View + Adjust | View + Adjust | View + Adjust | View + Adjust | No access |
| **Medicines** | Full CRUD | Full CRUD | Full CRUD | Full CRUD | No access |
| **Suppliers** | Full CRUD | Full CRUD | Full CRUD | View only | No access |
| **Customers** | Full CRUD | Full CRUD | Full CRUD | Full CRUD | Create + Edit |
| **Doctors** | Full CRUD | Full CRUD | Full CRUD | Full CRUD | No access |
| **Purchase Orders** | Full CRUD | Full CRUD | Full CRUD | No access | No access |
| **Goods Receipt** | Full | Full | Full | No access | No access |
| **Returns** | Full | Full | Full | Customer only | No access |
| **Barcode Labels** | Full | Full | Full | No access | No access |
| **Invoices** | Full | Full | Full | Create + View | No access |
| **Reports** | Full | Full | Full | No access | No access |
| **Notifications** | View | View | View | View | View |
| **Team Members** | Full CRUD | Full CRUD | No access | No access | No access |
| **Stores** | Full | Full | No access | No access | No access |
| **Settings** | View | View | No access | No access | No access |

---

## Role Descriptions

### Owner
- **Who:** Business owner / proprietor
- **Focus:** Profitability, business growth, multi-store oversight
- **Key screens:** Dashboard, Reports (Audit Log, Purchase Suggestions, Daily Summaries), Team Members, Stores
- **Unique capabilities:** View audit trail, manage all user roles, configure stores

### Admin
- **Who:** IT administrator / operations head
- **Focus:** System configuration, user management, compliance
- **Key screens:** Team Members, Stores, Settings, Reports
- **Unique capabilities:** Create/edit/deactivate all user accounts, manage store branches

### Manager
- **Who:** Store manager / operations manager
- **Focus:** Day-to-day operations, inventory, purchasing, returns
- **Key screens:** Inventory, Purchase Orders, Goods Receipt, Returns, Medicines
- **Unique capabilities:** Create purchase orders, receive stock, process both customer and supplier returns

### Pharmacist
- **Who:** Licensed pharmacist
- **Focus:** Dispensing, prescriptions, medicine knowledge
- **Key screens:** Point of Sale, Medicines, Inventory, Customers, Doctors
- **Unique capabilities:** Create/edit medicines, process customer returns, record purchase invoices

### Cashier
- **Who:** Front-desk billing staff
- **Focus:** Fast billing, customer service, payment processing
- **Key screens:** Point of Sale, Customers (basic)
- **Unique capabilities:** Create sales bills, register basic customer profiles

---

## Login Credentials (Seed Data)

| Role | Email | Password |
|---|---|---|
| Admin | admin@pharmacyos.com | admin123 |
| Cashier | cashier@pharmacyos.com | cashier123 |

> Other roles (Manager, Pharmacist, Owner) can be created by the Admin through Team Members.

---

## Default Navigation by Role

### Owner / Admin — Full Sidebar
```
Workspace:     Overview, Point of Sale, Inventory, Medicines
Masters:       Suppliers, Customers, Doctors
Operations:    Purchase Orders, Goods Receipt, Returns, Barcode Labels
Management:    Team Members, Stores, Reports, Invoices, Notifications, Settings
```

### Manager — Operations Focus
```
Workspace:     Overview, Point of Sale, Inventory, Medicines
Masters:       Suppliers, Customers, Doctors
Operations:    Purchase Orders, Goods Receipt, Returns, Barcode Labels
Management:    Reports, Invoices, Notifications
```

### Pharmacist — Dispensing Focus
```
Workspace:     Overview, Point of Sale, Inventory, Medicines
Masters:       Suppliers (view), Customers, Doctors
Operations:    Returns (customer)
Management:    Invoices, Notifications
```

### Cashier — Billing Focus
```
Workspace:     Overview, Point of Sale
Masters:       Customers
Management:    Notifications
```

---

## Common Tasks by Role

| Task | Owner | Admin | Manager | Pharmacist | Cashier |
|---|---|---|---|---|---|
| Create a sale | Yes | Yes | Yes | Yes | Yes |
| Adjust stock | Yes | Yes | Yes | Yes | No |
| Create a purchase order | Yes | Yes | Yes | No | No |
| Receive supplier stock | Yes | Yes | Yes | No | No |
| Process customer return | Yes | Yes | Yes | Yes | No |
| Process supplier return | Yes | Yes | Yes | No | No |
| Add a medicine | Yes | Yes | Yes | Yes | No |
| Create a user | Yes | Yes | No | No | No |
| View audit log | Yes | Yes | Yes | No | No |
| View reports | Yes | Yes | Yes | No | No |
| Configure settings | View | View | No | No | No |
| Manage stores | Yes | Yes | No | No | No |
