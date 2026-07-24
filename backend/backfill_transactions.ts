import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfill() {
  console.log('Starting backfill for existing transactions...');
  
  // 1. Backfill Sales Bills
  const sales = await prisma.salesBill.findMany({ where: { deletedAt: null } });
  for (const sale of sales) {
    const existing = await prisma.transaction.findFirst({
      where: { reference: sale.billNo, category: 'sales' }
    });
    if (!existing) {
      console.log(`Backfilling sale: ${sale.billNo} for amount: ${sale.totalAmount}`);
      await prisma.transaction.create({
        data: {
          storeId: sale.storeId,
          category: 'sales',
          type: 'income',
          amount: sale.totalAmount,
          date: sale.createdAt,
          reference: sale.billNo,
          description: 'Sales bill total (backfilled)',
          createdBy: sale.createdBy,
        }
      });
    }
  }

  // 2. Backfill Purchase Invoices
  const purchases = await prisma.purchaseInvoice.findMany({ where: { deletedAt: null } });
  for (const p of purchases) {
    const existing = await prisma.transaction.findFirst({
      where: { reference: p.invoiceNo, category: 'purchases' }
    });
    if (!existing) {
      console.log(`Backfilling purchase: ${p.invoiceNo} for amount: ${p.totalAmount}`);
      await prisma.transaction.create({
        data: {
          storeId: p.storeId,
          category: 'purchases',
          type: 'expense',
          amount: p.totalAmount,
          date: p.createdAt,
          reference: p.invoiceNo,
          description: 'Purchase invoice (backfilled)',
          createdBy: p.createdBy,
        }
      });
    }
  }

  // 3. Backfill Customer Returns
  const custReturns = await prisma.customerReturn.findMany({ where: { deletedAt: null } });
  for (const r of custReturns) {
    const existing = await prisma.transaction.findFirst({
      where: { reference: r.returnNo, category: 'sales_returns' }
    });
    if (!existing && Number(r.refundAmount) > 0) {
      console.log(`Backfilling customer return: ${r.returnNo} for amount: ${r.refundAmount}`);
      await prisma.transaction.create({
        data: {
          storeId: r.storeId,
          category: 'sales_returns',
          type: 'expense',
          amount: r.refundAmount,
          date: r.createdAt,
          reference: r.returnNo,
          description: 'Customer refund (backfilled)',
          createdBy: r.createdBy,
        }
      });
    }
  }

  // 4. Backfill Supplier Returns
  const supReturns = await prisma.supplierReturn.findMany({ where: { deletedAt: null } });
  for (const r of supReturns) {
    const existing = await prisma.transaction.findFirst({
      where: { reference: r.returnNo, category: 'purchases_returns' }
    });
    if (!existing && Number(r.creditAmount) > 0) {
      console.log(`Backfilling supplier return: ${r.returnNo} for amount: ${r.creditAmount}`);
      await prisma.transaction.create({
        data: {
          storeId: r.storeId,
          category: 'purchases_returns',
          type: 'income',
          amount: r.creditAmount,
          date: r.createdAt,
          reference: r.returnNo,
          description: 'Supplier return credit (backfilled)',
          createdBy: r.createdBy,
        }
      });
    }
  }

  console.log('Backfill completed successfully!');
}

backfill().catch(console.error).finally(() => prisma.$disconnect());
