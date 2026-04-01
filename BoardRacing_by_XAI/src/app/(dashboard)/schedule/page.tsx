'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">赛程管理</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          添加赛程
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>赛程列表</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">暂无赛程数据</p>
        </CardContent>
      </Card>
    </div>
  )
}
