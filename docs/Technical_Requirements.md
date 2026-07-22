# Technical Requirements Document (TRD)

## PharmacyOS — Cloud-Native Pharmacy Operating System

---

## 1. Technology Stack

### 1.1 Frontend
| Technology | Purpose |
|---|---|
| **Next.js 14+** (App Router) | Web application framework with SSR/SSG |
| **TypeScript** | Type-safe development |
| **Tailwind CSS** | Utility-first styling |
| **Shadcn/UI** | Component library built on Radix UI |
| **Zustand** | Lightweight state management |
| **TanStack Query** | Server state & caching |
| **React Hook Form + Zod** | Form validation |
| **PWA** | Offline-first capability |
| **Workbox** | Service worker & caching strategies |

### 1.2 Backend
| Technology | Purpose |
|---|---|
| **Node.js 20+** | Runtime environment |
| **NestJS** | Progressive Node.js framework (modular, decorators, DI) |
| **TypeScript** | Type-safe development |
| **PostgreSQL 16** | Primary database |
| **Redis 7** | Caching, session store, pub/sub, rate limiting |
| **Prisma ORM** | Database access & migrations |
| **BullMQ** | Background job processing (expiry alerts, reports) |
| **MinIO / S3** | Object storage (prescriptions, barcodes) |
| **Docker** | Containerization |
| **Kubernetes** | Orchestration (production) |

### 1.3 AI/ML
| Technology | Purpose |
|---|---|
| **OpenAI API** | LLM for OCR, voice, forecasting |
| **LangChain** | LLM orchestration framework |
| **TensorFlow.js** | Client-side inference (optional) |
| **Whisper API** | Voice-to-text for voice billing |

### 1.4 DevOps & Infrastructure
| Technology | Purpose |
|---|---|
| **GitHub Actions** | CI/CD pipeline |
| **Docker Compose** | Local development |
| **Azure / AWS** | Cloud hosting |
| **Terraform** | Infrastructure as Code |
| **Prometheus + Grafana** | Monitoring & alerting |
| **Sentry** | Error tracking |

---

## 2. Architecture Principles

### 2.1 Multi-Tenant SaaS Architecture
- **Schema-per-tenant** isolation model in PostgreSQL
- Each tenant gets its own schema with identical table structure
- Shared `public` schema for tenant registry, billing, and global config
- Connection pooling with tenant-aware routing via Prisma middleware

### 2.2 Offline-First Strategy
- **IndexedDB** for local data storage via Dexie.js
- **Service Worker** with Cache-First strategy for static assets
- **Background Sync API** for queuing mutations when offline
- **Conflict Resolution**: Last-write-wins with server-side timestamps
- **Sync Engine**: Incremental sync with change tracking (updated_at, deleted_at)

### 2.3 Microservices Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                     API Gateway (NestJS)                      │
│  Rate Limiting │ Auth │ Tenant Resolution │ Request Logging   │
└──────┬──────┬──────┬──────┬──────┬──────┬──────┬────────────┘
       │      │      │      │      │      │      │
┌──────▼┐ ┌──▼───┐ ┌▼────┐ ┌▼────┐ ┌▼────┐ ┌▼────┐ ┌▼──────┐
│Inventory│Billing│Purchase│Customer│Supplier│  AI  │  Auth  │
│ Service │Service│ Service│ Service│ Service│Service│ Service│
└────────┘ └──────┘ └─────┘ └─────┘ └─────┘ └─────┘ └───────┘
       │      │      │      │      │      │      │
