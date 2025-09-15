import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(request: NextRequest) {
  try {
    // Check if database URL is available
    if (!process.env.POSTGRES_PRISMA_URL && !process.env.DATABASE_URL) {
      return NextResponse.json({
        error: 'Database not configured - please seed the database first by visiting /api/auth/seed',
      }, { status: 503 });
    }

    const body = await request.json();
    const { email, password } = loginSchema.parse(body);

    // Find user with tenant information
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tenant: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials - user not found. Please seed the database first by visiting /api/auth/seed' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials - incorrect password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        tenantId: user.tenantId,
        role: user.role,
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '7d' }
    );

    // Create response with token in cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenant: {
          id: user.tenant.id,
          name: user.tenant.name,
          subscriptionPlan: user.tenant.subscription,
        },
      },
    });

    // Set HTTP-only cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    
    // More detailed error reporting
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          error: 'Login failed', 
          details: error.message,
          hint: 'If this is a database error, please visit /api/auth/seed to initialize the database'
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
