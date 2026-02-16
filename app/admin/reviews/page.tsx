import { redirect } from 'next/navigation'
import { requireAdmin } from '@/lib/auth/session'
import { prisma } from '@/lib/db/prisma'
import { ReviewsTable } from '@/components/admin/ReviewsTable'

export const metadata = {
  title: 'Manage Reviews',
  description: 'Approve or reject product reviews',
}

export default async function AdminReviewsPage() {
  const user = await requireAdmin().catch(() => null)

  if (!user) {
    redirect('/login')
  }

  const reviews = await prisma.review.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      product: {
        select: {
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  const pendingReviews = reviews.filter((r) => !r.isApproved)
  const approvedReviews = reviews.filter((r) => r.isApproved)

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Manage Reviews</h1>

      {/* Pending Reviews */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">
          Pending Approval ({pendingReviews.length})
        </h2>
        {pendingReviews.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">No pending reviews</p>
          </div>
        ) : (
          <ReviewsTable reviews={pendingReviews} isPending />
        )}
      </div>

      {/* Approved Reviews */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Approved ({approvedReviews.length})
        </h2>
        {approvedReviews.length === 0 ? (
          <div className="text-center py-12 border rounded-lg">
            <p className="text-muted-foreground">No approved reviews yet</p>
          </div>
        ) : (
          <ReviewsTable reviews={approvedReviews} />
        )}
      </div>
    </div>
  )
}