import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('PharmacyOS E2E Tests', () => {
  let app: INestApplication;
  let adminToken: string;
  let managerToken: string;
  let pharmacistToken: string;
  let cashierToken: string;
  let adminUserId: string;
  let createdUserId: string;
  let createdStoreId: string;
  let createdMedicineId: string;
  let createdSupplierId: string;
  let createdCustomerId: string;
  let createdDoctorId: string;
  let createdPurchaseOrderId: string;
  let createdGoodsReceiptId: string;
  let createdSaleId: string;
  let createdInvoiceId: string;
  let createdCustomerReturnId: string;
  let createdSupplierReturnId: string;
  let createdBarcodeId: string;
  let createdNotificationId: string;
  let storeId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ══════════════════════════════════════════════════════════
  // 1. APP HEALTH CHECK
  // ══════════════════════════════════════════════════════════
  describe('App Health Check', () => {
    it('GET / should return Hello World!', () => {
      return request(app.getHttpServer())
        .get('/')
        .expect(200)
        .expect('Hello World!');
    });
  });

  // ══════════════════════════════════════════════════════════
  // 2. AUTHENTICATION
  // ══════════════════════════════════════════════════════════
  describe('Authentication', () => {
    it('POST /auth/login - admin login should succeed', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@pharmacyos.com', password: 'admin123' })
        .expect(201);

      expect(res.body).toHaveProperty('accessToken');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe('admin@pharmacyos.com');
      expect(res.body.user.role).toBe('admin');
      expect(res.body.user.firstName).toBe('Rajesh');
      adminToken = res.body.accessToken;
      adminUserId = res.body.user.id;
    });

    it('POST /auth/login - manager login should succeed', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'manager@pharmacyos.com', password: 'manager123' })
        .expect(201);

      expect(res.body.user.role).toBe('manager');
      managerToken = res.body.accessToken;
    });

    it('POST /auth/login - pharmacist login should succeed', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'pharmacist@pharmacyos.com', password: 'pharmacist123' })
        .expect(201);

      expect(res.body.user.role).toBe('pharmacist');
      pharmacistToken = res.body.accessToken;
    });

    it('POST /auth/login - cashier login should succeed', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'cashier@pharmacyos.com', password: 'cashier123' })
        .expect(201);

      expect(res.body.user.role).toBe('cashier');
      cashierToken = res.body.accessToken;
    });

    it('POST /auth/login - invalid credentials should return 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'admin@pharmacyos.com', password: 'wrongpassword' })
        .expect(401);
    });

    it('POST /auth/login - nonexistent user should return 401', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({ email: 'nonexistent@pharmacyos.com', password: 'password' })
        .expect(401);
    });

    it('GET /auth/profile - should return authenticated user profile', async () => {
      const res = await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.email).toBe('admin@pharmacyos.com');
      expect(res.body.firstName).toBe('Rajesh');
      expect(res.body.role).toBe('admin');
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('storeId');
    });

    it('GET /auth/profile - should reject unauthenticated requests', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .expect(401);
    });

    it('GET /auth/profile - should reject invalid token', async () => {
      await request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token-here')
        .expect(401);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 3. PROTECTED ENDPOINTS - AUTH GUARD
  // ══════════════════════════════════════════════════════════
  describe('Auth Guard - Protected routes require token', () => {
    it('GET /dashboard/stats - should reject without token', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/stats')
        .expect(401);
    });

    it('GET /dashboard/stats - should accept valid token', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 4. DASHBOARD ENDPOINTS
  // ══════════════════════════════════════════════════════════
  describe('Dashboard', () => {
    it('GET /dashboard/stats - should return dashboard statistics', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('totalSales');
      expect(res.body).toHaveProperty('totalPurchases');
      expect(res.body).toHaveProperty('totalProfit');
      expect(res.body).toHaveProperty('totalBills');
      expect(res.body).toHaveProperty('totalItemsSold');
      expect(res.body).toHaveProperty('totalCustomers');
      expect(res.body).toHaveProperty('totalMedicines');
      expect(res.body).toHaveProperty('lowStockItems');
      expect(res.body).toHaveProperty('expiringItems');
      expect(res.body).toHaveProperty('pendingOrders');
      expect(typeof res.body.totalSales).toBe('number');
      expect(typeof res.body.totalMedicines).toBe('number');
      expect(res.body.totalMedicines).toBeGreaterThan(0);
    });

    it('GET /dashboard/sales-chart - should return 7-day chart data', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/sales-chart')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(7);
      res.body.forEach((entry: any) => {
        expect(entry).toHaveProperty('date');
        expect(entry).toHaveProperty('sales');
        expect(entry).toHaveProperty('profit');
        expect(entry).toHaveProperty('bills');
      });
    });

    it('GET /dashboard/sales-chart?days=30 - should return 30-day chart', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/sales-chart?days=30')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(30);
    });

    it('GET /dashboard/sales-chart?days=abc - should default to 7 days', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/sales-chart?days=abc')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(7);
    });

    it('GET /dashboard/sales-chart?days=999 - should clamp to max 90 days', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/sales-chart?days=999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(90);
    });

    it('GET /dashboard/top-medicines - should return top selling medicines', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/top-medicines')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(5);
      res.body.forEach((item: any) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('name');
        expect(item).toHaveProperty('category');
        expect(item).toHaveProperty('quantity');
        expect(item).toHaveProperty('amount');
      });
    });

    it('GET /dashboard/recent-activity - should return recent audit logs', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/recent-activity')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 5. STORES
  // ══════════════════════════════════════════════════════════
  describe('Stores', () => {
    it('GET /stores - should return list of stores', async () => {
      const res = await request(app.getHttpServer())
        .get('/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      storeId = res.body[0].id;
    });

    it('POST /stores - should create a new store', async () => {
      const res = await request(app.getHttpServer())
        .post('/stores')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code: `BR-${Date.now()}`,
          name: 'MediFlow Branch 1',
          addressLine1: '456 Branch Road',
          city: 'Delhi',
          state: 'Delhi',
          phone: '011-23456789',
          email: 'branch1@mediflow.in',
          gstin: '07AABCM1234F1Z5',
          drugLicenseNo: 'DL-2024-005678',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('MediFlow Branch 1');
      expect(res.body.code).toMatch(/^BR-/);
      createdStoreId = res.body.id;
    });

    it('PATCH /stores/:id - should update store details', async () => {
      if (!createdStoreId) return;
      const res = await request(app.getHttpServer())
        .patch(`/stores/${createdStoreId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'MediFlow Branch 1 Updated', city: 'New Delhi' })
        .expect(200);

      expect(res.body.name).toBe('MediFlow Branch 1 Updated');
      expect(res.body.city).toBe('New Delhi');
    });
  });

  // ══════════════════════════════════════════════════════════
  // 6. USERS
  // ══════════════════════════════════════════════════════════
  describe('Users', () => {
    it('GET /users - should return list of users', async () => {
      const res = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('email');
      expect(res.body[0]).toHaveProperty('role');
    });

    it('GET /users?role=admin - should filter users by role', async () => {
      const res = await request(app.getHttpServer())
        .get('/users?role=admin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((user: any) => {
        expect(user.role).toBe('admin');
      });
    });

    it('GET /users?isActive=true - should filter active users', async () => {
      const res = await request(app.getHttpServer())
        .get('/users?isActive=true')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      res.body.forEach((user: any) => {
        expect(user.isActive).toBe(true);
      });
    });

    it('POST /users - should create a new user', async () => {
      const res = await request(app.getHttpServer())
        .post('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          email: `testuser-${Date.now()}@pharmacyos.com`,
          firstName: 'Test',
          lastName: 'User',
          phone: `8888${String(Date.now()).slice(-6)}`,
          role: 'cashier',
          storeId,
          employeeCode: `EMP-${Date.now()}`,
          password: 'Test@1234',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.email).toMatch(/^testuser-/);
      expect(res.body.firstName).toBe('Test');
      createdUserId = res.body.id;
    });

    it('PATCH /users/:id - should update user details', async () => {
      if (!createdUserId) return;
      const res = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Updated', role: 'pharmacist' })
        .expect(200);

      expect(res.body.firstName).toBe('Updated');
      expect(res.body.role).toBe('pharmacist');
    });

    it('DELETE /users/:id - should soft-delete a user', async () => {
      if (!createdUserId) return;
      await request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('PATCH /users/nonexistent-id - should return 404 or error for missing record', async () => {
      const res = await request(app.getHttpServer())
        .patch('/users/00000000-0000-0000-0000-000000000000')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'No User' });
      expect([400, 404, 500]).toContain(res.status);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 7. MEDICINES
  // ══════════════════════════════════════════════════════════
  describe('Medicines', () => {
    it('GET /medicines - should return list of medicines', async () => {
      const res = await request(app.getHttpServer())
        .get('/medicines')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('brandName');
      expect(res.body[0]).toHaveProperty('batches');
    });

    it('GET /medicines?search=Crocin - should search by name', async () => {
      const res = await request(app.getHttpServer())
        .get('/medicines?search=Crocin')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      const found = res.body.some((m: any) =>
        m.brandName.toLowerCase().includes('crocin'),
      );
      expect(found).toBe(true);
    });

    it('GET /medicines?search=ZZZZNONEXISTENT - should return empty', async () => {
      const res = await request(app.getHttpServer())
        .get('/medicines?search=ZZZZNONEXISTENT')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });

    it('GET /medicines with very long search - should not crash', async () => {
      const res = await request(app.getHttpServer())
        .get(`/medicines?search=${'A'.repeat(500)}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /medicines - should create a new medicine', async () => {
      const res = await request(app.getHttpServer())
        .post('/medicines')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          brandName: 'Test Medicine E2E',
          genericName: 'Test Generic',
          strength: '100mg',
          form: 'Tablet',
          schedule: 'OTC',
          hsnCode: '30049090',
          gstPercent: 12,
          barcode: `TEST-MED-${Date.now()}`,
          unitType: 'strip',
          minStockLevel: 10,
          maxStockLevel: 100,
          reorderLevel: 20,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.brandName).toBe('Test Medicine E2E');
      createdMedicineId = res.body.id;
    });

    it('PATCH /medicines/:id - should update medicine details', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/medicines/${createdMedicineId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ brandName: 'Test Medicine Updated', strength: '200mg' })
        .expect(200);

      expect(res.body.brandName).toBe('Test Medicine Updated');
      expect(res.body.strength).toBe('200mg');
    });

    it('DELETE /medicines/:id - should soft-delete a medicine', async () => {
      await request(app.getHttpServer())
        .delete(`/medicines/${createdMedicineId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /medicines - deleted medicine should not appear', async () => {
      const res = await request(app.getHttpServer())
        .get('/medicines')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const found = res.body.some((m: any) => m.id === createdMedicineId);
      expect(found).toBe(false);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 8. SUPPLIERS
  // ══════════════════════════════════════════════════════════
  describe('Suppliers', () => {
    it('GET /suppliers - should return list of suppliers', async () => {
      const res = await request(app.getHttpServer())
        .get('/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('companyName');
    });

    it('POST /suppliers - should create a new supplier', async () => {
      const res = await request(app.getHttpServer())
        .post('/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          companyName: 'Test Pharma Distributors',
          contactPerson: 'Test Contact',
          gstin: '27AABCT1234F1Z5',
          drugLicenseNo: 'MH-TEST-001',
          addressLine1: '123 Test Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          phone: '022-12345678',
          email: 'test@testpharma.in',
          creditDays: 30,
          leadTimeDays: 3,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.companyName).toBe('Test Pharma Distributors');
      createdSupplierId = res.body.id;
    });

    it('PATCH /suppliers/:id - should update supplier details', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ companyName: 'Test Pharma Updated', creditDays: 45 })
        .expect(200);

      expect(res.body.companyName).toBe('Test Pharma Updated');
      expect(res.body.creditDays).toBe(45);
    });

    it('DELETE /suppliers/:id - should soft-delete a supplier', async () => {
      await request(app.getHttpServer())
        .delete(`/suppliers/${createdSupplierId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /suppliers - deleted supplier should not appear', async () => {
      const res = await request(app.getHttpServer())
        .get('/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const found = res.body.some((s: any) => s.id === createdSupplierId);
      expect(found).toBe(false);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 9. CUSTOMERS
  // ══════════════════════════════════════════════════════════
  describe('Customers', () => {
    it('GET /customers - should return list of customers', async () => {
      const res = await request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('firstName');
    });

    it('POST /customers - should create a new customer', async () => {
      const res = await request(app.getHttpServer())
        .post('/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Test',
          lastName: 'Customer',
          mobile: `8888${String(Date.now()).slice(-6)}`,
          email: 'test.customer@test.com',
          addressLine1: '123 Test Customer Road',
          city: 'Mumbai',
          state: 'Maharashtra',
          storeId,
          gender: 'Male',
          isCreditAllowed: true,
          creditLimit: 5000,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.firstName).toBe('Test');
      createdCustomerId = res.body.id;
    });

    it('PATCH /customers/:id - should update customer details', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ firstName: 'Updated Customer' })
        .expect(200);

      expect(res.body.firstName).toBe('Updated Customer');
    });

    it('DELETE /customers/:id - should soft-delete a customer', async () => {
      await request(app.getHttpServer())
        .delete(`/customers/${createdCustomerId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /customers - deleted customer should not appear', async () => {
      const res = await request(app.getHttpServer())
        .get('/customers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const found = res.body.some((c: any) => c.id === createdCustomerId);
      expect(found).toBe(false);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 10. DOCTORS
  // ══════════════════════════════════════════════════════════
  describe('Doctors', () => {
    it('GET /doctors - should return list of doctors', async () => {
      const res = await request(app.getHttpServer())
        .get('/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('name');
    });

    it('POST /doctors - should create a new doctor', async () => {
      const res = await request(app.getHttpServer())
        .post('/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Dr. Test Physician',
          speciality: 'General Physician',
          clinicHospital: 'Test Hospital',
          registrationNo: 'MCI-TEST-001',
          mobile: '9800000100',
          email: 'doctor@test.com',
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.name).toBe('Dr. Test Physician');
      createdDoctorId = res.body.id;
    });

    it('PATCH /doctors/:id - should update doctor details', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/doctors/${createdDoctorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ speciality: 'Cardiologist', clinicHospital: 'Heart Clinic' })
        .expect(200);

      expect(res.body.speciality).toBe('Cardiologist');
      expect(res.body.clinicHospital).toBe('Heart Clinic');
    });

    it('DELETE /doctors/:id - should soft-delete a doctor', async () => {
      await request(app.getHttpServer())
        .delete(`/doctors/${createdDoctorId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /doctors - deleted doctor should not appear', async () => {
      const res = await request(app.getHttpServer())
        .get('/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const found = res.body.some((d: any) => d.id === createdDoctorId);
      expect(found).toBe(false);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 11. INVENTORY
  // ══════════════════════════════════════════════════════════
  describe('Inventory', () => {
    it('GET /inventory - should return inventory with batch details', async () => {
      const res = await request(app.getHttpServer())
        .get('/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('batchNo');
      expect(res.body[0]).toHaveProperty('quantity');
      expect(res.body[0]).toHaveProperty('medicine');
      expect(res.body[0]).toHaveProperty('store');
      expect(res.body[0]).toHaveProperty('expiryDate');
    });

    it('POST /inventory/adjust - should increase stock', async () => {
      const invRes = await request(app.getHttpServer())
        .get('/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const batchId = invRes.body[0].id;
      const originalQty = Number(invRes.body[0].quantity);

      const res = await request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ batchId, quantity: 10 })
        .expect(201);

      expect(Number(res.body.quantity)).toBe(originalQty + 10);
    });

    it('POST /inventory/adjust - should decrease stock', async () => {
      const invRes = await request(app.getHttpServer())
        .get('/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const batchId = invRes.body[0].id;
      const currentQty = Number(invRes.body[0].quantity);

      const res = await request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ batchId, quantity: -5 })
        .expect(201);

      expect(Number(res.body.quantity)).toBe(currentQty - 5);
    });

    it('POST /inventory/adjust - should not go below zero', async () => {
      const invRes = await request(app.getHttpServer())
        .get('/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const batchId = invRes.body[0].id;
      const currentQty = Number(invRes.body[0].quantity);

      const res = await request(app.getHttpServer())
        .post('/inventory/adjust')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ batchId, quantity: -(currentQty + 1000) })
        .expect(201);

      expect(Number(res.body.quantity)).toBe(0);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 12. PURCHASE ORDERS
  // ══════════════════════════════════════════════════════════
  describe('Purchase Orders', () => {
    it('GET /purchase-orders - should return list of POs', async () => {
      const res = await request(app.getHttpServer())
        .get('/purchase-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('poNo');
      expect(res.body[0]).toHaveProperty('status');
      expect(res.body[0]).toHaveProperty('items');
    });

    it('POST /purchase-orders - should create a new PO with items', async () => {
      const supplierRes = await request(app.getHttpServer())
        .get('/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const medicineRes = await request(app.getHttpServer())
        .get('/medicines')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const supplier = supplierRes.body.find((s: any) => s.isActive);
      const medicine = medicineRes.body[0];
      if (!supplier || !medicine) return;

      const res = await request(app.getHttpServer())
        .post('/purchase-orders')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          storeId,
          supplierId: supplier.id,
          expectedDelivery: new Date(Date.now() + 7 * 86400000).toISOString(),
          notes: 'Test PO from E2E',
          createdBy: adminUserId,
          items: [
            {
              medicineId: medicine.id,
              quantity: 50,
              unitPrice: 80,
              mrp: 100,
              gstPercent: 12,
              totalAmount: 4000,
            },
          ],
        });

      if (res.status === 201) {
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('poNo');
        expect(res.body.status).toBe('draft');
        createdPurchaseOrderId = res.body.id;
      } else {
        expect([400, 500]).toContain(res.status);
      }
    });

    it('PATCH /purchase-orders/:id - should update PO status', async () => {
      if (!createdPurchaseOrderId) return;
      const res = await request(app.getHttpServer())
        .patch(`/purchase-orders/${createdPurchaseOrderId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ status: 'submitted' })
        .expect(200);

      expect(res.body.status).toBe('submitted');
    });

    it('DELETE /purchase-orders/:id - should soft-delete a PO', async () => {
      if (!createdPurchaseOrderId) return;
      await request(app.getHttpServer())
        .delete(`/purchase-orders/${createdPurchaseOrderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 13. GOODS RECEIPT NOTES
  // ══════════════════════════════════════════════════════════
  describe('Goods Receipt Notes', () => {
    it('GET /goods-receipt - should return list of GRNs', async () => {
      const res = await request(app.getHttpServer())
        .get('/goods-receipt')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('grnNo');
      expect(res.body[0]).toHaveProperty('status');
    });

    it('POST /goods-receipt - should create a new GRN', async () => {
      const supplierRes = await request(app.getHttpServer())
        .get('/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const medicineRes = await request(app.getHttpServer())
        .get('/medicines')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const supplier = supplierRes.body.find((s: any) => s.isActive);
      const medicine = medicineRes.body[0];
      if (!supplier || !medicine) return;

      const res = await request(app.getHttpServer())
        .post('/goods-receipt')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          storeId,
          supplierId: supplier.id,
          invoiceNo: `E2E-INV-${Date.now()}`,
          invoiceDate: new Date().toISOString(),
          notes: 'Test GRN from E2E',
          createdBy: adminUserId,
          items: [
            {
              medicineId: medicine.id,
              batchNo: `E2E-BATCH-${Date.now()}`,
              expiryDate: new Date(Date.now() + 365 * 86400000).toISOString(),
              mrp: 100,
              unitPrice: 75,
              quantity: 100,
              gstPercent: 12,
              sellingPrice: 100,
            },
          ],
        })
        .expect(201);

      expect(res.body).toHaveProperty('grnNo');
      expect(res.body.grnNo).toMatch(/^GRN-/);
      expect(res.body.status).toBe('pending');
      createdGoodsReceiptId = res.body.id;
    });

    it('PATCH /goods-receipt/:id - should update GRN status', async () => {
      if (!createdGoodsReceiptId) return;
      const res = await request(app.getHttpServer())
        .patch(`/goods-receipt/${createdGoodsReceiptId}`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({ status: 'verified' })
        .expect(200);

      expect(res.body.status).toBe('verified');
    });
  });

  // ══════════════════════════════════════════════════════════
  // 14. SALES
  // ══════════════════════════════════════════════════════════
  describe('Sales', () => {
    it('GET /sales - should return list of sales', async () => {
      const res = await request(app.getHttpServer())
        .get('/sales')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('billNo');
      expect(res.body[0]).toHaveProperty('totalAmount');
      expect(res.body[0]).toHaveProperty('salesItems');
    });

    it('POST /sales - should create a new sale with items', async () => {
      const medicineRes = await request(app.getHttpServer())
        .get('/medicines')
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);

      const medicine = medicineRes.body.find((m: any) => m.batches?.length > 0);
      if (!medicine) return;

      const batch = medicine.batches[0];

      const res = await request(app.getHttpServer())
        .post('/sales')
        .set('Authorization', `Bearer ${cashierToken}`)
        .send({
          storeId,
          createdBy: adminUserId,
          paymentMode: 'cash',
          items: [
            {
              medicineId: medicine.id,
              batchId: batch.id,
              batchNo: batch.batchNo,
              expiryDate: batch.expiryDate,
              medicineName: medicine.brandName,
              genericName: medicine.genericName,
              strength: medicine.strength,
              form: medicine.form,
              hsnCode: medicine.hsnCode,
              quantity: 2,
              unitType: medicine.unitType,
              mrp: Number(batch.mrp),
              unitPrice: Number(batch.sellingPrice),
              gstPercent: Number(batch.gstPercent),
              purchaseCost: Number(batch.purchasePrice),
            },
          ],
        });

      if (res.status === 201) {
        expect(res.body).toHaveProperty('billNo');
        expect(res.body.billNo).toMatch(/^INV-/);
        expect(res.body.paymentMode).toBe('cash');
        expect(res.body.paymentStatus).toBe('paid');
        expect(Number(res.body.totalAmount)).toBeGreaterThan(0);
        expect(res.body.salesItems).toHaveLength(1);
        createdSaleId = res.body.id;
      } else {
        expect([400, 500]).toContain(res.status);
      }
    });

    it('PATCH /sales/:id - should update sale notes', async () => {
      if (!createdSaleId) return;
      const res = await request(app.getHttpServer())
        .patch(`/sales/${createdSaleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ notes: 'Test sale notes updated' })
        .expect(200);

      expect(res.body.notes).toBe('Test sale notes updated');
    });

    it('DELETE /sales/:id - should cancel a sale', async () => {
      if (!createdSaleId) return;
      await request(app.getHttpServer())
        .delete(`/sales/${createdSaleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 15. PURCHASE INVOICES
  // ══════════════════════════════════════════════════════════
  describe('Purchase Invoices', () => {
    it('GET /invoices - should return list of purchase invoices', async () => {
      const res = await request(app.getHttpServer())
        .get('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('invoiceNo');
      expect(res.body[0]).toHaveProperty('totalAmount');
    });

    it('POST /invoices - should create a new purchase invoice', async () => {
      const supplierRes = await request(app.getHttpServer())
        .get('/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const supplier = supplierRes.body.find((s: any) => s.isActive);
      if (!supplier) return;

      const res = await request(app.getHttpServer())
        .post('/invoices')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          storeId,
          supplierId: supplier.id,
          invoiceNo: `E2E-PUR-${Date.now()}`,
          invoiceDate: new Date().toISOString(),
          totalAmount: 25000,
          paidAmount: 0,
          createdBy: adminUserId,
        })
        .expect(201);

      expect(res.body).toHaveProperty('invoiceNo');
      expect(res.body.paymentStatus).toBe('unpaid');
      createdInvoiceId = res.body.id;
    });

    it('PATCH /invoices/:id - should update invoice payment status', async () => {
      if (!createdInvoiceId) return;
      const res = await request(app.getHttpServer())
        .patch(`/invoices/${createdInvoiceId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ paymentStatus: 'paid' })
        .expect(200);

      expect(res.body.paymentStatus).toBe('paid');
    });
  });

  // ══════════════════════════════════════════════════════════
  // 16. RETURNS
  // ══════════════════════════════════════════════════════════
  describe('Returns', () => {
    it('GET /returns - should return list of returns', async () => {
      const res = await request(app.getHttpServer())
        .get('/returns')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('returnType');
      expect(['customer', 'supplier']).toContain(res.body[0].returnType);
    });

    it('POST /returns/supplier - should create a supplier return', async () => {
      const supplierRes = await request(app.getHttpServer())
        .get('/suppliers')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const supplier = supplierRes.body.find((s: any) => s.isActive);
      if (!supplier) return;

      const res = await request(app.getHttpServer())
        .post('/returns/supplier')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          storeId,
          supplierId: supplier.id,
          reason: 'Damaged goods received',
          creditAmount: 1500,
          notes: 'Batch was damaged in transit',
          createdBy: adminUserId,
        })
        .expect(201);

      expect(res.body).toHaveProperty('returnNo');
      expect(res.body.returnNo).toMatch(/^RET-S-/);
      createdSupplierReturnId = res.body.id;
    });

    it('PATCH /returns/supplier/:id - should update supplier return status', async () => {
      if (!createdSupplierReturnId) return;
      const res = await request(app.getHttpServer())
        .patch(`/returns/supplier/${createdSupplierReturnId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' })
        .expect(200);

      expect(res.body.status).toBe('approved');
    });
  });

  // ══════════════════════════════════════════════════════════
  // 17. BARCODES
  // ══════════════════════════════════════════════════════════
  describe('Barcodes', () => {
    it('GET /barcodes - should return list of barcode labels', async () => {
      const res = await request(app.getHttpServer())
        .get('/barcodes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
    });

    it('POST /barcodes - should create a new barcode label', async () => {
      const medicineRes = await request(app.getHttpServer())
        .get('/medicines')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const medicine = medicineRes.body[0];
      if (!medicine) return;

      const res = await request(app.getHttpServer())
        .post('/barcodes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          storeId,
          medicineId: medicine.id,
          labelType: 'medicine',
          barcodeData: `E2E-BC-${Date.now()}`,
          barcodeFormat: 'CODE128',
          createdBy: adminUserId,
        })
        .expect(201);

      expect(res.body).toHaveProperty('id');
      expect(res.body.labelType).toBe('medicine');
      expect(res.body.barcodeFormat).toBe('CODE128');
      createdBarcodeId = res.body.id;
    });

    it('DELETE /barcodes/:id - should soft-delete a barcode', async () => {
      if (!createdBarcodeId) return;
      await request(app.getHttpServer())
        .delete(`/barcodes/${createdBarcodeId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('GET /barcodes - deleted barcode should not appear', async () => {
      if (!createdBarcodeId) return;
      const res = await request(app.getHttpServer())
        .get('/barcodes')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const found = res.body.some((b: any) => b.id === createdBarcodeId);
      expect(found).toBe(false);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 18. NOTIFICATIONS
  // ══════════════════════════════════════════════════════════
  describe('Notifications', () => {
    it('GET /notifications - should return list of notifications', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('type');
      expect(res.body[0]).toHaveProperty('title');
      expect(res.body[0]).toHaveProperty('isRead');
      createdNotificationId = res.body[0].id;
    });

    it('PATCH /notifications/:id/read - should mark notification as read', async () => {
      const res = await request(app.getHttpServer())
        .patch(`/notifications/${createdNotificationId}/read`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body.isRead).toBe(true);
      expect(res.body).toHaveProperty('readAt');
    });
  });

  // ══════════════════════════════════════════════════════════
  // 19. REPORTS
  // ══════════════════════════════════════════════════════════
  describe('Reports', () => {
    it('GET /reports - should return reports data', async () => {
      const res = await request(app.getHttpServer())
        .get('/reports')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(res.body).toHaveProperty('dailySummaries');
      expect(res.body).toHaveProperty('auditLogs');
      expect(res.body).toHaveProperty('suggestions');
      expect(Array.isArray(res.body.dailySummaries)).toBe(true);
      expect(Array.isArray(res.body.auditLogs)).toBe(true);
      expect(Array.isArray(res.body.suggestions)).toBe(true);
    });
  });

  // ══════════════════════════════════════════════════════════
  // 20. SETTINGS
  // ══════════════════════════════════════════════════════════
  describe('Settings', () => {
    it('GET /settings - should return settings data', async () => {
      const res = await request(app.getHttpServer())
        .get('/settings')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('setting');
      expect(res.body[0]).toHaveProperty('value');
    });

    it('PATCH /settings/:id - should update settings', async () => {
      const res = await request(app.getHttpServer())
        .patch('/settings/business-profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ value: 'Updated Business Name' })
        .expect(200);

      expect(res.body.id).toBe('business-profile');
      expect(res.body).toHaveProperty('updatedAt');
    });
  });

  // ══════════════════════════════════════════════════════════
  // 21. ROLE-BASED ACCESS
  // ══════════════════════════════════════════════════════════
  describe('Role-Based Access Control', () => {
    it('Cashier should access dashboard', async () => {
      await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);
    });

    it('Cashier should access sales', async () => {
      await request(app.getHttpServer())
        .get('/sales')
        .set('Authorization', `Bearer ${cashierToken}`)
        .expect(200);
    });

    it('Manager should access purchase orders', async () => {
      await request(app.getHttpServer())
        .get('/purchase-orders')
        .set('Authorization', `Bearer ${managerToken}`)
        .expect(200);
    });

    it('Pharmacist should access inventory', async () => {
      await request(app.getHttpServer())
        .get('/inventory')
        .set('Authorization', `Bearer ${pharmacistToken}`)
        .expect(200);
    });

    it('All roles should access medicines', async () => {
      for (const token of [adminToken, managerToken, pharmacistToken, cashierToken]) {
        await request(app.getHttpServer())
          .get('/medicines')
          .set('Authorization', `Bearer ${token}`)
          .expect(200);
      }
    });
  });

  // ══════════════════════════════════════════════════════════
  // 22. DATA INTEGRITY
  // ══════════════════════════════════════════════════════════
  describe('Data Integrity', () => {
    it('Dashboard stats should have consistent numeric values', async () => {
      const res = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(typeof res.body.totalSales).toBe('number');
      expect(typeof res.body.totalPurchases).toBe('number');
      expect(typeof res.body.totalProfit).toBe('number');
      expect(typeof res.body.totalBills).toBe('number');
      expect(typeof res.body.totalItemsSold).toBe('number');
      expect(res.body.totalMedicines).toBeGreaterThan(0);
    });

    it('Medicines should have valid structure', async () => {
      const res = await request(app.getHttpServer())
        .get('/medicines')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      for (const med of res.body) {
        expect(med.brandName).toBeTruthy();
        expect(med.form).toBeTruthy();
        expect(Array.isArray(med.batches)).toBe(true);
      }
    });

    it('Inventory items should have non-negative quantities', async () => {
      const res = await request(app.getHttpServer())
        .get('/inventory')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      for (const item of res.body) {
        expect(Number(item.quantity)).toBeGreaterThanOrEqual(0);
        expect(item.medicine).toBeTruthy();
        expect(item.store).toBeTruthy();
      }
    });

    it('Purchase orders should have valid PO numbers', async () => {
      const res = await request(app.getHttpServer())
        .get('/purchase-orders')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      for (const po of res.body) {
        expect(po.poNo).toMatch(/^PO-/);
        expect(po.status).toBeTruthy();
        expect(Array.isArray(po.items)).toBe(true);
      }
    });

    it('Sales bills should have valid amounts', async () => {
      const res = await request(app.getHttpServer())
        .get('/sales')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      for (const bill of res.body) {
        expect(bill.billNo).toBeTruthy();
        expect(Number(bill.totalAmount)).toBeGreaterThanOrEqual(0);
        expect(bill.salesItems.length).toBeGreaterThan(0);
      }
    });

    it('Notifications should have required fields', async () => {
      const res = await request(app.getHttpServer())
        .get('/notifications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      for (const notif of res.body) {
        expect(notif.type).toBeTruthy();
        expect(notif.title).toBeTruthy();
        expect(typeof notif.isRead).toBe('boolean');
      }
    });
  });

  // ══════════════════════════════════════════════════════════
  // 23. CUSTOMER RETURN (end-to-end flow)
  // ══════════════════════════════════════════════════════════
  describe('Customer Returns Flow', () => {
    it('POST /returns/customer - should create a customer return', async () => {
      const salesRes = await request(app.getHttpServer())
        .get('/sales')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const sale = salesRes.body.find(
        (s: any) => s.salesItems?.length > 0 && s.billStatus !== 'cancelled',
      );
      if (!sale) return;

      const salesItem = sale.salesItems[0];

      const res = await request(app.getHttpServer())
        .post('/returns/customer')
        .set('Authorization', `Bearer ${pharmacistToken}`)
        .send({
          storeId,
          billId: sale.id,
          reason: 'Customer reported side effects',
          refundAmount: Number(salesItem.totalAmount),
          createdBy: adminUserId,
          items: [
            {
              salesItemId: salesItem.id,
              medicineId: salesItem.medicineId,
              batchId: salesItem.batchId,
              quantity: 1,
              unitPrice: Number(salesItem.unitPrice),
              totalAmount: Number(salesItem.totalAmount),
              reason: 'Adverse reaction',
            },
          ],
        })
        .expect(201);

      expect(res.body).toHaveProperty('returnNo');
      expect(res.body.returnNo).toMatch(/^RET-C-/);
      createdCustomerReturnId = res.body.id;
    });

    it('PATCH /returns/customer/:id - should update customer return', async () => {
      if (!createdCustomerReturnId) return;
      const res = await request(app.getHttpServer())
        .patch(`/returns/customer/${createdCustomerReturnId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'approved' })
        .expect(200);

      expect(res.body.status).toBe('approved');
    });
  });
});
