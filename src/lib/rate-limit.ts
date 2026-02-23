import { prisma } from "./prisma";

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

const RATE_LIMITS: Record<string, RateLimitConfig> = {
  "api/links": { maxRequests: 100, windowMs: 60 * 1000 }, // 100 per minute
  "api/qr": { maxRequests: 50, windowMs: 60 * 1000 }, // 50 per minute
  "api/register": { maxRequests: 5, windowMs: 60 * 60 * 1000 }, // 5 per hour
  redirect: { maxRequests: 1000, windowMs: 60 * 1000 }, // 1000 per minute
  default: { maxRequests: 200, windowMs: 60 * 1000 }, // 200 per minute
};

export async function checkRateLimit(
  identifier: string,
  endpoint: string
): Promise<{ allowed: boolean; remaining: number; resetAt: Date }> {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default;
  const windowStart = new Date(Date.now() - config.windowMs);

  try {
    // Clean up old entries
    await prisma.rateLimit.deleteMany({
      where: {
        windowStart: { lt: windowStart },
      },
    });

    // Get or create rate limit entry
    const existing = await prisma.rateLimit.findUnique({
      where: {
        identifier_endpoint: { identifier, endpoint },
      },
    });

    if (!existing || existing.windowStart < windowStart) {
      // Create new window
      await prisma.rateLimit.upsert({
        where: {
          identifier_endpoint: { identifier, endpoint },
        },
        create: {
          identifier,
          endpoint,
          count: 1,
          windowStart: new Date(),
        },
        update: {
          count: 1,
          windowStart: new Date(),
        },
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetAt: new Date(Date.now() + config.windowMs),
      };
    }

    if (existing.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.windowStart.getTime() + config.windowMs),
      };
    }

    // Increment counter
    await prisma.rateLimit.update({
      where: {
        identifier_endpoint: { identifier, endpoint },
      },
      data: {
        count: { increment: 1 },
      },
    });

    return {
      allowed: true,
      remaining: config.maxRequests - existing.count - 1,
      resetAt: new Date(existing.windowStart.getTime() + config.windowMs),
    };
  } catch {
    // If rate limiting fails, allow the request but log error
    console.error("Rate limiting error");
    return {
      allowed: true,
      remaining: config.maxRequests,
      resetAt: new Date(Date.now() + config.windowMs),
    };
  }
}

export function getRateLimitHeaders(
  remaining: number,
  resetAt: Date
): Record<string, string> {
  return {
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": resetAt.toISOString(),
  };
}
