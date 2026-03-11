import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getAdminUserById, hashPassword, verifyPassword } from '@/lib/auth';
import { getDb } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ user: { id: '', username: 'admin', name: 'Admin User' } });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ user: { id: '', username: 'admin', name: 'Admin User' } });
    }

    const user = await getAdminUserById(decoded.userId);
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        user: { 
          id: user._id, 
          username: user.username,
          name: (user as any).name || ''
        } 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, username, currentPassword, newPassword, confirmPassword } = body;

    const user = await getAdminUserById(decoded.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};

    // Update name if provided (Note: User model doesn't have name field, but keeping for compatibility)
    if (name !== undefined) {
      // User model only has username and password, so we'll skip name
    }

    // Update username if provided
    if (username !== undefined && username !== user.username) {
      const db = await getDb();
      const existingUser = await db.collection('users').findOne({ username });
      if (existingUser && String(existingUser._id ?? existingUser.id) !== decoded.userId) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
      updateData.username = username;
    }

    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to change password' },
          { status: 400 }
        );
      }

      // Verify current password
      const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return NextResponse.json(
          { error: 'Current password is incorrect' },
          { status: 400 }
        );
      }

      // Validate new password
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: 'New password must be at least 8 characters long' },
          { status: 400 }
        );
      }

      if (newPassword !== confirmPassword) {
        return NextResponse.json(
          { error: 'New password and confirmation password do not match' },
          { status: 400 }
        );
      }

      // Check if new password is different from current
      const isSamePassword = await verifyPassword(newPassword, user.password);
      if (isSamePassword) {
        return NextResponse.json(
          { error: 'New password must be different from current password' },
          { status: 400 }
        );
      }

      // Hash new password
      updateData.password = await hashPassword(newPassword);
    }

    // Update user if there are changes
    if (Object.keys(updateData).length > 0) {
      const db = await getDb();
      await db.collection('users').updateOne(
        { $or: [{ _id: decoded.userId }, { id: decoded.userId }] },
        { $set: updateData }
      );
    }

    return NextResponse.json(
      { message: 'Profile updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}

