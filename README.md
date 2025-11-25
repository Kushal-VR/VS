# Kushal Stream - Video Streaming Platform

A complete, production-ready video streaming web application built with Next.js, TypeScript, Tailwind CSS, Prisma, NextAuth, and Stripe.

## 🎯 Features

### User Features
- **Authentication**: Email/password and Google OAuth login
- **Video Streaming**: Watch full-length videos and shorts/reels
- **Access Control**: Free and Premium content tiers
- **Watch History**: Track viewing history and total watch time
- **User Profile**: Manage account, view subscription, and analytics
- **Responsive Design**: Beautiful UI that works on all devices

### Admin Features
- **Content Management**: Upload and manage videos and shorts
- **Multiple Video Sources**: Support for YouTube URLs, external URLs, and direct uploads
- **Access Control**: Mark content as Free or Premium
- **Trailer System**: Auto-generate trailers for premium content

### Subscription Features
- **Stripe Integration**: Secure payment processing
- **Subscription Management**: Monthly premium subscriptions
- **Automatic Access Control**: Premium users get full access to all content

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **Video Player**: React Player
- **Animations**: Framer Motion

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- (Optional) Stripe account for payments
- (Optional) Google Cloud project for OAuth

## 🚀 Getting Started

### 1. Clone and Install

```bash
cd kushal-stream
npm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Update the `.env` file with your values:

```env
# Database - Update with your PostgreSQL connection string
DATABASE_URL="postgresql://username:password@localhost:5432/kushal_stream?schema=public"

# NextAuth - Generate a secret: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# Google OAuth (Optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe (Dummy keys included for development)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_51DummyKeyForDevelopmentPurposesOnly"
STRIPE_SECRET_KEY="sk_test_51DummyKeyForDevelopmentPurposesOnly"
STRIPE_WEBHOOK_SECRET="whsec_DummyWebhookSecretForDevelopment"
NEXT_PUBLIC_STRIPE_PRICE_ID="price_DummyPriceIdForMonthlySubscription"
```

### 3. Set Up Database

Run Prisma migrations to create the database schema:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Create Admin User

After running the app for the first time and creating a user account, you need to manually set the user role to ADMIN in the database.

**Option 1: Using Prisma Studio**
```bash
npx prisma studio
```
- Open Prisma Studio in your browser
- Navigate to the `User` table
- Find your user and change `role` from `USER` to `ADMIN`
- Save changes

**Option 2: Using SQL**
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your-email@example.com';
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📱 Usage Guide

### For Regular Users

1. **Sign Up**: Create an account using email/password or Google
2. **Browse Content**: View all available videos on the home page
3. **Watch Videos**: 
   - Free users can watch full free videos and trailers of premium content
   - Premium users get full access to all content
4. **Shorts Feed**: Browse short-form content in the Shorts section
5. **Profile**: View watch history, analytics, and manage subscription

### For Admins

1. **Access Admin Dashboard**: Navigate to `/admin` (only visible to admin users)
2. **Upload Videos**:
   - Click "Upload Long Video" or "Upload Short"
   - Enter title, description, and video URL (YouTube, external, or direct)
   - Choose Free or Premium access
   - For premium videos, set trailer duration (default: 30 seconds)
3. **Manage Content**: Edit or delete existing videos and shorts

## 💳 Stripe Setup (Optional)

The app includes dummy Stripe keys for development. To enable real payments:

1. Create a [Stripe account](https://stripe.com)
2. Get your API keys from the Stripe Dashboard
3. Create a subscription product and price
4. Update `.env` with your real Stripe keys:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_real_key"
   STRIPE_SECRET_KEY="sk_test_your_real_key"
   NEXT_PUBLIC_STRIPE_PRICE_ID="price_your_real_price_id"
   ```

### Stripe Webhook Setup

For subscription events to work properly:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Copy the webhook signing secret and update `STRIPE_WEBHOOK_SECRET` in `.env`

## 🔐 Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Update `.env` with your Google Client ID and Secret

## 📁 Project Structure

```
kushal-stream/
├── app/
│   ├── api/              # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   ├── videos/       # Video CRUD operations
│   │   ├── stripe/       # Stripe checkout & webhooks
│   │   └── watch-history/ # Watch tracking
│   ├── admin/            # Admin dashboard pages
│   ├── auth/             # Login/register pages
│   ├── home/             # Main video feed
│   ├── shorts/           # Shorts/reels feed
│   ├── video/[id]/       # Video player page
│   ├── profile/          # User profile
│   ├── pricing/          # Subscription plans
│   └── page.tsx          # Landing page
├── components/           # Reusable components
├── lib/                  # Utility functions
│   ├── auth.ts          # NextAuth configuration
│   ├── prisma.ts        # Database client
│   ├── stripe.ts        # Stripe client
│   └── utils.ts         # Helper functions
├── prisma/
│   └── schema.prisma    # Database schema
├── types/               # TypeScript types
└── public/              # Static assets
```

## 🎨 Customization

### Change Brand Name

The platform uses "Kushal Stream" as the default name. To change it:

1. Update the landing page: `app/page.tsx`
2. Update the navbar: `components/Navbar.tsx`
3. Update metadata in `app/layout.tsx`
4. Search for "Kushal Stream" across the project and replace

### Modify Pricing

1. Update pricing display in `app/page.tsx` and `app/pricing/page.tsx`
2. Create new price in Stripe Dashboard
3. Update `NEXT_PUBLIC_STRIPE_PRICE_ID` in `.env`

## 🚢 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

### Database

For production, use a managed PostgreSQL service:
- [Vercel Postgres](https://vercel.com/storage/postgres)
- [Supabase](https://supabase.com)
- [Railway](https://railway.app)
- [Neon](https://neon.tech)

Update `DATABASE_URL` in your production environment variables.

### Stripe Webhooks (Production)

1. In Stripe Dashboard, add webhook endpoint: `https://yourdomain.com/api/stripe/webhook`
2. Select events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
3. Copy webhook signing secret and update production environment variable

## 📝 Database Schema

- **User**: User accounts with role and subscription status
- **Account**: NextAuth account linking (for OAuth)
- **Session**: NextAuth sessions
- **Video**: Videos and shorts with access control
- **WatchHistory**: User watch tracking
- **Subscription**: Stripe subscription records

## 🔧 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open Prisma Studio (database GUI)
npx prisma migrate dev  # Create new migration
```

## 🐛 Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check `DATABASE_URL` format
- Run `npx prisma generate` after schema changes

### Admin Access Not Working
- Verify user role is set to `ADMIN` in database
- Clear browser cache and cookies
- Check middleware configuration

### Stripe Webhooks Not Working
- Ensure webhook secret is correct
- Use Stripe CLI for local testing
- Check webhook endpoint is publicly accessible (for production)

### Video Player Issues
- Verify video URL is accessible
- Check if URL format is supported by react-player
- For YouTube: ensure video is not private

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Support

For issues and questions:
1. Check this README
2. Review the code comments
3. Check Prisma/NextAuth/Stripe documentation

## 🎉 Features Roadmap

Potential future enhancements:
- [ ] Video upload to cloud storage (AWS S3, Cloudflare R2)
- [ ] Comments and likes system
- [ ] Playlist creation
- [ ] Email notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] Live streaming support

---

Built with ❤️ using Next.js, TypeScript, and Tailwind CSS
