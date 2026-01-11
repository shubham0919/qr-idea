import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQRCodeDataURL, generateQRCodeSVG, generateQRCodeBuffer } from "@/lib/qr";
import { z } from "zod";

const updateQRSchema = z.object({
  foreground: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  size: z.number().min(100).max(1000).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

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

    // Generate the QR code data URL
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const linkUrl = `${appUrl}/r/${qrCode.link.slug}`;

    const dataUrl = await generateQRCodeDataURL(linkUrl, {
      foreground: qrCode.foreground,
      background: qrCode.background,
      size: qrCode.size,
    });

    return NextResponse.json({
      ...qrCode,
      dataUrl,
      linkUrl,
    });
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR code" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = updateQRSchema.parse(body);

    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    const updated = await prisma.qRCode.update({
      where: { id },
      data: {
        ...(data.foreground && { foreground: data.foreground }),
        ...(data.background && { background: data.background }),
        ...(data.size && { size: data.size }),
      },
      include: {
        link: true,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating QR code:", error);
    return NextResponse.json(
      { error: "Failed to update QR code" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const qrCode = await prisma.qRCode.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    await prisma.qRCode.delete({
      where: { id },
    });

    return NextResponse.json({ message: "QR code deleted successfully" });
  } catch (error) {
    console.error("Error deleting QR code:", error);
    return NextResponse.json(
      { error: "Failed to delete QR code" },
      { status: 500 }
    );
  }
}
