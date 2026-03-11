import { NextRequest, NextResponse } from 'next/server';
import { withNoAuth } from '@/lib/middleware';
import { validateCalendlyToken, testCalendlyIntegration } from '@/lib/calendly';

async function validateCalendlyCredentials(req: NextRequest, userId: string) {
  try {
    const body = await req.json();
    const { accessToken } = body;

    if (!accessToken || !accessToken.trim()) {
      return NextResponse.json(
        { success: false, error: 'Access token is required' },
        { status: 400 }
      );
    }

    // Validate the token
    const validationResult = await validateCalendlyToken(accessToken);

    if (!validationResult.success || !validationResult.userUri) {
      return NextResponse.json({
        success: false,
        error: validationResult.error || 'Failed to validate token',
        details: validationResult.details,
      });
    }

    // Optionally test fetching event types to ensure full access
    const integrationTest = await testCalendlyIntegration(
      accessToken,
      validationResult.userUri
    );

    return NextResponse.json({
      success: true,
      userUri: validationResult.userUri,
      userName: validationResult.userName,
      userEmail: validationResult.userEmail,
      schedulingUrl: validationResult.schedulingUrl,
      eventCount: integrationTest.eventCount,
      integrationTestSuccess: integrationTest.success,
      integrationTestError: integrationTest.error,
    });
  } catch (error) {
    console.error('Error validating Calendly credentials:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to validate credentials',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export const POST = withNoAuth(validateCalendlyCredentials);

