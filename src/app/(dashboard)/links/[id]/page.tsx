import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ExternalLink,
  MousePointer,
  Users,
  Globe,
  Smartphone,
  QrCode,
  Copy,
  Calendar,
  Lock,
  Hash,
} from "lucide-react";
import { LinkAnalyticsChart } from "@/components/dashboard/link-analytics-chart";
import { AnalyticsPieChart } from "@/components/dashboard/analytics-pie-chart";
import { AnalyticsBarChart } from "@/components/dashboard/analytics-bar-chart";
import { QRCodeSection } from "@/components/dashboard/qr-code-section";
import { CopyButton } from "@/components/dashboard/copy-button";

async function getLink(id: string, userId: string) {
  return prisma.link.findFirst({
    where: { id, userId },
    include: {
      qrCode: true,
      clicks: {
        orderBy: { createdAt: "desc" },
        take: 100,
      },
      _count: { select: { clicks: true } },
    },
  });
}

async function getAnalytics(linkId: string) {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [uniqueIPs, deviceStats, countryStats, browserStats, referrerStats, clicksByDay] = await Promise.all([
    prisma.click.groupBy({
      by: ["ipHash"],
      where: { linkId },
    }),
    prisma.click.groupBy({
      by: ["device"],
      where: { linkId },
      _count: true,
    }),
    prisma.click.groupBy({
      by: ["country"],
      where: { linkId },
      _count: true,
      orderBy: { _count: { country: "desc" } },
      take: 5,
    }),
    prisma.click.groupBy({
      by: ["browser"],
      where: { linkId },
      _count: true,
      orderBy: { _count: { browser: "desc" } },
      take: 5,
    }),
    prisma.click.groupBy({
      by: ["referrer"],
      where: { linkId },
      _count: true,
      orderBy: { _count: { referrer: "desc" } },
      take: 5,
    }),
    prisma.click.groupBy({
      by: ["createdAt"],
      where: {
        linkId,
        createdAt: { gte: sevenDaysAgo },
      },
      _count: true,
    }),
  ]);

  // Group clicks by day
  const clicksPerDay: Record<string, number> = {};
  for (let i = 6; i >= 0; i--) {
    const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];
    clicksPerDay[dateStr] = 0;
  }

  clicksByDay.forEach((click) => {
    const dateStr = new Date(click.createdAt).toISOString().split("T")[0];
    if (clicksPerDay[dateStr] !== undefined) {
      clicksPerDay[dateStr] += click._count;
    }
  });

  return {
    uniqueVisitors: uniqueIPs.length,
    devices: deviceStats.map((d) => ({
      name: d.device || "Unknown",
      value: d._count,
    })),
    countries: countryStats.map((c) => ({
      name: c.country || "Unknown",
      value: c._count,
    })),
    browsers: browserStats.map((b) => ({
      name: b.browser || "Unknown",
      value: b._count,
    })),
    referrers: referrerStats.map((r) => ({
      name: r.referrer || "Direct",
      value: r._count,
    })),
    clicksPerDay: Object.entries(clicksPerDay).map(([date, count]) => ({
      date,
      clicks: count,
    })),
  };
}

export default async function LinkDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    redirect("/login");
  }

  const link = await getLink(id, session.user.id);

  if (!link) {
    notFound();
  }

  const analytics = await getAnalytics(link.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const shortUrl = `${appUrl}/r/${link.slug}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/links">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-2xl font-bold text-gray-900">
              {link.title || link.slug}
            </h1>
            {!link.isActive && <Badge variant="secondary">Inactive</Badge>}
            {link.password && (
              <Badge variant="outline">
                <Lock className="mr-1 h-3 w-3" />
                Protected
              </Badge>
            )}
            {link.maxClicks && (
              <Badge variant="outline">
                <Hash className="mr-1 h-3 w-3" />
                {link.clickCount}/{link.maxClicks}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <code className="text-sm bg-gray-100 px-2 py-1 rounded">
              {shortUrl}
            </code>
            <CopyButton text={shortUrl} />
            <a href={shortUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="icon">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
          <p className="text-sm text-gray-500 mt-1 truncate">
            Destination: {link.originalUrl}
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Clicks
            </CardTitle>
            <MousePointer className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{link._count.clicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Unique Visitors
            </CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueVisitors}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Top Country
            </CardTitle>
            <Globe className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.countries[0]?.name || "N/A"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Top Device
            </CardTitle>
            <Smartphone className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {analytics.devices[0]?.name || "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Analytics Chart */}
        <div className="lg:col-span-2">
          <LinkAnalyticsChart data={analytics.clicksPerDay} />
        </div>

        {/* QR Code */}
        <div>
          <QRCodeSection
            linkId={link.id}
            qrCode={link.qrCode}
            shortUrl={shortUrl}
          />
        </div>
      </div>

      {/* Device & Browser Breakdown - Pie Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsPieChart
          title="Devices"
          data={analytics.devices}
          emptyMessage="No device data yet"
        />
        <AnalyticsPieChart
          title="Browsers"
          data={analytics.browsers}
          emptyMessage="No browser data yet"
        />
      </div>

      {/* Countries & Referrers - Bar Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <AnalyticsBarChart
          title="Top Countries"
          data={analytics.countries}
          emptyMessage="No country data yet"
        />
        <AnalyticsBarChart
          title="Top Referrers"
          data={analytics.referrers}
          emptyMessage="No referrer data yet"
        />
      </div>

      {/* Link Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Link Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500">Created:</span>
              <span className="text-sm">
                {new Date(link.createdAt).toLocaleDateString()}
              </span>
            </div>
            {link.expiresAt && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-500">Expires:</span>
                <span className="text-sm">
                  {new Date(link.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
