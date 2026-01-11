import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const linkId = url.searchParams.get("linkId");
    const period = url.searchParams.get("period") || "7d"; // 7d, 30d, 90d, all

    // Calculate date range
    let startDate: Date | undefined;
    const now = new Date();

    switch (period) {
      case "24h":
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "90d":
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = undefined;
    }

    // Build where clause
    const whereClause: {
      link: { userId: string; id?: string };
      createdAt?: { gte: Date };
    } = {
      link: { userId: session.user.id },
    };

    if (linkId) {
      whereClause.link.id = linkId;
    }

    if (startDate) {
      whereClause.createdAt = { gte: startDate };
    }

    // Get total clicks
    const totalClicks = await prisma.click.count({
      where: whereClause,
    });

    // Get unique visitors (by IP hash)
    const uniqueVisitors = await prisma.click.groupBy({
      by: ["ipHash"],
      where: whereClause,
    });

    // Get clicks by device
    const deviceStats = await prisma.click.groupBy({
      by: ["device"],
      where: whereClause,
      _count: true,
    });

    // Get clicks by browser
    const browserStats = await prisma.click.groupBy({
      by: ["browser"],
      where: whereClause,
      _count: true,
      orderBy: { _count: { browser: "desc" } },
      take: 10,
    });

    // Get clicks by country
    const countryStats = await prisma.click.groupBy({
      by: ["country"],
      where: whereClause,
      _count: true,
      orderBy: { _count: { country: "desc" } },
      take: 10,
    });

    // Get clicks by OS
    const osStats = await prisma.click.groupBy({
      by: ["os"],
      where: whereClause,
      _count: true,
      orderBy: { _count: { os: "desc" } },
      take: 10,
    });

    // Get clicks over time (daily)
    const clicksByDay = await prisma.$queryRaw<{ date: string; count: bigint }[]>`
      SELECT
        DATE(c."createdAt") as date,
        COUNT(*) as count
      FROM "Click" c
      JOIN "Link" l ON c."linkId" = l.id
      WHERE l."userId" = ${session.user.id}
        ${linkId ? prisma.$queryRaw`AND c."linkId" = ${linkId}` : prisma.$queryRaw``}
        ${startDate ? prisma.$queryRaw`AND c."createdAt" >= ${startDate}` : prisma.$queryRaw``}
      GROUP BY DATE(c."createdAt")
      ORDER BY date DESC
      LIMIT 30
    `;

    // Get top referrers
    const referrerStats = await prisma.click.groupBy({
      by: ["referrer"],
      where: {
        ...whereClause,
        referrer: { not: null },
      },
      _count: true,
      orderBy: { _count: { referrer: "desc" } },
      take: 10,
    });

    return NextResponse.json({
      totalClicks,
      uniqueVisitors: uniqueVisitors.length,
      devices: deviceStats.map((d) => ({
        device: d.device || "Unknown",
        count: d._count,
      })),
      browsers: browserStats.map((b) => ({
        browser: b.browser || "Unknown",
        count: b._count,
      })),
      countries: countryStats.map((c) => ({
        country: c.country || "Unknown",
        count: c._count,
      })),
      operatingSystems: osStats.map((o) => ({
        os: o.os || "Unknown",
        count: o._count,
      })),
      clicksByDay: clicksByDay.map((c) => ({
        date: c.date,
        count: Number(c.count),
      })),
      referrers: referrerStats.map((r) => ({
        referrer: r.referrer || "Direct",
        count: r._count,
      })),
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
