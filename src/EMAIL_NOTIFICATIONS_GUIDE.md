# Email Notifications System - Rain by Nurain

## Overview
The email notification system automatically sends professional emails for various e-commerce events. All emails are styled with Rain by Nurain branding and include comprehensive order/customer information.

## Email Types & Content

### 1. **New Order Confirmation (Customer)**
**Trigger:** When a customer successfully places an order  
**Recipient:** Customer  
**Subject:** `Order Confirmation #[ORDER_ID] - Rain by Nurain`

**Content Includes:**
- Order confirmation message
- Complete order details (items, quantities, sizes, colors)
- Pricing breakdown (subtotal, delivery, total)
- Customer information
- Shipping address
- Estimated delivery timeframe
- Order tracking information
- Customer service contact details
- RBN branding and tagline

### 2. **Order Status Updates (Customer)**
**Trigger:** When admin changes order status (pending → processing → shipped → completed)  
**Recipient:** Customer  
**Subject:** `Order #[ORDER_ID] Status Update - [NEW_STATUS]`

**Content Includes:**
- Status change notification
- Updated order timeline
- Tracking number (if shipped)
- Next steps information
- Estimated delivery dates
- Customer service contact

**Status-Specific Content:**
- **Processing:** Payment confirmed, order being prepared
- **Shipped:** Tracking number, delivery estimate, shipping carrier info
- **Completed:** Delivery confirmation, review request, future discount

### 3. **New Order Alert (Admin)**
**Trigger:** When any new order is placed  
**Recipient:** Admin (admin@rainbynurain.com)  
**Subject:** `🔔 New Order Alert #[ORDER_ID] - ₦[TOTAL]`

**Content Includes:**
- Order summary and total value
- Customer contact information
- Complete item list with variants
- Shipping requirements
- Payment status and method
- Quick action links
- Priority indicators for high-value orders

### 4. **Customer Inquiry Notification (Admin)**
**Trigger:** When customer submits contact form  
**Recipient:** Admin  
**Subject:** `💬 New Customer Inquiry - [SUBJECT]`

**Content Includes:**
- Customer contact details (name, email, phone)
- Inquiry subject category
- Full message content
- Timestamp and priority level
- Response recommendations
- Customer order history (if applicable)

### 5. **Low Stock Alerts (Admin)**
**Trigger:** When product stock falls below threshold (≤5 items)  
**Recipient:** Admin  
**Subject:** `⚠️ Low Stock Alert - [PRODUCT_NAME]`

**Content Includes:**
- Product details and current stock level
- Sales velocity information
- Reorder recommendations
- Variant-specific stock levels
- Revenue impact analysis

## Email Templates & Styling

### Professional Branding
- **Colors:** Black (#030213) headers, clean white backgrounds
- **Typography:** Rubik font family throughout
- **Logo:** RBN logo prominently displayed
- **Tagline:** "Left Home to Feed Home" in appropriate contexts

### Responsive Design
- Mobile-optimized layouts
- Clear call-to-action buttons
- Easy-to-scan information hierarchy
- Professional footer with contact information

## Technical Implementation

### Email Service Integration
```javascript
// Order confirmation email trigger
const emailResult = await fetch(`${SUPABASE_URL}/functions/v1/email-notifications/send-order-email`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: JSON.stringify({
    order: orderData,
    type: 'new_order'
  })
});
```

### Email Template System
- HTML templates with CSS styling
- Dynamic content injection
- Fallback text versions
- Error handling and logging

### Security & Privacy
- Customer data protection
- Secure API endpoints
- Admin-only internal notifications
- GDPR-compliant unsubscribe options

## Email Flow Examples

### Complete Purchase Flow
1. **Customer places order** → Instant order confirmation email
2. **Admin processes order** → Status update to "processing"
3. **Order ships** → Shipping notification with tracking
4. **Order delivered** → Completion email with review request

### Customer Service Flow
1. **Customer submits inquiry** → Admin notification
2. **Admin responds** → Customer receives response
3. **Follow-up required** → Automated reminder system

## Monitoring & Analytics
- Email delivery success tracking
- Open and click-through rates
- Customer engagement metrics
- Failed delivery handling

## Future Enhancements
- Marketing newsletter integration
- Abandoned cart recovery emails
- Product restock notifications
- Birthday and anniversary emails
- Loyalty program communications

---

**Note:** All email content maintains Rain by Nurain's premium streetwear brand voice while providing clear, actionable information to recipients.