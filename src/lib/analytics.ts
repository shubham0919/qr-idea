import { createHash } from "crypto";
import { UAParser } from "ua-parser-js";

export function hashIP(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

export function parseUserAgent(userAgent: string) {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  let device = "desktop";
  if (result.device.type === "mobile") {
    device = "mobile";
  } else if (result.device.type === "tablet") {
    device = "tablet";
  }

  return {
    device,
    browser: result.browser.name || "Unknown",
    os: result.os.name || "Unknown",
  };
}

interface GeoData {
  country: string | null;
  city: string | null;
}

export async function getGeoData(ip: string): Promise<GeoData> {
  // Skip for localhost/private IPs
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return { country: null, city: null };
  }

  try {
    const response = await fetch(`http://ip-api.com/json/${ip}?fields=country,city`, {
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    if (!response.ok) {
      return { country: null, city: null };
    }

    const data = await response.json();
    return {
      country: data.country || null,
      city: data.city || null,
    };
  } catch {
    return { country: null, city: null };
  }
}

export function getClientIP(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  return "127.0.0.1";
}
