import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/session'
import {
  getRevenueByDay,
  getTopProducts,
  getSalesStats,
  getOrderStatusBreakdown,
  getRecentCustomers,
} from '@/lib/db/queries/analytics'
import { formatPrice } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { RevenueChart } from '@/components/admin/RevenueChart'
import { TopProducts } from '@/components/admin/TopProducts'
import { OrderStatusChart } from '@/components/admin/OrderStatusChart'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const metadata = {
  title: 'Analytics',
  description: 'Store analytics and insights',
}

export default async function AnalyticsPage() {
  const user = await requireAdmin().catch(() => null)

  if (!user) {
    redirect('/login')
  }

  const [revenueData, topProducts, salesStats, orderStatus, recentCustomers] =
    await Promise.all([
      getRevenueByDay(30),
      getTopProducts(10),
      getSalesStats(),
      getOrderStatusBreakdown(),
      getRecentCustomers(10),
    ])

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Analytics</h1>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(salesStats.today.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesStats.today.orders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(salesStats.week.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesStats.week.orders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(salesStats.month.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesStats.month.orders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">All Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(salesStats.allTime.revenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              {salesStats.allTime.orders} orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Revenue (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <RevenueChart data={revenueData} />
        </CardContent>
      </Card>

      <div className="grid gap-8 md:grid-cols-2 mb-8">
        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
          </CardHeader>
          <CardContent>
            <TopProducts data={topProducts} />
          </CardContent>
        </Card>

        {/* Order Status */}
        <Card>
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderStatusChart data={orderStatus} />
          </CardContent>
        </Card>
      </div>

      {/* Recent Customers */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Joined</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer._count.orders}</TableCell>
                  <TableCell>
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}