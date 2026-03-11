/**
 * Script to update Abdullah Ghaffar's analyst image
 * 
 * Usage: npx tsx scripts/update-abdullah-image.ts
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function updateAbdullahImage() {
  console.log('🔄 Updating Abdullah Ghaffar\'s image...\n');

  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Find team member by name (case-insensitive, partial match)
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        OR: [
          { name: { contains: 'Abdullah', mode: 'insensitive' } },
          { name: { contains: 'Ghaffar', mode: 'insensitive' } },
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
      console.log('❌ No team member found with name containing "Abdullah" or "Ghaffar"');
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
      console.log('\n🔍 Filtering for "Abdullah Ghaffar"...');
      const abdullahGhaffar = teamMembers.find(m => 
        m.name.toLowerCase().includes('abdullah') && m.name.toLowerCase().includes('ghaffar')
      );
      if (abdullahGhaffar) {
        console.log(`✅ Found: ${abdullahGhaffar.name} (ID: ${abdullahGhaffar.teamId})\n`);
        const teamMember = abdullahGhaffar;
        console.log(`📋 Updating team member: ${teamMember.name} (ID: ${teamMember.teamId})`);
        console.log(`   Current image: ${teamMember.image || 'None'}\n`);

        // Update the image
        const newImagePath = '/team images/abdullah.jpeg';
        const updated = await prisma.teamMember.update({
          where: { id: teamMember.id },
          data: { image: newImagePath },
        });

        console.log('✅ Image updated successfully!');
        console.log(`   New image path: ${updated.image}`);
        console.log(`   Team member: ${updated.name} (ID: ${updated.teamId})`);
        return;
      }
      console.log('\n❌ Please specify which team member to update');
      return;
    }

    const teamMember = teamMembers[0];
    console.log(`📋 Found team member: ${teamMember.name} (ID: ${teamMember.teamId})`);
    console.log(`   Current image: ${teamMember.image || 'None'}\n`);

    // Update the image
    const newImagePath = '/team images/abdullah.jpeg';
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

updateAbdullahImage();

