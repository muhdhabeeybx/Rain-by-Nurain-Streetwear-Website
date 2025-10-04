# 🚀 Rain by Nurain (RBN) - Complete Deployment Guide

## 📋 **Prerequisites Checklist**

Before deploying, ensure you have:
- ✅ **GitHub account** 
- ✅ **Netlify account** (free tier available)
- ✅ **Supabase project** with your database set up
- ✅ **Paystack account** with API keys
- ✅ **Resend account** with API key
- ✅ **Git installed** on your computer

## 🔧 **Step 1: Prepare Environment Variables**

Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Payment Integration
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key

# Optional: Analytics or other services
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXXXXXX
```

## 📂 **Step 2: Update Supabase Project Reference**

In `/public/_redirects`, update the Supabase project ID:
```bash
# Replace 'your-project-id' with your actual Supabase project ID
/functions/*  https://YOUR_ACTUAL_PROJECT_ID.supabase.co/functions/v1/:splat  200
/api/*  https://YOUR_ACTUAL_PROJECT_ID.supabase.co/functions/v1/make-server-7f3098dc/:splat  200
```

## 🌐 **Step 3: Push to GitHub**

### **3.1 Initialize Git Repository**
```bash
# Navigate to your project folder
cd rain-by-nurain-ecommerce

# Initialize git (if not already done)
git init

# Add all files
git add .

# Make initial commit
git commit -m "Initial commit: Rain by Nurain e-commerce platform"
```

### **3.2 Create GitHub Repository**
1. Go to [GitHub.com](https://github.com)
2. Click **"New Repository"**
3. Name it: `rain-by-nurain-ecommerce`
4. Description: `Rain by Nurain (RBN) - Bold Gen Z Streetwear E-commerce Platform`
5. Set to **Public** or **Private** (your choice)
6. **Don't** initialize with README (you already have one)
7. Click **"Create Repository"**

### **3.3 Push to GitHub**
```bash
# Add GitHub remote (replace 'yourusername' with your GitHub username)
git remote add origin https://github.com/yourusername/rain-by-nurain-ecommerce.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🚀 **Step 4: Deploy to Netlify**

### **4.1 Connect GitHub to Netlify**
1. Go to [Netlify.com](https://netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **"Deploy with GitHub"**
4. Authorize Netlify to access your GitHub account
5. Select your `rain-by-nurain-ecommerce` repository

### **4.2 Configure Build Settings**
Netlify should auto-detect these settings, but verify:
- **Base directory**: (leave empty)
- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Functions directory**: (leave empty)

### **4.3 Add Environment Variables**
In Netlify dashboard:
1. Go to **Site Settings** → **Environment Variables**
2. Add each variable from your `.env.local` file:

```bash
VITE_SUPABASE_URL = https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY = pk_test_your_paystack_public_key
```

### **4.4 Deploy**
1. Click **"Deploy Site"**
2. Wait for build to complete (usually 2-5 minutes)
3. Your site will be available at: `https://random-name.netlify.app`

### **4.5 Customize Domain (Optional)**
1. In Netlify dashboard, go to **Domain Settings**
2. Click **"Options"** → **"Edit site name"**
3. Change to: `rain-by-nurain` or similar
4. Your site will be: `https://rain-by-nurain.netlify.app`

## ⚙️ **Step 5: Configure Supabase for Production**

### **5.1 Update Supabase Edge Functions**
Ensure your Supabase edge functions are deployed and working:
```bash
# If you have Supabase CLI installed
supabase functions deploy server
supabase functions deploy email-notifications
```

### **5.2 Configure CORS in Supabase**
In your Supabase dashboard:
1. Go to **Authentication** → **URL Configuration**
2. Add your Netlify URL to **Site URL**: `https://rain-by-nurain.netlify.app`
3. Add to **Redirect URLs**: `https://rain-by-nurain.netlify.app/**`

## 🔐 **Step 6: Configure External Services**

### **6.1 Paystack Configuration**
1. Go to your Paystack dashboard
2. Add your Netlify domain to **Allowed Domains**
3. Update webhook URLs if using webhooks

### **6.2 Resend Configuration**
1. Go to your Resend dashboard
2. Verify your sending domain
3. Ensure API key has proper permissions

## 🧪 **Step 7: Testing Your Deployment**

### **7.1 Test Core Functionality**
- ✅ **Homepage loads** correctly
- ✅ **Navigation** works between pages
- ✅ **Product catalog** displays products
- ✅ **Add to cart** functionality works
- ✅ **Checkout process** completes
- ✅ **Admin dashboard** is accessible

### **7.2 Test Integrations**
- ✅ **Supabase connection** (check admin dashboard)
- ✅ **Payment processing** (test with Paystack test cards)
- ✅ **Email notifications** (place a test order)
- ✅ **Order sync** between admin and customer accounts

## 🔄 **Step 8: Continuous Deployment**

Now your site auto-deploys! When you push changes:
```bash
# Make changes to your code
git add .
git commit -m "Your update description"
git push origin main
```

Netlify will automatically:
1. **Detect the push** to GitHub
2. **Run the build** process
3. **Deploy updates** to your live site
4. **Send notifications** about deployment status

## 📊 **Step 9: Monitoring and Analytics**

### **9.1 Netlify Analytics**
- Enable in Netlify dashboard for visitor insights
- Monitor deployment success/failure

### **9.2 Supabase Monitoring**
- Check database usage in Supabase dashboard
- Monitor edge function performance
- Review error logs

### **9.3 Performance Monitoring**
- Use Lighthouse for performance audits
- Monitor Core Web Vitals
- Check mobile responsiveness

## 🆘 **Troubleshooting Common Issues**

### **Build Failures**
```bash
# Clear npm cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### **Environment Variable Issues**
- Double-check variable names have `VITE_` prefix
- Ensure no trailing spaces in values
- Redeploy after adding new variables

### **Routing Issues**
- Verify `_redirects` file is in `/public` folder
- Check `netlify.toml` redirect configuration

### **Supabase Connection Issues**
- Verify project URL and anon key
- Check CORS settings in Supabase
- Ensure edge functions are deployed

## 🎉 **Success! Your RBN Store is Live**

Your Rain by Nurain e-commerce platform is now deployed and ready for customers!

### **Next Steps:**
1. **Add your products** through the admin dashboard
2. **Test the complete customer journey**
3. **Set up a custom domain** (optional)
4. **Configure email templates** in Resend
5. **Add Google Analytics** for tracking
6. **Set up monitoring** and alerts

### **Share Your Store:**
- **Admin Dashboard**: `https://your-site.netlify.app/admin`
- **Customer Store**: `https://your-site.netlify.app`
- **GitHub Repository**: `https://github.com/yourusername/rain-by-nurain-ecommerce`

**"Left Home to Feed Home"** - Your RBN store is ready to serve customers worldwide! 🌍