import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usersApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import type { User } from '@/types'
import {
  Search, Filter, MoreHorizontal, Edit, Trash2,
  UserPlus, Mail, Phone
} from 'lucide-react'

const defaultUsers: User[] = [
  { id: "1", storeId: "S001", employeeCode: "EMP001", firstName: "John", lastName: "Doe", email: "john@pharmacy.com", phone: "+91-9876543210", role: "admin", isActive: true, isFirstLogin: false, lastLoginAt: "2026-07-22T08:00:00", profilePicUrl: null, createdAt: "2026-01-15T00:00:00", updatedAt: "2026-07-22T08:00:00" },
  { id: "2", storeId: "S001", employeeCode: "EMP002", firstName: "Jane", lastName: "Smith", email: "jane@pharmacy.com", phone: "+91-9876543211", role: "pharmacist", isActive: true, isFirstLogin: false, lastLoginAt: "2026-07-22T07:30:00", profilePicUrl: null, createdAt: "2026-02-01T00:00:00", updatedAt: "2026-07-22T07:30:00" },
  { id: "3", storeId: "S002", employeeCode: "EMP003", firstName: "Sarah", lastName: "Johnson", email: "sarah@pharmacy.com", phone: "+91-9876543212", role: "cashier", isActive: true, isFirstLogin: true, lastLoginAt: null, profilePicUrl: null, createdAt: "2026-07-20T00:00:00", updatedAt: "2026-07-20T00:00:00" },
  { id: "4", storeId: "S001", employeeCode: "EMP004", firstName: "Mike", lastName: "Wilson", email: "mike@pharmacy.com", phone: "+91-9876543213", role: "manager", isActive: true, isFirstLogin: false, lastLoginAt: "2026-07-21T16:00:00", profilePicUrl: null, createdAt: "2026-03-10T00:00:00", updatedAt: "2026-07-21T16:00:00" },
  { id: "5", storeId: "S003", employeeCode: "EMP005", firstName: "Emily", lastName: "Brown", email: "emily@pharmacy.com", phone: "+91-9876543214", role: "pharmacist", isActive: false, isFirstLogin: false, lastLoginAt: "2026-07-15T12:00:00", profilePicUrl: null, createdAt: "2026-04-01T00:00:00", updatedAt: "2026-07-15T12:00:00" },
];

const roleColors: Record<string, "primary" | "success" | "warning" | "danger" | "default"> = {
  admin: "danger",
  manager: "warning",
  pharmacist: "primary",
  cashier: "success",
};

export default function UsersPage() {
  const [users, setUsers] = useState(defaultUsers);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [_editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data } = await usersApi.getAll();
        setUsers(data);
      } catch {
        // Use default data
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase()) ||
    user.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">Manage system users and their permissions</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-slate-300 pl-10 pr-4 py-2.5 text-sm placeholder-slate-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">User</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Contact</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Role</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Last Login</th>
                  <th className="text-right text-xs font-medium text-slate-500 uppercase tracking-wider px-6 py-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white text-sm font-semibold">
                          {user.firstName[0]}{user.lastName?.[0] || ''}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">{user.firstName} {user.lastName}</p>
                          <p className="text-xs text-slate-500">{user.employeeCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-sm text-slate-600">
                          <Mail className="h-3.5 w-3.5" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Phone className="h-3.5 w-3.5" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={roleColors[user.role] || "default"}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm text-slate-600">{user.isActive ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">
                        {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <p className="text-sm text-slate-500 mt-1">Fill in the details to create a new user</p>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setShowAddModal(false); }}>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                    <input type="text" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="John" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                    <input type="text" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="Doe" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="john@pharmacy.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <input type="tel" className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20" placeholder="+91-9876543210" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                  <select className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20">
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="pharmacist">Pharmacist</option>
                    <option value="cashier">Cashier</option>
                  </select>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                  <Button type="submit">Create User</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
