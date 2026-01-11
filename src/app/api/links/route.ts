import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, isValidSlug, isValidUrl } from "@/lib/utils/slug";
import { z } from "zod";

const createLinkSchema = z.object({
  originalUrl: z.string().url("Invalid URL"),
  title: z.string().optional(),
  slug: z.string().optional(),
  password: z.string().optional(),
  expiresAt: z.string().datetime().optional(),
  maxClicks: z.number().positive().optional(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const links = await prisma.link.findMany({
      where: { userId: session.user.id },
      include: {
        qrCode: true,
        _count: {
          select: { clicks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links" },
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
    const data = createLinkSchema.parse(body);

    // Validate URL
    if (!isValidUrl(data.originalUrl)) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Generate or validate slug
    let slug = data.slug || generateSlug();

    if (data.slug && !isValidSlug(data.slug)) {
      return NextResponse.json(
        { error: "Invalid slug format. Use 3-50 alphanumeric characters and hyphens." },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existingLink = await prisma.link.findUnique({
      where: { slug },
    });

    if (existingLink) {
      if (data.slug) {
        return NextResponse.json(
          { error: "This slug is already taken" },
          { status: 400 }
        );
      }
      // Regenerate if auto-generated slug collides
      slug = generateSlug();
    }

    // Check user's link limit (Free plan = 20)
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, _count: { select: { links: true } } },
    });

    if (user?.plan === "FREE" && user._count.links >= 20) {
      return NextResponse.json(
        { error: "Link limit reached. Upgrade to Pro for unlimited links." },
        { status: 403 }
      );
    }

    const link = await prisma.link.create({
      data: {
        slug,
        originalUrl: data.originalUrl,
        title: data.title,
        password: data.password,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        maxClicks: data.maxClicks,
        userId: session.user.id,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Failed to create link" },
      { status: 500 }
    );
  }
}
