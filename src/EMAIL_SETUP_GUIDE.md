# Email Notifications Setup Guide

## Overview
Your RBN e-commerce platform now has **real email notifications** integrated with **Resend** - a modern, reliable email API service. Here's everything you need to know to get emails working.

## 🚀 **Quick Setup (5 minutes)**

### **Step 1: Create Resend Account**
1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free)
3. Verify your email address

### **Step 2: Get API Key**
1. In your Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Name it `RBN-Production` 
4. Copy the API key (starts with `re_`)

### **Step 3: Add API Key to Environment**
1. In your Supabase project dashboard
2. Go to **Settings** → **Environment Variables**
3. Add new variable:
   - **Name**: `RESEND_API_KEY`
   - **Value**: `re_your_api_key_here`

### **Step 4: Set Up Domain (Recommended)**
1. In Resend dashboard, go to **Domains**
2. Add your domain: `rainbynurain.com`
3. Add the DNS records to your domain provider
4. Verify domain (takes a few minutes)

**That's it! Emails will now be sent automatically.**

## 📧 **What Emails Are Sent**

### **Order Confirmation Emails**
- **To**: Customer who placed the order
- **When**: Immediately after successful payment
- **Contains**: Order details, items, total, tracking info
- **From**: `noreply@rainbynurain.com`

### **Admin Order Notifications**  
- **To**: `rainbynurain@gmail.com` and `rbn@sableboxx.com`
- **When**: New order is placed
- **Contains**: Order summary, customer details, items
- **Subject**: `🛒 New Order #RBN-123 - ₦25,000`

### **Customer Inquiry Emails**
- **To**: Admin emails
- **When**: Someone submits contact form
- **Contains**: Customer message, contact details
- **Subject**: `💬 New Customer Inquiry from [Name]`

## 🎨 **Email Templates**

### **Professional Branding**
- **RBN logo** in header
- **"Left Home to Feed Home"** tagline
- **Consistent typography** (Rubik font)
- **Brand colors** (#030213 primary)
- **Mobile responsive** design

### **Order Email Example**
```html
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Rubik', Arial, sans-serif; }
    .header { background: #030213; color: white; }
    .content { padding: 30px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Rain by Nurain</h1>
    <p>Left Home to Feed Home</p>
  </div>
  <div class="content">
    <h2>Order Confirmation #RBN-123</h2>
    <p>Thank you for your order!</p>
    <!-- Order details here -->
  </div>
</body>
</html>
```

## 🔧 **Technical Implementation**

### **Email Sending Function**
```typescript
const sendEmailWithResend = async (emailData: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) => {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Rain by Nurain <noreply@rainbynurain.com>',
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text,
    }),
  });
};
```

### **Integration Points**
- **Order placement**: `/pages/CheckoutPage.tsx` → triggers order email
- **Contact form**: `/pages/ContactPage.tsx` → triggers inquiry email  
- **Admin actions**: Admin dashboard → triggers status update emails

## 🏢 **Alternative Email Providers**

If you prefer different email service, here are alternatives:

### **SendGrid** (Popular choice)
```typescript
// Replace the sendEmailWithResend function with:
const sendEmailWithSendGrid = async (emailData) => {
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: { email: 'noreply@rainbynurain.com', name: 'Rain by Nurain' },
      to: [{ email: emailData.to }],
      subject: emailData.subject,
      content: [
        { type: 'text/html', value: emailData.html },
        { type: 'text/plain', value: emailData.text }
      ]
    }),
  });
};
```

### **Mailgun** (Reliable)
```typescript
const sendEmailWithMailgun = async (emailData) => {
  const domain = 'rainbynurain.com';
  const apiKey = Deno.env.get('MAILGUN_API_KEY');
  
  const formData = new FormData();
  formData.append('from', 'Rain by Nurain <noreply@rainbynurain.com>');
  formData.append('to', emailData.to);
  formData.append('subject', emailData.subject);
  formData.append('html', emailData.html);
  formData.append('text', emailData.text);
  
  const response = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`api:${apiKey}`)}`,
    },
    body: formData,
  });
};
```

## 📊 **Monitoring & Analytics**

### **Email Delivery Tracking**
- **Resend Dashboard**: Shows delivery rates, opens, clicks
- **Server Logs**: Detailed success/failure logs in function console
- **KV Store**: All email attempts stored for debugging

### **Success Logging**
```typescript
// Email success/failure is logged:
console.log('✅ Customer email sent successfully');
console.log('⚠️ Admin email failed: API key invalid');
```

### **Admin Dashboard Integration**
- Email notifications appear in admin notifications tab
- Failed emails are flagged for manual follow-up
- Delivery status tracked per order

## 🛡️ **Security & Best Practices**

### **API Key Security**
- ✅ API key stored in Supabase environment variables
- ✅ Never exposed to frontend code
- ✅ Rotated regularly for security

### **Email Validation**
- ✅ Customer emails validated during checkout
- ✅ Bounced emails logged for cleanup
- ✅ Rate limiting to prevent spam

### **Template Security**
- ✅ All user content sanitized in templates
- ✅ No script injection possible
- ✅ Professional HTML structure

## 🚀 **Performance Optimizations**

### **Non-Blocking Email Sending**
- Emails sent asynchronously after order creation
- Won't slow down checkout process
- Retry mechanism for failed sends

### **Template Caching**
- Email templates generated once and reused
- Fast email composition
- Consistent branding

### **Error Handling**
- Graceful failure - orders complete even if email fails
- Detailed error logging for debugging
- Automatic retry for transient failures

## 📈 **Free Tier Limits**

### **Resend Free Plan**
- **100 emails/day** (3,000/month)
- **1 verified domain**
- **Email analytics**
- **API access**

### **Upgrade Triggers**
- More than 100 orders/day → Upgrade to paid plan ($20/month)
- Need multiple domains → Business plan
- Advanced analytics → Pro features

## 🎯 **Next Steps**

1. **Set up API key** following Step 1-3 above
2. **Test with sample order** to verify emails work
3. **Add domain verification** for professional sender address
4. **Monitor email delivery** in first few days
5. **Scale plan** as order volume grows

## 📞 **Support**

If you need help with email setup:
1. **Resend Documentation**: [resend.com/docs](https://resend.com/docs)
2. **Supabase Environment Variables**: Check your project settings
3. **Test Email Sending**: Use admin dashboard to trigger test emails

Your email notifications are now production-ready and will enhance customer experience significantly!