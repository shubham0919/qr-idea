import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashIP, parseUserAgent, getGeoData, getClientIP } from "@/lib/analytics";
import { checkRateLimit, getRateLimitHeaders } from "@/lib/rate-limit";
import { detectBot, isDuplicateClick } from "@/lib/bot-detection";
import { checkLinkAccess, handleSelfDestruct } from "@/lib/access-control";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const ip = getClientIP(request);
  const userAgent = request.headers.get("user-agent") || "";

  try {
    // Rate limiting
    const rateLimit = await checkRateLimit(ip, "redirect");
    if (!rateLimit.allowed) {
      return new NextResponse("Too many requests", {
        status: 429,
        headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt),
      });
    }

    // Bot detection
    const botResult = detectBot(userAgent);

    const link = await prisma.link.findUnique({
      where: { slug },
    });

    if (!link) {
      return NextResponse.redirect(new URL("/404", request.url));
    }

    // Get geo data for access control
    const { country, city } = await getGeoData(ip);
    const { device, browser, os } = parseUserAgent(userAgent);

    // Check all access restrictions
    const accessResult = checkLinkAccess(link, ip, country, device);

    if (!accessResult.allowed) {
      // Handle different rejection reasons
      switch (accessResult.reason) {
        case "destroyed":
        case "self_destructed":
          if (accessResult.redirectUrl) {
            return NextResponse.redirect(accessResult.redirectUrl);
          }
          return NextResponse.redirect(new URL("/link-destroyed", request.url));

        case "inactive":
          return NextResponse.redirect(new URL("/link-inactive", request.url));

        case "expired":
        case "time_window_expired":
        case "max_clicks_reached":
          return NextResponse.redirect(new URL("/link-expired", request.url));

        case "not_yet_active":
          return NextResponse.redirect(new URL("/link-not-active", request.url));

        case "ip_not_allowed":
        case "ip_blocked":
        case "country_not_allowed":
        case "country_blocked":
        case "device_not_allowed":
        case "device_blocked":
          return NextResponse.redirect(new URL("/access-denied", request.url));

        default:
          return NextResponse.redirect(new URL("/link-expired", request.url));
      }
    }

    // Check for password protection
    const url = new URL(request.url);
    const providedPassword = url.searchParams.get("p");

    if (link.password) {
      if (!providedPassword || providedPassword !== link.password) {
        return NextResponse.redirect(new URL(`/p/${slug}`, request.url));
      }
    }

    // Extract UTM parameters from request
    const utmSource = url.searchParams.get("utm_source");
    const utmMedium = url.searchParams.get("utm_medium");
    const utmCampaign = url.searchParams.get("utm_campaign");

    const ipHash = hashIP(ip);
    const referrer = request.headers.get("referer") || null;

    // Check for duplicate click (2 second window) - only for non-bots
    if (!botResult.isBot) {
      const isDuplicate = await isDuplicateClick(prisma, link.id, ipHash, 2000);

      if (!isDuplicate) {
        // Track the click
        await prisma.click.create({
          data: {
            linkId: link.id,
            ipHash,
            device,
            browser,
            os,
            country,
            city,
            referrer,
            userAgent,
            isBot: botResult.isBot || botResult.isSuspicious,
            utmSource: utmSource || link.utmSource,
            utmMedium: utmMedium || link.utmMedium,
            utmCampaign: utmCampaign || link.utmCampaign,
          },
        });

        // Increment click count
        await prisma.link.update({
          where: { id: link.id },
          data: { clickCount: { increment: 1 } },
        });

        // Handle self-destruct after click
        await handleSelfDestruct(prisma, {
          ...link,
          clickCount: link.clickCount + 1,
        });
      }
    }

    // Build redirect URL with UTM parameters if configured on link
    let redirectUrl = link.originalUrl;
    if (link.utmSource || link.utmMedium || link.utmCampaign) {
      const targetUrl = new URL(link.originalUrl);
      if (link.utmSource) targetUrl.searchParams.set("utm_source", link.utmSource);
      if (link.utmMedium) targetUrl.searchParams.set("utm_medium", link.utmMedium);
      if (link.utmCampaign) targetUrl.searchParams.set("utm_campaign", link.utmCampaign);
      redirectUrl = targetUrl.toString();
    }

    return NextResponse.redirect(redirectUrl, {
      headers: getRateLimitHeaders(rateLimit.remaining, rateLimit.resetAt),
    });
  } catch (error) {
    console.error("Redirect error:", error);
    return NextResponse.redirect(new URL("/error", request.url));
  }
}
