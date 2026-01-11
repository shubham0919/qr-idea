import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Plus, ExternalLink, MousePointer } from "lucide-react";
import { generateQRCodeDataURL } from "@/lib/qr";

async function getQRCodes(userId: string) {
  const qrCodes = await prisma.qRCode.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      link: {
        include: {
          _count: { select: { clicks: true } },
        },
      },
    },
  });

  // Generate data URLs for each QR code
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const qrCodesWithImages = await Promise.all(
    qrCodes.map(async (qr) => {
      const linkUrl = `${appUrl}/r/${qr.link.slug}`;
      const dataUrl = await generateQRCodeDataURL(linkUrl, {
        foreground: qr.foreground,
        background: qr.background,
        size: 150,
      });
      return { ...qr, dataUrl, linkUrl };
    })
  );

  return qrCodesWithImages;
}

export default async function QRCodesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const qrCodes = await getQRCodes(session.user.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
          <p className="text-gray-500">Manage your QR codes</p>
        </div>
        <Link href="/links/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Link with QR
          </Button>
        </Link>
      </div>

      {qrCodes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <QrCode className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No QR codes yet</h3>
            <p className="text-gray-500 mb-4">
              Create a link first, then generate a QR code for it
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {qrCodes.map((qr) => (
            <Card key={qr.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 bg-white flex justify-center">
                <img src={qr.dataUrl} alt="QR Code" className="w-32 h-32" />
              </div>
              <CardContent className="p-4 border-t">
                <Link
                  href={`/links/${qr.link.id}`}
                  className="font-medium text-gray-900 hover:text-primary block truncate"
                >
                  {qr.link.title || qr.link.slug}
                </Link>
                <p className="text-sm text-gray-500 truncate mt-1">
                  {qr.link.originalUrl}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-1.5 text-gray-500 text-sm">
                    <MousePointer className="h-4 w-4" />
                    <span>{qr.link._count.clicks} clicks</span>
                  </div>
                  <a
                    href={qr.linkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
