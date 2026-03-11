/**
 * Seed script for the `team` and `analysts` collections.
 *
 * Usage:
 *   node scripts/seed-team.js
 *
 * This populates the `team` collection (and optionally `analysts`) with
 * the same schema the admin panel uses when you create members via the UI.
 * Edit the TEAM_MEMBERS array below with your real data before running.
 */

require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DATABASE || 'inspired_analyst';

if (!uri) {
  console.error('❌  MONGODB_URI is not set in .env.local');
  process.exit(1);
}

// ─── EDIT THIS SECTION WITH YOUR REAL DATA ──────────────────────────────────
const TEAM_MEMBERS = [
  {
    teamId: 1,
    name: 'Analyst One',
    role: 'Senior Analyst',
    about: 'Experienced analyst specialising in equities and market research.',
    bootcampAbout: null,          // optional – leave null to fall back to about
    calendar: 'https://calendly.com/analyst-one',
    image: null,                  // optional – S3 URL or null
    // If this analyst already has Calendly credentials in the `analysts`
    // collection you can leave calendlyAccessToken null here.
    // If you want to seed credentials as well, provide the token.
    calendlyAccessToken: null,
  },
  {
    teamId: 2,
    name: 'Analyst Two',
    role: 'Trading Specialist',
    about: 'Specialist in technical analysis and algorithmic trading strategies.',
    bootcampAbout: null,
    calendar: 'https://calendly.com/analyst-two',
    image: null,
    calendlyAccessToken: null,
  },
  {
    teamId: 3,
    name: 'Analyst Three',
    role: 'Research Analyst',
    about: 'Focused on fundamental research and portfolio analysis.',
    bootcampAbout: null,
    calendar: 'https://calendly.com/analyst-three',
    image: null,
    calendlyAccessToken: null,
  },
  {
    teamId: 4,
    name: 'Analyst Four',
    role: 'Junior Analyst',
    about: 'Junior analyst with expertise in cryptocurrency and DeFi markets.',
    bootcampAbout: null,
    calendar: 'https://calendly.com/analyst-four',
    image: null,
    calendlyAccessToken: null,
  },
];
// ─────────────────────────────────────────────────────────────────────────────

async function seed() {
  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log(`✅  Connected to MongoDB (db: ${dbName})`);
    const db = client.db(dbName);

    // ── team collection ──────────────────────────────────────────────────────
    const teamCol = db.collection('team');

    // Create indexes (idempotent)
    await teamCol.createIndex({ teamId: 1 }, { unique: true });
    console.log('   team index ensured');

    for (const member of TEAM_MEMBERS) {
      const existing = await teamCol.findOne({ teamId: member.teamId });
      if (existing) {
        console.log(`   ⚠️  team member teamId=${member.teamId} already exists – skipping`);
        continue;
      }

      const docId = require('crypto').randomUUID();
      const now = new Date();
      await teamCol.insertOne({
        _id: docId,
        id: docId,
        teamId: member.teamId,
        name: member.name,
        role: member.role,
        about: member.about,
        bootcampAbout: member.bootcampAbout ?? null,
        calendar: member.calendar,
        image: member.image ?? null,
        createdAt: now,
        updatedAt: now,
      });
      console.log(`   ✅  inserted team member teamId=${member.teamId} (${member.name})`);
    }

    // ── analysts collection (Calendly credentials) ───────────────────────────
    const analystsCol = db.collection('analysts');
    await analystsCol.createIndex({ analystId: 1 }, { unique: true });
    console.log('   analysts index ensured');

    for (const member of TEAM_MEMBERS) {
      // Only touch the analysts collection if a token was provided,
      // OR if there is NO existing document yet (create a disabled placeholder).
      const existing = await analystsCol.findOne({ analystId: member.teamId });

      if (existing) {
        console.log(`   ⚠️  analysts doc analystId=${member.teamId} already exists – skipping`);
        continue;
      }

      const now = new Date();
      if (member.calendlyAccessToken) {
        await analystsCol.insertOne({
          analystId: member.teamId,
          name: member.name,
          calendly: {
            enabled: true,
            userUri: null,          // will be filled by the API when the token is validated
            accessToken: member.calendlyAccessToken,
          },
          updatedAt: now,
        });
        console.log(`   ✅  inserted analysts doc analystId=${member.teamId} (with token)`);
      } else {
        // Disabled placeholder so the API returns a proper "not configured" response
        await analystsCol.insertOne({
          analystId: member.teamId,
          name: member.name,
          calendly: { enabled: false, userUri: null, accessToken: null },
          updatedAt: now,
        });
        console.log(`   ✅  inserted analysts placeholder analystId=${member.teamId} (disabled)`);
      }
    }

    console.log('\n🎉  Seeding complete.');
    console.log(`   Visit http://localhost:3000/api/team  to verify`);
    console.log(`   Visit http://localhost:3000/api/analysts/calendly-credentials?analystId=1  to test`);
  } catch (err) {
    console.error('❌  Seed failed:', err.message);
  } finally {
    await client.close();
  }
}

seed();
