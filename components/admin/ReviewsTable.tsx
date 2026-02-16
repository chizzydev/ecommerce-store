'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  isApproved: boolean
  createdAt: Date
  user: {
    name: string | null
    email: string
  }
  product: {
    name: string
    slug: string
  }
}

interface ReviewsTableProps {
  reviews: Review[]
  isPending?: boolean
}

export function ReviewsTable({ reviews, isPending = false }: ReviewsTableProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  async function handleApprove(reviewId: string) {
    setLoadingId(reviewId)

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isApproved: true }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve review')
      }

      toast.success('Review approved')
      router.refresh()
    } catch (error) {
      toast.error('Failed to approve review')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleUnapprove(reviewId: string) {
    setLoadingId(reviewId)

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isApproved: false }),
      })

      if (!response.ok) {
        throw new Error('Failed to unapprove review')
      }

      toast.success('Review unapproved - moved to pending')
      router.refresh()
    } catch (error) {
      toast.error('Failed to unapprove review')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleDelete(reviewId: string) {
    if (!confirm('Are you sure you want to delete this review? This cannot be undone.')) {
      return
    }

    setLoadingId(reviewId)

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete review')
      }

      toast.success('Review deleted')
      router.refresh()
    } catch (error) {
      toast.error('Failed to delete review')
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Review</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reviews.map((review) => (
            <TableRow key={review.id}>
              <TableCell>
                <a
                  href={`/products/${review.product.slug}`}
                  className="font-medium hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {review.product.name}
                </a>
              </TableCell>

              <TableCell>
                <div>
                  <p className="font-medium">{review.user.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {review.user.email}
                  </p>
                </div>
              </TableCell>

              <TableCell>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </TableCell>

              <TableCell>
                <div className="max-w-md">
                  {review.title && (
                    <p className="font-medium mb-1">{review.title}</p>
                  )}
                  {review.comment && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {review.comment}
                    </p>
                  )}
                </div>
              </TableCell>

              <TableCell>{formatDate(review.createdAt)}</TableCell>

              <TableCell>
                <div className="flex gap-2">
                  {isPending ? (
                    <>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleApprove(review.id)}
                        disabled={loadingId === review.id}
                      >
                        {loadingId === review.id ? 'Approving...' : 'Approve'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(review.id)}
                        disabled={loadingId === review.id}
                      >
                        Delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnapprove(review.id)}
                        disabled={loadingId === review.id}
                      >
                        {loadingId === review.id ? 'Unapproving...' : 'Unapprove'}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(review.id)}
                        disabled={loadingId === review.id}
                      >
                        {loadingId === review.id ? 'Deleting...' : 'Delete'}
                      </Button>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}