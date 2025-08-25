# 🚀 GitHub Deployment Guide for INFO TAWJIH 2.0

## 📋 Pre-Deployment Steps

### 1. Clear Existing Repository Content

Since your repository already has files, we'll replace everything with the new web app:

```bash
# Remove existing remote connection (if any)
git remote remove origin

# Add your repository as the remote origin
git remote add origin https://github.com/THE-RZ1-x/tawjih-info.git

# Force push to replace all content
git push --force-with-lease origin main
```

### 2. Alternative: Clean Repository Method

If you want to completely clean the GitHub repository first:

1. Go to https://github.com/THE-RZ1-x/tawjih-info
2. Delete all existing files through GitHub web interface
3. Then push your new application

## 🌐 GitHub Pages Setup

**Important Note:** GitHub Pages is designed for static websites, but your INFO TAWJIH 2.0 is a full-stack Next.js application with:
- Server-side API routes
- Database connections
- Authentication system

### Recommended Alternative Platforms:

1. **Vercel** (Best for Next.js) - Free tier available
   - Automatic deployments from GitHub
   - Built-in database support
   - Zero configuration needed

2. **Netlify** - Great for static + serverless
   - Free tier available
   - Easy deployment from GitHub

3. **Railway** - Full-stack hosting
   - PostgreSQL database included
   - Free tier available

## 🚀 Quick Deploy Commands

### Step 1: Prepare Repository
```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit changes
git commit -m "Initial commit: INFO TAWJIH 2.0 - Moroccan Educational Guidance Platform"

# Add remote origin
git remote add origin https://github.com/THE-RZ1-x/tawjih-info.git

# Push to main branch (force replace existing content)
git push -f origin main
```

### Step 2: Deploy to Vercel (Recommended)
1. Go to https://vercel.com
2. Sign in with GitHub
3. Import your repository
4. Add environment variables (see DEPLOY_ENV_VARS.md)
5. Deploy automatically

### Step 3: Deploy to Netlify
1. Go to https://netlify.com
2. Connect your GitHub repository
3. Set build command: `npm run build`
4. Set publish directory: `.next`
5. Add environment variables

## 📝 Required Environment Variables

Copy these to your hosting platform:

```env
# Database
DATABASE_URL="your_neon_postgresql_url"
DIRECT_DATABASE_URL="your_neon_direct_url"

# Authentication
JWT_SECRET="your-32-char-random-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://yourdomain.com"

# CORS & Security
ALLOWED_ORIGINS="https://yourdomain.com"
SOCKET_ORIGINS="https://yourdomain.com"

# Admin Credentials
ADMIN_USERNAME="your_admin"
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="SecurePassword123!"

# Environment
NODE_ENV="production"
```

## 🔧 Post-Deployment Steps

After successful deployment:

1. **Database Setup:**
   ```bash
   npm run db:push
   npm run admin:create
   ```

2. **Test Your Application:**
   - Visit your deployed URL
   - Test admin login at `/admin`
   - Verify all pages load correctly
   - Test job/guidance/exam functionality

## 🛠️ Troubleshooting

### Common Issues:

1. **Build Errors:**
   - Ensure all environment variables are set
   - Check the deployment logs

2. **Database Connection:**
   - Verify Neon PostgreSQL URL is correct
   - Ensure connection string includes SSL parameters

3. **Authentication Issues:**
   - Check JWT_SECRET is set
   - Verify NEXTAUTH_URL matches your domain

## 📞 Need Help?

Your application is production-ready! If you encounter issues:
1. Check the deployment logs
2. Verify environment variables
3. Ensure database connection is working

---

**🇲🇦 Ready to serve Moroccan students and job seekers!**