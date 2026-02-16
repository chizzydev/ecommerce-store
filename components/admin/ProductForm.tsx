'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { generateUploadButton } from '@uploadthing/react'
import type { OurFileRouter } from '@/app/api/uploadthing/core'

const UploadButton = generateUploadButton<OurFileRouter>()

const productSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters').regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  description: z.string().nullable(),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  sku: z.string().nullable(),
  categoryId: z.string().min(1, 'Category is required'),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
})

type ProductFormValues = z.infer<typeof productSchema>

interface ProductFormProps {
  product?: {
    id: string
    name: string
    slug: string
    description: string | null
    price: number
    stock: number
    sku: string | null
    images: string[]
    thumbnail: string | null
    categoryId: string
    isActive: boolean
    isFeatured: boolean
  }
  categories: Array<{ id: string; name: string }>
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [images, setImages] = useState<string[]>(product?.images || [])
  const router = useRouter()
  const isEdit = !!product

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: product
      ? {
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          stock: product.stock,
          sku: product.sku,
          categoryId: product.categoryId,
          isActive: product.isActive,
          isFeatured: product.isFeatured,
        }
      : {
          name: '',
          slug: '',
          description: null,
          price: 0,
          stock: 0,
          sku: null,
          categoryId: '',
          isActive: true,
          isFeatured: false,
        },
  })

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    if (!isEdit) {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      form.setValue('slug', slug)
    }
  }

  const onSubmit: SubmitHandler<ProductFormValues> = async (data) => {
    setIsLoading(true)

    try {
      const url = isEdit
        ? `/api/admin/products/${product!.id}`
        : '/api/admin/products'

      const response = await fetch(url, {
        method: isEdit ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          images,
          thumbnail: images[0] || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save product')
      }

      toast.success(isEdit ? 'Product updated' : 'Product created')
      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Rest of the form stays the same */}
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={isLoading}
                    onChange={(e) => {
                      field.onChange(e)
                      handleNameChange(e.target.value)
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>URL-friendly identifier</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  value={field.value || ''}
                  disabled={isLoading}
                  rows={4}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-6 md:grid-cols-3">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="stock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU (optional)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value || ''} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Image Upload */}
        <div className="space-y-4">
          <FormLabel>Product Images</FormLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {images.map((url, index) => (
              <div key={index} className="relative aspect-square">
                <img
                  src={url}
                  alt={`Product ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setImages(images.filter((_, i) => i !== index))}
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
          <UploadButton
            endpoint="productImage"
            onClientUploadComplete={(res) => {
              const urls = res.map((file) => file.url)
              setImages([...images, ...urls])
              toast.success('Images uploaded')
            }}
            onUploadError={(error: Error) => {
              toast.error(`Upload failed: ${error.message}`)
            }}
          />
        </div>

        <div className="flex gap-6">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Active</FormLabel>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isFeatured"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2">
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormLabel className="!mt-0">Featured</FormLabel>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/products')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  )
}