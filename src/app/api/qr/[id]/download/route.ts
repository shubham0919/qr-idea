import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQRCodeBuffer, generateQRCodeSVG } from "@/lib/qr";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;
    const url = new URL(req.url);
    const format = url.searchParams.get("format") || "png";

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        link: true,
      },
    });

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const linkUrl = `${appUrl}/r/${qrCode.link.slug}`;

    if (format === "svg") {
      const svg = await generateQRCodeSVG(linkUrl, {
        foreground: qrCode.foreground,
        background: qrCode.background,
      });

      return new NextResponse(svg, {
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="qr-${qrCode.link.slug}.svg"`,
        },
      });
    }

    // Default to PNG
    const buffer = await generateQRCodeBuffer(linkUrl, {
      foreground: qrCode.foreground,
      background: qrCode.background,
      size: qrCode.size,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qr-${qrCode.link.slug}.png"`,
      },
    });
  } catch (error) {
    console.error("Error downloading QR code:", error);
    return NextResponse.json(
      { error: "Failed to download QR code" },
      { status: 500 }
    );
  }
}
