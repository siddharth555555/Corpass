const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminEmail = 'admin@corpass.in';
  const adminPassword = 'admin';
  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  const existingAdmin = await prisma.user.findFirst({
    where: { loginId: 'admin' },
  });

  if (existingAdmin) {
    console.log('Admin user already exists.');
    return;
  }

  const user = await prisma.user.create({
    data: {
      name: 'System Admin',
      loginId: 'admin',
      email: adminEmail,
      mobile: '0000000000',
      password: hashedPassword,
      address: 'HQ',
      city: 'Delhi',
      pincode: '110001',
      role: 'ADMIN',
    },
  });

  console.log('Admin user created successfully: admin / admin');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
