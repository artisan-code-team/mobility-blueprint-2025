This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, set up your environment variables:

```bash
# Create a .env file with the following variables:
POSTGRES_PRISMA_URL=your_postgres_url_here
POSTGRES_URL_NON_POOLING=your_postgres_non_pooling_url_here
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=your_sanity_dataset
NEXT_PUBLIC_SANITY_API_VERSION=your_api_version
SYNC_TOKEN=your_sync_token_for_exercise_sync
```

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
# Make a POST request to the sync endpoint
curl -X POST -H "Authorization: Bearer your_sync_token" http://localhost:3000/api/sync-exercises
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

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
