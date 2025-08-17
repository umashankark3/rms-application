# 🌐 Complete InfinityFree Deployment Guide

## ✅ **Status: Code Uploaded to GitHub**

Great! Your RMS application is now on GitHub. Here's how to deploy it:

---

## 🚀 **Step 1: Deploy Backend (Render.com - FREE)**

### **A. Create Render Account**
1. Go to [render.com](https://render.com)
2. **Sign up with GitHub** (use same account as your repo)

### **B. Create Web Service**
1. Click **"New +"** → **"Web Service"**
2. **Connect GitHub** → Select your RMS repository
3. **Configure Service:**
   ```
   Name: rms-backend
   Environment: Node
   Branch: main
   Root Directory: (leave empty)
   Build Command: cd backend && npm install && npx prisma generate
   Start Command: cd backend && npm start
   ```

### **C. Add Environment Variables**
Click **"Environment"** tab and add:

```
NODE_ENV=production
SERVER_PORT=10000
JWT_SECRET=rms_super_secret_jwt_key_2024_production
JWT_REFRESH_SECRET=rms_refresh_secret_key_2024_production
STORAGE_DRIVER=local
UPLOAD_DIR=uploads
MAX_FILE_SIZE=5242880
APP_BASE_URL=https://your-service-name.onrender.com
```

### **D. Create Database**
1. **New +** → **"PostgreSQL"**
2. **Name:** `rms-database`
3. **Plan:** Free
4. **Copy connection string** and add as `DB_URL` environment variable

### **E. Deploy Backend**
1. Click **"Create Web Service"**
2. **Wait for deployment** (5-10 minutes)
3. **Note your backend URL:** `https://rms-backend-xyz.onrender.com`

---

## 🌐 **Step 2: Update Frontend for Production**

### **A. Update API URL**
1. **Edit:** `frontend/env.production`
2. **Replace:** `https://your-backend-name.onrender.com/api`
3. **With your actual Render URL**

Example:
```
REACT_APP_API_URL=https://rms-backend-abc123.onrender.com/api
```

### **B. Rebuild Frontend**
```bash
cd frontend
npm run build
```

---

## 📁 **Step 3: Upload to InfinityFree**

### **A. InfinityFree Setup**
1. **Create account** at [infinityfree.net](https://infinityfree.net)
2. **Create website** (choose subdomain or use custom domain)
3. **Access File Manager** or get FTP credentials

### **B. Upload Files**
**Upload these files from `frontend/build/` to InfinityFree `htdocs/`:**

```
htdocs/
├── index.html              ← From build/index.html
├── asset-manifest.json     ← From build/asset-manifest.json
└── static/                 ← Entire static/ folder
    ├── css/
    │   └── main.9f9ee3ac.css
    └── js/
        └── main.6027e5ba.js
```

### **C. Upload Methods**

#### **Method 1: File Manager**
1. Login to InfinityFree control panel
2. **File Manager** → **htdocs/**
3. **Upload** each file/folder

#### **Method 2: FTP (Recommended)**
1. **Download FileZilla**
2. **FTP Settings:**
   - Host: Your InfinityFree FTP hostname
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21
3. **Upload to:** `/htdocs/` directory

---

## 🔧 **Step 4: Configure CORS**

After backend deployment, update CORS settings:

**In your backend on Render, the CORS should allow your InfinityFree domain:**

```javascript
// This is already configured in your backend/src/index.js
app.use(cors({
  origin: process.env.FRONTEND_URL || true,
  credentials: true
}));
```

Add `FRONTEND_URL` environment variable in Render:
```
FRONTEND_URL=https://your-infinityfree-domain.com
```

---

## 🎯 **Summary of Steps**

1. ✅ **Code on GitHub** (Done!)
2. 🚀 **Deploy backend** to Render.com
3. 🗄️ **Set up database** on Render
4. 🔧 **Update frontend** API URL
5. 🏗️ **Rebuild frontend**
6. 📁 **Upload to InfinityFree**

---

## 🆘 **Need Help?**

**Common Issues:**
- **CORS errors:** Add your InfinityFree domain to backend CORS
- **API not found:** Check your `REACT_APP_API_URL` is correct
- **Database errors:** Verify `DB_URL` connection string

**Your next step:** Deploy the backend to Render.com first, then come back to update the frontend API URL!

---

## 📞 **Quick Start Commands**

**After getting your Render backend URL:**

1. **Update API URL:**
   ```bash
   # Edit frontend/env.production with your Render URL
   ```

2. **Rebuild:**
   ```bash
   cd frontend && npm run build
   ```

3. **Upload `frontend/build/` contents to InfinityFree `htdocs/`**

**You're all set!** 🎉