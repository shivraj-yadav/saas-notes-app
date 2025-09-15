import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        message: 'Database not configured - DATABASE_URL environment variable missing',
        note: 'This is expected during local builds. Database will be available on Vercel deployment.',
      }, { status: 503 });
    }

    // Dynamic import to avoid initialization during build
    const { prisma } = await import('../../../../lib/prisma');
    
    // Test database connection
    await prisma.$connect();
    
    // Query to get basic info about tables
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    
    // Get counts from each table
    const userCount = await prisma.user.count();
    const tenantCount = await prisma.tenant.count();
    const noteCount = await prisma.note.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        tables,
        counts: {
          users: userCount,
          tenants: tenantCount,
          notes: noteCount,
        },
      },
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
