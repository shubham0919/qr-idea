import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidSlug, isValidUrl } from "@/lib/utils/slug";
import { z } from "zod";

const updateLinkSchema = z.object({
  originalUrl: z.string().url("Invalid URL").optional(),
  title: z.string().nullable().optional(),
  slug: z.string().optional(),
  password: z.string().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  maxClicks: z.number().positive().nullable().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),

  // Time-based restrictions
  activeFrom: z.string().datetime().nullable().optional(),
  activeUntil: z.string().datetime().nullable().optional(),

  // IP Restrictions
  allowedIPs: z.array(z.string()).nullable().optional(),
  blockedIPs: z.array(z.string()).nullable().optional(),

  // Country Restrictions
  allowedCountries: z.array(z.string()).nullable().optional(),
  blockedCountries: z.array(z.string()).nullable().optional(),

  // Device Restrictions
  allowedDevices: z.array(z.string()).nullable().optional(),
  blockedDevices: z.array(z.string()).nullable().optional(),

  // Self-destruct
  selfDestructType: z.enum(["NONE", "AFTER_FIRST_CLICK", "AFTER_N_CLICKS", "AFTER_TIME"]).optional(),
  selfDestructClicks: z.number().positive().nullable().optional(),
  selfDestructAt: z.string().datetime().nullable().optional(),
  destroyRedirectUrl: z.string().url().nullable().optional(),

  // UTM Parameters
  utmSource: z.string().nullable().optional(),
  utmMedium: z.string().nullable().optional(),
  utmCampaign: z.string().nullable().optional(),
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

    const link = await prisma.link.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        qrCode: true,
        clicks: {
          orderBy: { createdAt: "desc" },
          take: 100,
        },
        _count: {
          select: { clicks: true },
        },
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Parse JSON fields for response
    return NextResponse.json({
      ...link,
      allowedIPs: link.allowedIPs ? JSON.parse(link.allowedIPs) : null,
      blockedIPs: link.blockedIPs ? JSON.parse(link.blockedIPs) : null,
      allowedCountries: link.allowedCountries ? JSON.parse(link.allowedCountries) : null,
      blockedCountries: link.blockedCountries ? JSON.parse(link.blockedCountries) : null,
      allowedDevices: link.allowedDevices ? JSON.parse(link.allowedDevices) : null,
      blockedDevices: link.blockedDevices ? JSON.parse(link.blockedDevices) : null,
    });
  } catch (error) {
    console.error("Error fetching link:", error);
    return NextResponse.json(
      { error: "Failed to fetch link" },
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
    const data = updateLinkSchema.parse(body);

    // Check if link exists and belongs to user
    const existingLink = await prisma.link.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Validate URL if provided
    if (data.originalUrl && !isValidUrl(data.originalUrl)) {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Validate slug if provided
    if (data.slug) {
      if (!isValidSlug(data.slug)) {
        return NextResponse.json(
          { error: "Invalid slug format" },
          { status: 400 }
        );
      }

      // Check if new slug is taken
      const slugTaken = await prisma.link.findFirst({
        where: {
          slug: data.slug,
          id: { not: id },
        },
      });

      if (slugTaken) {
        return NextResponse.json(
          { error: "This slug is already taken" },
          { status: 400 }
        );
      }
    }

    // Check plan restrictions for advanced features
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true },
    });

    if (user?.plan === "FREE") {
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
          { error: "Advanced restrictions require Pro plan." },
          { status: 403 }
        );
      }
    }

    const link = await prisma.link.update({
      where: { id },
      data: {
        ...(data.originalUrl && { originalUrl: data.originalUrl }),
        ...(data.title !== undefined && { title: data.title }),
        ...(data.slug && { slug: data.slug }),
        ...(data.password !== undefined && { password: data.password }),
        ...(data.expiresAt !== undefined && {
          expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        }),
        ...(data.maxClicks !== undefined && { maxClicks: data.maxClicks }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        ...(data.isPublic !== undefined && { isPublic: data.isPublic }),

        // Time-based restrictions
        ...(data.activeFrom !== undefined && {
          activeFrom: data.activeFrom ? new Date(data.activeFrom) : null,
        }),
        ...(data.activeUntil !== undefined && {
          activeUntil: data.activeUntil ? new Date(data.activeUntil) : null,
        }),

        // IP Restrictions
        ...(data.allowedIPs !== undefined && {
          allowedIPs: data.allowedIPs?.length ? JSON.stringify(data.allowedIPs) : null,
        }),
        ...(data.blockedIPs !== undefined && {
          blockedIPs: data.blockedIPs?.length ? JSON.stringify(data.blockedIPs) : null,
        }),

        // Country Restrictions
        ...(data.allowedCountries !== undefined && {
          allowedCountries: data.allowedCountries?.length ? JSON.stringify(data.allowedCountries) : null,
        }),
        ...(data.blockedCountries !== undefined && {
          blockedCountries: data.blockedCountries?.length ? JSON.stringify(data.blockedCountries) : null,
        }),

        // Device Restrictions
        ...(data.allowedDevices !== undefined && {
          allowedDevices: data.allowedDevices?.length ? JSON.stringify(data.allowedDevices) : null,
        }),
        ...(data.blockedDevices !== undefined && {
          blockedDevices: data.blockedDevices?.length ? JSON.stringify(data.blockedDevices) : null,
        }),

        // Self-destruct
        ...(data.selfDestructType !== undefined && { selfDestructType: data.selfDestructType }),
        ...(data.selfDestructClicks !== undefined && { selfDestructClicks: data.selfDestructClicks }),
        ...(data.selfDestructAt !== undefined && {
          selfDestructAt: data.selfDestructAt ? new Date(data.selfDestructAt) : null,
        }),
        ...(data.destroyRedirectUrl !== undefined && { destroyRedirectUrl: data.destroyRedirectUrl }),

        // UTM Parameters
        ...(data.utmSource !== undefined && { utmSource: data.utmSource }),
        ...(data.utmMedium !== undefined && { utmMedium: data.utmMedium }),
        ...(data.utmCampaign !== undefined && { utmCampaign: data.utmCampaign }),
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error("Error updating link:", error);
    return NextResponse.json(
      { error: "Failed to update link" },
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

    const link = await prisma.link.findFirst({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    await prisma.link.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Link deleted successfully" });
  } catch (error) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Failed to delete link" },
      { status: 500 }
    );
  }
}
