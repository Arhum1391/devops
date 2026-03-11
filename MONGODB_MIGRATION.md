# MongoDB Migration – Complete

The project has been fully migrated from PostgreSQL (Prisma) to MongoDB Atlas.

## What Changed

### Removed
- **Prisma** – `@prisma/client`, `prisma` CLI, `src/lib/prisma.ts`
- **Prisma schema** – `prisma/schema.prisma` and migrations
- **PostgreSQL** – No longer used by the app

### Added / Updated
- **Next.js**: `src/lib/mongodb.ts` – `getDb()`, `toApiDoc`/`toApiDocs`
- **FastAPI**: `backend/app/core/database.py` – Motor-based MongoDB client
- **All API routes** – Use MongoDB collections instead of Prisma

## Environment Variables

### Required (root `.env` for Next.js)

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?appName=...
```

### Optional

```env
MONGODB_DATABASE=inspired_analyst   # Default if not set
```

### Backend (`.env` in `backend/`)

Same variables: `MONGODB_URI`, `MONGODB_DATABASE`.

## MongoDB Collections

| Collection | Purpose |
|------------|---------|
| `users` | Admin/auth users |
| `public_users` | Customer accounts |
| `team` | Team members |
| `analysts` | Analyst profiles + Calendly config |
| `subscribers` | Newsletter |
| `plans` | Subscription plans |
| `bootcamps` | Bootcamp courses |
| `bootcamp_lessons` | Lessons |
| `subscriptions` | Stripe subscriptions |
| `payment_methods` | Saved payment methods |
| `billing_history` | Invoice history |
| `bookings` | Calendly bookings |
| `bootcamp_registrations` | Bootcamp enrollments |
| `reviews` | Customer reviews |
| `research_page_content` | Research content |
| `shariah_tiles` | Shariah tiles |
| `binance_credentials` | Encrypted Binance API keys |
| `bootcamp_progress` | User progress |

## Scripts Status

These scripts still use Prisma/PostgreSQL and are **deprecated** or need updates:

- `scripts/migrate-postgresql-to-mongodb.ts` – One-time migration (run before removing Prisma; now Prisma is removed, so this script will fail)
- `scripts/backup-tables.ts`, `restore-tables.ts`, `delete-tables.ts` – PostgreSQL-specific
- `scripts/analyze-database-tables.ts` – PostgreSQL-specific
- `scripts/check-calendly-data.ts`, `test-calendly-api.ts` – Use Prisma
- `scripts/update-*-image.ts` (abdullah, arhum, awais, wara) – Use Prisma for team images

**Recommendation**: Reimplement these scripts with MongoDB if you still need them.

## Data Migration (PostgreSQL → MongoDB)

If you still have data in PostgreSQL:

1. Temporarily reinstall Prisma and run the migration:
   ```bash
   npm install prisma @prisma/client --save-dev
   npx prisma generate
   npm run migrate:postgres-to-mongo
   npm uninstall prisma @prisma/client
   ```

2. **Note on team/analysts**: The migration script migrates `team` and `analysts` if PostgreSQL has data. If you see `○ team: 0` in the output, PostgreSQL had no team members. Use the populate endpoint to seed:
   ```bash
   curl -X POST http://localhost:3000/admin/api/team/populate
   ```

## Testing Checklist

- [ ] Auth: signup, signin, JWT
- [ ] Team page and analyst profiles
- [ ] Calendly: event types, availability, booking
- [ ] Stripe: checkout, webhook (subscriptions, bootcamp, bookings)
- [ ] Reviews CRUD
- [ ] Admin dashboard
- [ ] Bootcamp enrollment and progress

## Known Considerations

1. **User IDs**: MongoDB uses `_id` (ObjectId or string). The app uses `id` for API responses; `toApiDoc` maps `_id` → `id`. User lookups use `$or: [{ _id: userId }, { id: userId }]` for compatibility.
2. **Indexes**: Add indexes for common queries (e.g. `email`, `stripeSessionId`, `stripeSubscriptionId`) for better performance.
3. **Stripe webhook**: Runs asynchronously; ensure MongoDB connection is stable for webhook processing.
