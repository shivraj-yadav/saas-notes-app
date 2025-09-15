import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../../../../../../lib/auth';
import { prisma } from '../../../../../../lib/prisma';
import { canUpgradeTenant } from '../../../../../../lib/subscription';

// POST /api/tenants/[slug]/upgrade - Upgrade tenant to Pro plan (Admin only)
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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
    if (!canUpgradeTenant(user.role)) {
      return NextResponse.json(
        { error: 'Only admins can upgrade tenant subscriptions' },
        { status: 403 }
      );
    }

    const { slug } = params;

    // Find the tenant by slug and ensure user belongs to it
    const tenant = await prisma.tenant.findFirst({
      where: {
        slug: slug,
        id: user.tenantId, // Ensure user can only upgrade their own tenant
      },
    });

    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found or access denied' },
        { status: 404 }
      );
    }

    // Check if already on Pro plan
    if (tenant.subscription === 'pro') {
      return NextResponse.json(
        { 
          error: 'Tenant is already on Pro plan',
          currentPlan: tenant.subscription,
        },
        { status: 400 }
      );
    }

    // Upgrade tenant to Pro plan
    const updatedTenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { 
        subscription: 'pro',
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        subscription: true,
        updatedAt: true,
      },
    });

    // Log the upgrade action (optional - for audit trail)
    console.log(`Tenant ${tenant.slug} upgraded to Pro by admin ${user.email} at ${new Date().toISOString()}`);

    return NextResponse.json({
      message: 'Tenant successfully upgraded to Pro plan',
      tenant: updatedTenant,
      upgradedBy: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      upgradedAt: updatedTenant.updatedAt,
    });

  } catch (error) {
    console.error('Tenant upgrade error:', error);
    
    // More detailed error reporting
    if (error instanceof Error) {
      if (error.message.includes('connect')) {
        return NextResponse.json(
          { error: 'Database connection failed', details: 'Unable to connect to database' },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        { error: 'Upgrade failed', details: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error during upgrade' },
      { status: 500 }
    );
  }
}
