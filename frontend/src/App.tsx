import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from '@/components/layout/Layout'
import LoginPage from '@/pages/LoginPage'
import LandingPage from '@/pages/LandingPage'
import DashboardPage from '@/pages/DashboardPage'
import UsersPage from '@/pages/UsersPage'
import MedicinesPage from '@/pages/MedicinesPage'
import SuppliersPage from '@/pages/SuppliersPage'
import CustomersPage from '@/pages/CustomersPage'
import DoctorsPage from '@/pages/DoctorsPage'
import SalesPage from '@/pages/SalesPage'
import InventoryPage from '@/pages/InventoryPage'
import PurchaseOrdersPage from '@/pages/PurchaseOrdersPage'
import GoodsReceiptPage from '@/pages/GoodsReceiptPage'
import ReturnsPage from '@/pages/ReturnsPage'
import StoresPage from '@/pages/StoresPage'
import BarcodesPage from '@/pages/BarcodesPage'
import InvoicesPage from '@/pages/InvoicesPage'
import NotificationsPage from '@/pages/NotificationsPage'
import SettingsPage from '@/pages/SettingsPage'
import ReportsPage from '@/pages/ReportsPage'
import AccountsPage from '@/pages/AccountsPage'
import ToastContainer from '@/components/ui/toast'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  if (!token) return <Navigate to="/welcome" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/welcome" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index element={<DashboardPage />} />
          <Route path="accounts" element={<AccountsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="sales" element={<SalesPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="medicines" element={<MedicinesPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="doctors" element={<DoctorsPage />} />
          <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
          <Route path="goods-receipt" element={<GoodsReceiptPage />} />
          <Route path="returns" element={<ReturnsPage />} />
          <Route path="stores" element={<StoresPage />} />
          <Route path="barcodes" element={<BarcodesPage />} />
          <Route path="invoices" element={<InvoicesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
