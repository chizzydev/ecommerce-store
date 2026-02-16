'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface TopProductsProps {
  data: Array<{
    productName: string
    quantitySold: number
  }>
}

export function TopProducts({ data }: TopProductsProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="productName"
          angle={-45}
          textAnchor="end"
          height={100}
        />
        <YAxis />
        <Tooltip />
        <Bar dataKey="quantitySold" fill="#000" />
      </BarChart>
    </ResponsiveContainer>
  )
}