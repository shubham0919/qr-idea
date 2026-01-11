import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link2, QrCode, MousePointer, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getDashboardStats(userId: string) {
  const [linksCount, qrCodesCount, totalClicks, recentLinks] = await Promise.all([
    prisma.link.count({ where: { userId } }),
    prisma.qRCode.count({ where: { userId } }),
    prisma.click.count({
      where: { link: { userId } },
    }),
    prisma.link.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        _count: { select: { clicks: true } },
      },
    }),
  ]);

  // Get clicks in last 7 days
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentClicks = await prisma.click.count({
    where: {
      link: { userId },
      createdAt: { gte: sevenDaysAgo },
    },
  });

  return {
    linksCount,
    qrCodesCount,
    totalClicks,
    recentClicks,
    recentLinks,
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const stats = await getDashboardStats(session.user.id);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {session.user.name || "User"}!</p>
        </div>
        <Link href="/links/new">
          <Button>
            <Link2 className="mr-2 h-4 w-4" />
            Create Link
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Links
            </CardTitle>
            <Link2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.linksCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              QR Codes
            </CardTitle>
            <QrCode className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.qrCodesCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Clicks
            </CardTitle>
            <MousePointer className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClicks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Last 7 Days
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentClicks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Links */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Links</CardTitle>
          <Link href="/links">
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {stats.recentLinks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Link2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No links yet</p>
              <Link href="/links/new">
                <Button variant="link">Create your first link</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentLinks.map((link) => (
                <Link
                  key={link.id}
                  href={`/links/${link.id}`}
                  className="flex items-center justify-between p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-gray-900 truncate">
                      {link.title || link.slug}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {link.originalUrl}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-2 text-gray-500">
                    <MousePointer className="h-4 w-4" />
                    <span className="text-sm font-medium">{link._count.clicks}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
