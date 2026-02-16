import { formatDate } from '@/lib/utils'
import { Star } from 'lucide-react'

interface Review {
  id: string
  rating: number
  title: string | null
  comment: string | null
  createdAt: Date
  user: {
    name: string | null
  }
}

interface ReviewListProps {
  reviews: Review[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-muted-foreground">No reviews yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Be the first to review this product!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border rounded-lg p-6">
          <div className="flex items-start justify-between mb-2">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold">{review.user.name || 'Anonymous'}</p>
                <div className="flex">
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
              </div>
              {review.title && (
                <h4 className="font-medium">{review.title}</h4>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDate(review.createdAt)}
            </p>
          </div>
          {review.comment && (
            <p className="text-muted-foreground mt-2">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  )
}