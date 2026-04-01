'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function DataTablesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">数据表</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新建数据表
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>数据表列表</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">暂无数据表</p>
        </CardContent>
      </Card>
    </div>
  )
}
