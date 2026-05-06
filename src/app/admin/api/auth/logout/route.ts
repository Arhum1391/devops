import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json(
    { message: 'Logout successful' },
    { status: 200 }
  );

  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: false, // Set to true when using HTTPS
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
