const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const hashedPassword = await bcrypt.hash('password', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        isActive: true,
        role: 'MEMBER'
      }
    });
    console.log('Test user created:', user.email);
  } catch (error) {
    console.error('Error creating test user:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser();