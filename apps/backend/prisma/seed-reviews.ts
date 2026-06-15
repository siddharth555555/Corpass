import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const orders = await prisma.order.findMany({
    where: { status: 'DELIVERED' },
    include: {
      sellerProfile: true
    }
  });

  console.log(`Found ${orders.length} delivered orders.`);

  let createdCount = 0;
  for (const order of orders) {
    // Check if review already exists
    const existing = await prisma.review.findFirst({
      where: { orderId: order.id }
    });

    if (!existing) {
      // Create a buyer review for the seller
      await prisma.review.create({
        data: {
          orderId: order.id,
          reviewerId: order.buyerId,
          revieweeId: order.sellerProfile.userId,
          reviewerRole: 'BUYER',
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5
          title: 'Great product',
          comment: 'Very satisfied with the quality and delivery time.'
        }
      });

      // Create a seller review for the buyer
      await prisma.review.create({
        data: {
          orderId: order.id,
          reviewerId: order.sellerProfile.userId,
          revieweeId: order.buyerId,
          reviewerRole: 'SELLER',
          rating: 5,
          title: 'Great buyer',
          comment: 'Prompt payment and clear communication.'
        }
      });
      
      createdCount += 2;
    }
  }

  console.log(`Created ${createdCount} reviews.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
