import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashIP, parseUserAgent, getGeoData, getClientIP } from "@/lib/analytics";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const link = await prisma.link.findUnique({
      where: { slug },
    });

    if (!link) {
      return NextResponse.redirect(new URL("/404", request.url));
    }

    // Check if link is active
    if (!link.isActive) {
      return NextResponse.redirect(new URL("/link-inactive", request.url));
    }

    // Check if link has expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      return NextResponse.redirect(new URL("/link-expired", request.url));
    }

    // Check if max clicks exceeded
    if (link.maxClicks && link.clickCount >= link.maxClicks) {
      return NextResponse.redirect(new URL("/link-expired", request.url));
    }

    // Check for password protection
    const url = new URL(request.url);
    const providedPassword = url.searchParams.get("p");

    if (link.password) {
      if (!providedPassword || providedPassword !== link.password) {
        // Redirect to password entry page
        return NextResponse.redirect(
          new URL(`/p/${slug}`, request.url)
        );
      }
    }

    // Track the click asynchronously
    const ip = getClientIP(request);
    const userAgent = request.headers.get("user-agent") || "";
    const referrer = request.headers.get("referer") || null;

    // Don't await - fire and forget for faster redirects
    trackClick(link.id, ip, userAgent, referrer).catch(console.error);

    // Increment click count
    prisma.link.update({
      where: { id: link.id },
      data: { clickCount: { increment: 1 } },
    }).catch(console.error);

    return NextResponse.redirect(link.originalUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}

async function trackClick(
  linkId: string,
  ip: string,
  userAgent: string,
  referrer: string | null
) {
  const ipHash = hashIP(ip);

  // Check for duplicate click within 2 seconds
  const recentClick = await prisma.click.findFirst({
    where: {
      linkId,
      ipHash,
      createdAt: {
        gte: new Date(Date.now() - 2000),
      },
    },
  });

  if (recentClick) {
    return; // Skip duplicate
  }

  const { device, browser, os } = parseUserAgent(userAgent);
  const { country, city } = await getGeoData(ip);

  await prisma.click.create({
    data: {
      linkId,
      ipHash,
      device,
      browser,
      os,
      country,
      city,
      referrer,
      userAgent,
    },
  });
}
