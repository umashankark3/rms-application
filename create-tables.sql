-- Create RMS Database Tables Manually
-- Run this in your Neon database SQL editor

-- Create enum types
CREATE TYPE "UserRole" AS ENUM ('admin', 'recruiter');
CREATE TYPE "ResumeStatus" AS ENUM ('new', 'reviewing', 'assigned', 'shortlisted', 'rejected');

-- Create users table
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL PRIMARY KEY,
    "username" VARCHAR(50) UNIQUE NOT NULL,
    "fullName" VARCHAR(120),
    "phone" VARCHAR(20),
    "role" "UserRole" NOT NULL DEFAULT 'recruiter',
    "passwordHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create resumes table
CREATE TABLE IF NOT EXISTS "resumes" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(20),
    "skills" JSONB,
    "experience" TEXT,
    "status" "ResumeStatus" NOT NULL DEFAULT 'new',
    "fileKey" VARCHAR(255) NOT NULL,
    "fileName" VARCHAR(255) NOT NULL,
    "fileSize" INTEGER NOT NULL,
    "uploadedBy" INTEGER NOT NULL,
    "assignedTo" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "resumes_uploadedBy_fkey" FOREIGN KEY ("uploadedBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "resumes_assignedTo_fkey" FOREIGN KEY ("assignedTo") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create shareLinks table
CREATE TABLE IF NOT EXISTS "shareLinks" (
    "id" SERIAL PRIMARY KEY,
    "token" VARCHAR(255) UNIQUE NOT NULL,
    "resumeId" INTEGER NOT NULL,
    "createdBy" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "shareLinks_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "shareLinks_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Insert default users
INSERT INTO "users" ("username", "fullName", "role", "passwordHash") VALUES
('admin', 'System Administrator', 'admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2'), -- password: admin123
('recruiter1', 'Recruiter User', 'recruiter', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VjPoyNdO2') -- password: recruiter123
ON CONFLICT ("username") DO NOTHING;

-- Verify tables created
SELECT 'Users table created' as status, COUNT(*) as user_count FROM "users";
SELECT 'Resumes table created' as status, COUNT(*) as resume_count FROM "resumes";
SELECT 'ShareLinks table created' as status, COUNT(*) as sharelink_count FROM "shareLinks";