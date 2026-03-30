# Deployment Instructions - AI Lead Gen Funnel

## One-Click Deploy to Render

This app is configured for instant deployment to Render's free tier.

### Prerequisites
- GitHub account connected to Render
- SMTP email credentials (or use a service like SendGrid, Mailgun)

### Steps

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com) and sign in with GitHub

2. **Deploy from Blueprint**
   - Click "New +" → "Blueprint"
   - Select repository: `Kevo919/ai-lead-gen-funnel`
   - Branch: `main`
   - Click "Apply"

3. **Configure Environment Variables**

   Render will create the service with these required variables:

   - `EMAIL_HOST` - Your SMTP server (e.g., smtp.gmail.com, smtp.sendgrid.net)
   - `EMAIL_USER` - Your SMTP username/email
   - `EMAIL_PASS` - Your SMTP password or API key
   - `EMAIL_FROM` - From address for outgoing emails (default: noreply@example.com)

   Optional variables (already configured):
   - `PORT` - Set to 10000 (Render default)
   - `EMAIL_PORT` - Set to 587 (SMTP TLS port)
   - `DRIP_INTERVAL_HOURS` - Set to 24 (daily drip emails)

4. **Wait for Deployment**
   - Render will build and deploy automatically
   - First deployment takes 2-3 minutes
   - You'll get a URL like: `https://ai-lead-gen-funnel.onrender.com`

5. **Test the Landing Page**
   - Visit your deployed URL
   - Submit the lead form with a test email
   - Check that email drip sequence starts

### Free Tier Limitations

- Service sleeps after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- 750 hours/month of runtime (upgrade to keep always-on)

### Alternative: Deploy to Railway

If you prefer Railway:

1. Visit [railway.app](https://railway.app) and connect GitHub
2. Create new project from `Kevo919/ai-lead-gen-funnel`
3. Add environment variables (same as above)
4. Railway will auto-deploy from `main` branch

### Email Service Recommendations

For free/low-cost SMTP:
- **SendGrid** - 100 emails/day free
- **Mailgun** - 100 emails/day free
- **Gmail SMTP** - Free, but daily limits apply

### Post-Deployment

After deployment, update [ONL-68](/ONL/issues/ONL-68) with the live URL and mark as done.
