import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PharmacyService } from './pharmacy.service';

@UseGuards(AuthGuard('jwt'))
@Controller()
export class PharmacyController {
  constructor(private readonly pharmacy: PharmacyService) {}

  // ── Dashboard ──────────────────────────────────────
  @Get('dashboard/stats')
  dashboardStats() { return this.pharmacy.dashboardStats(); }

  @Get('dashboard/sales-chart')
  dashboardSalesChart(@Query('days') days?: string) { return this.pharmacy.dashboardSalesChart(days); }

  @Get('dashboard/top-medicines')
  topMedicines() { return this.pharmacy.topMedicines(); }

  @Get('dashboard/recent-activity')
  recentActivity() { return this.pharmacy.recentActivity(); }

  // ── Users ──────────────────────────────────────────
  @Get('users')
  users(@Query() query: Record<string, string>) { return this.pharmacy.users(query); }

  @Post('users')
  createUser(@Body() body: any) { return this.pharmacy.createUser(body); }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() body: any) { return this.pharmacy.updateUser(id, body); }

  @Delete('users/:id')
  deleteUser(@Param('id') id: string) { return this.pharmacy.deleteUser(id); }

  // ── Stores ─────────────────────────────────────────
  @Get('stores')
  stores() { return this.pharmacy.stores(); }

  @Post('stores')
  createStore(@Body() body: any) { return this.pharmacy.createStore(body); }

  @Patch('stores/:id')
  updateStore(@Param('id') id: string, @Body() body: any) { return this.pharmacy.updateStore(id, body); }

  // ── Medicines ──────────────────────────────────────
  @Get('medicines')
  medicines(@Query() query: Record<string, string>) { return this.pharmacy.medicines(query); }

  @Post('medicines')
  createMedicine(@Body() body: any) { return this.pharmacy.createMedicine(body); }

  @Patch('medicines/:id')
  updateMedicine(@Param('id') id: string, @Body() body: any) { return this.pharmacy.updateMedicine(id, body); }

  @Delete('medicines/:id')
  deleteMedicine(@Param('id') id: string) { return this.pharmacy.deleteMedicine(id); }

  // ── Inventory ──────────────────────────────────────
  @Get('inventory')
  inventory() { return this.pharmacy.inventory(); }

  @Post('inventory/adjust')
  adjustStock(@Body() body: any) { return this.pharmacy.adjustStock(body); }

  // ── Suppliers ──────────────────────────────────────
  @Get('suppliers')
  suppliers() { return this.pharmacy.suppliers(); }

  @Post('suppliers')
  createSupplier(@Body() body: any) { return this.pharmacy.createSupplier(body); }

  @Patch('suppliers/:id')
  updateSupplier(@Param('id') id: string, @Body() body: any) { return this.pharmacy.updateSupplier(id, body); }

  @Delete('suppliers/:id')
  deleteSupplier(@Param('id') id: string) { return this.pharmacy.deleteSupplier(id); }

  // ── Customers ──────────────────────────────────────
  @Get('customers')
  customers() { return this.pharmacy.customers(); }

  @Post('customers')
  createCustomer(@Body() body: any) { return this.pharmacy.createCustomer(body); }

  @Patch('customers/:id')
  updateCustomer(@Param('id') id: string, @Body() body: any) { return this.pharmacy.updateCustomer(id, body); }

  @Delete('customers/:id')
  deleteCustomer(@Param('id') id: string) { return this.pharmacy.deleteCustomer(id); }

  // ── Doctors ────────────────────────────────────────
  @Get('doctors')
  doctors() { return this.pharmacy.doctors(); }

  @Post('doctors')
  createDoctor(@Body() body: any) { return this.pharmacy.createDoctor(body); }

  @Patch('doctors/:id')
  updateDoctor(@Param('id') id: string, @Body() body: any) { return this.pharmacy.updateDoctor(id, body); }

  @Delete('doctors/:id')
  deleteDoctor(@Param('id') id: string) { return this.pharmacy.deleteDoctor(id); }

  // ── Purchase Orders ────────────────────────────────
  @Get('purchase-orders')
  purchaseOrders() { return this.pharmacy.purchaseOrders(); }

  @Post('purchase-orders')
  createPurchaseOrder(@Body() body: any) { return this.pharmacy.createPurchaseOrder(body); }

  @Patch('purchase-orders/:id')
  updatePurchaseOrder(@Param('id') id: string, @Body() body: any) { return this.pharmacy.updatePurchaseOrder(id, body); }

  @Delete('purchase-orders/:id')
  deletePurchaseOrder(@Param('id') id: string) { return this.pharmacy.deletePurchaseOrder(id); }

  // ── Goods Receipt ──────────────────────────────────
  @Get('goods-receipt')
  goodsReceipts() { return this.pharmacy.goodsReceipts(); }

  @Post('goods-receipt')
  createGoodsReceipt(@Body() body: any) { return this.pharmacy.createGoodsReceipt(body); }

  @Patch('goods-receipt/:id')
  updateGoodsReceipt(@Param('id') id: string, @Body() body: any) { return this.pharmacy.updateGoodsReceipt(id, body); }

  // ── Sales ──────────────────────────────────────────
  @Get('sales')
  sales() { return this.pharmacy.sales(); }

  @Post('sales')
  createSale(@Body() body: any) { return this.pharmacy.createSale(body); }

  @Patch('sales/:id')
  updateSale(@Param('id') id: string, @Body() body: any) { return this.pharmacy.updateSale(id, body); }

  @Delete('sales/:id')
  deleteSale(@Param('id') id: string) { return this.pharmacy.deleteSale(id); }

  // ── Invoices ───────────────────────────────────────
  @Get('invoices')
  invoices() { return this.pharmacy.invoices(); }

  @Post('invoices')
  createInvoice(@Body() body: any) { return this.pharmacy.createInvoice(body); }

  @Patch('invoices/:id')
  updateInvoice(@Param('id') id: string, @Body() body: any) { return this.pharmacy.updateInvoice(id, body); }

  // ── Returns ────────────────────────────────────────
  @Get('returns')
  returns() { return this.pharmacy.returns(); }

  @Post('returns/customer')
  createCustomerReturn(@Body() body: any) { return this.pharmacy.createCustomerReturn(body); }

  @Post('returns/supplier')
  createSupplierReturn(@Body() body: any) { return this.pharmacy.createSupplierReturn(body); }

  @Patch('returns/:type/:id')
  updateReturn(@Param('type') type: string, @Param('id') id: string, @Body() body: any) {
    return type === 'supplier' ? this.pharmacy.updateSupplierReturn(id, body) : this.pharmacy.updateCustomerReturn(id, body);
  }

  // ── Barcodes ───────────────────────────────────────
  @Get('barcodes')
  barcodes() { return this.pharmacy.barcodes(); }

  @Post('barcodes')
  createBarcode(@Body() body: any) { return this.pharmacy.createBarcode(body); }

  @Delete('barcodes/:id')
  deleteBarcode(@Param('id') id: string) { return this.pharmacy.deleteBarcode(id); }

  // ── Notifications ──────────────────────────────────
  @Get('notifications')
  notifications() { return this.pharmacy.notifications(); }

  @Patch('notifications/:id/read')
  markNotificationRead(@Param('id') id: string) { return this.pharmacy.markNotificationRead(id); }

  // ── Reports ────────────────────────────────────────
  @Get('reports')
  reports() { return this.pharmacy.reports(); }

  // ── Settings ───────────────────────────────────────
  @Get('settings')
  settings() { return this.pharmacy.settings(); }

  @Patch('settings/:id')
  updateSettings(@Param('id') id: string, @Body() body: any) { return this.pharmacy.updateSettings(id, body); }
}
