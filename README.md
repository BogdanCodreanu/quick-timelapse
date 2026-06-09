# quick-timelapse

Make wound-healing timelapses from photos. Sign in, create a timelapse, upload
photos (phone camera/gallery, desktop drag-and-drop, or clipboard paste), align
each frame against an onion-skin of the previous one, then preview and download
an animated GIF.

## Stack

- **web/** — Next.js 16 (App Router, TypeScript, Tailwind 4)
  - **Auth:** Clerk (`proxy.ts` + `<ClerkProvider>`)
  - **DB:** Neon Postgres via **Prisma 7** (`@prisma/adapter-neon`)
  - **API:** a single **GraphQL** endpoint (`/api/graphql`) — GraphQL Yoga +
    Pothos (code-first, `@pothos/plugin-prisma`). Client uses urql +
    graphql-codegen; Server Components read via in-process execution.
  - **Storage:** private S3 bucket; browser uploads/downloads via presigned URLs.
  - **Editor:** one converged client workspace (upload + arrange + align + GIF),
    canvas compositing in the browser, GIF encoding via `gifenc`.
- **infra/** — AWS CDK (`StorageStack`): the private S3 images bucket.

## Prerequisites

- Node 20.9+ (uses Node 24 here), npm
- A [Neon](https://neon.tech) Postgres database
- A [Clerk](https://dashboard.clerk.com) application
- AWS credentials with a profile named `bogdan` (region `eu-central-1`)

## Setup (web)

```bash
cd web
npm install                      # also runs `prisma generate` (postinstall)
cp .env.example .env.local       # then fill in the values (see below)
npm run db:migrate               # apply Prisma migrations to Neon
npm run codegen                  # generate the typed GraphQL client
npm run dev                      # http://localhost:3000
```

### Environment (`web/.env.local`, gitignored)

| Var | What |
| --- | --- |
| `DATABASE_URL` | Neon **pooled** connection (`...-pooler...`), used at runtime |
| `DIRECT_URL` | Neon **direct** connection (same host without `-pooler`), used by `prisma migrate` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY` | from the Clerk dashboard |
| `AWS_REGION` | `eu-central-1` |
| `AWS_PROFILE` | `bogdan` (server uses the default AWS credential chain — no keys in the repo) |
| `IMAGES_BUCKET_NAME` | from the CDK output `ImagesBucketName` |

## Infrastructure (AWS CDK)

All AWS commands use the `bogdan` profile. From `infra/`:

```bash
npm install
npm run bootstrap    # once per account/region: cdk bootstrap --profile bogdan
npm run deploy       # cdk deploy --profile bogdan  → outputs ImagesBucketName/Region
npm run diff         # cdk diff --profile bogdan
npm run destroy      # cdk destroy --profile bogdan
npm test             # jest assertions on the synthesized template
```

Put the `ImagesBucketName` output into `web/.env.local` as `IMAGES_BUCKET_NAME`.

The bucket is private (all public access blocked, SSE-S3, SSL enforced). CORS
allows `http://localhost:*` for development — **add your production origin** to
the `cors` rule in
[storage-stack.ts](infra/lib/storage-stack.ts) before deploying the web app to a
host.

## How it works

- **Upload** → the browser normalizes the image (EXIF-corrected, downscaled to
  2000px, re-encoded JPEG), requests a presigned PUT, uploads straight to S3,
  then records a `Frame`. HEIC is rejected with a clear message.
- **Align/edit** → the fixed output canvas is the crop frame. Drag to move,
  scroll to zoom, rotate; the previous frame shows as an adjustable onion-skin.
  Edits autosave: the browser composites the frame and uploads the result to S3,
  then persists the transform — debounced, on frame-switch, and via "Save now".
- **GIF** → preview by clicking play (cycles aligned frames at the chosen delay);
  Download composites every frame to the canvas size and encodes with `gifenc`.

## Verification

Integration smoke tests run against the real Neon DB + S3 (need `web/.env.local`):

```bash
cd web
npm run smoke        # GraphQL CRUD + ownership, S3 upload round-trip, editor mutations
npx tsc --noEmit && npm run lint && npm run build
```
