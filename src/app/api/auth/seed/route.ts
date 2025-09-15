import { NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
  return seedDatabase();
}

export async function POST() {
  return seedDatabase();
}

async function seedDatabase() {
  try {
    // Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: false,
        message: 'Database not configured - DATABASE_URL environment variable missing',
      }, { status: 503 });
    }

    // Create tenants
    const acmeTenant = await prisma.tenant.upsert({
      where: { slug: 'acme' },
      update: {},
      create: {
        name: 'Acme Corporation',
        slug: 'acme',
        subscription: 'free',
      },
    });

    const globexTenant = await prisma.tenant.upsert({
      where: { slug: 'globex' },
      update: {},
      create: {
        name: 'Globex Corporation',
        slug: 'globex',
        subscription: 'pro',
      },
    });

    // Hash password
    const hashedPassword = await bcrypt.hash('password', 12);

    // Create users
    const users = [
      {
        email: 'admin@acme.test',
        name: 'Acme Admin',
        role: 'admin',
        tenantId: acmeTenant.id,
      },
      {
        email: 'user@acme.test',
        name: 'Acme User',
        role: 'member',
        tenantId: acmeTenant.id,
      },
      {
        email: 'admin@globex.test',
        name: 'Globex Admin',
        role: 'admin',
        tenantId: globexTenant.id,
      },
      {
        email: 'user@globex.test',
        name: 'Globex User',
        role: 'member',
        tenantId: globexTenant.id,
      },
    ];

    for (const userData of users) {
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          password: hashedPassword,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        tenants: 2,
        users: 4,
        password: 'password',
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to seed database',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
