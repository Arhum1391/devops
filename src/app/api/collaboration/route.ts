import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, company, message, phone } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      );
    }

    // TODO: Send email or save to database
    return NextResponse.json({
      message: "Thank you for your collaboration request. We'll get back to you soon!",
      success: true,
    });
  } catch (error) {
    console.error('Collaboration form error:', error);
    return NextResponse.json(
      { error: 'Failed to submit collaboration request' },
      { status: 500 }
    );
  }
}
