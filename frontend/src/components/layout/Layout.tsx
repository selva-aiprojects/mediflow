import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-[#F4F7F6]">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <main className={`min-h-screen transition-[margin] duration-300 ${collapsed ? 'lg:ml-[88px]' : 'lg:ml-[268px]'}`}>
        <div className="mx-auto max-w-[1600px] px-5 py-6 sm:px-8 sm:py-8 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
