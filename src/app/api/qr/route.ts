import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createQRSchema = z.object({
  linkId: z.string(),
  foreground: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  background: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  size: z.number().min(100).max(1000).optional(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const qrCodes = await prisma.qRCode.findMany({
      where: { userId: session.user.id },
      include: {
        link: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(qrCodes);
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return NextResponse.json(
      { error: "Failed to fetch QR codes" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createQRSchema.parse(body);

    // Check if link exists and belongs to user
    const link = await prisma.link.findFirst({
      where: {
        id: data.linkId,
        userId: session.user.id,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Check if QR already exists for this link
    const existingQR = await prisma.qRCode.findUnique({
      where: { linkId: data.linkId },
    });

    if (existingQR) {
      return NextResponse.json(
        { error: "QR code already exists for this link" },
        { status: 400 }
      );
    }

    // Check user's QR limit (Free plan = 20)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, _count: { select: { qrCodes: true } } },
    });

    if (user?.plan === "FREE" && user._count.qrCodes >= 20) {
      return NextResponse.json(
        { error: "QR code limit reached. Upgrade to Pro for unlimited QR codes." },
        { status: 403 }
      );
    }

    const qrCode = await prisma.qRCode.create({
      data: {
        linkId: data.linkId,
        foreground: data.foreground || "#000000",
        background: data.background || "#FFFFFF",
        size: data.size || 300,
        userId: session.user.id,
      },
      include: {
        link: true,
      },
    });

    return NextResponse.json(qrCode, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating QR code:", error);
    return NextResponse.json(
      { error: "Failed to create QR code" },
      { status: 500 }
    );
  }
}
