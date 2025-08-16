# ResumeFlow

A comprehensive full-stack resume management system built with React 18 and Node.js. ResumeFlow allows organizations to efficiently manage candidate resumes with features like file uploads, user management, assignment workflows, and secure WhatsApp sharing.

## 🚀 Features

### Core Functionality
- **Resume Upload & Management**: Upload PDF, DOC, DOCX files up to 10MB
- **User Management**: Admin can create and manage users with different roles
- **Assignment System**: Assign resumes to specific recruiters
- **Status Tracking**: Track resume status (New, Reviewing, Assigned, Shortlisted, Rejected)
- **Search & Filter**: Search by candidate name, email, skills, and filter by status
- **Secure File Access**: Files served via signed URLs or share links only

### Advanced Features
- **WhatsApp Integration**: Share resumes directly via WhatsApp with custom messages
- **Time-limited Share Links**: Create secure, expiring links for external sharing
- **Role-based Access Control**: Admin and Recruiter roles with different permissions
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live data updates using React Query

## 🛠 Technology Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **Materialize CSS** - Material Design UI framework
- **React Query** - Data fetching and caching
- **React Router v6** - Client-side routing
- **React Hook Form + Zod** - Form handling and validation
- **Axios** - HTTP client

### Backend
- **Node.js 20** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma ORM** - Database ORM with MySQL/PostgreSQL support
- **JWT Authentication** - Secure authentication with httpOnly cookies
- **Multer** - File upload handling
- **Zod** - Server-side validation
- **AWS S3/Local Storage** - Configurable file storage

### Security & Performance
- **Helmet.js** - Security headers
- **Express Rate Limiting** - API rate limiting
- **CORS** - Cross-origin resource sharing
- **bcryptjs** - Password hashing
- **Input Validation** - Comprehensive validation on both client and server

## 📋 Prerequisites

- Node.js 20 or higher
- MySQL or PostgreSQL database
- npm or yarn package manager
- (Optional) AWS S3 account for cloud storage

## 🚀 Quick Start

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd resumeflow

# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install:all
```

### 2. Database Setup

```bash
# Copy environment file
cp backend/env.example backend/.env

# Edit backend/.env with your database credentials
# Example for MySQL:
DB_URL="mysql://username:password@localhost:3306/resumeflow"

# Generate Prisma client and run migrations
cd backend
npm run db:generate
npm run db:migrate

# Seed the database with default users
npm run db:seed
```

### 3. Environment Configuration

Edit `backend/.env`:

```env
SERVER_PORT=8080
JWT_SECRET=your-super-secret-jwt-key-here
JWT_REFRESH_SECRET=your-refresh-secret-here
DB_URL=mysql://username:password@localhost:3306/resumeflow

# Storage Configuration
STORAGE_DRIVER=local  # or 's3'
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760

# For S3 storage (optional)
S3_BUCKET=your-bucket-name
S3_REGION=ap-south-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key

# Application URL
APP_BASE_URL=http://localhost:3000
```

### 4. Start Development Servers

```bash
# Start both backend and frontend in development mode
npm run dev

