# Email Configuration Guide for Production

## Problem: Gmail SMTP Failing in Production

Gmail SMTP often fails in production environments due to security restrictions, IP blocking, and rate limiting.

## Solution 1: Use Gmail App Password (Current Setup - Improved)

### Step 1: Enable 2-Factor Authentication
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled

### Step 2: Generate App Password
1. Visit [App Passwords](https://myaccount.google.com/apppasswords)
2. Select **Mail** as the app
3. Select **Other** as the device and name it "AI Finance Tracker"
4. Click **Generate**
5. Copy the 16-character password (without spaces)

### Step 3: Configure Environment Variables

**For Production (Vercel/Netlify/etc.):**
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-char-app-password
EMAIL_FROM_NAME=AI Finance Tracker
NODE_ENV=production
```

**Important Notes:**
- Use the **App Password**, NOT your regular Gmail password
- Remove any spaces from the App Password
- Port 587 is recommended (STARTTLS)
- Port 465 also works (SSL/TLS) - set `EMAIL_PORT=465`

### Step 4: Test the Configuration

Run this test script to verify your Gmail setup:

```javascript
// test-email.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log('❌ Error:', error);
  } else {
    console.log('✅ Server is ready to send emails');
  }
});
```

---

## Solution 2: Use Brevo (Recommended for Production)

Brevo (formerly Sendinblue) is more reliable for production and has a generous free tier (300 emails/day).

### Step 1: Create Brevo Account
1. Sign up at [Brevo](https://www.brevo.com/)
2. Verify your email address

### Step 2: Get API Key
1. Go to [SMTP & API](https://app.brevo.com/settings/keys/api)
2. Click **Generate a new API key**
3. Name it "AI Finance Tracker"
4. Copy the API key

### Step 3: Configure Environment Variables

```env
BREVO_API_KEY=your-brevo-api-key
BREVO_FROM_EMAIL=your-verified-email@domain.com
EMAIL_FROM_NAME=AI Finance Tracker
NODE_ENV=production
```

### Step 4: Verify Sender Email
1. Go to [Senders](https://app.brevo.com/senders)
2. Add and verify your sender email address
3. Use this verified email in `BREVO_FROM_EMAIL`

**Benefits:**
- ✅ No IP restrictions
- ✅ Better deliverability
- ✅ 300 emails/day free tier
- ✅ Email analytics
- ✅ No authentication issues

---

## Solution 3: Use Resend (Modern Alternative)

Resend is a modern email API with excellent developer experience.

### Step 1: Create Resend Account
1. Sign up at [Resend](https://resend.com/)
2. Verify your email

### Step 2: Get API Key
1. Go to [API Keys](https://resend.com/api-keys)
2. Create a new API key
3. Copy the key

### Step 3: Add Resend Utility (Optional)

Create `src/utils/sendEmailResend.js`:

```javascript
import { Resend } from 'resend';

const sendEmailResend = async (options) => {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const data = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME || 'AI Finance Tracker'} <onboarding@resend.dev>`,
      to: [options.email],
      subject: options.subject,
      html: options.html,
    });

    console.log('✅ Email sent via Resend:', data);
    return data;
  } catch (error) {
    console.error('❌ Resend error:', error);
    throw error;
  }
};

export default sendEmailResend;
```

### Step 4: Update authController.js

```javascript
import sendEmailResend from '../utils/sendEmailResend.js';

// In sendResetOTP function:
if (process.env.RESEND_API_KEY) {
  await sendEmailResend({
    email: user.email,
    subject: "Password Reset OTP - AI Finance Tracker",
    html: emailHtml,
  });
}
```

**Benefits:**
- ✅ 100 emails/day free tier
- ✅ Modern API
- ✅ Excellent documentation
- ✅ Built for developers

---

## Troubleshooting Common Errors

### Error: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Solution:** You're using your regular Gmail password instead of an App Password. Generate an App Password.

### Error: "Connection timeout"
**Solution:** 
- Check if port 587 or 465 is blocked by your hosting provider
- Try switching between port 587 and 465
- Contact your hosting provider about SMTP restrictions

### Error: "Self-signed certificate"
**Solution:** Already handled in the updated code with proper TLS configuration.

### Error: "Too many login attempts"
**Solution:** 
- Gmail has rate limits. Wait 15-30 minutes
- Consider switching to Brevo or Resend

---

## Current Priority Order

Your application tries email services in this order:

1. **Brevo** (if `BREVO_API_KEY` is set)
2. **Gmail SMTP** (if `EMAIL_USER` and `EMAIL_PASS` are set)
3. **Development Fallback** (logs OTP to console)

---

## Recommended Setup for Production

**Best Option:** Use **Brevo** for production
- Set `BREVO_API_KEY` and `BREVO_FROM_EMAIL`
- Remove or keep Gmail as backup

**Backup Option:** Keep Gmail with App Password
- Useful if Brevo fails
- Set `EMAIL_USER` and `EMAIL_PASS` with App Password

---

## Testing Checklist

- [ ] Environment variables are set correctly
- [ ] Using App Password (not regular password) for Gmail
- [ ] Email address is verified (for Brevo/Resend)
- [ ] Port 587 or 465 is not blocked
- [ ] Test email sending from production environment
- [ ] Check spam folder if emails not received
- [ ] Monitor error logs for detailed error messages

---

## Need Help?

Check the backend logs for detailed error messages. The updated code now provides:
- Connection verification
- Detailed error codes
- Helpful troubleshooting hints
- Success/failure indicators
