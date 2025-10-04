# 🚀 Netlify Deployment Guide for Rain by Nurain (RBN)

## 🎯 **Quick Deploy Steps**

1. **Push to GitHub** (see `GITHUB_SETUP.md`)
2. **Connect to Netlify** (follow steps below)
3. **Add environment variables**
4. **Deploy and test**

## 📋 **Prerequisites**

- ✅ GitHub repository created and pushed
- ✅ Netlify account (free tier works great)
- ✅ Supabase project with your environment variables
- ✅ Paystack account with public key
- ✅ Resend account with API key

## 🌐 **Step 1: Connect GitHub to Netlify**

### **1.1 Login to Netlify**
1. Go to [netlify.com](https://netlify.com)
2. Click **"Sign up"** or **"Log in"**
3. Choose **"GitHub"** to sign in with your GitHub account

### **1.2 Import Your Repository**
1. Click **"Add new site"** 
2. Select **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. **Authorize Netlify** to access your GitHub account
5. Find and select **"rain-by-nurain-ecommerce"** repository

## ⚙️ **Step 2: Configure Build Settings**

Netlify should auto-detect these settings:

```bash
Base directory: (leave empty)
Build command: npm run build
Publish directory: dist
Functions directory: (leave empty)
```

### **If settings aren't auto-detected:**
- **Repository**: `your-username/rain-by-nurain-ecommerce`
- **Branch to deploy**: `main`
- **Build command**: `npm run build`
- **Publish directory**: `dist`

## 🔐 **Step 3: Add Environment Variables**

### **3.1 Navigate to Environment Variables**
1. In Netlify dashboard, go to **"Site settings"**
2. Click **"Environment variables"** in the sidebar
3. Click **"Add a variable"**

### **3.2 Add Each Variable**
Add these environment variables one by one:

```bash
# Supabase Configuration
Key: VITE_SUPABASE_URL
Value: https://your-project-id.supabase.co

Key: VITE_SUPABASE_ANON_KEY  
Value: your_supabase_anon_key_here

# Payment Integration
Key: VITE_PAYSTACK_PUBLIC_KEY
Value: pk_test_your_paystack_public_key_here

# Optional: Analytics
Key: VITE_GOOGLE_ANALYTICS_ID
Value: GA-XXXXXXXXX
```

### **3.3 Where to Find Your Keys**

**Supabase Keys:**
1. Go to your Supabase dashboard
2. Click **"Settings"** → **"API"**
3. Copy **"Project URL"** and **"anon public"** key

**Paystack Key:**
1. Go to your Paystack dashboard
2. Navigate to **"Settings"** → **"API Keys & Webhooks"**
3. Copy the **"Public Key"** (starts with `pk_test_` or `pk_live_`)

**Resend Key (for backend):**
- This goes in your Supabase Edge Function environment (not Netlify)

## 🚀 **Step 4: Deploy Your Site**

### **4.1 Initial Deployment**
1. Click **"Deploy site"** button
2. Wait for build to complete (usually 2-5 minutes)
3. Watch the build logs for any errors

### **4.2 Monitor Build Process**
You'll see these stages:
```
1. 🔄 Preparing Git repository
2. 📦 Installing dependencies  
3. 🏗️ Building your site
4. 📤 Deploying to CDN
5. ✅ Site deployed successfully
```

### **4.3 Access Your Live Site**
After successful deployment:
- Your site will be at: `https://random-name-123.netlify.app`
- Click the URL to view your live RBN store!

## 🎨 **Step 5: Customize Your Domain**

### **5.1 Change Site Name**
1. In Netlify dashboard, go to **"Site settings"**
2. Click **"Change site name"**
3. Choose a new name: `rain-by-nurain` or `rbn-store`
4. Your site becomes: `https://rain-by-nurain.netlify.app`

### **5.2 Add Custom Domain (Optional)**
If you have a custom domain:
1. Go to **"Domain settings"**
2. Click **"Add custom domain"**
3. Enter your domain: `rainbynurain.com`
4. Follow DNS configuration instructions

## ✅ **Step 6: Test Your Deployment**

### **6.1 Core Functionality Test**
Visit your live site and test:
- ✅ **Homepage loads** without errors
- ✅ **Navigation works** between pages
- ✅ **Product catalog** displays correctly
- ✅ **Add to cart** functionality works
- ✅ **Mobile responsiveness** looks good

### **6.2 Backend Integration Test**
- ✅ **Admin dashboard** loads at `/admin`
- ✅ **Product management** works in admin
- ✅ **Order creation** works in admin
- ✅ **Customer account** login works

### **6.3 Payment Integration Test**
- ✅ **Checkout process** initiates
- ✅ **Paystack payment** form loads
- ✅ **Test payment** completes (use test cards)

## 🔧 **Step 7: Configure Additional Settings**

### **7.1 Custom Headers**
Netlify automatically applies headers from `netlify.toml`:
- Security headers for XSS protection
- Cache control for performance
- CORS headers for API access

### **7.2 Redirects Configuration**
The `_redirects` file handles:
- Single Page Application routing
- API proxy to Supabase
- 404 fallback to homepage

### **7.3 Form Handling (Optional)**
If you add contact forms later:
1. Add `netlify` attribute to forms
2. Forms will auto-submit to Netlify Forms
3. Configure notifications in dashboard

## 🔄 **Step 8: Continuous Deployment**

### **8.1 Automatic Deployments**
Now when you push to GitHub:
```bash
git add .
git commit -m "✨ New feature: Enhanced product gallery"
git push origin main
```

Netlify automatically:
1. **Detects the push** to your main branch
2. **Starts a new build** using your settings
3. **Deploys to your live site** when successful
4. **Sends notifications** about deployment status

### **8.2 Build Notifications**
Configure notifications:
1. Go to **"Site settings"** → **"Build & deploy"**
2. Scroll to **"Deploy notifications"**
3. Add webhook for Slack, Discord, or email alerts

## 📊 **Step 9: Monitoring and Analytics**

### **9.1 Netlify Analytics**
Enable built-in analytics:
1. Go to **"Analytics"** tab in dashboard
2. Enable for visitor insights and performance

### **9.2 Build Performance**
Monitor build times and optimize:
- Check **"Deploys"** tab for build history
- Review build logs for optimization opportunities
- Use build plugins for additional features

### **9.3 Performance Monitoring**
Use built-in tools:
- **Lighthouse scores** in deploy details
- **Core Web Vitals** monitoring
- **Mobile performance** insights

## 🆘 **Troubleshooting Common Issues**

### **Build Failures**
```bash
# Common fixes:
1. Check environment variables are set correctly
2. Verify package.json dependencies
3. Clear cache and redeploy
4. Check build logs for specific errors
```

### **Environment Variables Not Working**
- Ensure variables start with `VITE_` prefix
- No trailing spaces in values
- Redeploy after adding new variables
- Check capitalization and spelling

### **404 Errors on Page Refresh**
- Verify `_redirects` file is in `/public` folder
- Check `netlify.toml` configuration
- Ensure all routes are handled by React Router

### **API/Backend Connection Issues**
- Verify Supabase project URL and keys
- Check CORS settings in Supabase dashboard
- Test API endpoints in browser dev tools

## 🎉 **Success! Your RBN Store is Live**

Your Rain by Nurain e-commerce platform is now live on Netlify!

### **Your Live URLs:**
- **Customer Store**: `https://rain-by-nurain.netlify.app`
- **Admin Dashboard**: `https://rain-by-nurain.netlify.app/admin`
- **GitHub Repository**: `https://github.com/yourusername/rain-by-nurain-ecommerce`

### **Next Steps:**
1. ✅ **Add products** through admin dashboard
2. ✅ **Test full customer journey** end-to-end
3. ✅ **Configure custom domain** (optional)
4. ✅ **Set up monitoring** and alerts
5. ✅ **Share with customers** and start selling!

### **Share Your Achievement:**
Your bold, Gen Z streetwear platform is ready to serve customers worldwide with the tagline **"Left Home to Feed Home"**! 

**🌍 Your RBN store is live and ready for business! 🛍️**