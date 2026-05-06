/**
 * Script to update Khair ul Wara's analyst image
 * 
 * Usage: npx tsx scripts/update-wara-image.ts
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function updateWaraImage() {
  console.log('🔄 Updating Khair ul Wara\'s image...\n');

  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Find team member by name (case-insensitive, partial match)
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        OR: [
          { name: { contains: 'Khair', mode: 'insensitive' } },
          { name: { contains: 'Wara', mode: 'insensitive' } },
          { name: { contains: 'ul Wara', mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        teamId: true,
        name: true,
        image: true,
      },
    });

    if (teamMembers.length === 0) {
      console.log('❌ No team member found with name containing "Khair", "Wara", or "ul Wara"');
      console.log('\n📋 Available team members:');
      const allMembers = await prisma.teamMember.findMany({
        select: { teamId: true, name: true },
        orderBy: { teamId: 'asc' },
      });
      allMembers.forEach(m => {
        console.log(`  - ID: ${m.teamId}, Name: ${m.name}`);
      });
      return;
    }

    if (teamMembers.length > 1) {
      console.log('⚠️  Multiple team members found:');
      teamMembers.forEach(m => {
        console.log(`  - ID: ${m.teamId}, Name: ${m.name}`);
      });
      console.log('\n❌ Please specify which team member to update');
      return;
    }

    const teamMember = teamMembers[0];
    console.log(`📋 Found team member: ${teamMember.name} (ID: ${teamMember.teamId})`);
    console.log(`   Current image: ${teamMember.image || 'None'}\n`);

    // Update the image
    const newImagePath = '/team images/wara.jpeg';
    const updated = await prisma.teamMember.update({
      where: { id: teamMember.id },
      data: { image: newImagePath },
    });

    console.log('✅ Image updated successfully!');
    console.log(`   New image path: ${updated.image}`);
    console.log(`   Team member: ${updated.name} (ID: ${updated.teamId})`);

  } catch (error) {
    console.error('❌ Error updating image:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateWaraImage();

