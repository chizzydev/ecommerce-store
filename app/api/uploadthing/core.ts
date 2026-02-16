import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { requireAdmin } from '@/lib/auth/session'

const f = createUploadthing()

export const ourFileRouter = {
  productImage: f({ image: { maxFileSize: '4MB', maxFileCount: 5 } })
    .middleware(async () => {
      const user = await requireAdmin()
      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log('Upload complete for userId:', metadata.userId)
      console.log('File URL:', file.url)
      return { url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter