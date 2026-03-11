import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();

async function checkTeamImages() {
  try {
    console.log('🔍 Checking team member images in database...\n');

    const teamMembers = await prisma.teamMember.findMany({
      select: {
        id: true,
        teamId: true,
        name: true,
        image: true,
      },
      orderBy: { teamId: 'asc' },
    });

    console.log(`📊 Found ${teamMembers.length} team members:\n`);
    
    teamMembers.forEach(member => {
      const hasImage = member.image && member.image.trim() !== '' && member.image !== 'null' && member.image !== 'undefined';
      console.log(`  • ${member.name} (ID: ${member.teamId})`);
      console.log(`    Image: ${hasImage ? member.image : '(none)'}`);
      console.log(`    Will show initials: ${!hasImage}\n`);
    });

    const withImages = teamMembers.filter(m => 
      m.image && 
      m.image.trim() !== '' && 
      m.image !== 'null' && 
      m.image !== 'undefined'
    );
    
    const withoutImages = teamMembers.filter(m => 
      !m.image || 
      m.image.trim() === '' || 
      m.image === 'null' || 
      m.image === 'undefined'
    );

    console.log('='.repeat(60));
    console.log(`\n📈 Summary:`);
    console.log(`  Total team members: ${teamMembers.length}`);
    console.log(`  With images: ${withImages.length}`);
    console.log(`  Without images: ${withoutImages.length} (will show initials)`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTeamImages();

