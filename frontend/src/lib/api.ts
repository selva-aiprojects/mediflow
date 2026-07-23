import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export default api

export const authApi = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/profile'),
}

export const usersApi = {
  getAll: (params?: { storeId?: string; role?: string; isActive?: boolean }) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.patch(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
}

export const storesApi = {
  getAll: () => api.get('/stores'),
  getById: (id: string) => api.get(`/stores/${id}`),
  create: (data: any) => api.post('/stores', data),
  update: (id: string, data: any) => api.patch(`/stores/${id}`, data),
}

export const medicinesApi = {
  getAll: (params?: { search?: string; categoryId?: string; page?: number; limit?: number }) => api.get('/medicines', { params }),
  getById: (id: string) => api.get(`/medicines/${id}`),
  create: (data: any) => api.post('/medicines', data),
  update: (id: string, data: any) => api.patch(`/medicines/${id}`, data),
  delete: (id: string) => api.delete(`/medicines/${id}`),
}

export const suppliersApi = {
  getAll: () => api.get('/suppliers'),
  getById: (id: string) => api.get(`/suppliers/${id}`),
  create: (data: any) => api.post('/suppliers', data),
  update: (id: string, data: any) => api.patch(`/suppliers/${id}`, data),
  delete: (id: string) => api.delete(`/suppliers/${id}`),
}

export const customersApi = {
  getAll: () => api.get('/customers'),
  getById: (id: string) => api.get(`/customers/${id}`),
  create: (data: any) => api.post('/customers', data),
  update: (id: string, data: any) => api.patch(`/customers/${id}`, data),
  delete: (id: string) => api.delete(`/customers/${id}`),
}

export const doctorsApi = {
  getAll: () => api.get('/doctors'),
  getById: (id: string) => api.get(`/doctors/${id}`),
  create: (data: any) => api.post('/doctors', data),
  update: (id: string, data: any) => api.patch(`/doctors/${id}`, data),
  delete: (id: string) => api.delete(`/doctors/${id}`),
}

export const salesApi = {
  getAll: () => api.get('/sales'),
  create: (data: any) => api.post('/sales', data),
  update: (id: string, data: any) => api.patch(`/sales/${id}`, data),
  delete: (id: string) => api.delete(`/sales/${id}`),
}

export const inventoryApi = {
  getAll: () => api.get('/inventory'),
  adjustStock: (data: any) => api.post('/inventory/adjust', data),
}

export const purchaseOrdersApi = {
  getAll: () => api.get('/purchase-orders'),
  create: (data: any) => api.post('/purchase-orders', data),
  update: (id: string, data: any) => api.patch(`/purchase-orders/${id}`, data),
  delete: (id: string) => api.delete(`/purchase-orders/${id}`),
}

export const goodsReceiptApi = {
  getAll: () => api.get('/goods-receipt'),
  create: (data: any) => api.post('/goods-receipt', data),
  update: (id: string, data: any) => api.patch(`/goods-receipt/${id}`, data),
}

export const returnsApi = {
  getAll: () => api.get('/returns'),
  createCustomerReturn: (data: any) => api.post('/returns/customer', data),
  createSupplierReturn: (data: any) => api.post('/returns/supplier', data),
  update: (type: string, id: string, data: any) => api.patch(`/returns/${type}/${id}`, data),
}

export const invoicesApi = {
  getAll: () => api.get('/invoices'),
  create: (data: any) => api.post('/invoices', data),
  update: (id: string, data: any) => api.patch(`/invoices/${id}`, data),
}

export const barcodesApi = {
  getAll: () => api.get('/barcodes'),
  create: (data: any) => api.post('/barcodes', data),
  delete: (id: string) => api.delete(`/barcodes/${id}`),
}

export const notificationsApi = {
  getAll: () => api.get('/notifications'),
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),
}

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
  getSalesChart: (days?: number) => api.get('/dashboard/sales-chart', { params: { days } }),
  getTopMedicines: () => api.get('/dashboard/top-medicines'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
}

export const reportsApi = {
  getAll: () => api.get('/reports'),
}

export const settingsApi = {
  getAll: () => api.get('/settings'),
  update: (id: string, data: any) => api.patch(`/settings/${id}`, data),
}

export const accountsApi = {
  getAll: (params?: { storeId?: string }) => api.get('/accounts', { params }),
  create: (data: any) => api.post('/accounts', data),
  update: (id: string, data: any) => api.patch(`/accounts/${id}`, data),
  delete: (id: string) => api.delete(`/accounts/${id}`),
}

export const transactionsApi = {
  getAll: (params?: { storeId?: string; accountId?: string }) => api.get('/transactions', { params }),
  create: (data: any) => api.post('/transactions', data),
}
