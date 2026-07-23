import * as dotenv from 'dotenv';
dotenv.config();
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding reports data...');

  // 1. Get a store
  const store = await prisma.store.findFirst();
  if (!store) {
    console.error('No store found. Please create a store first.');
    return;
  }
  console.log(`Using Store: ${store.name}`);

  // 2. Get a user
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('No user found. Please create a user first.');
    return;
  }
  console.log(`Using User: ${user.firstName}`);

  // 3. Get some medicines
  const medicines = await prisma.medicine.findMany({ take: 3 });
  if (medicines.length === 0) {
    console.error('No medicines found. Please create medicines first.');
    return;
  }

  // 4. Create Daily Summaries for the last 5 days
  console.log('Creating Daily Summaries...');
  const today = new Date();
  for (let i = 0; i < 5; i++) {
    const summaryDate = new Date(today);
    summaryDate.setDate(today.getDate() - i);
    summaryDate.setHours(0, 0, 0, 0);

    const existingSummary = await prisma.dailySummary.findFirst({
      where: { storeId: store.id, summaryDate }
    });

    if (!existingSummary) {
      await prisma.dailySummary.create({
        data: {
          storeId: store.id,
          summaryDate,
          totalSales: 1500 + Math.random() * 2000, // $1500 - $3500
          totalPurchases: 500 + Math.random() * 1000,
          totalProfit: 400 + Math.random() * 800,
          totalBills: Math.floor(20 + Math.random() * 50),
          totalItemsSold: Math.floor(100 + Math.random() * 200),
          netProfit: 300 + Math.random() * 600,
          notes: `System generated summary for demo - Day ${i + 1}`
        }
      });
    }
  }

  // 5. Create Audit Logs
  console.log('Creating Audit Logs...');
  const actions = ['USER_LOGIN', 'SALE_CREATED', 'STOCK_UPDATED', 'INVOICE_GENERATED', 'MEDICINE_ADDED'];
  const entities = ['Auth', 'SalesBill', 'Batch', 'PurchaseInvoice', 'Medicine'];
  
  for (let i = 0; i < 10; i++) {
    const logDate = new Date(today);
    logDate.setHours(today.getHours() - (Math.random() * 48)); // Within last 48 hours

    await prisma.auditLog.create({
      data: {
        storeId: store.id,
        userId: user.id,
        action: actions[i % actions.length],
        entityType: entities[i % entities.length],
        entityId: `OBJ-${Math.floor(1000 + Math.random() * 9000)}`,
        description: `User performed ${actions[i % actions.length]} on ${entities[i % entities.length]}`,
        createdAt: logDate
      }
    });
  }

  // 6. Create Purchase Suggestions
  console.log('Creating Purchase Suggestions...');
  for (let i = 0; i < medicines.length; i++) {
    const medicine = medicines[i];
    
    // Check if suggestion already exists
    const existing = await prisma.purchaseSuggestion.findFirst({
      where: { storeId: store.id, medicineId: medicine.id }
    });

    if (!existing) {
      const priority = i === 0 ? 'critical' : (i === 1 ? 'high' : 'medium');
      
      await prisma.purchaseSuggestion.create({
        data: {
          storeId: store.id,
          medicineId: medicine.id,
          currentStock: Math.floor(Math.random() * 10), // Low stock
          averageDailySale: 2 + Math.random() * 5,
          suggestedQuantity: 50 + Math.floor(Math.random() * 50),
          priority: priority,
          notes: `Automatically suggested due to low inventory levels.`,
        }
      });
    }
  }

  console.log('Successfully seeded reports data for the demo!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
