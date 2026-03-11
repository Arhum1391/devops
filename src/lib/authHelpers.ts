import { NextRequest } from 'next/server';
import { verifyToken } from './auth';

/**
 * Helper function to get the authenticated user from a request
 * Returns null if not authenticated
 */
export async function getAuthenticatedUser(request: NextRequest) {
  try {
    const token = request.cookies.get('user-auth-token')?.value;
    
    if (!token) {
      return null;
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    return decoded.userId;
  } catch (error) {
    console.error('Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Middleware helper for protected API routes
 * Returns the userId if authenticated, or null if not
 */
export async function requireAuth(request: NextRequest) {
  const userId = await getAuthenticatedUser(request);
  
  if (!userId) {
    return { error: 'Authentication required', userId: null };
  }

  return { error: null, userId };
}