┌──────▼──────▼──────▼──────▼──────▼──────▼──────▼───────┐
│                    PostgreSQL (per-tenant schema)         │
├──────────────────────────────────────────────────────────┤
│                         Redis                            │
├──────────────────────────────────────────────────────────┤
│                    MinIO / S3 Storage                     │
├──────────────────────────────────────────────────────────┤
│                   OpenAI / Local LLM                      │
└──────────────────────────────────────────────────────────┘
```

### 2.4 API Design
- **RESTful** for CRUD operations
- **GraphQL** (optional) for complex dashboard queries
- **WebSocket** for real-time updates (billing, stock changes)
- **OpenAPI 3.0** specification for all endpoints
- **API Versioning**: URL-based (`/api/v1/...`)

---

## 3. Authentication & Authorization

### 3.1 Auth Flow
```
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Client  │────▶│  Auth    │────▶│  JWT     │────▶│  Tenant  │
│          │     │  Service │     │  Issued  │     │  Resolved│
└─────────┘     └──────────┘     └──────────┘     └──────────┘
```

- **JWT** with access + refresh token pattern
- Access token: 15 minutes expiry
- Refresh token: 7 days expiry (stored in Redis)
- **Multi-factor authentication** (optional, for admin/owner roles)
- **OAuth 2.0** for future SSO integration

### 3.2 Role-Based Access Control (RBAC)
| Role | Scope | Permissions |
|---|---|---|
| **Super Admin** | Global | Tenant management, system config |
| **Owner** | Tenant | Full access to all modules |
| **Manager** | Tenant | Inventory, purchases, returns, reports |
| **Pharmacist** | Tenant | Billing, prescription, stock view |
| **Cashier** | Tenant | Billing only |

### 3.3 Tenant Resolution
- Subdomain-based: `{tenant}.pharmacyos.com`
- Custom domain support
- Tenant ID extracted from JWT claims
- Prisma middleware auto-filters by tenant schema

---

## 4. Data Flow & State Management

### 4.1 Frontend State Architecture
```
┌─────────────────────────────────────────────┐
│              Zustand Stores                   │
│  ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────┐ │
│  │  Auth   │ │  Cart  │ │  UI    │ │Sync  │ │
│  │  Store  │ │  Store │ │  Store │ │Store │ │
│  └─────────┘ └────────┘ └────────┘ └──────┘ │
├─────────────────────────────────────────────┤
│           TanStack Query (Server State)       │
│  ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────┐ │
│  │Inventory│ │Billing │ │Purchase│ │Reports│ │
│  │ Queries │ │Queries │ │ Queries│ │Queries│ │
│  └─────────┘ └────────┘ └────────┘ └──────┘ │
├─────────────────────────────────────────────┤
│           IndexedDB (Offline Store)           │
│  ┌─────────┐ ┌────────┐ ┌────────┐ ┌──────┐ │
│  │Products │ │Batches │ │Pending │ │Sales │ │
│  │ Cache   │ │ Cache  │ │Mutations│ │Cache │ │
│  └─────────┘ └────────┘ └────────┘ └──────┘ │
└─────────────────────────────────────────────┘
```

### 4.2 Offline Sync Strategy
1. **Online**: All reads/writes go to API → PostgreSQL
2. **Offline**: Reads from IndexedDB cache; writes queued in IndexedDB
3. **Reconnect**: Background Sync API triggers flush of queued mutations
4. **Conflict**: Server timestamp wins; client notified of conflicts
5. **Cache Invalidation**: Stale-while-revalidate pattern via TanStack Query

---

## 5. Performance Requirements

| Metric | Target | Measurement |
|---|---|---|
| API Response Time (P95) | < 300ms | New Relic / Prometheus |
| Page Load (First Paint) | < 1.5s | Lighthouse |
| Page Load (Time to Interactive) | < 3s | Lighthouse |
| Barcode Scan → Bill Item | < 200ms | Custom metric |
| Search Autocomplete | < 100ms | Custom metric |
| Concurrent Users per Tenant | 1000+ | Load test |
| Offline Sync Latency | < 5s on reconnect | Custom metric |
| Report Generation | < 10s for 1yr data | Custom metric |

---

## 6. Security Requirements

### 6.1 Data Security
- **Encryption at rest**: AES-256 for database, S3 server-side encryption
- **Encryption in transit**: TLS 1.3 for all communications
- **Password hashing**: bcrypt with cost factor 12
- **JWT signing**: RS256 with rotating key pairs
- **API rate limiting**: 100 req/min per user (configurable)

### 6.2 Compliance
- **GST**: All invoices comply with GST invoice rules
- **Drug License**: Track and alert on drug license expiry
- **Data Localization**: All data stored in India (AWS Mumbai / Azure Central India)
- **Audit Trail**: Immutable log of all critical actions
- **GDPR-ready**: Data export and deletion capabilities

### 6.3 Input Validation
- Server-side validation on all endpoints (Zod schemas)
- SQL injection prevention via Prisma parameterized queries
- XSS prevention via output encoding
- CSRF protection via double-submit cookie pattern
- File upload validation (type, size, scan)

---

## 7. Monitoring & Observability

### 7.1 Logging
- **Structured logging**: JSON format with correlation IDs
- **Log levels**: DEBUG, INFO, WARN, ERROR, FATAL
- **Centralized**: ELK Stack (Elasticsearch, Logstash, Kibana)
- **Retention**: 30 days hot, 90 days warm, 1 year cold

### 7.2 Metrics
- **Application metrics**: Request rate, error rate, latency (P50/P95/P99)
- **Business metrics**: Daily sales, bills count, active users
- **Infrastructure metrics**: CPU, memory, disk, network
- **Alerting**: PagerDuty / Slack for critical alerts

### 7.3 Tracing
- **Distributed tracing**: OpenTelemetry
- **Trace all API requests** across microservices
- **Sampling**: 100% for errors, 10% for successful requests

---

## 8. Development Workflow

### 8.1 Git Branching Strategy
```
main ──── Production-ready code
  │
  └── develop ──── Integration branch
        │
        ├── feature/xxx ──── New features
        ├── bugfix/xxx ──── Bug fixes
        └── release/x.x.x ──── Release candidates
