require('dotenv').config();
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  try {
    // Create default admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const admin = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        fullName: 'System Administrator',
        role: 'admin',
        passwordHash: adminPassword
      }
    });

    console.log('✅ Created admin user:', admin.username);

    // Create sample recruiter
    const recruiterPassword = await bcrypt.hash('recruiter123', 12);
    const recruiter = await prisma.user.upsert({
      where: { username: 'recruiter1' },
      update: {},
      create: {
        username: 'recruiter1',
        fullName: 'John Recruiter',
        phone: '+91-9876543210',
        role: 'recruiter',
        passwordHash: recruiterPassword
      }
    });

    console.log('✅ Created recruiter user:', recruiter.username);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin - Username: admin, Password: admin123');
    console.log('Recruiter - Username: recruiter1, Password: recruiter123');
    console.log('\n⚠️  Please change these passwords in production!');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });