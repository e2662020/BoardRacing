'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, CalendarDays, Monitor, Table2 } from 'lucide-react'

const stats = [
  {
    title: '选手总数',
    value: '24',
    icon: Users,
  },
  {
    title: '今日赛程',
    value: '8',
    icon: CalendarDays,
  },
  {
    title: '直播包装',
    value: '12',
    icon: Monitor,
  },
  {
    title: '数据表',
    value: '6',
    icon: Table2,
  },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">控制台</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>正在比赛的选手</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">暂无正在比赛的选手</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>今日赛程</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">今日暂无赛程</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
