/**
 * Admin Reports Analytics API Route
 * GET /api/admin/reports/analytics - Get BPLO analytics and metrics
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only REVIEWER and ADMIN can access analytics
    if (!['REVIEWER', 'ADMINISTRATOR'].includes(session.user.role!)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get query parameters for date filtering
    const url = new URL(request.url);
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    // Default to last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate
      ? new Date(startDate)
      : new Date(end.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get total applications
    const totalApplications = await prisma.application.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    // Get applications by status
    const applicationsByStatus = await prisma.application.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: start, lte: end },
      },
      _count: true,
    });

    // Get total payments
    const totalPayments = await prisma.payment.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    // Get payments by status
    const paymentsByStatus = await prisma.payment.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: start, lte: end },
      },
      _count: true,
    });

    // Get total revenue
    const revenueData = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        createdAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });

    // Get permits issued
    const permitsIssued = await prisma.permit.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    // Get permits by status
    const permitsByStatus = await prisma.permit.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: start, lte: end },
      },
      _count: true,
    });

    // Get permits expiring within 30 days
    const thirtyDaysFromNow = new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringPermits = await prisma.permit.count({
      where: {
        status: 'ACTIVE',
        expiryDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
      },
    });

    // Get claim statistics
    const totalClaims = await prisma.slotReservation.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });

    // Get claims by status
    const claimsByStatus = await prisma.slotReservation.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: start, lte: end },
      },
      _count: true,
    });

    // Get average processing time (from submission to ENDORSED status)
    const processingTimes = await prisma.application.findMany({
      where: {
        status: 'ENDORSED',
        createdAt: { gte: start, lte: end },
      },
      select: { createdAt: true, updatedAt: true },
    });

    const avgProcessingDays =
      processingTimes.length > 0
        ? processingTimes.reduce((sum, app) => {
            const days =
              (app.updatedAt.getTime() - app.createdAt.getTime()) /
              (1000 * 60 * 60 * 24);
            return sum + days;
          }, 0) / processingTimes.length
        : 0;

    // Get approval rate
    const totalReviewed = applicationsByStatus.reduce((sum, stat) => {
      if (['APPROVED', 'REJECTED', 'ENDORSED'].includes(stat.status)) {
        return sum + stat._count;
      }
      return sum;
    }, 0);

    const approvalRate =
      totalReviewed > 0
        ? ((applicationsByStatus.find((s) => s.status === 'ENDORSED')?._count || 0) /
            totalReviewed) *
          100
        : 0;

    // Format response
    return NextResponse.json({
      period: {
        startDate: start.toISOString(),
        endDate: end.toISOString(),
        days: Math.ceil(
          (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
        ),
      },
      applications: {
        total: totalApplications,
        byStatus: Object.fromEntries(
          applicationsByStatus.map((s) => [s.status, s._count])
        ),
        avgProcessingDays: Math.round(avgProcessingDays * 100) / 100,
        approvalRate: Math.round(approvalRate * 100) / 100,
      },
      payments: {
        total: totalPayments,
        byStatus: Object.fromEntries(
          paymentsByStatus.map((s) => [s.status, s._count])
        ),
        totalRevenue: revenueData._sum.amount || 0,
      },
      permits: {
        issued: permitsIssued,
        byStatus: Object.fromEntries(
          permitsByStatus.map((s) => [s.status, s._count])
        ),
        expiringIn30Days: expiringPermits,
      },
      claims: {
        total: totalClaims,
        byStatus: Object.fromEntries(
          claimsByStatus.map((s) => [s.status, s._count])
        ),
      },
    });
  } catch (error) {
    console.error('Analytics generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    );
  }
}
