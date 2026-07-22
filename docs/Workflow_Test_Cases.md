# MediFlow workflow validation test cases

## Scope and execution

Run the frontend at `http://127.0.0.1:5173`. Use a valid seeded account for authenticated cases. Record actual results, tester, build ID, and evidence (screenshot or invoice ID) in the execution log.

**Current implementation note:** Dashboard, sign-in, user management, navigation, and UI states are implemented. The remaining navigation destinations currently present an intentional placeholder state; their cases below define acceptance criteria for the full workflow when each module is implemented.

| ID | Module / workflow | Preconditions | Steps | Expected result |
|---|---|---|---|---|
| AUTH-01 | Sign in successfully | Active user exists | Open `/login`; submit valid email and password | User is sent to Overview; token and user data are stored; dashboard is visible. |
| AUTH-02 | Reject invalid sign in | None | Submit an invalid password | Clear inline error is displayed; user remains on sign-in page; no token is stored. |
| AUTH-03 | Required field validation | None | Submit with either credential blank | Sign-in is prevented and field guidance is displayed. |
| AUTH-04 | Password visibility | None | Toggle the eye icon twice | Password switches between masked/plain text without losing entered value. |
| AUTH-05 | Sign out | Authenticated user | Select Sign out in sidebar | Session values are cleared and user returns to `/login`. |
| NAV-01 | Responsive workspace navigation | Authenticated user | Resize below desktop width, then back above it | Main content remains readable; desktop sidebar appears at desktop widths without overlap. |
| NAV-02 | Sidebar compact mode | Authenticated user | Collapse and expand sidebar | Icons remain usable in compact mode; content margin updates; labels return on expansion. |
| NAV-03 | Route highlighting | Authenticated user | Visit each sidebar destination | Exactly the active destination is visually highlighted. |
| DASH-01 | Dashboard load | Authenticated user | Open `/` | Greeting, date, summary cards, revenue chart, alerts, best sellers and quick actions render without layout overflow. |
| DASH-02 | Dashboard API fallback | API unavailable | Open `/` with dashboard API unavailable | Dashboard renders the supplied fallback figures; no blocking error is shown. |
| DASH-03 | Dashboard API data | API returns valid statistics | Open `/` | Summary values reflect API data and retain readable currency formatting. |
| DASH-04 | Dashboard date selector | Authenticated user | Open/select reporting period | Selected period is visibly applied and chart/cards update after data wiring is available. |
| DASH-05 | Inventory alert hand-off | Alert exists | Select Review on each alert | User lands in filtered inventory/expiry context for the selected medicine. |
| SALES-01 | Start a new sale | Cashier permissions; stock available | Select New sale; search medicine; add quantity | Product, applicable batch, price, tax and line total are shown; stock availability is validated. |
| SALES-02 | Barcode sale | Scanner/product barcode available | Scan barcode at POS | Matching medicine is added once; unknown barcode gives clear recovery guidance. |
| SALES-03 | FIFO/expiry batch allocation | Medicine has multiple batches | Add a batch-enabled medicine | Nearest valid expiry/FIFO batch is chosen; user can review permitted alternatives. |
| SALES-04 | Payment and invoice | Sale cart populated | Pay by Cash, UPI, card and credit in separate runs | Correct tender flow runs, invoice is issued/printable, stock reduces once, and audit record is created. |
| SALES-05 | Prescription billing | Pharmacist permissions; image available | Attach prescription, patient and doctor; complete sale | Prescription is stored against invoice; pharmacist can verify items before finalisation. |
| MED-01 | Create medicine master | Manager/admin permissions | Add brand, generic, strength, form, schedule, GST, pricing and barcode | Required fields validate; medicine is searchable and barcode is unique. |
| MED-02 | Medicine compliance flags | Medicine exists | Enable batch/expiry tracking and schedule class | Required batch/expiry/schedule behaviour is enforced in purchase and sale workflows. |
| PO-01 | Create purchase order | Supplier and medicine exist | Create PO; add items; submit | Totals/tax are correct; status becomes Submitted; approval/audit entry is available. |
| PO-02 | Purchase suggestion | Sales history and stock levels exist | Open suggestions; accept a recommendation | Suggested quantity accounts for demand, lead time and safety stock; accepted items populate a draft PO. |
| GRN-01 | Receive supplier invoice | Approved PO exists | Receive partial/full shipment; enter batch, expiry, MRP, cost and GST | Quantity rules are validated; receiving status is correct; inventory updates only on confirmation. |
| INV-01 | Inventory visibility | Stock batches exist | Search/filter by medicine, batch, expiry and rack | Available and reserved quantities, expiry, rack, cost and MRP are accurate. |
| INV-02 | Stock adjustment | Manager permission | Adjust stock with a reason | Confirmation is required; on-hand quantity changes once; before/after audit record is visible. |
| INV-03 | Low stock / expiry alerts | Thresholds and batches exist | Trigger low stock and 30/60/90/expired scenarios | Correct urgency category appears; expired stock cannot be sold. |
| RET-01 | Customer return | Original invoice exists | Search original sale; select eligible item; refund | Sale eligibility and quantity are validated; refund/credit note is generated; approved stock is restored. |
| RET-02 | Supplier return | Expired/damaged batch exists | Create supplier return; submit | Returned quantity is reserved/removed correctly; supplier credit note and audit entry are generated. |
| BAR-01 | Generate labels | Medicine records exist | Select medicines/batches; create labels | Preview displays correct name, barcode, batch/price where configured, and printable output. |
| BAR-02 | Scan label | Generated label exists | Scan label during sale | Scanner resolves the same medicine/batch metadata as the printed label. |
| USERS-01 | List and search users | Authenticated admin; users exist | Open Team members; search name, email and role | Matching users remain; nonmatches show an empty state; table stays usable on narrow screens. |
| USERS-02 | Add user | Authenticated admin | Select Add User; complete mandatory data; submit | Modal closes after valid submission; new user gets correct role/status; invalid data is explained inline. |
| USERS-03 | Role-based restrictions | Test accounts for cashier, pharmacist, manager, owner, admin | Sign in as each role and visit protected functions | Access matches RBAC matrix; prohibited actions are hidden or denied server-side. |
| STORES-01 | Store setup and transfer | Two stores and stock exist | Create/update store; transfer stock A to B; receive it | Store details validate; transfer has dispatch/receipt states; source and destination quantities reconcile. |
| REPORT-01 | Sales, purchase and GST reports | Transactions across dates exist | Filter report period/store; export Sales, Purchase, HSN, GSTR-1 and GSTR-3B data | Totals match underlying transactions; exports are correctly scoped and downloadable. |
| REPORT-02 | Financial reports | Transactions and inventory exist | Run profit, margin, fast/slow/dead stock and trend reports | Calculations reconcile to sales/purchase/inventory records and filters are retained. |
| INV-04 | Invoice retrieval | Completed sale exists | Find invoice; view, print and download | Invoice identity, patient/customer, lines, GST and payment details match the sale and are immutable. |
| NOTIF-01 | Notification lifecycle | Alerts exist | Open notifications; mark read; follow alert link | Unread count updates; destination context is correct; notification state persists. |
| SET-01 | Settings persistence | Admin permissions | Change store/tax/print/alert configuration and save | Validation prevents invalid configuration; refreshed app shows saved configuration; audit event exists. |
| AUD-01 | Audit integrity | Privileged action exists | Change price, bill, stock or user and inspect audit log | Entry has timestamp, actor, action, entity and before/after values; ordinary users cannot alter log. |

## Cross-cutting acceptance checks

| ID | Check | Steps | Expected result |
|---|---|---|---|
| XC-01 | Accessibility | Navigate all controls with keyboard; inspect focus and labels | Every action is reachable, focus is visible, inputs have labels, and status/error information is announced. |
| XC-02 | Responsive UI | Test 320px, 768px, 1024px and 1440px widths | No horizontal page overflow; tables offer controlled scrolling; touch targets remain usable. |
| XC-03 | Error recovery | Simulate API failure, timeout and duplicate submission | User sees a nontechnical message, can retry safely, and no duplicate transaction is created. |
| XC-04 | Data security | Attempt direct route/API access without token and with low-privilege account | Authentication and authorization are enforced on server; sensitive values never appear in client errors. |
| XC-05 | Performance | Load dashboard, search inventory, and complete sale on representative data | Initial and interaction times meet agreed performance targets; loading feedback is visible. |
