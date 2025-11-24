const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateAdmin(newEmail, newPassword, newName) {
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const updated = await prisma.user.update({
      where: { email: 'admin@company.com' },
      data: {
        email: newEmail,
        password: hashedPassword,
        name: newName || newEmail.split('@')[0]
      }
    });
    console.log('Admin updated successfully:', {
      id: updated.id,
      email: updated.email,
      name: updated.name
    });
  } catch (error) {
    console.error('Error updating admin:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Usage: node update-admin.js newemail@company.com newpassword "New Admin Name"
const [,, newEmail, newPassword, newName] = process.argv;
if (!newEmail || !newPassword) {
  console.log('Usage: node update-admin.js <email> <password> [name]');
  process.exit(1);
}

updateAdmin(newEmail, newPassword, newName);