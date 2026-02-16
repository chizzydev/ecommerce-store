import { Star } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

interface ReviewSummaryProps {
  reviews: Array<{ rating: number }>
  totalReviews: number
  averageRating: number
}

export function ReviewSummary({
  reviews,
  totalReviews,
  averageRating,
}: ReviewSummaryProps) {
  const ratingCounts = [0, 0, 0, 0, 0]

  reviews.forEach((review) => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++
    }
  })

  return (
    <div className="border rounded-lg p-6">
      <div className="text-center mb-6">
        <div className="text-4xl font-bold mb-2">{averageRating.toFixed(1)}</div>
        <div className="flex justify-center mb-2">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-5 w-5 ${
                i < Math.round(averageRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      <div className="space-y-2">
        {[5, 4, 3, 2, 1].map((rating) => {
          const count = ratingCounts[rating - 1]
          const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0

          return (
            <div key={rating} className="flex items-center gap-2">
              <div className="flex items-center gap-1 w-16">
                <span className="text-sm">{rating}</span>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              </div>
              <Progress value={percentage} className="flex-1" />
              <span className="text-sm text-muted-foreground w-12 text-right">
                {count}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}