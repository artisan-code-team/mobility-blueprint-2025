# Google OAuth Setup Guide

This guide will help you set up Google OAuth for your NextAuth.js application.

## Prerequisites

- A Google Cloud Console account
- Your NextAuth.js application already configured

## Step 1: Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application" as the application type
   - Add authorized redirect URIs:
     - Development: `http://localhost:3000/api/auth/callback/google`
     - Production: `https://yourdomain.com/api/auth/callback/google`
5. Copy the Client ID and Client Secret

## Step 2: Environment Variables

Add these variables to your `.env.local` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id_here"
GOOGLE_CLIENT_SECRET="your_google_client_secret_here"
```

## Step 3: Database Migration (if needed)

If you haven't run the Prisma migrations yet:

```bash
npx prisma migrate dev
```

## Step 4: Testing

1. Start your development server: `npm run dev`
2. Navigate to `/sign-in`
3. Click "Sign in with Google"
4. Complete the OAuth flow

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI" error**
   - Make sure the redirect URI in Google Cloud Console exactly matches your callback URL
   - Check for trailing slashes or protocol mismatches

2. **"Client ID not found" error**
   - Verify your `GOOGLE_CLIENT_ID` environment variable is set correctly
   - Ensure the environment variable is loaded (restart your dev server)

3. **"Client secret mismatch" error**
   - Verify your `GOOGLE_CLIENT_SECRET` environment variable is set correctly
   - Make sure there are no extra spaces or characters

### Production Deployment

For production deployment:

1. Update the authorized redirect URIs in Google Cloud Console to include your production domain
2. Set the environment variables in your production environment
3. Ensure `NEXTAUTH_URL` is set to your production domain

## Security Notes

- Never commit your `.env.local` file to version control
- Use different OAuth credentials for development and production
- Regularly rotate your client secrets
- Consider implementing additional security measures like domain verification

## Additional Configuration Options

### Force Refresh Token (Optional)

If you need access to refresh tokens, you can modify the Google provider configuration in `lib/auth/config.ts`:

```typescript
Google({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      prompt: "consent",
      access_type: "offline",
      response_type: "code"
    }
  }
}),
```

**Note:** This will ask users to confirm access every time they sign in.

### Domain Restriction (Optional)

To restrict access to specific email domains:

```typescript
callbacks: {
  async signIn({ account, profile }) {
    if (account.provider === "google") {
      return profile.email_verified && profile.email.endsWith("@yourdomain.com")
    }
    return true
  },
}
``` 