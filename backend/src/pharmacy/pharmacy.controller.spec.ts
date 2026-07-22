import { Test, TestingModule } from '@nestjs/testing';
import { PharmacyController } from './pharmacy.controller';
import { PharmacyService } from './pharmacy.service';

const mockService = {
  dashboardStats: jest.fn(),
  dashboardSalesChart: jest.fn(),
  topMedicines: jest.fn(),
  recentActivity: jest.fn(),
  users: jest.fn(),
  createUser: jest.fn(),
  updateUser: jest.fn(),
  deleteUser: jest.fn(),
  medicines: jest.fn(),
  createMedicine: jest.fn(),
  updateMedicine: jest.fn(),
  deleteMedicine: jest.fn(),
  suppliers: jest.fn(),
  createSupplier: jest.fn(),
  updateSupplier: jest.fn(),
  deleteSupplier: jest.fn(),
  customers: jest.fn(),
  createCustomer: jest.fn(),
  updateCustomer: jest.fn(),
  deleteCustomer: jest.fn(),
  doctors: jest.fn(),
  createDoctor: jest.fn(),
  updateDoctor: jest.fn(),
  deleteDoctor: jest.fn(),
  inventory: jest.fn(),
  adjustStock: jest.fn(),
  purchaseOrders: jest.fn(),
  createPurchaseOrder: jest.fn(),
  updatePurchaseOrder: jest.fn(),
  deletePurchaseOrder: jest.fn(),
  goodsReceipts: jest.fn(),
  createGoodsReceipt: jest.fn(),
  updateGoodsReceipt: jest.fn(),
  sales: jest.fn(),
  createSale: jest.fn(),
  updateSale: jest.fn(),
  deleteSale: jest.fn(),
  invoices: jest.fn(),
  createInvoice: jest.fn(),
  updateInvoice: jest.fn(),
  returns: jest.fn(),
  createCustomerReturn: jest.fn(),
  createSupplierReturn: jest.fn(),
  updateCustomerReturn: jest.fn(),
  updateSupplierReturn: jest.fn(),
  stores: jest.fn(),
  createStore: jest.fn(),
  updateStore: jest.fn(),
  barcodes: jest.fn(),
  createBarcode: jest.fn(),
  deleteBarcode: jest.fn(),
  notifications: jest.fn(),
  markNotificationRead: jest.fn(),
  reports: jest.fn(),
  settings: jest.fn(),
  updateSettings: jest.fn(),
};

