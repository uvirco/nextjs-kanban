const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'admin@company.com',
        name: 'Admin User',
        password: hashedPassword,
        isActive: true,
        role: 'ADMIN'
      }
    });
    console.log('Admin user created:', user.email);
    console.log('Login credentials:');
    console.log('Email: admin@company.com');
    console.log('Password: admin123');
  } catch (error) {
    console.error('Error creating admin user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
