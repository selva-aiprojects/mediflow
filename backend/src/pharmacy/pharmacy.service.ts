import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

const take = 50;

function clean<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

@Injectable()
export class PharmacyService {
  constructor(private prisma: PrismaService) {}

  // ── Dashboard ──────────────────────────────────────

  async dashboardStats() {
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
    const yesterdayStart = new Date(todayStart); yesterdayStart.setDate(yesterdayStart.getDate() - 1)

    const [totalCustomers, totalMedicines, lowStockItems, expiringItems, pendingOrders,
      allSales, allPurchases, todayBillsData, yesterdayBillsData,
      todaySalesAgg, yesterdaySalesAgg] = await Promise.all([
      this.prisma.customer.count({ where: { deletedAt: null } }),
      this.prisma.medicine.count({ where: { deletedAt: null } }),
      this.prisma.batch.count({ where: { quantity: { lte: 10 }, deletedAt: null } }),
      this.prisma.batch.count({ where: { deletedAt: null, expiryDate: { lte: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60) } } }),
      this.prisma.purchaseOrder.count({ where: { status: { in: ['draft', 'submitted', 'pending'] }, deletedAt: null } }),
      this.prisma.salesItem.aggregate({ _sum: { totalAmount: true, quantity: true } }),
      this.prisma.purchaseInvoice.aggregate({ _sum: { totalAmount: true } }),
      this.prisma.salesBill.aggregate({ _count: true, where: { billDate: { gte: todayStart }, deletedAt: null } }),
      this.prisma.salesBill.aggregate({ _count: true, where: { billDate: { gte: yesterdayStart, lt: todayStart }, deletedAt: null } }),
      this.prisma.salesBill.aggregate({ _sum: { totalAmount: true }, where: { billDate: { gte: todayStart }, deletedAt: null } }),
      this.prisma.salesBill.aggregate({ _sum: { totalAmount: true }, where: { billDate: { gte: yesterdayStart, lt: todayStart }, deletedAt: null } }),
    ]);

    const totalSales = Number(allSales._sum.totalAmount || 0);
    const totalPurchases = Number(allPurchases._sum.totalAmount || 0);
    const todaySalesVal = Number(todaySalesAgg._sum.totalAmount || 0);
    const yesterdaySalesVal = Number(yesterdaySalesAgg._sum.totalAmount || 0);
    const todayBillCount = todayBillsData._count;
    const yesterdayBillCount = yesterdayBillsData._count;
    const salesDelta = yesterdaySalesVal > 0 ? Math.round((todaySalesVal - yesterdaySalesVal) / yesterdaySalesVal * 1000) / 10 : 0;

