import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Link2,
  Plus,
  MousePointer,
  ExternalLink,
  QrCode,
  Copy,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

async function getLinks(userId: string) {
  return prisma.link.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      qrCode: true,
      _count: { select: { clicks: true } },
    },
  });
}

export default async function LinksPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const links = await getLinks(session.user.id);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Links</h1>
          <p className="text-gray-500">Manage your short links</p>
        </div>
        <Link href="/links/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Link
          </Button>
        </Link>
      </div>

      {links.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Link2 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No links yet</h3>
            <p className="text-gray-500 mb-4">
              Create your first short link to get started
            </p>
            <Link href="/links/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Link
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {links.map((link) => (
            <Card key={link.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link
                        href={`/links/${link.id}`}
                        className="font-semibold text-gray-900 hover:text-primary truncate"
                      >
                        {link.title || link.slug}
                      </Link>
                      {!link.isActive && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                      {link.password && (
                        <Badge variant="outline">Protected</Badge>
                      )}
                      {link.qrCode && (
                        <Badge variant="outline" className="gap-1">
                          <QrCode className="h-3 w-3" />
                          QR
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-primary">
                      <span className="truncate">{appUrl}/r/{link.slug}</span>
                    </div>
                    <p className="text-sm text-gray-500 truncate mt-1">
                      {link.originalUrl}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-gray-500">
                      <MousePointer className="h-4 w-4" />
                      <span className="font-medium">{link._count.clicks}</span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/links/${link.id}`}>
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <a
                            href={`${appUrl}/r/${link.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open Link
                          </a>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
