import { NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

const analystsData = [
  { id: 0, name: 'Adnan', role: 'Senior Developer', about: 'Full-stack developer with expertise in modern web technologies, API development, and system integration.', calendar: '' },
  { id: 1, name: 'Assassin', role: 'Lead Architect', about: 'Senior software architect with extensive experience in system design and development.', calendar: '' },
  { id: 2, name: 'Hassan Tariq', role: 'Full-Stack Developer', about: 'Full-stack developer specializing in modern web technologies.', calendar: '' },
  { id: 3, name: 'Hamza Ali', role: 'Backend Engineer', about: 'Backend engineer with 5 years of experience in building robust server-side applications.', calendar: '' },
  { id: 4, name: 'Hassan Khan', role: 'DevOps Engineer', about: 'DevOps and cloud infrastructure specialist.', calendar: '' },
  { id: 5, name: 'Meower', role: 'Frontend Developer', about: 'Frontend developer specializing in React and modern UI/UX design.', calendar: '' },
  { id: 6, name: 'Mohid', role: 'Technical Consultant', about: 'Technical consultant with over 5 years of experience.', calendar: '' },
  { id: 7, name: 'M. Usama', role: 'Cloud Solutions Architect', about: 'Cloud solutions architect with expertise in AWS, Azure, and GCP.', calendar: '' }
];

export async function POST() {
  try {
    const db = await getDb();
    await db.collection('team').deleteMany({});

    const now = new Date();
    const teamMembers = analystsData.map((a) => ({
      _id: crypto.randomUUID(),
      id: crypto.randomUUID(),
      teamId: a.id,
      name: a.name,
      role: a.role,
      about: a.about,
      calendar: a.calendar,
      bootcampAbout: null,
      image: null,
      createdAt: now,
      updatedAt: now,
    }));

    const result = await db.collection('team').insertMany(teamMembers);

    return NextResponse.json({
      message: 'Team members populated successfully',
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error('Populate team members error:', error);
    return NextResponse.json(
      { error: 'Failed to populate team members' },
      { status: 500 }
    );
  }
}
