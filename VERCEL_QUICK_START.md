# Vercel Deployment - Quick Start (5 Minutes)

## 🚀 Deploy in 5 Steps

### Step 1: Commit Your Code
```bash
git add -A
git commit -m "Ready for Vercel deployment"
git push origin main
```

### Step 2: Create Vercel Account
- Go to https://vercel.com
- Click "Sign Up"
- Choose "Continue with GitHub"
- Authorize Vercel

### Step 3: Import Project
- Go to https://vercel.com/dashboard
- Click "Add New" → "Project"
- Click "Import Git Repository"
- Search for "personal-tracker"
- Click "Import"

### Step 4: Add Environment Variables
In the "Environment Variables" section, add:

```
SUPABASE_URL = [your_supabase_url]
SUPABASE_ANON_KEY = [your_supabase_anon_key]
SUPABASE_SERVICE_ROLE_KEY = [your_supabase_service_role_key]
NODE_ENV = production
```

**Get these from:** https://app.supabase.com → Your Project → Settings → API

### Step 5: Deploy
- Click "Deploy"
- Wait 2-3 minutes
- Get your live URL! 🎉

---

## 📝 Update Frontend URL

After deployment, update your API URL:

**File:** `public/js/api.js` (Line ~5)

```javascript
// Change from:
const API_BASE_URL = 'http://localhost:4000/api';

// To:
const API_BASE_URL = 'https://your-project-name.vercel.app/api';
```

Then:
```bash
git add public/js/api.js
git commit -m "Update API URL for production"
git push origin main
```

Vercel will auto-redeploy! ✅

---

## ✅ Verify Deployment

1. Visit your Vercel URL
2. Open DevTools (F12)
3. Go to Network tab
4. Try logging in
5. Check that API calls go to your Vercel URL
6. No errors should appear

---

## 🎯 Your Live Application

**Frontend:** https://your-project-name.vercel.app  
**API:** https://your-project-name.vercel.app/api  
**Database:** Supabase (unchanged)

---

## 🔄 Continuous Deployment

Every time you push to GitHub:
```bash
git push origin main
```

Vercel automatically deploys! No manual steps needed.

---

## 📊 Monitor Your App

- **Vercel Dashboard:** https://vercel.com/dashboard
- **View Logs:** Deployments → Click deployment → View Logs
- **Check Status:** See "Ready" or "Error" status

---

## 🆘 Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Vercel logs, ensure all dependencies in package.json |
| API 404 errors | Verify environment variables are set |
| CORS errors | Check API URL in public/js/api.js matches Vercel URL |
| Login not working | Check Supabase credentials in environment variables |

---

## 🎉 Done!

Your Personal Tracker is now live on Vercel! 🚀

**Share your URL:** https://your-project-name.vercel.app

---

## 📚 Full Documentation

For detailed information, see: `VERCEL_DEPLOYMENT_GUIDE.md`

