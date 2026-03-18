This is a [Next.js](https://nextjs.org) birthday reminder app with Google sign-in, MongoDB storage, and email delivery through Resend.

## Getting Started

First, create a `.env.local` file with the required configuration:

```env
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google
MONGO_DB_CONNECTION_STRING=
MONGO_DB_NAME=
NEXTAUTH_SECRET=
NEXTAUTH_BASEURL=http://localhost:3000
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

Then run the development server:

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

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Google OAuth is used for authentication only. Email sending is handled through Resend, so `RESEND_FROM_EMAIL` must be a sender address that is valid for your Resend account.

Useful commands:

```bash
npm run dev
npm run build
npm run lint
```

Main app code lives in `src/app`, with email logic in `src/app/lib/email.ts` and authenticated dashboard pages under `src/app/dashboard`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
