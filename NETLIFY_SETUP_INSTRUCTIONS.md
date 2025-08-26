# 🚀 Netlify Environment Setup Instructions

## 📁 Files Ready for Upload

I've created `NETLIFY_PRODUCTION.env` with your **actual database connection** and production-ready settings.

## ✅ What's Already Configured

- ✅ **Your real Neon PostgreSQL database URL**
- ✅ **Production-grade JWT secrets** (stronger than development)
- ✅ **Secure admin credentials**
- ✅ **Production environment settings**

## 🔧 What You Need to Change (Only 1 thing!)

### **Update Netlify App URL:**

In `NETLIFY_PRODUCTION.env`, replace `YOUR-APP-NAME` with your actual Netlify app name:

```env
# Change this:
NEXTAUTH_URL=https://YOUR-APP-NAME.netlify.app

# To this (example):
NEXTAUTH_URL=https://tawjih-info.netlify.app
```

**Update these 3 lines with your Netlify app name:**
1. `NEXTAUTH_URL=https://YOUR-APP-NAME.netlify.app`
2. `ALLOWED_ORIGINS=https://YOUR-APP-NAME.netlify.app`
3. `SOCKET_ORIGINS=https://YOUR-APP-NAME.netlify.app`

## 🚀 Upload to Netlify

1. **Open** `NETLIFY_PRODUCTION.env`
2. **Replace** `YOUR-APP-NAME` with your Netlify app name
3. **Save** the file
4. **In Netlify Dashboard** → Click "Import from a .env file"
5. **Upload** `NETLIFY_PRODUCTION.env`
6. **Deploy!**

## 🎯 Your Database is Ready!

Your Neon PostgreSQL database is already configured and will work immediately after upload.

## 🔑 Admin Login

After deployment, access admin panel at:
- **URL:** `https://your-app.netlify.app/admin`
- **Username:** `admin`
- **Email:** `admin@tawjih-info.ma`
- **Password:** `TawijhSecure2025!Morocco`

---

**🇲🇦 Your INFO TAWJIH 2.0 platform is ready to serve Morocco!**