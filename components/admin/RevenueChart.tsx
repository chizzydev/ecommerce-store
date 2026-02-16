'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatPrice } from '@/lib/utils'

interface RevenueChartProps {
  data: Array<{
    date: string
    revenue: number
  }>
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getMonth() + 1}/${date.getDate()}`
          }}
        />
        <YAxis
          tickFormatter={(value) => formatPrice(value)}
        />
        <Tooltip
          formatter={(value) => formatPrice(Number(value))}
          labelFormatter={(label) => {
            const date = new Date(label)
            return date.toLocaleDateString()
          }}
        />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#000"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}