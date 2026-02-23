// Common bot user agent patterns
const BOT_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /slurp/i,
  /mediapartners/i,
  /googlebot/i,
  /bingbot/i,
  /yandex/i,
  /baiduspider/i,
  /facebookexternalhit/i,
  /twitterbot/i,
  /rogerbot/i,
  /linkedinbot/i,
  /embedly/i,
  /quora link preview/i,
  /showyoubot/i,
  /outbrain/i,
  /pinterest/i,
  /developers\.google\.com/i,
  /slackbot/i,
  /vkshare/i,
  /w3c_validator/i,
  /redditbot/i,
  /applebot/i,
  /whatsapp/i,
  /flipboard/i,
  /tumblr/i,
  /bitlybot/i,
  /skypeuripreview/i,
  /nuzzel/i,
  /discordbot/i,
  /google page speed/i,
  /qwantify/i,
  /pinterestbot/i,
  /bitrix link preview/i,
  /xing-contenttabreceiver/i,
  /chrome-lighthouse/i,
  /telegrambot/i,
  /integration testing/i,
  /headlesschrome/i,
  /phantomjs/i,
  /selenium/i,
  /webdriver/i,
  /puppeteer/i,
  /playwright/i,
];

// Suspicious patterns that might indicate automated traffic
const SUSPICIOUS_PATTERNS = [
  /curl/i,
  /wget/i,
  /python-requests/i,
  /python-urllib/i,
  /go-http-client/i,
  /java\//i,
  /okhttp/i,
  /axios/i,
  /node-fetch/i,
  /libwww-perl/i,
  /scrapy/i,
  /httpx/i,
];

export interface BotDetectionResult {
  isBot: boolean;
  isSuspicious: boolean;
  reason?: string;
}

export function detectBot(userAgent: string | null): BotDetectionResult {
  if (!userAgent || userAgent.trim() === "") {
    return {
      isBot: true,
      isSuspicious: true,
      reason: "Missing user agent",
    };
  }

  // Check for known bot patterns
  for (const pattern of BOT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return {
        isBot: true,
        isSuspicious: false,
        reason: `Matched bot pattern: ${pattern.source}`,
      };
    }
  }

  // Check for suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(userAgent)) {
      return {
        isBot: false,
        isSuspicious: true,
        reason: `Matched suspicious pattern: ${pattern.source}`,
      };
    }
  }

  // Check for very short user agents (usually bots)
  if (userAgent.length < 20) {
    return {
      isBot: false,
      isSuspicious: true,
      reason: "User agent too short",
    };
  }

  return {
    isBot: false,
    isSuspicious: false,
  };
}

// Check if click is a duplicate within time window
export async function isDuplicateClick(
  prisma: any,
  linkId: string,
  ipHash: string,
  windowMs: number = 2000 // 2 seconds default
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowMs);

  const recentClick = await prisma.click.findFirst({
    where: {
      linkId,
      ipHash,
      createdAt: { gte: windowStart },
    },
    orderBy: { createdAt: "desc" },
  });

  return !!recentClick;
}
