import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Pill, ShoppingCart, Package, Users, Store, BarChart3, LogOut, ChevronRight, ClipboardList, Truck, RotateCcw, FileText, QrCode, Bell, PanelLeftClose, Settings, Stethoscope, Building2 } from 'lucide-react'

const primaryItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/' },
  { icon: ShoppingCart, label: 'Point of sale', path: '/sales' },
  { icon: Package, label: 'Inventory', path: '/inventory' },
  { icon: Pill, label: 'Medicines', path: '/medicines' },
]
const masterItems = [
  { icon: Building2, label: 'Suppliers', path: '/suppliers' },
  { icon: Users, label: 'Customers', path: '/customers' },
  { icon: Stethoscope, label: 'Doctors', path: '/doctors' },
]
const operationsItems = [
  { icon: ClipboardList, label: 'Purchase orders', path: '/purchase-orders' },
  { icon: Truck, label: 'Goods receipt', path: '/goods-receipt' },
  { icon: RotateCcw, label: 'Returns', path: '/returns' },
  { icon: QrCode, label: 'Barcode labels', path: '/barcodes' },
]
const managementItems = [
  { icon: Users, label: 'Team members', path: '/users' },
  { icon: Store, label: 'Stores', path: '/stores' },
  { icon: BarChart3, label: 'Reports', path: '/reports' },
  { icon: FileText, label: 'Invoices', path: '/invoices' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
  { icon: Settings, label: 'Settings', path: '/settings' },
]

function NavGroup({ title, items, collapsed }: { title: string; items: typeof primaryItems; collapsed: boolean }) {
  return <div className="mb-5">
    {!collapsed && <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[.16em] text-slate-500">{title}</p>}
    <div className="space-y-1">{items.map((item) => <NavLink key={item.path} to={item.path} title={collapsed ? item.label : undefined} className={({ isActive }) => cn('group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all', isActive ? 'bg-[#33CC99] text-[#10213b] shadow-[0_8px_22px_rgba(51,204,153,.18)]' : 'text-slate-300 hover:bg-white/[.07] hover:text-white')}>
      <item.icon className="h-[18px] w-[18px] shrink-0" />
      {!collapsed && <span>{item.label}</span>}
    </NavLink>)}</div>
  </div>
}

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  return <aside className={cn('fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/[.08] bg-[#1A2B4C] px-3 py-5 text-white transition-all duration-300 lg:flex', collapsed ? 'w-[88px]' : 'w-[268px]')}>
    <div className={cn('mb-8 flex items-center px-2', collapsed ? 'justify-center' : 'justify-between')}>
      <div className="flex items-center gap-3 overflow-hidden">
        <div className="grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-[#007BFF]/15"><img src="/brand/mediflow-mark.png" alt="MediFlow" className="h-10 w-10 object-contain" /></div>
        {!collapsed && <div><p className="text-base font-bold tracking-tight text-white">MediFlow</p><p className="text-[10px] font-medium tracking-[.14em] text-[#33CC99]">PHARMACY OS</p></div>}
      </div>
      {!collapsed && <button onClick={onToggle} aria-label="Collapse navigation" className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white"><PanelLeftClose className="h-4 w-4" /></button>}
    </div>
    <nav className="flex-1 overflow-y-auto"><NavGroup title="Workspace" items={primaryItems} collapsed={collapsed} /><NavGroup title="Masters" items={masterItems} collapsed={collapsed} /><NavGroup title="Operations" items={operationsItems} collapsed={collapsed} /><NavGroup title="Management" items={managementItems} collapsed={collapsed} /></nav>
    <div className="mt-3 border-t border-white/[.07] pt-3">
      {!collapsed && <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[.06] p-3"><div className="grid h-8 w-8 place-items-center rounded-full bg-[#007BFF] text-xs font-bold text-white">JD</div><div className="min-w-0"><p className="truncate text-xs font-semibold text-white">John Doe</p><p className="text-[11px] text-slate-400">Store manager</p></div></div>}
      <button onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = '/login' }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/[.06] hover:text-white"><LogOut className="h-[18px] w-[18px]" />{!collapsed && 'Sign out'}</button>
      {collapsed && <button onClick={onToggle} aria-label="Expand navigation" className="mt-1 flex w-full justify-center rounded-xl p-2.5 text-slate-500 hover:bg-white/[.06] hover:text-white"><ChevronRight className="h-[18px] w-[18px]" /></button>}
    </div>
  </aside>
}