# Or start them separately:
npm run backend:dev  # Backend on http://localhost:8080
npm run frontend:dev # Frontend on http://localhost:3000
```

## 👥 Default Users

After running the seed script, you can login with:

- **Admin**: 
  - Username: `admin`
  - Password: `admin123`
  
- **Recruiter**: 
  - Username: `recruiter1`
  - Password: `recruiter123`

**⚠️ Important**: Change these passwords in production!

## 📖 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user info

### User Management (Admin only)
- `GET /api/users` - List all users
- `POST /api/users` - Create new user
- `PATCH /api/users/:id` - Update user

### Resume Management
- `POST /api/resumes` - Upload resume with file
- `GET /api/resumes` - List resumes (with filtering)
- `GET /api/resumes/:id` - Get specific resume
- `PATCH /api/resumes/:id` - Update resume status/notes
- `POST /api/resumes/:id/assign` - Assign resume to user
- `GET /api/resumes/:id/file` - Get signed file URL

### Share Links
- `POST /api/resumes/:id/share` - Create share link
- `GET /api/s/:token` - Public resume access via token
- `POST /api/share/:id/revoke` - Revoke share link

## 🔐 User Roles & Permissions

### Admin
- Full access to all features
- Create and manage users
- View and manage all resumes
- Assign resumes to any user
- Create and revoke share links

### Recruiter
- View assigned resumes and own uploads
- Update status on assigned resumes
- Create share links for accessible resumes
- Cannot create users or access admin features

## 📱 WhatsApp Integration

ResumeFlow includes built-in WhatsApp sharing functionality:

1. **Create Share Link**: Automatically generates a secure, time-limited link
2. **Compose Message**: Uses a predefined template with candidate details
3. **WhatsApp Launch**: Opens WhatsApp with pre-filled message and share link

Template format:
```
Hi! Please review this candidate: [Candidate Name]. 
Skills: [Top 3 Skills]. 
Resume: [Secure Share Link]
```

## 🗃 File Storage Options

### Local Storage (Default)
Files stored in `backend/uploads/` directory. Suitable for development and small deployments.

### AWS S3 Storage
For production deployments, configure S3 storage:

```env
STORAGE_DRIVER=s3
S3_BUCKET=your-bucket-name
S3_REGION=ap-south-1
S3_ACCESS_KEY=your-access-key
S3_SECRET_KEY=your-secret-key
```

## 🚀 Production Deployment

### 1. Build Applications

```bash
# Build backend
npm run backend:build

# Build frontend
npm run frontend:build
```

### 2. Environment Setup

- Set `NODE_ENV=production`
- Use strong JWT secrets
- Configure production database
- Set up proper CORS origins
- Enable HTTPS

### 3. Database Migration

```bash
cd backend
npx prisma migrate deploy
```

### 4. Process Management

Use PM2 or similar for production:

```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start dist/index.js --name "resumeflow-backend"

# Serve frontend with nginx or serve static files
```

## 🧪 Testing

### Acceptance Test Scenarios

1. **File Upload**: Upload PDF <10MB → appears in dashboard with status=new
2. **Assignment**: Assign by valid username → assignedTo updates; assignee sees item
3. **Share Links**: Create share link (30 min) → public page opens without login, file downloads, expires after time
4. **WhatsApp**: WhatsApp button opens wa.me with prefilled message and share URL
5. **Permissions**: Recruiter cannot create users; admin can

### Manual Testing

1. **Upload Resume**:
   - Go to `/upload`
   - Fill form with candidate details
   - Upload PDF/DOC file
   - Verify appears in dashboard

2. **User Management** (Admin only):
   - Go to `/users`
   - Create new recruiter user
   - Verify user can login

3. **Assignment Workflow**:
   - Assign resume to recruiter
   - Login as recruiter
   - Verify can see assigned resume
   - Update status and notes

4. **Share Link**:
   - Create share link for resume
   - Open link in incognito mode
   - Verify can download file
   - Test expiration

## 📊 Database Schema

### Users Table
- `id` (Primary Key)
- `username` (Unique)
- `fullName`, `phone`, `role`
- `passwordHash`
- `createdAt`

### Resumes Table
- `id` (Primary Key)
- Candidate info: `candidateName`, `candidateEmail`, `candidatePhone`
- Resume data: `experienceYears`, `skills`, `notes`
- File info: `fileKey`, `fileName`, `fileSize`, `mimeType`
- Workflow: `status`, `uploadedByUserId`, `assignedToUserId`
- Timestamps: `createdAt`, `updatedAt`

### ShareLinks Table
- `id` (Primary Key)
- `resumeId` (Foreign Key)
- `token` (Unique 32-char string)
- `expiresAt`, `revoked`
- `createdByUserId`, `createdAt`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation above
- Review the default user credentials
- Ensure all environment variables are properly set

## 🎯 Roadmap

- [ ] Email notifications for assignments
- [ ] Resume parsing and auto-fill
- [ ] Advanced search with Elasticsearch
- [ ] Resume comparison tools
- [ ] Interview scheduling integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard