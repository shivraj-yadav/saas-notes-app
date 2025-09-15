import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '../../../../../lib/auth';
import { getSubscriptionStatus } from '../../../../../lib/subscription';

// GET /api/subscription/status - Get current subscription status and usage
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

    const subscriptionStatus = await getSubscriptionStatus(user.tenantId);
    
    if (!subscriptionStatus) {
      return NextResponse.json(
        { error: 'Subscription status not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      subscription: subscriptionStatus,
      user: {
        role: user.role,
        canUpgrade: user.role === 'admin',
      },
    });

  } catch (error) {
    console.error('Get subscription status error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
