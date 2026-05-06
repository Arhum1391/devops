import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
    try {
        const { name } = await request.json();

        if (!name) {
            return NextResponse.json(
                { error: 'Analyst name is required' },
                { status: 400 }
            );
        }

        const db = await getDb();
        const analyst = await db.collection('team').findOne({ name });

        if (analyst) {
            return NextResponse.json({
                about: (analyst as Record<string, unknown>).about || 'No additional information available.'
            });
        } else {
            return NextResponse.json(
                { error: 'Analyst not found' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error fetching analyst about data:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
