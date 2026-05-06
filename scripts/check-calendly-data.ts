/**
 * Diagnostic script to check Calendly data in PostgreSQL
 * 
 * Usage: npx tsx scripts/check-calendly-data.ts
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function checkCalendlyData() {
  console.log('🔍 Checking Calendly data in PostgreSQL...\n');
  process.stdout.write('Starting diagnostic...\n');

  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL\n');
    // Get all analysts
    const analysts = await prisma.analyst.findMany({
      select: {
        analystId: true,
        name: true,
        calendly: true,
      },
      orderBy: {
        analystId: 'asc',
      },
    });

    console.log(`Found ${analysts.length} analysts\n`);

    for (const analyst of analysts) {
      console.log(`Analyst ID: ${analyst.analystId}`);
      console.log(`  Name: ${analyst.name}`);
      console.log(`  Has Calendly data: ${!!analyst.calendly}`);
      
      if (analyst.calendly) {
        const calendly = typeof analyst.calendly === 'string' 
          ? JSON.parse(analyst.calendly) 
          : analyst.calendly;
        
        console.log(`  Calendly Type: ${typeof analyst.calendly}`);
        console.log(`  Enabled: ${calendly?.enabled || false}`);
        console.log(`  Has User URI: ${!!calendly?.userUri}`);
        console.log(`  Has Access Token: ${!!calendly?.accessToken}`);
        console.log(`  User URI: ${calendly?.userUri || 'N/A'}`);
        console.log(`  Access Token: ${calendly?.accessToken ? '***' : 'N/A'}`);
      } else {
        console.log(`  ⚠️  No Calendly configuration`);
      }
      console.log('');
    }

    // Check team members
    console.log('\n📋 Checking Team Members...\n');
    const teamMembers = await prisma.teamMember.findMany({
      select: {
        teamId: true,
        name: true,
        role: true,
      },
      orderBy: {
        teamId: 'asc',
      },
    });

    console.log(`Found ${teamMembers.length} team members\n`);
    for (const member of teamMembers) {
      console.log(`  Team ID: ${member.teamId}, Name: ${member.name}, Role: ${member.role}`);
    }

  } catch (error) {
    console.error('❌ Error checking Calendly data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCalendlyData();
