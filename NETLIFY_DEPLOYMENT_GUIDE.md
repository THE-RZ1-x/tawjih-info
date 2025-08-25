# 🚀 Netlify Deployment Guide for INFO TAWJIH 2.0

## 📁 Files You Need to Upload to Netlify

### Method 1: GitHub Integration (Recommended)
Since your code is already on GitHub, use this method:

1. **Go to Netlify**: https://netlify.com
2. **Sign up/Login** with your GitHub account
3. **Click "New site from Git"**
4. **Choose GitHub** and select your repository: `THE-RZ1-x/tawjih-info`
5. **Configure build settings** (auto-detected):
   - Build command: `npm run build`
   - Publish directory: `.next`
6. **Add environment variables** (see section below)
7. **Deploy**

### Method 2: Manual File Upload
If you prefer to upload files manually:

#### Required Files/Folders:
```
📁 Upload these to Netlify:
├── 📁 src/               (Complete source code)
├── 📁 public/            (Static assets)
├── 📁 prisma/           (Database schema)
├── 📁 scripts/          (Admin creation script)
├── 📄 package.json      (Dependencies)
├── 📄 package-lock.json (Lock file)
├── 📄 next.config.ts    (Next.js config)
├── 📄 netlify.toml      (Netlify config - IMPORTANT!)
├── 📄 tailwind.config.ts
├── 📄 tsconfig.json
├── 📄 middleware.ts
├── 📄 .env.production.example
└── 📄 README.md
```

#### Files to EXCLUDE:
```
❌ Do NOT upload:
├── 📁 .next/           (Build output - will be generated)
├── 📁 node_modules/    (Dependencies - will be installed)
├── 📁 .git/           (Git history - not needed)
├── 📄 .env            (Local environment - security risk)
├── 📄 *.log           (Log files)
└── 📁 db/             (Local database files)
```

## 🔧 Netlify Configuration

### Build Settings:
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node.js version**: 18.x or higher

### Environment Variables (CRITICAL):
Add these in Netlify Dashboard → Site Settings → Environment Variables:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://username:password@host/database?sslmode=require
DIRECT_DATABASE_URL=postgresql://username:password@host/database?sslmode=require

# Authentication
JWT_SECRET=your-very-strong-32-char-random-secret-here
NEXTAUTH_SECRET=your-nextauth-secret-different-from-jwt
NEXTAUTH_URL=https://your-netlify-app.netlify.app

# CORS & Security
ALLOWED_ORIGINS=https://your-netlify-app.netlify.app
SOCKET_ORIGINS=https://your-netlify-app.netlify.app

# Admin Credentials
ADMIN_USERNAME=your_admin_username
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=YourSecureAdminPassword123!

# Environment
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
```

## 📋 Step-by-Step Deployment

### Step 1: Prepare Your Files
```bash
# Ensure build works locally first
npm run build

# Commit latest changes
git add .
git commit -m "Add Netlify configuration for deployment"
git push origin main
```

### Step 2: Netlify Setup
1. **Create Netlify Account**: https://netlify.com
2. **New Site**: Click "New site from Git"
3. **Connect GitHub**: Authorize Netlify to access your repos
4. **Select Repository**: Choose `THE-RZ1-x/tawjih-info`

### Step 3: Configure Build
```
Repository: THE-RZ1-x/tawjih-info
Branch: main
Build command: npm run build
Publish directory: .next
```

### Step 4: Add Environment Variables
Go to Site Settings → Environment Variables and add all the variables listed above.

### Step 5: Deploy
Click "Deploy site" - First build will take 3-5 minutes.

## 🔍 Post-Deployment Checklist

After deployment, verify:

- [ ] **Site loads**: Visit your Netlify URL
- [ ] **Pages work**: Test `/jobs`, `/guidance`, `/exams`
- [ ] **Admin panel**: Visit `/admin` and login
- [ ] **API endpoints**: Check network tab for API calls
- [ ] **Database**: Ensure data loads correctly
- [ ] **Mobile**: Test responsive design

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check environment variables are set
   - Verify Node.js version (18.x+)
   - Check build logs in Netlify dashboard

2. **Database Connection Error**:
   - Verify DATABASE_URL format
   - Ensure Neon PostgreSQL allows connections
   - Check SSL parameters in connection string

3. **Authentication Issues**:
   - Verify JWT_SECRET and NEXTAUTH_SECRET are different
   - Check NEXTAUTH_URL matches your Netlify domain
   - Ensure ALLOWED_ORIGINS is correct

4. **API Routes Not Working**:
   - Netlify should auto-detect Next.js API routes
   - Check `netlify.toml` configuration
   - Verify `@netlify/plugin-nextjs` is installed

### Build Command Issues:
If build fails, try these alternatives:

```bash
# Option 1: Standard Next.js build
npm run build

# Option 2: Export static (if needed)
npm run build && npm run export
```

## 📞 Support

Your INFO TAWJIH 2.0 platform is optimized for Netlify deployment. Key features:

✅ **Server-side rendering** via Netlify Functions
✅ **API routes** automatically converted to serverless functions  
✅ **Database integration** with Neon PostgreSQL
✅ **Authentication system** working with JWT
✅ **Admin panel** fully functional
✅ **Arabic RTL support** with responsive design

---

**🇲🇦 Ready to serve Moroccan students and educators!**

Need help? Check the Netlify deploy logs or contact support.