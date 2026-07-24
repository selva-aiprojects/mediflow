# Architecture Updates

This document tracks major architectural decisions and implementations added to the Pharmacy OS platform.

## Multi-Store Segregation

### Overview
To support multi-branch pharmacies, the system now enforces a strict multi-store segregation model. Instead of relying on manual `where: { storeId }` clauses in every single service method, we've implemented a global middleware approach.

### Implementation Details
1. **Frontend (`StoreContext`)**: A React Context (`StoreContext.tsx`) manages the active store selection. When a user switches stores via the UI dropdown, the `activeStoreId` is saved to `localStorage` and the application reloads to fetch the new store's context.
2. **API Interceptor**: The Axios interceptor (`lib/api.ts`) automatically appends an `X-Store-Id` header to every outgoing API request.
3. **Backend `AsyncLocalStorage`**: A NestJS middleware (`ContextMiddleware`) extracts the `X-Store-Id` header and initializes an `AsyncLocalStorage` context for the request lifecycle.
4. **Prisma Middleware**: A global Prisma client extension (using `this.$use` middleware in `PrismaService`) intercepts all database operations (`findMany`, `update`, `create`, etc.). It automatically reads the `storeId` from `AsyncLocalStorage` and injects it into the query arguments (e.g., `where.storeId = ...` or `data.storeId = ...`).
5. **Exceptions**: Global tables like `User`, `Tenant`, `Category`, `Manufacturer`, and `Medicine` bypass this middleware as they are shared across stores.

## AI-Powered Goods Receipt (GRN) Import

### Overview
To streamline inventory management, store keepers can now upload vendor invoices (PDFs or images) directly to the system.

### Implementation Details
1. **Frontend Integration**: The Goods Receipt page includes an "AI Import" button that handles file selection and uploads it to the `/api/goods-receipt/extract` endpoint as `multipart/form-data`.
2. **Backend AI Processing**: The backend uses the Google Generative AI SDK (`@google/generative-ai`) and the `gemini-1.5-flash` multimodal model.
3. **Extraction Prompt**: The AI is prompted to perform OCR and structured data extraction, returning a strictly formatted JSON array containing the Supplier Name, Invoice Number, Medicine Names, Batch Numbers, Expiry Dates, Quantities, and Pricing.
4. **Auto-Mapping**: The frontend receives the JSON array and automatically cross-references the AI's extracted medicine/supplier names with the local database to pre-populate the `medicineId` and `supplierId` fields in the GRN creation form.
5. **Fallback Mechanism**: If the `GEMINI_API_KEY` environment variable is not present, the backend falls back to a realistic mock response for testing and UI demonstration purposes.
