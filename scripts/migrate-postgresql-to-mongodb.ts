/**
 * PostgreSQL to MongoDB Atlas Migration Script
 *
 * Migrates all data from PostgreSQL (Prisma) to MongoDB Atlas.
 * Run: npm run migrate:postgres-to-mongo
 *
 * Prerequisites:
 * - DATABASE_URL in .env (PostgreSQL)
 * - MONGODB_URI in .env (MongoDB Atlas)
 * - Optional: MONGODB_DATABASE (default: inspired_analyst)
 *
 * WARNING: This script DELETES existing data in target MongoDB collections
 * before inserting. Backup MongoDB first if it contains important data.
 */

import { PrismaClient } from '@prisma/client';
import { MongoClient } from 'mongodb';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

function toMongoDoc<T extends Record<string, unknown>>(record: T): Record<string, unknown> {
  const { id, ...rest } = record as T & { id: string };
  return {
    _id: id,
    id, // keep for application compatibility
    ...rest,
  };
}

async function migrate() {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is required in .env');
  }

  const dbName = process.env.MONGODB_DATABASE || 'inspired_analyst';

  console.log('Connecting to PostgreSQL...');
  await prisma.$connect();

  console.log('Connecting to MongoDB Atlas...');
  const mongoClient = new MongoClient(mongoUri);
  await mongoClient.connect();
  const db = mongoClient.db(dbName);

  const stats: Record<string, number> = {};

  try {
    // 1. users (admin)
    const users = await prisma.user.findMany();
    if (users.length > 0) {
      const docs = users.map((u) => toMongoDoc(u));
      await db.collection('users').deleteMany({});
      await db.collection('users').insertMany(docs);
      stats.users = users.length;
      console.log(`  ✓ users: ${users.length}`);
    }

    // 2. public_users
    const publicUsers = await prisma.publicUser.findMany();
    if (publicUsers.length > 0) {
      const docs = publicUsers.map((u) => toMongoDoc(u));
      await db.collection('public_users').deleteMany({});
      await db.collection('public_users').insertMany(docs);
      stats.public_users = publicUsers.length;
      console.log(`  ✓ public_users: ${publicUsers.length}`);
    }

    // 3. team
    const teamMembers = await prisma.teamMember.findMany();
    if (teamMembers.length > 0) {
      const docs = teamMembers.map((u) => toMongoDoc(u));
      await db.collection('team').deleteMany({});
      await db.collection('team').insertMany(docs);
      stats.team = teamMembers.length;
      console.log(`  ✓ team: ${teamMembers.length}`);
    } else {
      console.log(`  ○ team: 0 (PostgreSQL had no team members - use /admin/api/team/populate to seed)`);
    }

    // 4. analysts
    const analysts = await prisma.analyst.findMany();
    if (analysts.length > 0) {
      const docs = analysts.map((u) => toMongoDoc(u));
      await db.collection('analysts').deleteMany({});
      await db.collection('analysts').insertMany(docs);
      stats.analysts = analysts.length;
      console.log(`  ✓ analysts: ${analysts.length}`);
    } else {
      console.log(`  ○ analysts: 0 (PostgreSQL had no analysts - Calendly config)`);
    }

    // 5. subscribers
    const subscribers = await prisma.subscriber.findMany();
    if (subscribers.length > 0) {
      const docs = subscribers.map((u) => toMongoDoc(u));
      await db.collection('subscribers').deleteMany({});
      await db.collection('subscribers').insertMany(docs);
      stats.subscribers = subscribers.length;
      console.log(`  ✓ subscribers: ${subscribers.length}`);
    }

    // 6. plans
    const plans = await prisma.plan.findMany();
    if (plans.length > 0) {
      const docs = plans.map((u) => toMongoDoc(u));
      await db.collection('plans').deleteMany({});
      await db.collection('plans').insertMany(docs);
      stats.plans = plans.length;
      console.log(`  ✓ plans: ${plans.length}`);
    }

    // 7. bootcamps
    const bootcamps = await prisma.bootcamp.findMany();
    if (bootcamps.length > 0) {
      const docs = bootcamps.map((u) => toMongoDoc(u));
      await db.collection('bootcamps').deleteMany({});
      await db.collection('bootcamps').insertMany(docs);
      stats.bootcamps = bootcamps.length;
      console.log(`  ✓ bootcamps: ${bootcamps.length}`);
    }

    // 8. bootcamp_lessons
    const lessons = await prisma.bootcampLesson.findMany();
    if (lessons.length > 0) {
      const docs = lessons.map((u) => toMongoDoc(u));
      await db.collection('bootcamp_lessons').deleteMany({});
      await db.collection('bootcamp_lessons').insertMany(docs);
      stats.bootcamp_lessons = lessons.length;
      console.log(`  ✓ bootcamp_lessons: ${lessons.length}`);
    }

    // 9. subscriptions
    const subscriptions = await prisma.subscription.findMany();
    if (subscriptions.length > 0) {
      const docs = subscriptions.map((u) => toMongoDoc(u));
      await db.collection('subscriptions').deleteMany({});
      await db.collection('subscriptions').insertMany(docs);
      stats.subscriptions = subscriptions.length;
      console.log(`  ✓ subscriptions: ${subscriptions.length}`);
    }

    // 10. payment_methods
    const paymentMethods = await prisma.paymentMethod.findMany();
    if (paymentMethods.length > 0) {
      const docs = paymentMethods.map((u) => toMongoDoc(u));
      await db.collection('payment_methods').deleteMany({});
      await db.collection('payment_methods').insertMany(docs);
      stats.payment_methods = paymentMethods.length;
      console.log(`  ✓ payment_methods: ${paymentMethods.length}`);
    }

    // 11. billing_history
    const billingHistory = await prisma.billingHistory.findMany();
    if (billingHistory.length > 0) {
      const docs = billingHistory.map((u) => toMongoDoc(u));
      await db.collection('billing_history').deleteMany({});
      await db.collection('billing_history').insertMany(docs);
      stats.billing_history = billingHistory.length;
      console.log(`  ✓ billing_history: ${billingHistory.length}`);
    }

    // 12. bookings
    const bookings = await prisma.booking.findMany();
    if (bookings.length > 0) {
      const docs = bookings.map((u) => toMongoDoc(u));
      await db.collection('bookings').deleteMany({});
      await db.collection('bookings').insertMany(docs);
      stats.bookings = bookings.length;
      console.log(`  ✓ bookings: ${bookings.length}`);
    }

    // 13. bootcamp_registrations
    const bootcampRegistrations = await prisma.bootcampRegistration.findMany();
    if (bootcampRegistrations.length > 0) {
      const docs = bootcampRegistrations.map((u) => toMongoDoc(u));
      await db.collection('bootcamp_registrations').deleteMany({});
      await db.collection('bootcamp_registrations').insertMany(docs);
      stats.bootcamp_registrations = bootcampRegistrations.length;
      console.log(`  ✓ bootcamp_registrations: ${bootcampRegistrations.length}`);
    }

    // 14. reviews
    const reviews = await prisma.review.findMany();
    if (reviews.length > 0) {
      const docs = reviews.map((u) => toMongoDoc(u));
      await db.collection('reviews').deleteMany({});
      await db.collection('reviews').insertMany(docs);
      stats.reviews = reviews.length;
      console.log(`  ✓ reviews: ${reviews.length}`);
    }

    // 15. research_page_content
    const researchPageContent = await prisma.researchPageContent.findMany();
    if (researchPageContent.length > 0) {
      const docs = researchPageContent.map((u) => toMongoDoc(u));
      await db.collection('research_page_content').deleteMany({});
      await db.collection('research_page_content').insertMany(docs);
      stats.research_page_content = researchPageContent.length;
      console.log(`  ✓ research_page_content: ${researchPageContent.length}`);
    }

    // 16. shariah_tiles
    const shariahTiles = await prisma.shariahTile.findMany();
    if (shariahTiles.length > 0) {
      const docs = shariahTiles.map((u) => toMongoDoc(u));
      await db.collection('shariah_tiles').deleteMany({});
      await db.collection('shariah_tiles').insertMany(docs);
      stats.shariah_tiles = shariahTiles.length;
      console.log(`  ✓ shariah_tiles: ${shariahTiles.length}`);
    }

    // 17. binance_credentials
    const binanceCredentials = await prisma.binanceCredential.findMany();
    if (binanceCredentials.length > 0) {
      const docs = binanceCredentials.map((u) => toMongoDoc(u));
      await db.collection('binance_credentials').deleteMany({});
      await db.collection('binance_credentials').insertMany(docs);
      stats.binance_credentials = binanceCredentials.length;
      console.log(`  ✓ binance_credentials: ${binanceCredentials.length}`);
    }

    // 18. bootcamp_progress
    const bootcampProgress = await prisma.bootcampProgress.findMany();
    if (bootcampProgress.length > 0) {
      const docs = bootcampProgress.map((u) => toMongoDoc(u));
      await db.collection('bootcamp_progress').deleteMany({});
      await db.collection('bootcamp_progress').insertMany(docs);
      stats.bootcamp_progress = bootcampProgress.length;
      console.log(`  ✓ bootcamp_progress: ${bootcampProgress.length}`);
    }

    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    console.log('\n--- Migration complete ---');
    console.log(`Total documents migrated: ${total}`);
    console.log('Collections:', Object.entries(stats).filter(([, c]) => c > 0).map(([k, v]) => `${k}: ${v}`).join(', '));
  } finally {
    await prisma.$disconnect();
    await mongoClient.close();
    console.log('\nConnections closed.');
  }
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
