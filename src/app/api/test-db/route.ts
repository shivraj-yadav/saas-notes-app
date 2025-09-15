import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';

// GET /api/test-db - Test database connection
export async function GET(request: NextRequest) {
  try {
    // Test basic database connection
    await prisma.$connect();
    
    // Try to query the database
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Get table info to verify schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      connection: 'Connected to Vercel Postgres',
      testQuery: result,
      tables: tables,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
