const { PrismaClient } = require('./apps/backend/node_modules/@prisma/client');
const prisma = new PrismaClient();
async function main() {
  try {
    await prisma.user.create({
      data: {
        name: 'System Admin',
        loginId: 'admin2',
        email: 'admin2@corpass.in',
        mobile: '0000000001',
        password: 'pass',
        address: 'HQ',
        city: 'Delhi',
        pincode: '110001',
        role: 'ADMIN',
      }
    });
    console.log("Success admin2");
  } catch (e) {
    console.error("ADMIN2 Error:", e);
  }
}
main().then(() => process.exit(0));
