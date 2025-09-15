import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../../../../../lib/auth';
import { prisma } from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const inviteUserSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  role: z.enum(['admin', 'member'], { required_error: 'Role must be admin or member' }),
});

// POST /api/users/invite - Invite a new user to the tenant (Admin only)
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await getUserFromToken(token);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Check if user has admin permissions
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can invite users' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validate input
    const validationResult = inviteUserSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { email, name, role } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash default password
    const hashedPassword = await bcrypt.hash('password', 12);

    // Create new user in the same tenant as the admin
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        tenantId: user.tenantId, // Same tenant as the inviting admin
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    // Log the invitation action
    console.log(`User ${email} invited to tenant ${user.tenantId} by admin ${user.email} at ${new Date().toISOString()}`);

    return NextResponse.json({
      message: 'User invited successfully',
      user: newUser,
      invitedBy: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      defaultPassword: 'password', // In production, you'd send this via email
    }, { status: 201 });

  } catch (error) {
    console.error('User invitation error:', error);
    
    // More detailed error reporting
    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed', details: 'Unable to connect to database' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: 'Invitation failed', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error during invitation' },
      { status: 500 }
    );
  }
}
