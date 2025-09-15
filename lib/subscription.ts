import { prisma } from './prisma';

export type SubscriptionPlan = 'free' | 'pro';

export interface SubscriptionLimits {
  maxNotes: number | null; // null means unlimited
}

export const SUBSCRIPTION_LIMITS: Record<SubscriptionPlan, SubscriptionLimits> = {
  free: {
    maxNotes: 3,
  },
  pro: {
    maxNotes: null, // unlimited
  },
};

export async function checkSubscriptionLimits(
  tenantId: string,
  action: 'create_note'
): Promise<{ allowed: boolean; reason?: string; currentCount?: number; limit?: number }> {
  try {
    // Get tenant subscription status
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { subscription: true },
    });

    if (!tenant) {
      return { allowed: false, reason: 'Tenant not found' };
    }

    const plan = tenant.subscription as SubscriptionPlan;
    const limits = SUBSCRIPTION_LIMITS[plan];

    if (action === 'create_note') {
      // For pro plan, always allow
      if (limits.maxNotes === null) {
        return { allowed: true };
      }

      // For free plan, check current note count
      const currentNoteCount = await prisma.note.count({
        where: { tenantId },
      });

      if (currentNoteCount >= limits.maxNotes) {
        return {
          allowed: false,
          reason: `Free plan limit reached. You can create up to ${limits.maxNotes} notes. Upgrade to Pro for unlimited notes.`,
          currentCount: currentNoteCount,
          limit: limits.maxNotes,
        };
      }

      return {
        allowed: true,
        currentCount: currentNoteCount,
        limit: limits.maxNotes,
      };
    }

    return { allowed: true };
  } catch (error) {
    console.error('Subscription check error:', error);
    return { allowed: false, reason: 'Subscription validation failed' };
  }
}

export async function getSubscriptionStatus(tenantId: string) {
  try {
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { 
        subscription: true,
        name: true,
        slug: true,
      },
    });

    if (!tenant) {
      return null;
    }

    const plan = tenant.subscription as SubscriptionPlan;
    const limits = SUBSCRIPTION_LIMITS[plan];
    
    // Get current usage
    const currentNoteCount = await prisma.note.count({
      where: { tenantId },
    });

    return {
      plan,
      limits,
      usage: {
        notes: currentNoteCount,
      },
      tenant: {
        name: tenant.name,
        slug: tenant.slug,
      },
    };
  } catch (error) {
    console.error('Get subscription status error:', error);
    return null;
  }
}

export function canUpgradeTenant(userRole: string): boolean {
  return userRole === 'admin';
}
