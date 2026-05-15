This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set up your environment variables:

```bash
# Create a .env.local file with the following variables:

# Database (Auto-configured if using Vercel Postgres)
POSTGRES_PRISMA_URL=your_postgres_url_here
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url_here

# Authentication (Required for user login)
# Magic link email (SMTP)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@domain.com
EMAIL_SERVER_PASSWORD=your-app-password
EMAIL_FROM=your-email@domain.com
NEXTAUTH_SECRET=your-nextauth-secret
# Google sign-in (OAuth 2.0). Create credentials in Google Cloud Console:
# APIs & Services → Credentials → Create OAuth client ID (Web application).
# Authorized redirect URI: https://your-domain.com/api/auth/callback/google
# (for local dev, add http://localhost:3000/api/auth/callback/google)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
# Base URL of the app (required for OAuth callbacks in many deployments)
NEXTAUTH_URL=http://localhost:3000

# Sanity CMS (Required for content management)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=your_sanity_dataset
NEXT_PUBLIC_SANITY_API_VERSION=2024-02-13
NEXT_PUBLIC_SANITY_TOKEN=your_sanity_token

# Optional: Security token for exercise sync API
SYNC_TOKEN=your_sync_token_for_exercise_sync
```

### Testing Google sign-in on a Vercel preview (no local run)

1. Push your branch (for example `feature/google-gmail-signin`) so Vercel creates a **Preview** deployment.
2. In the Vercel dashboard, open that deployment and copy its **https** URL (branch previews usually keep the same hostname while the branch name is unchanged).
3. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → your **OAuth 2.0 Web client** → add **Authorized JavaScript origins** `https://<preview-host>` and **Authorized redirect URIs** `https://<preview-host>/api/auth/callback/google`. Google does not allow wildcard preview hosts; the host must match the deployment URL exactly.
4. In Vercel → **Settings → Environment Variables**, attach the same `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `NEXTAUTH_SECRET` (and your DB/Sanity keys) to the **Preview** environment. Set **`NEXTAUTH_URL`** for Preview to `https://<preview-host>` so OAuth callbacks match that host. If `NEXTAUTH_URL` is only set for Production, add a Preview override so previews do not inherit the production URL.
5. **Redeploy** the preview after changing env vars or Google redirect URIs.

Then, initialize the database:

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push the schema to your database
npx prisma db push

# Start Prisma Studio (optional, for database management)
npx prisma studio
```

To sync exercises from Sanity to the database:

```bash
# Manual sync all exercises (if SYNC_TOKEN is configured)
curl -X POST -H "Authorization: Bearer your_sync_token" http://localhost:3000/api/sync-exercises

# Or sync all exercises without auth token (for development)
curl -X GET http://localhost:3000/api/sync-exercises
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database Management

The project uses Prisma with PostgreSQL for data management. Key commands:

```bash
# View and edit database content
npx prisma studio

# After making changes to schema.prisma
npx prisma generate  # Update Prisma Client
npx prisma db push   # Push schema changes to database
```

## Content Management

This project uses Sanity.io for content management. The Sanity Studio is embedded in the Next.js application and can be accessed at `/studio`.

Key features:

- Exercise content management through Sanity Studio
- Automatic sync between Sanity and PostgreSQL database
- Secure API endpoints for data synchronization

## Production Environment

The application is configured with:

### ✅ **Currently Working Features:**
- **Marketing Pages**: Homepage, Saturday Vinyasa, Dynamic Mobility, In-Person classes
- **Authentication**: Magic link email login system
- **User Dashboard**: Personalized exercise recommendations
- **Exercise Tracking**: Complete exercises and track progress
- **Content Management**: Sanity Studio for exercise content
- **Database Sync**: Automatic sync between Sanity and PostgreSQL

### 🔧 **Environment Variables Status:**
- **Authentication**: ✅ Fully configured (EMAIL_*, NEXTAUTH_SECRET)
- **Database**: ✅ Auto-configured (Vercel Postgres)
- **Content Management**: ✅ Configured (SANITY_*)
- **Security**: ⚠️ Optional SYNC_TOKEN not configured (sync API is unprotected)

### 📝 **Missing for Local Development:**
If setting up locally, you'll need to configure your own:
- Email server credentials (or use the same as production)
- Local database URLs (or connect to production database)
- Sanity project access

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