```

### 8.2 CI/CD Pipeline
```
Commit → Lint → Test → Build → Deploy (Dev)
                                    │
                                    ▼
                              Integration Tests
                                    │
                                    ▼
                              Deploy (Staging)
                                    │
                                    ▼
                              E2E Tests
                                    │
                                    ▼
                              Deploy (Production)
```

### 8.3 Code Quality
- **ESLint** with strict TypeScript rules
- **Prettier** for consistent formatting
- **Husky** for pre-commit hooks
- **Commitlint** for conventional commits
- **SonarQube** for code quality analysis
- **Jest** for unit tests (80%+ coverage)
- **Playwright** for E2E tests

---

## 9. Deployment Architecture

### 9.1 Development Environment
```
Docker Compose:
├── PostgreSQL 16
├── Redis 7
├── MinIO (S3-compatible)
├── API Gateway (NestJS - hot reload)
├── Frontend (Next.js - hot reload)
└── BullMQ Worker
```

### 9.2 Production Environment (Kubernetes)
```
Ingress Controller (Traefik / Nginx)
    │
    ├── API Gateway Service (3 replicas)
    ├── Frontend Service (3 replicas)
    ├── Auth Service (2 replicas)
    ├── Inventory Service (3 replicas)
    ├── Billing Service (3 replicas)
    ├── Purchase Service (2 replicas)
    ├── AI Service (2 replicas)
    ├── BullMQ Worker (2 replicas)
    │
    └── Stateful Sets:
        ├── PostgreSQL (Primary + 2 Replicas)
        ├── Redis Cluster (3 nodes)
        └── MinIO (Distributed mode)
```

---

## 10. Third-Party Integrations

| Integration | Purpose | Priority |
|---|---|---|
| **SMS Gateway** | OTP, order notifications | High |
| **Email Service** | Invoices, reports | High |
| **WhatsApp Business API** | AI ordering, notifications | Medium |
| **Payment Gateway** | UPI, card payments | High |
| **Print Server** | Thermal printer support | High |
| **Barcode Scanner SDK** | WebUSB / Bluetooth scanner | High |
| **GST Portal API** | Auto-filing GSTR-1/3B | Low (Future) |
| **Drug License API** | License verification | Low (Future) |

---

## 11. Error Handling Strategy

### 11.1 API Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Insufficient stock for batch A001",
    "details": {
      "medicineId": "med_123",
      "batchNo": "A001",
      "available": 5,
      "requested": 10
    },
    "requestId": "req_abc123",
    "timestamp": "2026-07-21T14:00:00Z"
  }
}
```

### 11.2 Error Codes
| Code | HTTP Status | Description |
|---|---|---|
| VALIDATION_ERROR | 400 | Input validation failed |
| UNAUTHORIZED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Resource conflict (e.g., duplicate) |
| INSUFFICIENT_STOCK | 409 | Not enough stock |
| RATE_LIMITED | 429 | Too many requests |
| INTERNAL_ERROR | 500 | Unexpected server error |
| SERVICE_UNAVAILABLE | 503 | Downstream service unavailable |

---

## 12. Database Design Principles

### 12.1 Naming Conventions
- **Tables**: snake_case, plural (e.g., `medicines`, `purchase_invoices`)
- **Columns**: snake_case (e.g., `brand_name`, `selling_price`)
- **Primary Keys**: UUID v7 (time-ordered for better index performance)
- **Foreign Keys**: `{table_name}_id` (e.g., `medicine_id`)
- **Indexes**: `idx_{table}_{column}` (e.g., `idx_medicines_brand_name`)
- **Unique Constraints**: `uq_{table}_{column}` (e.g., `uq_medicines_barcode`)

### 12.2 Common Columns (All Tables)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
deleted_at      TIMESTAMPTZ  -- Soft delete
created_by      UUID REFERENCES users(id)
updated_by      UUID REFERENCES users(id)
tenant_id       UUID NOT NULL  -- For shared schema mode (if not using schema-per-tenant)
```

### 12.3 Soft Delete Strategy
- All tables use `deleted_at` for soft delete
- Queries filter `WHERE deleted_at IS NULL` by default
- Prisma middleware auto-filters soft-deleted records
- Data is physically purged after 90 days via cron job

---

## 13. Caching Strategy

### 13.1 Redis Cache Layers
| Cache | Key Pattern | TTL | Purpose |
|---|---|---|---|
| Medicine Search | `{tenant}:medicines:search:{query}` | 5 min | Autocomplete results |
| Medicine Detail | `{tenant}:medicines:{id}` | 10 min | Product details |
| Batch Stock | `{tenant}:batches:stock:{medicineId}` | 1 min | Real-time stock |
| User Session | `{tenant}:sessions:{userId}` | 7 days | JWT refresh tokens |
| Rate Limiter | `ratelimit:{userId}:{endpoint}` | 1 min | Rate limiting |
| Dashboard Stats | `{tenant}:dashboard:{date}` | 5 min | Dashboard widgets |

### 13.2 Cache Invalidation
- Write-through cache pattern
- On mutation: invalidate related cache keys
- BullMQ job for bulk cache invalidation
- Cache stampede protection via mutex locks

---

## 14. File Storage

### 14.1 Storage Structure (MinIO/S3)
```
{tenant-id}/
├── prescriptions/
│   ├── {year}/{month}/{day}/{uuid}.jpg
│   └── {year}/{month}/{day}/{uuid}.pdf
├── barcodes/
│   └── {medicine-id}/{batch-no}.png
├── invoices/
│   └── {year}/{month}/{day}/{invoice-no}.pdf
├── reports/
│   └── {type}/{year}/{month}/{uuid}.xlsx
└── backups/
    └── {date}/full-dump.sql