describe('PharmacyController', () => {
  let controller: PharmacyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PharmacyController],
      providers: [{ provide: PharmacyService, useValue: mockService }],
    }).compile();

    controller = module.get<PharmacyController>(PharmacyController);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // ── Dashboard ──────────────────────────────────────

  describe('Dashboard', () => {
    it('GET /pharmacy/dashboard/stats', async () => {
      mockService.dashboardStats.mockResolvedValue({ totalCustomers: 100 });
      const result = await controller.dashboardStats();
      expect(result.totalCustomers).toBe(100);
    });

    it('GET /pharmacy/dashboard/sales-chart', async () => {
      mockService.dashboardSalesChart.mockResolvedValue([]);
      const result = await controller.dashboardSalesChart('7');
      expect(result).toEqual([]);
    });

    it('GET /pharmacy/dashboard/top-medicines', async () => {
      mockService.topMedicines.mockResolvedValue([]);
      const result = await controller.topMedicines();
      expect(result).toEqual([]);
    });

    it('GET /pharmacy/dashboard/recent-activity', async () => {
      mockService.recentActivity.mockResolvedValue([]);
      const result = await controller.recentActivity();
      expect(result).toEqual([]);
    });
  });

  // ── Users ──────────────────────────────────────────

  describe('Users CRUD', () => {
    it('GET /pharmacy/users', async () => {
      mockService.users.mockResolvedValue([]);
      expect(await controller.users({})).toEqual([]);
    });

    it('POST /pharmacy/users', async () => {
      mockService.createUser.mockResolvedValue({ id: '1' });
      const result = await controller.createUser({ email: 'a@b.com', firstName: 'A', password: 'x' });
      expect(result.id).toBe('1');
    });

    it('PATCH /pharmacy/users/:id', async () => {
      mockService.updateUser.mockResolvedValue({ id: '1', firstName: 'B' });
      const result = await controller.updateUser('1', { firstName: 'B' });
      expect(result.firstName).toBe('B');
    });

    it('DELETE /pharmacy/users/:id', async () => {
      mockService.deleteUser.mockResolvedValue(undefined);
      await expect(controller.deleteUser('1')).resolves.toBeUndefined();
    });
  });

  // ── Medicines ──────────────────────────────────────

  describe('Medicines CRUD', () => {
    it('GET /pharmacy/medicines', async () => {
      mockService.medicines.mockResolvedValue([]);
      expect(await controller.medicines({})).toEqual([]);
    });

    it('POST /pharmacy/medicines', async () => {
      mockService.createMedicine.mockResolvedValue({ id: '1', brandName: 'Dolo' });
      const result = await controller.createMedicine({ brandName: 'Dolo' });
      expect(result.brandName).toBe('Dolo');
    });

    it('PATCH /pharmacy/medicines/:id', async () => {
      mockService.updateMedicine.mockResolvedValue({ id: '1', brandName: 'Updated' });
      const result = await controller.updateMedicine('1', { brandName: 'Updated' });
      expect(result.brandName).toBe('Updated');
    });

    it('DELETE /pharmacy/medicines/:id', async () => {
      mockService.deleteMedicine.mockResolvedValue(undefined);
      await expect(controller.deleteMedicine('1')).resolves.toBeUndefined();
    });
  });

  // ── Suppliers ──────────────────────────────────────

  describe('Suppliers CRUD', () => {
    it('GET /pharmacy/suppliers', async () => {
      mockService.suppliers.mockResolvedValue([]);
      expect(await controller.suppliers()).toEqual([]);
    });

    it('POST /pharmacy/suppliers', async () => {
      mockService.createSupplier.mockResolvedValue({ id: '1', companyName: 'X' });
      const result = await controller.createSupplier({ companyName: 'X' });
      expect(result.companyName).toBe('X');
    });

    it('PATCH /pharmacy/suppliers/:id', async () => {
      mockService.updateSupplier.mockResolvedValue({ id: '1', companyName: 'Y' });
      const result = await controller.updateSupplier('1', { companyName: 'Y' });
      expect(result.companyName).toBe('Y');
    });

    it('DELETE /pharmacy/suppliers/:id', async () => {
      mockService.deleteSupplier.mockResolvedValue(undefined);
      await expect(controller.deleteSupplier('1')).resolves.toBeUndefined();
    });
  });

  // ── Customers ──────────────────────────────────────

  describe('Customers CRUD', () => {
    it('GET /pharmacy/customers', async () => {
      mockService.customers.mockResolvedValue([]);
      expect(await controller.customers()).toEqual([]);
    });

    it('POST /pharmacy/customers', async () => {
      mockService.createCustomer.mockResolvedValue({ id: '1' });
      const result = await controller.createCustomer({ firstName: 'J' });
      expect(result.id).toBe('1');
    });

    it('PATCH /pharmacy/customers/:id', async () => {
      mockService.updateCustomer.mockResolvedValue({ id: '1', firstName: 'K' });
      const result = await controller.updateCustomer('1', { firstName: 'K' });
      expect(result.firstName).toBe('K');
    });

    it('DELETE /pharmacy/customers/:id', async () => {
      mockService.deleteCustomer.mockResolvedValue(undefined);
      await expect(controller.deleteCustomer('1')).resolves.toBeUndefined();
    });
  });

  // ── Doctors ────────────────────────────────────────

  describe('Doctors CRUD', () => {
    it('GET /pharmacy/doctors', async () => {
      mockService.doctors.mockResolvedValue([]);
      expect(await controller.doctors()).toEqual([]);
    });

    it('POST /pharmacy/doctors', async () => {
      mockService.createDoctor.mockResolvedValue({ id: '1' });
      const result = await controller.createDoctor({ name: 'Dr. X' });
      expect(result.id).toBe('1');
    });

    it('PATCH /pharmacy/doctors/:id', async () => {
      mockService.updateDoctor.mockResolvedValue({ id: '1', name: 'Dr. Y' });
      const result = await controller.updateDoctor('1', { name: 'Dr. Y' });
      expect(result.name).toBe('Dr. Y');
    });

    it('DELETE /pharmacy/doctors/:id', async () => {
      mockService.deleteDoctor.mockResolvedValue(undefined);
      await expect(controller.deleteDoctor('1')).resolves.toBeUndefined();
    });
  });

  // ── Inventory ──────────────────────────────────────

  describe('Inventory', () => {
    it('GET /pharmacy/inventory', async () => {
      mockService.inventory.mockResolvedValue([]);
      expect(await controller.inventory()).toEqual([]);
    });

    it('POST /pharmacy/inventory/adjust', async () => {
      mockService.adjustStock.mockResolvedValue({ id: '1', quantity: 100 });
      const result = await controller.adjustStock({ batchId: '1', quantity: 100 });
      expect(result.quantity).toBe(100);
    });
  });

  // ── Purchase Orders ────────────────────────────────

  describe('Purchase Orders CRUD', () => {
    it('GET /pharmacy/purchase-orders', async () => {
      mockService.purchaseOrders.mockResolvedValue([]);
      expect(await controller.purchaseOrders()).toEqual([]);
    });

    it('POST /pharmacy/purchase-orders', async () => {
      mockService.createPurchaseOrder.mockResolvedValue({ id: '1' });
      const result = await controller.createPurchaseOrder({ supplierId: 's1', items: [] });
      expect(result.id).toBe('1');
    });

    it('PATCH /pharmacy/purchase-orders/:id', async () => {
      mockService.updatePurchaseOrder.mockResolvedValue({ id: '1', status: 'received' });
      const result = await controller.updatePurchaseOrder('1', { status: 'received' });
      expect(result.status).toBe('received');
    });

    it('DELETE /pharmacy/purchase-orders/:id', async () => {
      mockService.deletePurchaseOrder.mockResolvedValue(undefined);
      await expect(controller.deletePurchaseOrder('1')).resolves.toBeUndefined();
    });
  });

  // ── Goods Receipt ──────────────────────────────────

  describe('Goods Receipt', () => {
    it('GET /pharmacy/goods-receipt', async () => {
      mockService.goodsReceipts.mockResolvedValue([]);
      expect(await controller.goodsReceipts()).toEqual([]);
    });

    it('POST /pharmacy/goods-receipt', async () => {
      mockService.createGoodsReceipt.mockResolvedValue({ id: '1' });
      const result = await controller.createGoodsReceipt({ purchaseOrderId: 'po1' });
      expect(result.id).toBe('1');
    });

    it('PATCH /pharmacy/goods-receipt/:id', async () => {
      mockService.updateGoodsReceipt.mockResolvedValue({ id: '1', status: 'verified' });
      const result = await controller.updateGoodsReceipt('1', { status: 'verified' });
      expect(result.status).toBe('verified');
    });
  });

  // ── Sales ──────────────────────────────────────────

  describe('Sales', () => {
    it('GET /pharmacy/sales', async () => {
      mockService.sales.mockResolvedValue([]);
      expect(await controller.sales()).toEqual([]);
    });

    it('POST /pharmacy/sales', async () => {
      mockService.createSale.mockResolvedValue({ id: '1', billNo: 'SB-001' });
      const result = await controller.createSale({ items: [] });
      expect(result.billNo).toBe('SB-001');
    });

    it('PATCH /pharmacy/sales/:id', async () => {
      mockService.updateSale.mockResolvedValue({ id: '1', status: 'completed' });
      const result = await controller.updateSale('1', { status: 'completed' });
      expect(result.status).toBe('completed');
    });

    it('DELETE /pharmacy/sales/:id', async () => {
      mockService.deleteSale.mockResolvedValue(undefined);
      await expect(controller.deleteSale('1')).resolves.toBeUndefined();
    });
  });

  // ── Invoices ───────────────────────────────────────

  describe('Invoices', () => {
    it('GET /pharmacy/invoices', async () => {
      mockService.invoices.mockResolvedValue([]);
      expect(await controller.invoices()).toEqual([]);
    });

    it('POST /pharmacy/invoices', async () => {
      mockService.createInvoice.mockResolvedValue({ id: '1' });
      const result = await controller.createInvoice({ salesBillId: 'sb1' });
      expect(result.id).toBe('1');
    });

    it('PATCH /pharmacy/invoices/:id', async () => {
      mockService.updateInvoice.mockResolvedValue({ id: '1', status: 'paid' });
      const result = await controller.updateInvoice('1', { status: 'paid' });
      expect(result.status).toBe('paid');
    });
  });

  // ── Returns ────────────────────────────────────────

  describe('Returns', () => {
    it('GET /pharmacy/returns', async () => {
      mockService.returns.mockResolvedValue([]);
      expect(await controller.returns()).toEqual([]);
    });

    it('POST /pharmacy/returns/customer', async () => {
      mockService.createCustomerReturn.mockResolvedValue({ id: '1' });
      const result = await controller.createCustomerReturn({ salesBillId: 'sb1', items: [] });
      expect(result.id).toBe('1');
    });

    it('POST /pharmacy/returns/supplier', async () => {
      mockService.createSupplierReturn.mockResolvedValue({ id: '1' });
      const result = await controller.createSupplierReturn({ supplierId: 's1', items: [] });
      expect(result.id).toBe('1');
    });

    it('PATCH /pharmacy/returns/:type/:id', async () => {
      mockService.updateCustomerReturn.mockResolvedValue({ id: '1', status: 'completed' });
      const result = await controller.updateReturn('customer', '1', { status: 'completed' });
      expect(result.status).toBe('completed');
    });
  });

  // ── Stores ─────────────────────────────────────────

  describe('Stores CRUD', () => {
    it('GET /pharmacy/stores', async () => {
      mockService.stores.mockResolvedValue([]);
      expect(await controller.stores()).toEqual([]);
    });

    it('POST /pharmacy/stores', async () => {
      mockService.createStore.mockResolvedValue({ id: '1' });
      const result = await controller.createStore({ name: 'New' });
      expect(result.id).toBe('1');
    });

    it('PATCH /pharmacy/stores/:id', async () => {
      mockService.updateStore.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await controller.updateStore('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  // ── Barcodes ───────────────────────────────────────

  describe('Barcodes', () => {
    it('GET /pharmacy/barcodes', async () => {
      mockService.barcodes.mockResolvedValue([]);
      expect(await controller.barcodes()).toEqual([]);
    });

    it('POST /pharmacy/barcodes', async () => {
      mockService.createBarcode.mockResolvedValue({ id: '1' });
      const result = await controller.createBarcode({ medicineId: 'm1' });
      expect(result.id).toBe('1');
    });

    it('DELETE /pharmacy/barcodes/:id', async () => {
      mockService.deleteBarcode.mockResolvedValue(undefined);
      await expect(controller.deleteBarcode('1')).resolves.toBeUndefined();
    });
  });

  // ── Notifications ──────────────────────────────────

  describe('Notifications', () => {
    it('GET /pharmacy/notifications', async () => {
      mockService.notifications.mockResolvedValue([]);
      expect(await controller.notifications()).toEqual([]);
    });

    it('PATCH /pharmacy/notifications/:id/read', async () => {
      mockService.markNotificationRead.mockResolvedValue({ id: '1', isRead: true });
      const result = await controller.markNotificationRead('1');
      expect(result.isRead).toBe(true);
    });
  });

  // ── Settings ───────────────────────────────────────

  describe('Settings', () => {
    it('GET /pharmacy/settings', async () => {
      mockService.settings.mockResolvedValue([]);
      expect(await controller.settings()).toEqual([]);
    });

    it('PATCH /pharmacy/settings/:id', async () => {
      mockService.updateSettings.mockResolvedValue({ setting: 'x', value: 'y' });
      const result = await controller.updateSettings('1', { setting: 'x', value: 'y' });
      expect(result.value).toBe('y');
    });
  });

  // ── Reports ────────────────────────────────────────

  describe('Reports', () => {
    it('GET /pharmacy/reports', async () => {
      mockService.reports.mockResolvedValue({ dailySummaries: [], auditLogs: [], suggestions: [] });
      const result = await controller.reports();
      expect(result).toHaveProperty('dailySummaries');
    });
  });
});