    return {
      totalSales, totalPurchases, totalProfit: Math.max(totalSales - totalPurchases, 0),
      totalBills: (await this.prisma.salesBill.aggregate({ _count: true, where: { deletedAt: null } }))._count,
      totalItemsSold: Number(allSales._sum.quantity || 0),
      totalCustomers, totalMedicines, lowStockItems, expiringItems, pendingOrders,
      todaySales: todaySalesVal, todayBills: todayBillCount,
      yesterdaySales: yesterdaySalesVal, yesterdayBills: yesterdayBillCount,
      salesDeltaPercent: salesDelta,
    };
  }

  async dashboardSalesChart(daysInput?: string) {
    const parsedDays = Number(daysInput);
    const days = Number.isInteger(parsedDays) ? Math.min(Math.max(parsedDays, 1), 90) : 7;
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - (days - 1));

    const bills = await this.prisma.salesBill.findMany({
      where: { deletedAt: null, billDate: { gte: start } },
      select: { billDate: true, totalAmount: true, salesItems: { select: { totalAmount: true, purchaseCost: true, quantity: true } } },
    });
    const byDate = new Map<string, { sales: number; profit: number; bills: number }>();
    for (const bill of bills) {
      const key = bill.billDate.toISOString().slice(0, 10);
      const totals = byDate.get(key) || { sales: 0, profit: 0, bills: 0 };
      totals.sales += Number(bill.totalAmount || 0);
      totals.profit += bill.salesItems.reduce((sum, item) => sum + Number(item.totalAmount || 0) - Number(item.purchaseCost || 0) * item.quantity, 0);
      totals.bills += 1;
      byDate.set(key, totals);
    }

    return Array.from({ length: days }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const key = date.toISOString().slice(0, 10);
      return { date: key, ...(byDate.get(key) || { sales: 0, profit: 0, bills: 0 }) };
    });
  }

  async topMedicines() {
    const grouped = await this.prisma.salesItem.groupBy({
      by: ['medicineId'], _sum: { quantity: true, totalAmount: true },
      orderBy: { _sum: { quantity: 'desc' } }, take: 5,
    });
    const medicines = await this.prisma.medicine.findMany({
      where: { id: { in: grouped.map((item) => item.medicineId) } },
      select: { id: true, brandName: true, category: { select: { name: true } } },
    });
    const medicineById = new Map(medicines.map((medicine) => [medicine.id, medicine]));
    return grouped.map((item) => {
      const medicine = medicineById.get(item.medicineId);
      return { id: item.medicineId, name: medicine?.brandName || 'Unknown', category: medicine?.category?.name || 'Uncategorised', quantity: Number(item._sum.quantity || 0), amount: Number(item._sum.totalAmount || 0) };
    });
  }

  async recentActivity() {
    return clean(await this.prisma.auditLog.findMany({
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: 'desc' }, take: 10,
    }));
  }

  // ── Users ──────────────────────────────────────────

  async users(query: Record<string, string>) {
    return clean(await this.prisma.user.findMany({
      where: {
        deletedAt: null,
        ...(query.role ? { role: query.role } : {}),
        ...(query.isActive ? { isActive: query.isActive === 'true' } : {}),
      },
      select: {
        id: true, storeId: true, employeeCode: true, firstName: true, lastName: true,
        email: true, phone: true, role: true, isActive: true, isFirstLogin: true,
        lastLoginAt: true, profilePicUrl: true, createdAt: true, updatedAt: true,
      },
      orderBy: { createdAt: 'desc' }, take,
    }));
  }

  async createUser(data: any) {
    const bcrypt = require('bcryptjs');
    const passwordHash = await bcrypt.hash(data.password || 'Temp@123', 10);
    return clean(await this.prisma.user.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || 'cashier',
        storeId: data.storeId,
        employeeCode: data.employeeCode,
        passwordHash,
      },
      select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
    }));
  }

  async updateUser(id: string, data: any) {
    const updateData: any = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.storeId !== undefined) updateData.storeId = data.storeId;
    return clean(await this.prisma.user.update({ where: { id }, data: updateData }));
  }

  async deleteUser(id: string) {
    return clean(await this.prisma.user.update({ where: { id }, data: { deletedAt: new Date() } }));
  }

  // ── Stores ─────────────────────────────────────────

  async stores() {
    return clean(await this.prisma.store.findMany({
      where: { deletedAt: null },
      include: { _count: { select: { users: true, batches: true, salesBills: true } } },
      orderBy: { createdAt: 'desc' }, take,
    }));
  }

  async createStore(data: any) {
    return clean(await this.prisma.store.create({
      data: {
        code: data.code,
        name: data.name,
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        phone: data.phone,
        email: data.email,
        gstin: data.gstin,
        drugLicenseNo: data.drugLicenseNo,
        isHeadOffice: data.isHeadOffice || false,
      },
    }));
  }

  async updateStore(id: string, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.addressLine1 !== undefined) updateData.addressLine1 = data.addressLine1;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    return clean(await this.prisma.store.update({ where: { id }, data: updateData }));
  }

  // ── Medicines ──────────────────────────────────────

  async medicines(query: Record<string, string>) {
    const search = query.search?.trim();
    return clean(await this.prisma.medicine.findMany({
      where: {
        deletedAt: null,
        ...(search ? {
          OR: [
            { brandName: { contains: search, mode: 'insensitive' } },
            { genericName: { contains: search, mode: 'insensitive' } },
            { barcode: { contains: search, mode: 'insensitive' } },
          ],
        } : {}),
      },
      include: {
        category: true,
        manufacturer: true,
        batches: { where: { deletedAt: null }, take: 5, orderBy: { expiryDate: 'asc' } },
      },
      orderBy: { brandName: 'asc' }, take,
    }));
  }

  async createMedicine(data: any) {
    return clean(await this.prisma.medicine.create({
      data: {
        brandName: data.brandName,
        genericName: data.genericName,
        strength: data.strength,
        form: data.form,
        schedule: data.schedule,
        categoryId: data.categoryId,
        manufacturerId: data.manufacturerId,
        gstPercent: data.gstPercent ? new Prisma.Decimal(data.gstPercent) : undefined,
        hsnCode: data.hsnCode,
        barcode: data.barcode,
        isBatchEnabled: data.isBatchEnabled ?? true,
        isExpiryEnabled: data.isExpiryEnabled ?? true,
        isPrescriptionRequired: data.isPrescriptionRequired ?? false,
        unitType: data.unitType || 'strip',
        minStockLevel: data.minStockLevel,
        maxStockLevel: data.maxStockLevel,
        reorderLevel: data.reorderLevel,
      },
      include: { category: true, manufacturer: true },
    }));
  }

  async updateMedicine(id: string, data: any) {
    const updateData: any = {};
    for (const key of ['brandName', 'genericName', 'strength', 'form', 'schedule', 'categoryId', 'manufacturerId', 'hsnCode', 'barcode', 'isBatchEnabled', 'isExpiryEnabled', 'isPrescriptionRequired', 'unitType', 'minStockLevel', 'maxStockLevel', 'reorderLevel', 'isActive']) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
    if (data.gstPercent !== undefined) updateData.gstPercent = new Prisma.Decimal(data.gstPercent);
    return clean(await this.prisma.medicine.update({ where: { id }, data: updateData, include: { category: true, manufacturer: true } }));
  }

  async deleteMedicine(id: string) {
    return clean(await this.prisma.medicine.update({ where: { id }, data: { deletedAt: new Date() } }));
  }

  // ── Inventory ──────────────────────────────────────

  async inventory() {
    return clean(await this.prisma.batch.findMany({
      where: { deletedAt: null },
      include: { medicine: true, store: true, supplier: true, rack: true },
      orderBy: [{ expiryDate: 'asc' }, { quantity: 'asc' }], take,
    }));
  }

  async adjustStock(data: any) {
    const batch = await this.prisma.batch.findUnique({ where: { id: data.batchId } });
    if (!batch) throw new Error('Batch not found');
    const newQuantity = batch.quantity + (data.quantity || 0);
    return clean(await this.prisma.batch.update({
      where: { id: data.batchId },
      data: { quantity: Math.max(0, newQuantity) },
    }));
  }

  // ── Suppliers ──────────────────────────────────────

  async suppliers() {
    return clean(await this.prisma.supplier.findMany({ where: { deletedAt: null }, orderBy: { companyName: 'asc' }, take }));
  }

  async createSupplier(data: any) {
    return clean(await this.prisma.supplier.create({
      data: {
        companyName: data.companyName,
        contactPerson: data.contactPerson,
        gstin: data.gstin,
        drugLicenseNo: data.drugLicenseNo,
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        phone: data.phone,
        email: data.email,
        creditDays: data.creditDays,
        leadTimeDays: data.leadTimeDays,
      },
    }));
  }

  async updateSupplier(id: string, data: any) {
    const updateData: any = {};
    for (const key of ['companyName', 'contactPerson', 'gstin', 'drugLicenseNo', 'addressLine1', 'city', 'state', 'phone', 'email', 'creditDays', 'leadTimeDays', 'isActive']) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
    return clean(await this.prisma.supplier.update({ where: { id }, data: updateData }));
  }

  async deleteSupplier(id: string) {
    return clean(await this.prisma.supplier.update({ where: { id }, data: { deletedAt: new Date() } }));
  }

  // ── Customers ──────────────────────────────────────

  async customers() {
    return clean(await this.prisma.customer.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' }, take }));
  }

  async createCustomer(data: any) {
    return clean(await this.prisma.customer.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        mobile: data.mobile,
        email: data.email,
        addressLine1: data.addressLine1,
        city: data.city,
        state: data.state,
        storeId: data.storeId,
        dateOfBirth: data.dateOfBirth,
        gender: data.gender,
        isCreditAllowed: data.isCreditAllowed ?? false,
        creditLimit: data.creditLimit,
      },
    }));
  }

  async updateCustomer(id: string, data: any) {
    const updateData: any = {};
    for (const key of ['firstName', 'lastName', 'mobile', 'email', 'addressLine1', 'city', 'state', 'isCreditAllowed', 'creditLimit', 'isActive']) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
    return clean(await this.prisma.customer.update({ where: { id }, data: updateData }));
  }

  async deleteCustomer(id: string) {
    return clean(await this.prisma.customer.update({ where: { id }, data: { deletedAt: new Date() } }));
  }

  // ── Doctors ────────────────────────────────────────

  async doctors() {
    return clean(await this.prisma.doctor.findMany({ where: { deletedAt: null }, orderBy: { name: 'asc' }, take }));
  }

  async createDoctor(data: any) {
    return clean(await this.prisma.doctor.create({
      data: {
        name: data.name,
        speciality: data.speciality,
        clinicHospital: data.clinicHospital,
        registrationNo: data.registrationNo,
        mobile: data.mobile,
        email: data.email,
        address: data.address,
      },
    }));
  }

  async updateDoctor(id: string, data: any) {
    const updateData: any = {};
    for (const key of ['name', 'speciality', 'clinicHospital', 'registrationNo', 'mobile', 'email', 'address', 'isActive']) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }
    return clean(await this.prisma.doctor.update({ where: { id }, data: updateData }));
  }

  async deleteDoctor(id: string) {
    return clean(await this.prisma.doctor.update({ where: { id }, data: { deletedAt: new Date() } }));
  }

  // ── Purchase Orders ────────────────────────────────

  async purchaseOrders() {
    return clean(await this.prisma.purchaseOrder.findMany({
      where: { deletedAt: null },
      include: { store: true, supplier: true, items: { include: { medicine: true } } },
      orderBy: { createdAt: 'desc' }, take,
    }));
  }

  async createPurchaseOrder(data: any) {
    const lastPO = await this.prisma.purchaseOrder.findFirst({
      where: { storeId: data.storeId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { poNo: true },
    });
    const nextNo = lastPO ? String(Number(lastPO.poNo.replace('PO-', '')) + 1).padStart(4, '0') : '0001';
    const storeId = data.storeId || (await this.prisma.store.findFirst({ where: { deletedAt: null }, select: { id: true } }))?.id;

    return clean(await this.prisma.purchaseOrder.create({
      data: {
        storeId,
        supplierId: data.supplierId,
        poNo: `PO-${nextNo}`,
        expectedDelivery: data.expectedDelivery,
        status: 'draft',
        notes: data.notes,
        createdBy: data.createdBy,
        items: data.items?.length ? {
          create: data.items.map((item: any, index: number) => ({
            medicineId: item.medicineId,
            itemNo: index + 1,
            quantityOrdered: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            mrp: item.mrp ? new Prisma.Decimal(item.mrp) : undefined,
            gstPercent: item.gstPercent ? new Prisma.Decimal(item.gstPercent) : undefined,
            totalAmount: new Prisma.Decimal(item.totalAmount || item.quantity * item.unitPrice),
          })),
        } : undefined,
      },
      include: { supplier: true, items: true },
    }));
  }

  async updatePurchaseOrder(id: string, data: any) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    return clean(await this.prisma.purchaseOrder.update({ where: { id }, data: updateData }));
  }

  async deletePurchaseOrder(id: string) {
    return clean(await this.prisma.purchaseOrder.update({ where: { id }, data: { deletedAt: new Date() } }));
  }

  // ── Goods Receipt ──────────────────────────────────

  async goodsReceipts() {
    return clean(await this.prisma.goodsReceiptNote.findMany({
      where: { deletedAt: null },
      include: { supplier: true, store: true, items: { include: { medicine: true } } },
      orderBy: { createdAt: 'desc' }, take,
    }));
  }

  async createGoodsReceipt(data: any) {
    const storeId = data.storeId || (await this.prisma.store.findFirst({ where: { deletedAt: null }, select: { id: true } }))?.id;
    const lastGRN = await this.prisma.goodsReceiptNote.findFirst({
      where: { storeId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      select: { grnNo: true },
    });
    const nextNo = lastGRN ? String(Number(lastGRN.grnNo.replace('GRN-', '')) + 1).padStart(4, '0') : '0001';

    const grn = await this.prisma.goodsReceiptNote.create({
      data: {
        storeId,
        supplierId: data.supplierId,
        poId: data.poId,
        grnNo: `GRN-${nextNo}`,
        invoiceNo: data.invoiceNo,
        invoiceDate: data.invoiceDate,
        status: 'pending',
        notes: data.notes,
        createdBy: data.createdBy,
        items: data.items?.length ? {
          create: data.items.map((item: any) => ({
            medicineId: item.medicineId,
            poItemId: item.poItemId,
            batchNo: item.batchNo,
            expiryDate: new Date(item.expiryDate),
            mrp: new Prisma.Decimal(item.mrp),
            unitPrice: new Prisma.Decimal(item.unitPrice),
            quantity: item.quantity,
            freeQuantity: item.freeQuantity || 0,
            gstPercent: item.gstPercent ? new Prisma.Decimal(item.gstPercent) : undefined,
            totalAmount: new Prisma.Decimal(item.totalAmount || item.quantity * item.unitPrice),
            sellingPrice: item.sellingPrice ? new Prisma.Decimal(item.sellingPrice) : undefined,
          })),
        } : undefined,
      },
      include: { supplier: true, items: true },
    });

    if (data.status === 'completed' && data.items?.length) {
      for (const item of data.items) {
        await this.prisma.batch.upsert({
          where: { medicineId_storeId_batchNo: { medicineId: item.medicineId, storeId, batchNo: item.batchNo } },
          create: {
            medicineId: item.medicineId, storeId, batchNo: item.batchNo,
            mrp: new Prisma.Decimal(item.mrp),
            purchasePrice: new Prisma.Decimal(item.unitPrice),
            sellingPrice: new Prisma.Decimal(item.sellingPrice || item.mrp),
            gstPercent: item.gstPercent ? new Prisma.Decimal(item.gstPercent) : 0,
            quantity: item.quantity,
            initialQuantity: item.quantity,
            expiryDate: new Date(item.expiryDate),
            supplierId: data.supplierId,
          },
          update: { quantity: { increment: item.quantity } },
        });
      }
    }
    return clean(grn);
  }

  async updateGoodsReceipt(id: string, data: any) {
    return clean(await this.prisma.goodsReceiptNote.update({ where: { id }, data: { status: data.status, notes: data.notes } }));
  }

  // ── Sales ──────────────────────────────────────────

  async sales() {
    return clean(await this.prisma.salesBill.findMany({
      where: { deletedAt: null },
      include: { customer: true, store: true, salesItems: { include: { medicine: true } }, payments: true },
      orderBy: { createdAt: 'desc' }, take,
    }));
  }

  async createSale(data: any) {
    const storeId = data.storeId || (await this.prisma.store.findFirst({ where: { deletedAt: null }, select: { id: true } }))?.id;
    const today = new Date();
    const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    const prefix = `PH-${dateStr}-`;

    const lastBill = await this.prisma.salesBill.findFirst({
      where: { storeId, deletedAt: null, billNo: { startsWith: prefix } },
      orderBy: { createdAt: 'desc' },
      select: { billNo: true },
    });
    
    let nextNo = '0001';
    if (lastBill && lastBill.billNo) {
       const lastSequence = lastBill.billNo.split('-').pop();
       if (lastSequence && !isNaN(Number(lastSequence))) {
         nextNo = String(Number(lastSequence) + 1).padStart(4, '0');
       }
    }
    const newBillNo = `${prefix}${nextNo}`;

    let subtotal = 0;
    let totalGst = 0;
    const items = (data.items || []).map((item: any, index: number) => {
      const lineTotal = item.quantity * item.unitPrice;
      const lineGst = lineTotal * ((item.gstPercent || 0) / 100);
      subtotal += lineTotal;
      totalGst += lineGst;
      return {
        medicineId: item.medicineId,
        batchId: item.batchId,
        batchNo: item.batchNo,
        expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
        itemNo: index + 1,
        medicineName: item.medicineName,
        genericName: item.genericName,
        quantity: item.quantity,
        unitPrice: new Prisma.Decimal(item.unitPrice),
        gstPercent: item.gstPercent ? new Prisma.Decimal(item.gstPercent) : 0,
        gstAmount: new Prisma.Decimal(lineGst),
        totalAmount: new Prisma.Decimal(lineTotal),
        purchaseCost: item.purchaseCost ? new Prisma.Decimal(item.purchaseCost) : undefined,
      };
    });

    const totalAmount = subtotal + totalGst;
    const paidAmount = data.paidAmount || totalAmount;

    const bill = await this.prisma.salesBill.create({
      data: {
        storeId,
        customerId: data.customerId,
        billNo: newBillNo,
        subtotal: new Prisma.Decimal(subtotal),
        gstAmount: new Prisma.Decimal(totalGst),
        totalAmount: new Prisma.Decimal(totalAmount),
        paidAmount: new Prisma.Decimal(paidAmount),
        balanceAmount: new Prisma.Decimal(totalAmount - paidAmount),
        paymentMode: data.paymentMode || 'cash',
        paymentStatus: paidAmount >= totalAmount ? 'paid' : 'partial',
        isCreditSale: data.paymentMode === 'credit',
        createdBy: data.createdBy,
        salesItems: { create: items },
        payments: data.paymentMode ? {
          create: {
            paymentNo: `PAY-${nextNo}`,
            paymentMode: data.paymentMode || 'cash',
            amount: new Prisma.Decimal(paidAmount),
            createdBy: data.createdBy,
          },
        } : undefined,
      },
      include: { salesItems: true, payments: true },
    });

    for (const item of data.items || []) {
      if (item.batchId) {
        await this.prisma.batch.update({
          where: { id: item.batchId },
          data: { quantity: { decrement: item.quantity } },
        });
      }
    }
    return clean(bill);
  }

  async updateSale(id: string, data: any) {
    const updateData: any = {};
    if (data.status) updateData.billStatus = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    return clean(await this.prisma.salesBill.update({ where: { id }, data: updateData }));
  }

  async deleteSale(id: string) {
    return clean(await this.prisma.salesBill.update({ where: { id }, data: { deletedAt: new Date(), billStatus: 'cancelled' } }));
  }

  // ── Invoices ───────────────────────────────────────

  async invoices() {
    return clean(await this.prisma.purchaseInvoice.findMany({
      where: { deletedAt: null },
      include: { supplier: true, store: true, payments: true },
      orderBy: { createdAt: 'desc' }, take,
    }));
  }

  async createInvoice(data: any) {
    const storeId = data.storeId || (await this.prisma.store.findFirst({ where: { deletedAt: null }, select: { id: true } }))?.id;
    return clean(await this.prisma.purchaseInvoice.create({
      data: {
        storeId,
        supplierId: data.supplierId,
        grnId: data.grnId,
        poId: data.poId,
        invoiceNo: data.invoiceNo,
        invoiceDate: new Date(data.invoiceDate),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        totalAmount: new Prisma.Decimal(data.totalAmount),
        paidAmount: new Prisma.Decimal(data.paidAmount || 0),
        balanceAmount: new Prisma.Decimal(data.totalAmount - (data.paidAmount || 0)),
        paymentStatus: (data.paidAmount || 0) >= data.totalAmount ? 'paid' : 'unpaid',
        createdBy: data.createdBy,
      },
      include: { supplier: true },
    }));
  }

  async updateInvoice(id: string, data: any) {
    const updateData: any = {};
    if (data.paymentStatus) updateData.paymentStatus = data.paymentStatus;
    if (data.status) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes;
    return clean(await this.prisma.purchaseInvoice.update({ where: { id }, data: updateData }));
  }

  // ── Returns ────────────────────────────────────────

  async returns() {
    const [customerReturns, supplierReturns] = await Promise.all([
      this.prisma.customerReturn.findMany({ where: { deletedAt: null }, include: { bill: true, items: true }, take }),
      this.prisma.supplierReturn.findMany({ where: { deletedAt: null }, include: { supplier: true, items: true }, take }),
    ]);
    return clean([...customerReturns.map((item) => ({ ...item, returnType: 'customer' })), ...supplierReturns.map((item) => ({ ...item, returnType: 'supplier' }))]);
  }

  async createCustomerReturn(data: any) {
    const storeId = data.storeId || (await this.prisma.store.findFirst({ where: { deletedAt: null }, select: { id: true } }))?.id;
    const lastRet = await this.prisma.customerReturn.findFirst({ where: { storeId, deletedAt: null }, orderBy: { createdAt: 'desc' }, select: { returnNo: true } });
    const nextNo = lastRet ? String(Number(lastRet.returnNo.replace('RET-C-', '')) + 1).padStart(4, '0') : '0001';

    return clean(await this.prisma.customerReturn.create({
      data: {
        storeId, billId: data.billId,
        returnNo: `RET-C-${nextNo}`,
        reason: data.reason,
        refundAmount: data.refundAmount ? new Prisma.Decimal(data.refundAmount) : 0,
        createdBy: data.createdBy,
        items: data.items?.length ? {
          create: data.items.map((item: any) => ({
            salesItemId: item.salesItemId,
            medicineId: item.medicineId,
            batchId: item.batchId,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            totalAmount: new Prisma.Decimal(item.totalAmount || item.quantity * item.unitPrice),
            reason: item.reason,
          })),
        } : undefined,
      },
      include: { items: true },
    }));
  }

  async createSupplierReturn(data: any) {
    const storeId = data.storeId || (await this.prisma.store.findFirst({ where: { deletedAt: null }, select: { id: true } }))?.id;
    const lastRet = await this.prisma.supplierReturn.findFirst({ where: { storeId, deletedAt: null }, orderBy: { createdAt: 'desc' }, select: { returnNo: true } });
    const nextNo = lastRet ? String(Number(lastRet.returnNo.replace('RET-S-', '')) + 1).padStart(4, '0') : '0001';

    return clean(await this.prisma.supplierReturn.create({
      data: {
        storeId, supplierId: data.supplierId,
        returnNo: `RET-S-${nextNo}`,
        reason: data.reason,
        creditAmount: data.creditAmount ? new Prisma.Decimal(data.creditAmount) : 0,
        createdBy: data.createdBy,
        items: data.items?.length ? {
          create: data.items.map((item: any) => ({
            medicineId: item.medicineId,
            batchId: item.batchId,
            quantity: item.quantity,
            unitPrice: new Prisma.Decimal(item.unitPrice),
            totalAmount: new Prisma.Decimal(item.totalAmount || item.quantity * item.unitPrice),
            reason: item.reason,
          })),
        } : undefined,
      },
      include: { supplier: true, items: true },
    }));
  }

  async updateCustomerReturn(id: string, data: any) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    return clean(await this.prisma.customerReturn.update({ where: { id }, data: updateData }));
  }

  async updateSupplierReturn(id: string, data: any) {
    const updateData: any = {};
    if (data.status) updateData.status = data.status;
    return clean(await this.prisma.supplierReturn.update({ where: { id }, data: updateData }));
  }

  // ── Barcodes ───────────────────────────────────────

  async barcodes() {
    return clean(await this.prisma.barcodeLabel.findMany({
      where: { deletedAt: null },
      include: { medicine: true, batch: true, store: true },
      orderBy: { createdAt: 'desc' }, take,
    }));
  }

  async createBarcode(data: any) {
    const storeId = data.storeId || (await this.prisma.store.findFirst({ where: { deletedAt: null }, select: { id: true } }))?.id;
    return clean(await this.prisma.barcodeLabel.create({
      data: {
        storeId,
        medicineId: data.medicineId,
        batchId: data.batchId,
        labelType: data.labelType || 'medicine',
        barcodeData: data.barcodeData,
        barcodeFormat: data.barcodeFormat || 'CODE128',
        createdBy: data.createdBy,
      },
      include: { medicine: true },
    }));
  }

  async deleteBarcode(id: string) {
    return clean(await this.prisma.barcodeLabel.update({ where: { id }, data: { deletedAt: new Date() } }));
  }

  // ── Notifications ──────────────────────────────────

  async notifications() {
    return clean(await this.prisma.notificationLog.findMany({ orderBy: { createdAt: 'desc' }, take }));
  }

  async markNotificationRead(id: string) {
    return clean(await this.prisma.notificationLog.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    }));
  }

  // ── Reports ────────────────────────────────────────

  async reports() {
    const [dailySummaries, auditLogs, suggestions] = await Promise.all([
      this.prisma.dailySummary.findMany({ include: { store: true }, orderBy: { summaryDate: 'desc' }, take }),
      this.prisma.auditLog.findMany({ include: { user: { select: { firstName: true, lastName: true } }, store: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 20 }),
      this.prisma.purchaseSuggestion.findMany({ include: { medicine: true, supplier: true, store: true }, orderBy: { createdAt: 'desc' }, take }),
    ]);
    return clean({ dailySummaries, auditLogs, suggestions });
  }

  // ── Settings ───────────────────────────────────────

  async settings() {
    const [stores, users] = await Promise.all([
      this.prisma.store.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'asc' }, take: 10 }),
      this.prisma.user.findMany({
        where: { deletedAt: null },
        select: { id: true, firstName: true, lastName: true, email: true, role: true, isActive: true },
        orderBy: { createdAt: 'asc' }, take: 10,
      }),
    ]);
    return clean([
      { id: 'business-profile', setting: 'Business profile', value: stores[0]?.name || 'Head Office', status: 'active', owner: 'Admin' },
      { id: 'store-count', setting: 'Configured stores', value: stores.length, status: 'active', owner: 'Operations' },
      { id: 'user-count', setting: 'Active users', value: users.filter((user) => user.isActive).length, status: 'active', owner: 'Admin' },
      { id: 'tax-mode', setting: 'GST billing', value: 'Enabled', status: 'active', owner: 'Finance' },
    ]);
  }

  async updateSettings(id: string, data: any) {
    return { id, ...data, updatedAt: new Date() };
  }

  // ── Accounts ───────────────────────────────────────
  async accounts(query: Record<string, string>) {
    const storeId = query.storeId || (await this.prisma.store.findFirst({ where: { deletedAt: null }, select: { id: true } }))?.id;
    return clean(await this.prisma.account.findMany({
      where: { storeId, deletedAt: null },
      orderBy: { name: 'asc' },
    }));
  }

  async createAccount(data: any) {
    const storeId = data.storeId || (await this.prisma.store.findFirst({ where: { deletedAt: null }, select: { id: true } }))?.id;
    return clean(await this.prisma.account.create({
      data: {
        storeId,
        name: data.name,
        type: data.type,
        description: data.description,
        balance: data.balance || 0,
      }
    }));
  }

  async updateAccount(id: string, data: any) {
    return clean(await this.prisma.account.update({
      where: { id },
      data: {
        name: data.name,
        type: data.type,
        description: data.description,
        balance: data.balance,
        isActive: data.isActive,
      }
    }));
  }

  async deleteAccount(id: string) {
    return clean(await this.prisma.account.update({
      where: { id },
      data: { deletedAt: new Date() }
    }));
  }

  // ── Transactions ───────────────────────────────────
  async transactions(query: Record<string, string>) {
    const storeId = query.storeId || (await this.prisma.store.findFirst({ where: { deletedAt: null }, select: { id: true } }))?.id;
    return clean(await this.prisma.transaction.findMany({
      where: {
        storeId,
        accountId: query.accountId || undefined,
        deletedAt: null
      },
      include: {
        account: { select: { name: true, type: true } },
        createdByUser: { select: { firstName: true, lastName: true } }
      },
      orderBy: { date: 'desc' },
    }));
  }

  async createTransaction(data: any) {
    const storeId = data.storeId || (await this.prisma.store.findFirst({ where: { deletedAt: null }, select: { id: true } }))?.id;
    
    const transaction = await this.prisma.transaction.create({
      data: {
        storeId,
        accountId: data.accountId,
        type: data.type,
        amount: data.amount,
        date: data.date ? new Date(data.date) : new Date(),
        reference: data.reference,
        description: data.description,
        createdBy: data.createdBy
      },
      include: {
        account: { select: { name: true, type: true } },
        createdByUser: { select: { firstName: true, lastName: true } }
      }
    });

    const account = await this.prisma.account.findUnique({ where: { id: data.accountId } });
    if (account) {
      const amt = Number(data.amount);
      const isIncrease = (account.type === 'asset' || account.type === 'expense') ? data.type === 'debit' : data.type === 'credit';
      const balanceChange = isIncrease ? amt : -amt;

      await this.prisma.account.update({
        where: { id: account.id },
        data: {
          balance: { increment: balanceChange }
        }
      });
    }

    return clean(transaction);
  }
}
