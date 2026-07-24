import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function calculateDailySummaries() {
  console.log('Calculating Daily Summaries from real data...');
  
  // 1. Get the store
  const store = await prisma.store.findFirst({ where: { deletedAt: null } });
  if (!store) return console.log('No store');

  // Clear old daily summaries
  await prisma.dailySummary.deleteMany();

  // Get all transactions
  const transactions = await prisma.transaction.findMany({
    where: { storeId: store.id, deletedAt: null },
    orderBy: { date: 'asc' }
  });

  // Group by date
  const summariesByDate = new Map<string, any>();

  for (const tx of transactions) {
    // Treat the date as YYYY-MM-DD
    const dateStr = tx.date.toISOString().split('T')[0];
    if (!summariesByDate.has(dateStr)) {
      summariesByDate.set(dateStr, {
        storeId: store.id,
        summaryDate: new Date(dateStr),
        totalSales: 0,
        totalPurchases: 0,
        totalProfit: 0,
        totalBills: 0,
        totalItemsSold: 0,
        netProfit: 0,
        notes: 'Calculated from actual transactions'
      });
    }

    const summary = summariesByDate.get(dateStr);
    const amount = Number(tx.amount);

    if (tx.category === 'sales') {
      summary.totalSales += amount;
      summary.totalBills += 1;
      summary.netProfit += amount;
    } else if (tx.category === 'purchases') {
      summary.totalPurchases += amount;
      summary.netProfit -= amount;
    } else if (tx.type === 'income') {
      summary.netProfit += amount;
    } else if (tx.type === 'expense') {
      summary.netProfit -= amount;
    }
  }

  // Insert summaries
  for (const [_, summary] of summariesByDate) {
    summary.totalProfit = summary.netProfit;
    await prisma.dailySummary.create({ data: summary });
    console.log(`Created summary for ${summary.summaryDate.toISOString().split('T')[0]} - Net Profit: ${summary.netProfit}`);
  }

  console.log('Done!');
}

calculateDailySummaries().catch(console.error).finally(() => prisma.$disconnect());
