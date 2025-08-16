#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 RMS Setup Script');
console.log('==========================\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));

if (majorVersion < 18) {
  console.error('❌ Node.js version 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Check if .env file exists in backend
const backendEnvPath = path.join(__dirname, 'backend', '.env');
const backendEnvExamplePath = path.join(__dirname, 'backend', 'env.example');

if (!fs.existsSync(backendEnvPath)) {
  if (fs.existsSync(backendEnvExamplePath)) {
    console.log('📝 Creating backend/.env from env.example...');
    fs.copyFileSync(backendEnvExamplePath, backendEnvPath);
    console.log('✅ Created backend/.env');
    console.log('⚠️  Please edit backend/.env with your database credentials before continuing.');
    console.log('   Example: DB_URL="mysql://username:password@localhost:3306/resumeflow"');
    console.log('\nAfter editing .env, run: node setup.js continue\n');
    
    if (process.argv[2] !== 'continue') {
      process.exit(0);
    }
  } else {
    console.error('❌ backend/env.example not found');
    process.exit(1);
  }
} else {
  console.log('✅ backend/.env already exists');
}

try {
  // Install dependencies
  console.log('📦 Installing dependencies...');
  execSync('npm install', { stdio: 'inherit' });
  
  console.log('📦 Installing backend dependencies...');
  execSync('npm install', { cwd: 'backend', stdio: 'inherit' });
  
  console.log('📦 Installing frontend dependencies...');
  execSync('npm install', { cwd: 'frontend', stdio: 'inherit' });
  
  console.log('✅ All dependencies installed');

  // Generate Prisma client
  console.log('🗄️  Generating Prisma client...');
  execSync('npm run db:generate', { cwd: 'backend', stdio: 'inherit' });
  console.log('✅ Prisma client generated');

  // Run migrations
  console.log('🗄️  Running database migrations...');
  try {
    execSync('npm run db:migrate', { cwd: 'backend', stdio: 'inherit' });
    console.log('✅ Database migrations completed');
  } catch (error) {
    console.log('⚠️  Database migration failed. Please check your database connection.');
    console.log('   Make sure your database is running and the DB_URL in backend/.env is correct.');
    console.log('\nYou can run migrations manually later with:');
    console.log('   cd backend && npm run db:migrate');
  }

  // Seed database
  console.log('🌱 Seeding database with default users...');
  try {
    execSync('npm run db:seed', { cwd: 'backend', stdio: 'inherit' });
    console.log('✅ Database seeded successfully');
  } catch (error) {
    console.log('⚠️  Database seeding failed. You can run it manually later with:');
    console.log('   cd backend && npm run db:seed');
  }

  console.log('\n🎉 Setup completed successfully!');
  console.log('\nNext steps:');
  console.log('1. Start the development servers:');
  console.log('   npm run dev');
  console.log('\n2. Open your browser to:');
  console.log('   http://localhost:3000');
  console.log('\n3. Login with default credentials:');
  console.log('   Admin: admin / admin123');
  console.log('   Recruiter: recruiter1 / recruiter123');
  console.log('\n⚠️  Remember to change default passwords in production!');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  console.log('\nPlease check the error above and try running the setup again.');
  console.log('You can also install dependencies manually:');
  console.log('  npm install');
  console.log('  cd backend && npm install');
  console.log('  cd ../frontend && npm install');
  process.exit(1);
}