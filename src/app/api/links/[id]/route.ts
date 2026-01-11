import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isValidSlug, isValidUrl } from "@/lib/utils/slug";
import { z } from "zod";

const updateLinkSchema = z.object({
  originalUrl: z.string().url("Invalid URL").optional(),
  title: z.string().optional(),
  slug: z.string().optional(),
  password: z.string().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
  maxClicks: z.number().positive().nullable().optional(),
  isActive: z.boolean().optional(),
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

    return NextResponse.json(link);
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
