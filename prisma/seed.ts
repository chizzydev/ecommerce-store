import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.review.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.wishlistItem.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10)

  const admin = await prisma.user.create({
    data: {
      name: 'Admin User',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  })

  const user = await prisma.user.create({
    data: {
      name: 'Test User',
      email: 'user@example.com',
      password: hashedPassword,
      role: 'USER',
    },
  })

  console.log('✅ Users created')

  // Create categories
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices and gadgets',
    },
  })

  const clothing = await prisma.category.create({
    data: {
      name: 'Clothing',
      slug: 'clothing',
      description: 'Fashion and apparel',
    },
  })

  const books = await prisma.category.create({
    data: {
      name: 'Books',
      slug: 'books',
      description: 'Books and literature',
    },
  })

  const home = await prisma.category.create({
    data: {
      name: 'Home & Garden',
      slug: 'home-garden',
      description: 'Home and garden products',
    },
  })

  const sports = await prisma.category.create({
    data: {
      name: 'Sports',
      slug: 'sports',
      description: 'Sports and fitness equipment',
    },
  })

  console.log('✅ Categories created')

  // Create products with NAIRA prices and REAL IMAGES
  const products = [
    // Electronics
    {
      name: 'Wireless Headphones',
      slug: 'wireless-headphones',
      description: 'Premium noise-cancelling wireless headphones with 30-hour battery life',
      price: 475000, // ₦475,000
      stock: 50,
      sku: 'ELEC-001',
      categoryId: electronics.id,
      images: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'],
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Smart Watch',
      slug: 'smart-watch',
      description: 'Fitness tracking smartwatch with heart rate monitor',
      price: 315000, // ₦315,000
      stock: 30,
      sku: 'ELEC-002',
      categoryId: electronics.id,
      images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'],
      thumbnail: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Bluetooth Speaker',
      slug: 'bluetooth-speaker',
      description: 'Portable waterproof bluetooth speaker',
      price: 118000, // ₦118,000
      stock: 75,
      sku: 'ELEC-003',
      categoryId: electronics.id,
      images: ['https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800'],
      thumbnail: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400',
      isActive: true,
      isFeatured: false,
    },

    // Clothing
    {
      name: 'Cotton T-Shirt',
      slug: 'cotton-t-shirt',
      description: 'Comfortable 100% cotton t-shirt',
      price: 39500, // ₦39,500
      stock: 100,
      sku: 'CLO-001',
      categoryId: clothing.id,
      images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'],
      thumbnail: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Denim Jeans',
      slug: 'denim-jeans',
      description: 'Classic fit denim jeans',
      price: 79000, // ₦79,000
      stock: 60,
      sku: 'CLO-002',
      categoryId: clothing.id,
      images: ['https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'],
      thumbnail: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400',
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Winter Jacket',
      slug: 'winter-jacket',
      description: 'Warm winter jacket with hood',
      price: 158000, // ₦158,000
      stock: 40,
      sku: 'CLO-003',
      categoryId: clothing.id,
      images: ['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800'],
      thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400',
      isActive: true,
      isFeatured: false,
    },

    // Books
    {
      name: 'JavaScript Guide',
      slug: 'javascript-guide',
      description: 'Complete guide to modern JavaScript',
      price: 63000, // ₦63,000
      stock: 200,
      sku: 'BOOK-001',
      categoryId: books.id,
      images: ['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800'],
      thumbnail: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400',
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Design Patterns',
      slug: 'design-patterns',
      description: 'Software design patterns explained',
      price: 71000, // ₦71,000
      stock: 150,
      sku: 'BOOK-002',
      categoryId: books.id,
      images: ['https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800'],
      thumbnail: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400',
      isActive: true,
      isFeatured: false,
    },

    // Home & Garden
    {
      name: 'Coffee Maker',
      slug: 'coffee-maker',
      description: 'Programmable coffee maker with timer',
      price: 126000, // ₦126,000
      stock: 45,
      sku: 'HOME-001',
      categoryId: home.id,
      images: ['https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800'],
      thumbnail: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=400',
      isActive: true,
      isFeatured: false,
    },
    {
      name: 'Plant Pot Set',
      slug: 'plant-pot-set',
      description: 'Set of 3 ceramic plant pots',
      price: 47500, // ₦47,500
      stock: 80,
      sku: 'HOME-002',
      categoryId: home.id,
      images: ['https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800'],
      thumbnail: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
      isActive: true,
      isFeatured: false,
    },

    // Sports
    {
      name: 'Yoga Mat',
      slug: 'yoga-mat',
      description: 'Non-slip yoga mat with carrying strap',
      price: 55000, // ₦55,000
      stock: 90,
      sku: 'SPORT-001',
      categoryId: sports.id,
      images: ['https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800'],
      thumbnail: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
      isActive: true,
      isFeatured: true,
    },
    {
      name: 'Dumbbells Set',
      slug: 'dumbbells-set',
      description: 'Adjustable dumbbells set (5-25kg)',
      price: 189000, // ₦189,000
      stock: 35,
      sku: 'SPORT-002',
      categoryId: sports.id,
      images: ['public/images/dumbbell.jpg'],
      thumbnail: '',
      isActive: true,
      isFeatured: false,
    },
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }

  console.log('✅ Products created with Naira prices and Unsplash images')

  // Create sample review
  const headphones = await prisma.product.findFirst({
    where: { slug: 'wireless-headphones' },
  })

  if (headphones) {
    await prisma.review.create({
      data: {
        productId: headphones.id,
        userId: user.id,
        rating: 5,
        title: 'Amazing sound quality!',
        comment: 'Best headphones I\'ve ever owned. The noise cancellation is incredible.',
        isApproved: true,
      },
    })

    console.log('✅ Sample review created')
  }

  console.log('🎉 Database seeded successfully!')
  console.log('📧 Login credentials:')
  console.log('   Admin: admin@example.com / password123')
  console.log('   User: user@example.com / password123')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })