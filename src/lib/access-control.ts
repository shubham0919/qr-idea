import { Link } from "@prisma/client";

export interface AccessCheckResult {
  allowed: boolean;
  reason?: string;
  redirectUrl?: string;
}

// Parse JSON array from string safely
function parseJsonArray(value: string | null): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function checkLinkAccess(
  link: Link,
  clientIP: string,
  country: string | null,
  device: string | null
): AccessCheckResult {
  // Check if link is destroyed
  if (link.isDestroyed) {
    return {
      allowed: false,
      reason: "destroyed",
      redirectUrl: link.destroyRedirectUrl || undefined,
    };
  }

  // Check if link is active
  if (!link.isActive) {
    return {
      allowed: false,
      reason: "inactive",
    };
  }

  // Check expiration
  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    return {
      allowed: false,
      reason: "expired",
    };
  }

  // Check max clicks
  if (link.maxClicks && link.clickCount >= link.maxClicks) {
    return {
      allowed: false,
      reason: "max_clicks_reached",
    };
  }

  // Check time-based restrictions
  const now = new Date();
  if (link.activeFrom && new Date(link.activeFrom) > now) {
    return {
      allowed: false,
      reason: "not_yet_active",
    };
  }
  if (link.activeUntil && new Date(link.activeUntil) < now) {
    return {
      allowed: false,
      reason: "time_window_expired",
    };
  }

  // Check self-destruct time
  if (
    link.selfDestructType === "AFTER_TIME" &&
    link.selfDestructAt &&
    new Date(link.selfDestructAt) < now
  ) {
    return {
      allowed: false,
      reason: "self_destructed",
      redirectUrl: link.destroyRedirectUrl || undefined,
    };
  }

  // Check IP restrictions
  const allowedIPs = parseJsonArray(link.allowedIPs);
  const blockedIPs = parseJsonArray(link.blockedIPs);

  if (allowedIPs.length > 0 && !allowedIPs.includes(clientIP)) {
    return {
      allowed: false,
      reason: "ip_not_allowed",
    };
  }

  if (blockedIPs.includes(clientIP)) {
    return {
      allowed: false,
      reason: "ip_blocked",
    };
  }

  // Check country restrictions
  if (country) {
    const allowedCountries = parseJsonArray(link.allowedCountries);
    const blockedCountries = parseJsonArray(link.blockedCountries);

    if (
      allowedCountries.length > 0 &&
      !allowedCountries.includes(country.toUpperCase())
    ) {
      return {
        allowed: false,
        reason: "country_not_allowed",
      };
    }

    if (blockedCountries.includes(country.toUpperCase())) {
      return {
        allowed: false,
        reason: "country_blocked",
      };
    }
  }

  // Check device restrictions
  if (device) {
    const allowedDevices = parseJsonArray(link.allowedDevices);
    const blockedDevices = parseJsonArray(link.blockedDevices);

    const normalizedDevice = device.toLowerCase();

    if (
      allowedDevices.length > 0 &&
      !allowedDevices.some((d) => d.toLowerCase() === normalizedDevice)
    ) {
      return {
        allowed: false,
        reason: "device_not_allowed",
      };
    }

    if (blockedDevices.some((d) => d.toLowerCase() === normalizedDevice)) {
      return {
        allowed: false,
        reason: "device_blocked",
      };
    }
  }

  return { allowed: true };
}

export async function handleSelfDestruct(
  prisma: any,
  link: Link
): Promise<boolean> {
  // Check if self-destruct should trigger
  if (link.selfDestructType === "NONE" || link.isDestroyed) {
    return false;
  }

  let shouldDestroy = false;

  switch (link.selfDestructType) {
    case "AFTER_FIRST_CLICK":
      // Will destroy after this click
      shouldDestroy = true;
      break;

    case "AFTER_N_CLICKS":
      // Check if we've reached the click threshold
      if (link.selfDestructClicks && link.clickCount + 1 >= link.selfDestructClicks) {
        shouldDestroy = true;
      }
      break;

    case "AFTER_TIME":
      // Already handled in checkLinkAccess
      if (link.selfDestructAt && new Date(link.selfDestructAt) < new Date()) {
        shouldDestroy = true;
      }
      break;
  }

  if (shouldDestroy) {
    await prisma.link.update({
      where: { id: link.id },
      data: {
        isDestroyed: true,
        destroyedAt: new Date(),
      },
    });
    return true;
  }

  return false;
}
