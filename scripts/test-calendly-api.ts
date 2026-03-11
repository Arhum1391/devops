/**
 * Test script to check Calendly API endpoints
 * 
 * Usage: npx tsx scripts/test-calendly-api.ts [analystId]
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function testCalendlyAPI() {
  const analystId = process.argv[2] || '0';
  console.log(`🧪 Testing Calendly API for analyst ID: ${analystId}\n`);

  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Test 1: Check if analyst exists
    console.log('📋 Test 1: Checking if analyst exists...');
    const analyst = await prisma.analyst.findUnique({
      where: { analystId: parseInt(analystId) },
      select: {
        analystId: true,
        name: true,
        calendly: true,
      },
    });

    if (!analyst) {
      console.log(`❌ Analyst with ID ${analystId} not found\n`);
      
      // List all analysts
      console.log('📋 Available analysts:');
      const allAnalysts = await prisma.analyst.findMany({
        select: { analystId: true, name: true },
        orderBy: { analystId: 'asc' },
      });
      allAnalysts.forEach(a => {
        console.log(`  - ID: ${a.analystId}, Name: ${a.name}`);
      });
      return;
    }

    console.log(`✅ Found analyst: ${analyst.name} (ID: ${analyst.analystId})\n`);

    // Test 2: Check calendly data
    console.log('📋 Test 2: Checking Calendly data...');
    console.log(`  Has calendly field: ${!!analyst.calendly}`);
    console.log(`  Type: ${typeof analyst.calendly}`);
    
    if (analyst.calendly) {
      const calendly = typeof analyst.calendly === 'string' 
        ? JSON.parse(analyst.calendly) 
        : analyst.calendly;
      
      console.log(`  Enabled: ${calendly?.enabled || false}`);
      console.log(`  Has User URI: ${!!calendly?.userUri}`);
      console.log(`  Has Access Token: ${!!calendly?.accessToken}`);
      console.log(`  User URI: ${calendly?.userUri || 'N/A'}`);
      console.log(`  Full data:`, JSON.stringify(calendly, null, 2));
    } else {
      console.log(`  ⚠️  No Calendly configuration found`);
    }

    // Test 3: Check corresponding team member
    console.log('\n📋 Test 3: Checking corresponding team member...');
    const teamMember = await prisma.teamMember.findUnique({
      where: { teamId: parseInt(analystId) },
      select: {
        teamId: true,
        name: true,
        role: true,
      },
    });

    if (teamMember) {
      console.log(`✅ Found team member: ${teamMember.name} (Team ID: ${teamMember.teamId})`);
      console.log(`  Role: ${teamMember.role}`);
    } else {
      console.log(`❌ No team member found with teamId: ${analystId}`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCalendlyAPI();