```

### 14.2 File Upload Constraints
| Type | Max Size | Allowed Formats |
|---|---|---|
| Prescription Images | 10 MB | JPG, PNG, PDF |
| Barcode Labels | 2 MB | PNG |
| Invoice PDFs | 5 MB | PDF |
| Report Exports | 50 MB | XLSX, CSV |

---

## 15. Background Jobs (BullMQ)

| Job | Schedule | Description |
|---|---|---|
| Expiry Alert Check | Daily at 00:00 | Check and notify about expiring medicines |
| Purchase Suggestion | Daily at 02:00 | Generate purchase suggestions |
| GST Report Generation | Monthly on 1st | Generate GST reports for previous month |
| Database Backup | Daily at 03:00 | Full database backup |
| Cache Warmup | Daily at 04:00 | Pre-warm common cache keys |
| Data Purging | Weekly on Sunday | Purge soft-deleted records > 90 days |
| Sync Cleanup | Hourly | Clean up stale sync records |
| AI Forecast | Weekly on Monday | Generate demand forecast |

---

## 16. Testing Strategy

| Test Type | Tool | Coverage Target | CI Stage |
|---|---|---|---|
| Unit Tests | Jest + Vitest | 80%+ | Pre-commit |
| Integration Tests | Supertest + Testcontainers | 70%+ | PR |
| E2E Tests | Playwright | Critical paths | Staging |
| API Tests | Postman / Newman | All endpoints | PR |
| Load Tests | k6 | 1000 concurrent users | Pre-release |
| Security Scan | OWASP ZAP | All endpoints | Pre-release |

---

## 17. Environment Configuration

### 17.1 Environment Variables
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/pharmacyos
REDIS_URL=redis://host:6379

# Auth
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Storage
S3_ENDPOINT=
S3_REGION=
S3_ACCESS_KEY=
S3_SECRET_KEY=
S3_BUCKET=pharmacyos

# AI
OPENAI_API_KEY=
WHISPER_API_KEY=

# External Services
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
SMS_API_KEY=
WHATSAPP_API_KEY=
PAYMENT_GATEWAY_KEY=

# App
NODE_ENV=development
PORT=3000
TENANT_MODE=schema  # schema | shared
CORS_ORIGINS=http://localhost:3000

# Monitoring
SENTRY_DSN=
NEW_RELIC_KEY=
```

---

## 18. Module-Specific Technical Requirements

### 18.1 Billing Module
- **Real-time stock deduction** on bill finalization
- **Batch selection**: FIFO or Nearest Expiry (configurable)
- **Hold bill**: Save incomplete bills for later
- **Offline billing**: Full billing capability offline, sync when online
- **Thermal printer**: ESC/POS protocol support via WebUSB
- **GST invoice**: Generate GST-compliant invoice with QR code
- **Discount**: Item-level and bill-level discounts with approval workflow

### 18.2 Inventory Module
- **Real-time stock tracking** across batches
- **Stock adjustments** with reason codes and approval
- **Stock transfer** between stores (multi-store)
- **Rack/Shelf management** for physical location tracking
- **Low stock alerts** with configurable thresholds
- **Dead stock identification** (no movement in 90 days)

### 18.3 Purchase Module
- **Purchase order** creation and approval workflow
- **Goods receipt** with batch and expiry entry
- **Purchase invoice** matching with PO and GRN
- **Supplier credit** tracking
- **Purchase return** with credit note generation

### 18.4 AI Module
- **Demand forecasting**: Time-series analysis using historical sales
- **OCR prescription**: Image upload → text extraction → medicine mapping
- **Voice billing**: Speech-to-text → medicine recognition → bill preparation
- **Generic substitute**: Medicine name → generic alternatives
- **Smart alerts**: Rule-based + ML anomaly detection

---

*Document Version: 1.0*
*Prepared for: Cognivectra*