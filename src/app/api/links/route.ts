import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, isValidSlug, isValidUrl } from "@/lib/utils/slug";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { getClientIP } from "@/lib/analytics";
import { z } from "zod";

const createLinkSchema = z.object({
  originalUrl: z.string().url("Invalid URL"),
  title: z.string().optional(),
  slug: z.string().optional(),
  password: z.string().optional(),
  expiresAt: z.string().datetime().optional().nullable(),
  maxClicks: z.number().positive().optional().nullable(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),

  // Time-based restrictions
  activeFrom: z.string().datetime().optional().nullable(),
  activeUntil: z.string().datetime().optional().nullable(),

  // IP Restrictions
  allowedIPs: z.array(z.string()).optional().nullable(),
  blockedIPs: z.array(z.string()).optional().nullable(),

  // Country Restrictions
  allowedCountries: z.array(z.string()).optional().nullable(),
  blockedCountries: z.array(z.string()).optional().nullable(),

  // Device Restrictions
  allowedDevices: z.array(z.string()).optional().nullable(),
  blockedDevices: z.array(z.string()).optional().nullable(),

  // Self-destruct
  selfDestructType: z.enum(["NONE", "AFTER_FIRST_CLICK", "AFTER_N_CLICKS", "AFTER_TIME"]).optional(),
  selfDestructClicks: z.number().positive().optional().nullable(),
  selfDestructAt: z.string().datetime().optional().nullable(),
  destroyRedirectUrl: z.string().url().optional().nullable(),

  // UTM Parameters
  utmSource: z.string().optional().nullable(),
  utmMedium: z.string().optional().nullable(),
  utmCampaign: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limiting
    const ip = getClientIP(request);
    const rateLimit = await checkRateLimit(ip, "api/links");
    if (!rateLimit.allowed) {
      return new NextResponse("Too many requests", {
        status: 429,
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt),
      });
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

    return NextResponse.json(links, {
      headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt),
    });
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

    // Rate limiting
    const ip = getClientIP(req);
    const rateLimit = await checkRateLimit(ip, "api/links");
    if (!rateLimit.allowed) {
      return new NextResponse("Too many requests", {
        status: 429,
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt),
      });
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

    // Check user's link limit and plan restrictions
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, _count: { select: { links: true } } },
    });

    if (user?.plan === "FREE") {
      if (user._count.links >= 20) {
        return NextResponse.json(
          { error: "Link limit reached. Upgrade to Pro for unlimited links." },
          { status: 403 }
        );
      }

      // Free users can't use advanced features
      if (
        data.selfDestructType && data.selfDestructType !== "NONE" ||
        data.allowedIPs?.length ||
        data.blockedIPs?.length ||
        data.allowedCountries?.length ||
        data.blockedCountries?.length ||
        data.allowedDevices?.length ||
        data.blockedDevices?.length
      ) {
        return NextResponse.json(
          { error: "Advanced restrictions require Pro plan. Upgrade to unlock this feature." },
          { status: 403 }
        );
      }
    }

    const link = await prisma.link.create({
      data: {
        slug,
        originalUrl: data.originalUrl,
        title: data.title,
        password: data.password,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        maxClicks: data.maxClicks,
        isActive: data.isActive ?? true,
        isPublic: data.isPublic ?? true,
        userId: session.user.id,

        // Time-based restrictions
        activeFrom: data.activeFrom ? new Date(data.activeFrom) : null,
        activeUntil: data.activeUntil ? new Date(data.activeUntil) : null,

        // IP Restrictions (store as JSON strings)
        allowedIPs: data.allowedIPs?.length ? JSON.stringify(data.allowedIPs) : null,
        blockedIPs: data.blockedIPs?.length ? JSON.stringify(data.blockedIPs) : null,

        // Country Restrictions
        allowedCountries: data.allowedCountries?.length ? JSON.stringify(data.allowedCountries) : null,
        blockedCountries: data.blockedCountries?.length ? JSON.stringify(data.blockedCountries) : null,

        // Device Restrictions
        allowedDevices: data.allowedDevices?.length ? JSON.stringify(data.allowedDevices) : null,
        blockedDevices: data.blockedDevices?.length ? JSON.stringify(data.blockedDevices) : null,

        // Self-destruct
        selfDestructType: data.selfDestructType || "NONE",
        selfDestructClicks: data.selfDestructClicks,
        selfDestructAt: data.selfDestructAt ? new Date(data.selfDestructAt) : null,
        destroyRedirectUrl: data.destroyRedirectUrl,

        // UTM Parameters
        utmSource: data.utmSource,
        utmMedium: data.utmMedium,
        utmCampaign: data.utmCampaign,
      },
    });

    return NextResponse.json(link, {
      status: 201,
      headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt),
    });
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
