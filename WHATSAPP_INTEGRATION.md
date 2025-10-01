# WhatsApp Integration Guide
## ARET Environmental Services - Direct WhatsApp Contact

---

## Overview

The ARET Environmental Services website is integrated with WhatsApp to provide instant communication with potential and existing customers. All WhatsApp links open a direct conversation with your customer care team.

---

## WhatsApp Contact Number

**Primary WhatsApp Number**: +234 915 287 0616

This number is used across all WhatsApp touchpoints on the website.

---

## Integration Points

### 1. Floating WhatsApp Button

**Location**: Fixed bottom-right corner of all pages (above the LiveChat widget)

**Features**:
- Always visible and accessible
- Opens WhatsApp with pre-filled message
- Hover tooltip: "Chat with us on WhatsApp"
- Responsive design for mobile and desktop

**Pre-filled Message**:
```
Hello! I'm interested in ARET Environmental Services. I'd like to know more about your waste management solutions.
```

**File**: `/src/components/WhatsAppButton.tsx`

---

### 2. Contact Section

**Location**: Contact page form section

**Format**: Link button alongside Call and Email options

**Features**:
- Green color (#25D366) for WhatsApp brand recognition
- Same pre-filled message as floating button
- Touch-optimized for mobile devices

**File**: `/src/components/Contact.tsx:176`

---

### 3. Footer Contact Info

**Location**: Footer section on all pages

**Format**: Contact information list item with WhatsApp icon

**Features**:
- Displays phone number with WhatsApp icon
- Hover effect changes color to WhatsApp green
- Opens WhatsApp with pre-filled message

**File**: `/src/components/Footer.tsx:102-109`

---

## How It Works

### User Flow

1. **Customer clicks WhatsApp link** (from button, contact section, or footer)
2. **WhatsApp opens automatically**:
   - On mobile: Opens WhatsApp app
   - On desktop: Opens WhatsApp Web
3. **Pre-filled message appears** in the chat input
4. **Customer can edit or send** the message immediately
5. **Your team receives the message** and can respond in real-time

### Technical Implementation

All WhatsApp links use the standard WhatsApp URL format:
```
https://wa.me/[PHONE_NUMBER]?text=[ENCODED_MESSAGE]
```

Example:
```
https://wa.me/2349152870616?text=Hello!%20I'm%20interested%20in%20ARET%20Environmental%20Services...
```

**Note**: Phone number format uses international format without the "+" symbol (2349152870616)

---

## Customer Care Considerations

### Responding to WhatsApp Messages

When customers contact via WhatsApp:

1. **Acknowledge quickly** - Respond within 5 minutes if possible
2. **Identify their needs** - Ask clarifying questions about services needed
3. **Collect information** - Gather:
   - Full name
   - Email address
   - Phone number (if different)
   - Service type needed
   - Property type
   - Location/address
   - Preferred contact time
   - Any special requirements

4. **Provide quote** - Give pricing information
5. **Schedule service** - Confirm date and time
6. **Send confirmation** - Follow up with written confirmation via WhatsApp

### Best Practices

- Use WhatsApp Business App for professional features:
  - Automated greeting messages
  - Away messages
  - Quick replies for common questions
  - Labels for organizing contacts
  - Catalog feature for service listings

- Save contact information promptly to your CRM or database
- Use the pre-existing `client_registrations` table in Supabase to store customer data
- Follow up within 24 hours with formal quote or next steps

---

## Database Integration (Optional)

While the WhatsApp integration is direct (not automated), you can still use the Supabase database to store client information collected through WhatsApp conversations.

### Client Registrations Table

The database includes a `client_registrations` table that can be used to manually log client information:

**Structure**:
- `id` - Unique identifier
- `reference_number` - Generated reference (e.g., ARET20250930001)
- `full_name` - Client's full name
- `email` - Email address
- `phone` - Phone number
- `service_type` - Type of service requested
- `property_type` - Residential/Commercial/Industrial
- `location` - Address in Uyo
- `preferred_contact_time` - Best time to reach them
- `additional_comments` - Special requirements
- `registration_source` - Set to 'whatsapp_manual'
- `status` - pending, contacted, in_progress, completed
- `created_at` - Timestamp

**Manual Entry Process**:
1. Collect information via WhatsApp chat
2. Log in to Supabase Dashboard
3. Navigate to Table Editor → `client_registrations`
4. Click "Insert Row"
5. Fill in the collected information
6. Generate reference number using: `SELECT generate_reference_number();`
7. Set `registration_source` to 'whatsapp_manual'
8. Save the entry

This helps you:
- Track all customer inquiries
- Generate reports on lead sources
- Monitor conversion rates
- Assign clients to team members
- Track status of each inquiry

---

## Updating WhatsApp Number

If you need to change the WhatsApp contact number in the future:

### Step 1: Update WhatsApp Button Component
File: `/src/components/WhatsAppButton.tsx`

Change line 5:
```typescript
const phoneNumber = "2349152870616"; // Update this number
```

### Step 2: Update Contact Component
File: `/src/components/Contact.tsx`

Change line 176:
```typescript
href="https://wa.me/2349152870616?text=..." // Update this number
```

### Step 3: Update Footer Component
File: `/src/components/Footer.tsx`

Change line 102:
```typescript
href="https://wa.me/2349152870616?text=..." // Update this number
```

And line 108:
```typescript
<span className="font-medium">WhatsApp: 09152870616</span> // Update display number
```

### Step 4: Rebuild and Deploy
```bash
npm run build
```

---

## Customizing Pre-filled Messages

To change the pre-filled WhatsApp message:

### Step 1: Edit Message Text
File: `/src/components/WhatsAppButton.tsx`

Change line 6:
```typescript
const message = "Hello! I'm interested in ARET Environmental Services. I'd like to know more about your waste management solutions.";
```

### Step 2: Update Other Components
Make the same change in:
- `/src/components/Contact.tsx:176`
- `/src/components/Footer.tsx:102`

**Tip**: Keep messages concise and clear about the customer's intent.

---

## Analytics & Tracking

### Recommended Metrics

Track the following to measure WhatsApp effectiveness:

1. **WhatsApp Click Rate**
   - Use Google Analytics event tracking
   - Track clicks on WhatsApp button/links

2. **Response Time**
   - Average time to first response
   - Average time to inquiry resolution

3. **Conversion Rate**
   - Percentage of WhatsApp chats that become customers
   - Revenue generated from WhatsApp leads

4. **Common Questions**
   - List of frequently asked questions
   - Create quick reply templates for efficiency

### Setting Up Click Tracking (Optional)

Add event tracking to WhatsApp links:

```typescript
onClick={() => {
  // Google Analytics event
  gtag('event', 'whatsapp_click', {
    'event_category': 'contact',
    'event_label': 'floating_button'
  });
}}
```

---

## WhatsApp Business Features

### Recommended Setup

1. **Download WhatsApp Business App**
   - Available on iOS and Android
   - Free to use

2. **Create Business Profile**
   - Business name: ARET Environmental Services
   - Category: Environmental Services
   - Description: Waste collection, management & disposal services
   - Address: No. 576 Oron Road, Uyo, Akwa Ibom State
   - Hours: Your operating hours
   - Website: Your website URL

3. **Configure Automated Messages**
   - **Greeting message**: "Welcome to ARET Environmental Services! We're here to help with all your waste management needs. How can we assist you today?"
   - **Away message**: "Thank you for contacting us! We're currently away but will respond within [X] hours. For urgent matters, please call 09152870616."

4. **Create Quick Replies**
   - Service inquiry response
   - Pricing request response
   - Scheduling information
   - Payment information
   - Emergency service information

5. **Use Labels**
   - New Customer
   - Quote Requested
   - Scheduled
   - Completed
   - Follow-up Needed

---

## Troubleshooting

### Issue: WhatsApp Link Not Opening

**Causes**:
- WhatsApp not installed on device
- Browser blocking popup

**Solutions**:
- On mobile: Ensure WhatsApp app is installed
- On desktop: Use WhatsApp Web or install WhatsApp desktop app
- Check browser popup blocker settings

### Issue: Wrong Number Format

**Symptoms**: Link opens but shows error

**Solution**: Ensure number format is correct:
- Use international format without "+" in URL
- Format: 2349152870616 (not +234 915 287 0616)

### Issue: Message Not Pre-filled

**Cause**: Special characters not properly encoded

**Solution**: Use `encodeURIComponent()` for message text:
```typescript
const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
```

---

## Support Contacts

For technical issues with the website integration:
- Review code in the files mentioned in this document
- Check browser console for JavaScript errors
- Verify phone number format

For WhatsApp Business App support:
- Visit: [https://faq.whatsapp.com/](https://faq.whatsapp.com/)
- WhatsApp Business Help Center

---

## Summary

The WhatsApp integration provides three main contact points:
1. Floating button (always visible)
2. Contact section link
3. Footer contact information

All links open direct conversations with your team at +234 915 287 0616 with a pre-filled introduction message.

The integration is simple, reliable, and requires no complex setup or third-party services beyond WhatsApp itself.

---

**Document Version**: 1.0
**Last Updated**: September 30, 2025
**Maintained By**: Development Team