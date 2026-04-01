'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Monitor,
  Table2,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    title: '控制台',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    title: '选手管理',
    href: '/athletes',
    icon: Users,
  },
  {
    title: '赛程管理',
    href: '/schedule',
    icon: CalendarDays,
  },
  {
    title: '直播包装',
    href: '/packages',
    icon: Monitor,
  },
  {
    title: '数据表',
    href: '/data-tables',
    icon: Table2,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-card flex flex-col">
      <div className="p-6 border-b">
        <h2 className="text-lg font-semibold">一起赛事</h2>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <Settings className="h-4 w-4" />
          设置
        </Link>
      </div>
    </div>
  )
}
