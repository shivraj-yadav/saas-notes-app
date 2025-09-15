import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { checkSubscriptionLimits } from '../../../../lib/subscription';
import { z } from 'zod';

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
});

// GET /api/notes - Get all notes for authenticated user's tenant
export async function GET(request: NextRequest) {
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

    // Get search query parameter
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');

    // Build where clause with tenant isolation
    const whereClause: any = {
      tenantId: user.tenantId, // Tenant isolation
    };

    // Add search filter if provided
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const notes = await prisma.note.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/notes - Create a new note
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

    const body = await request.json();
    
    // Validate input
    const validationResult = createNoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.issues },
        { status: 400 }
      );
    }

    const { title, content } = validationResult.data;

    // Check subscription limits before creating note
    const subscriptionCheck = await checkSubscriptionLimits(user.tenantId, 'create_note');
    if (!subscriptionCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Subscription limit exceeded',
          message: subscriptionCheck.reason,
          currentCount: subscriptionCheck.currentCount,
          limit: subscriptionCheck.limit,
        },
        { status: 403 }
      );
    }

    // Create note with tenant isolation
    const note = await prisma.note.create({
      data: {
        title,
        content,
        userId: user.id,
        tenantId: user.tenantId, // Ensure tenant isolation
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
