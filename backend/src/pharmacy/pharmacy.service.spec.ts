import { Test, TestingModule } from '@nestjs/testing';
import { PharmacyService } from './pharmacy.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  customer: { count: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  medicine: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), groupBy: jest.fn() },
  salesBill: { aggregate: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  salesItem: { aggregate: jest.fn(), groupBy: jest.fn() },
  batch: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), upsert: jest.fn(), update: jest.fn() },
  purchaseOrder: { count: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  purchaseInvoice: { aggregate: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  supplier: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  doctor: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  store: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  goodsReceiptNote: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  customerReturn: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  supplierReturn: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  barcodeLabel: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  notificationLog: { findMany: jest.fn(), update: jest.fn() },
  dailySummary: { findMany: jest.fn() },
  auditLog: { findMany: jest.fn() },
  purchaseSuggestion: { findMany: jest.fn() },
  user: { findMany: jest.fn(), create: jest.fn(), update: jest.fn() },
  $transaction: jest.fn((fns: any[]) => Promise.all(fns)),
};

describe('PharmacyService', () => {
  let service: PharmacyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PharmacyService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<PharmacyService>(PharmacyService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── Dashboard ──────────────────────────────────────

  describe('dashboardStats', () => {
    it('should return dashboard statistics', async () => {
      mockPrisma.customer.count.mockResolvedValue(100);
      mockPrisma.medicine.count.mockResolvedValue(500);
      mockPrisma.batch.count.mockResolvedValue(15);
      mockPrisma.purchaseOrder.count.mockResolvedValue(5);
      mockPrisma.salesItem.aggregate.mockResolvedValue({ _sum: { totalAmount: 100000, quantity: 500 } });
      mockPrisma.purchaseInvoice.aggregate.mockResolvedValue({ _sum: { totalAmount: 80000 } });
      // salesBill.aggregate is called 5 times: todayBills, yesterdayBills, todaySales, yesterdaySales, totalBills
      mockPrisma.salesBill.aggregate
        .mockResolvedValueOnce({ _count: 5, _sum: { totalAmount: null } })    // todayBills
        .mockResolvedValueOnce({ _count: 3, _sum: { totalAmount: null } })    // yesterdayBills
        .mockResolvedValueOnce({ _count: null, _sum: { totalAmount: 5000 } }) // todaySales
        .mockResolvedValueOnce({ _count: null, _sum: { totalAmount: 4000 } }) // yesterdaySales
        .mockResolvedValueOnce({ _count: 50, _sum: { totalAmount: null } });  // totalBills

      const result = await service.dashboardStats();
      expect(result.totalCustomers).toBe(100);
      expect(result.totalMedicines).toBe(500);
      expect(result.totalSales).toBe(100000);
      expect(result.totalPurchases).toBe(80000);
      expect(result.totalProfit).toBe(20000);
      expect(result.todaySales).toBe(5000);
      expect(result.todayBills).toBe(5);
      expect(result.yesterdaySales).toBe(4000);
      expect(result.yesterdayBills).toBe(3);
      expect(result.salesDeltaPercent).toBe(25);
    });
  });

  describe('dashboardSalesChart', () => {
    it('should return chart data for 7 days', async () => {
      mockPrisma.salesBill.findMany.mockResolvedValue([]);
      const result = await service.dashboardSalesChart('7');
      expect(result).toHaveLength(7);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('sales');
      expect(result[0]).toHaveProperty('profit');
      expect(result[0]).toHaveProperty('bills');
    });

    it('should default to 7 days', async () => {
      mockPrisma.salesBill.findMany.mockResolvedValue([]);
      const result = await service.dashboardSalesChart(undefined);
      expect(result).toHaveLength(7);
    });
  });

  // ── Users ──────────────────────────────────────────

  describe('users', () => {
    it('should return user list', async () => {
      mockPrisma.user.findMany.mockResolvedValue([
        { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@test.com', role: 'admin' },
      ]);
      const result = await service.users({});
      expect(result).toHaveLength(1);
      expect(result[0].firstName).toBe('John');
    });
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      mockPrisma.user.create.mockResolvedValue({ id: '1', email: 'new@test.com', firstName: 'New', role: 'cashier' });
      const result = await service.createUser({ email: 'new@test.com', firstName: 'New', password: 'test123' });
      expect(result.email).toBe('new@test.com');
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });
  });

  describe('deleteUser', () => {
    it('should soft delete a user', async () => {
      mockPrisma.user.update.mockResolvedValue({ id: '1', deletedAt: new Date() });
      await service.deleteUser('1');
      expect(mockPrisma.user.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { deletedAt: expect.any(Date) } });
    });
  });

  // ── Medicines ──────────────────────────────────────

  describe('medicines', () => {
    it('should return medicines list', async () => {
      mockPrisma.medicine.findMany.mockResolvedValue([
        { id: '1', brandName: 'Crocin', form: 'tablet', batches: [] },
      ]);
      const result = await service.medicines({});
      expect(result).toHaveLength(1);
      expect(result[0].brandName).toBe('Crocin');
    });

    it('should search medicines', async () => {
      mockPrisma.medicine.findMany.mockResolvedValue([]);
      await service.medicines({ search: 'crocin' });
      expect(mockPrisma.medicine.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ brandName: expect.objectContaining({ contains: 'crocin' }) }),
            ]),
          }),
        })
      );
    });
  });

  describe('createMedicine', () => {
    it('should create a medicine', async () => {
      mockPrisma.medicine.create.mockResolvedValue({ id: '1', brandName: 'Dolo', form: 'tablet' });
      const result = await service.createMedicine({ brandName: 'Dolo', form: 'tablet' });
      expect(result.brandName).toBe('Dolo');
    });
  });

  describe('deleteMedicine', () => {
    it('should soft delete', async () => {
      mockPrisma.medicine.update.mockResolvedValue({ id: '1', deletedAt: new Date() });
      await service.deleteMedicine('1');
      expect(mockPrisma.medicine.update).toHaveBeenCalledWith({ where: { id: '1' }, data: { deletedAt: expect.any(Date) } });
    });
  });

  // ── Suppliers ──────────────────────────────────────

  describe('suppliers', () => {
    it('should return suppliers list', async () => {
      mockPrisma.supplier.findMany.mockResolvedValue([{ id: '1', companyName: 'MediSupply' }]);
      const result = await service.suppliers();
      expect(result).toHaveLength(1);
    });
  });

  describe('createSupplier', () => {
    it('should create supplier', async () => {
      mockPrisma.supplier.create.mockResolvedValue({ id: '1', companyName: 'New Supplier' });
      const result = await service.createSupplier({ companyName: 'New Supplier' });
      expect(result.companyName).toBe('New Supplier');
    });
  });

  // ── Customers ──────────────────────────────────────

  describe('customers', () => {
    it('should return customers list', async () => {
      mockPrisma.customer.findMany.mockResolvedValue([{ id: '1', firstName: 'John', mobile: '1234567890' }]);
      const result = await service.customers();
      expect(result).toHaveLength(1);
    });
  });

  describe('createCustomer', () => {
    it('should create customer', async () => {
      mockPrisma.customer.create.mockResolvedValue({ id: '1', firstName: 'John', mobile: '1234567890' });
      const result = await service.createCustomer({ firstName: 'John', mobile: '1234567890' });
      expect(result.firstName).toBe('John');
    });
  });

  // ── Doctors ────────────────────────────────────────

  describe('doctors', () => {
    it('should return doctors list', async () => {
      mockPrisma.doctor.findMany.mockResolvedValue([{ id: '1', name: 'Dr. Sharma' }]);
      const result = await service.doctors();
      expect(result).toHaveLength(1);
    });
  });

  describe('createDoctor', () => {
    it('should create doctor', async () => {
      mockPrisma.doctor.create.mockResolvedValue({ id: '1', name: 'Dr. New' });
      const result = await service.createDoctor({ name: 'Dr. New' });
      expect(result.name).toBe('Dr. New');
    });
  });

  // ── Inventory ──────────────────────────────────────

  describe('inventory', () => {
    it('should return batches', async () => {
      mockPrisma.batch.findMany.mockResolvedValue([{ id: '1', batchNo: 'B001', quantity: 50 }]);
      const result = await service.inventory();
      expect(result).toHaveLength(1);
    });
  });

  // ── Notifications ──────────────────────────────────

  describe('notifications', () => {
    it('should return notifications', async () => {
      mockPrisma.notificationLog.findMany.mockResolvedValue([{ id: '1', title: 'Low stock', isRead: false }]);
      const result = await service.notifications();
      expect(result).toHaveLength(1);
    });
  });

  describe('markNotificationRead', () => {
    it('should mark as read', async () => {
      mockPrisma.notificationLog.update.mockResolvedValue({ id: '1', isRead: true });
      const result = await service.markNotificationRead('1');
      expect(result.isRead).toBe(true);
    });
  });

  // ── Settings ───────────────────────────────────────

  describe('settings', () => {
    it('should return settings', async () => {
      mockPrisma.store.findMany.mockResolvedValue([{ name: 'HQ' }]);
      mockPrisma.user.findMany.mockResolvedValue([{ isActive: true }]);
      const result = await service.settings();
      expect(result).toHaveLength(4);
      expect(result[0].setting).toBe('Business profile');
    });
  });

  // ── Reports ────────────────────────────────────────

  describe('reports', () => {
    it('should return reports data', async () => {
      mockPrisma.dailySummary.findMany.mockResolvedValue([]);
      mockPrisma.auditLog.findMany.mockResolvedValue([]);
      mockPrisma.purchaseSuggestion.findMany.mockResolvedValue([]);
      const result = await service.reports();
      expect(result).toHaveProperty('dailySummaries');
      expect(result).toHaveProperty('auditLogs');
      expect(result).toHaveProperty('suggestions');
    });
  });
});
