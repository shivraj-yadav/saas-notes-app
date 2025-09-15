import { NextResponse } from 'next/server';

// GET /api/health - Health check endpoint for automated testing
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
