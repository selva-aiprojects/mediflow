export interface User {
  id: string
  storeId: string | null
  employeeCode: string | null
  firstName: string
  lastName: string | null
  email: string
  phone: string | null
  role: string
  isActive: boolean
  isFirstLogin: boolean
  lastLoginAt: string | null
  profilePicUrl: string | null
  createdAt: string
  updatedAt: string
  store?: Store
}

export interface Store {
  id: string
  code: string
  name: string
  addressLine1: string | null
  city: string | null
  state: string | null
  phone: string | null
  email: string | null
  isActive: boolean
  isHeadOffice: boolean
}

export interface DashboardStats {
  totalSales: number
  totalPurchases: number
  totalProfit: number
  totalBills: number
  totalItemsSold: number
  totalCustomers: number
  totalMedicines: number
  lowStockItems: number
  expiringItems: number
  pendingOrders: number
  todaySales: number
  todayBills: number
  yesterdaySales?: number
  yesterdayBills?: number
  salesDeltaPercent?: number
}

export interface SalesChartData {
  date: string
  sales: number
  profit: number
  bills: number
}

export interface TopMedicine {
  id: string
  name: string
  quantity: number
  amount: number
  percentage: number
}

export interface RecentActivity {
  id: string
  type: 'sale' | 'purchase' | 'return' | 'adjustment' | 'user'
  description: string
  amount: number
  timestamp: string
  user: string
}