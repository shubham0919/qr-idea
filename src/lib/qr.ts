import QRCode from "qrcode";

export type QRStyle = "SQUARES" | "DOTS" | "ROUNDED";

export interface QROptions {
  foreground?: string;
  background?: string;
  size?: number;
  margin?: number;
  style?: QRStyle;
  logoUrl?: string;
  logoSize?: number;
  frameText?: string;
  frameColor?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
}

export async function generateQRCodeDataURL(
  url: string,
  options: QROptions = {}
): Promise<string> {
  const {
    foreground = "#000000",
    background = "#FFFFFF",
    size = 300,
    margin = 4,
    errorCorrectionLevel = "H", // Higher for logo support
  } = options;

  const dataUrl = await QRCode.toDataURL(url, {
    width: size,
    margin,
    color: {
      dark: foreground,
      light: background,
    },
    errorCorrectionLevel,
  });

  return dataUrl;
}

export async function generateQRCodeSVG(
  url: string,
  options: QROptions = {}
): Promise<string> {
  const {
    foreground = "#000000",
    background = "#FFFFFF",
    margin = 4,
    frameText,
    frameColor,
    errorCorrectionLevel = "H",
  } = options;

  let svg = await QRCode.toString(url, {
    type: "svg",
    margin,
    color: {
      dark: foreground,
      light: background,
    },
    errorCorrectionLevel,
  });

  // Add frame text if provided
  if (frameText) {
    const textColor = frameColor || foreground;
    // Parse SVG to add text
    svg = svg.replace(
      "</svg>",
      `<text x="50%" y="98%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${textColor}">${frameText}</text></svg>`
    );
    // Adjust viewBox to accommodate text
    svg = svg.replace(
      /viewBox="([^"]+)"/,
      (match, viewBox) => {
        const [x, y, w, h] = viewBox.split(" ").map(Number);
        return `viewBox="${x} ${y} ${w} ${h + 20}"`;
      }
    );
  }

  return svg;
}

export async function generateQRCodeBuffer(
  url: string,
  options: QROptions = {}
): Promise<Buffer> {
  const {
    foreground = "#000000",
    background = "#FFFFFF",
    size = 300,
    margin = 4,
    errorCorrectionLevel = "H",
  } = options;

  const buffer = await QRCode.toBuffer(url, {
    width: size,
    margin,
    color: {
      dark: foreground,
      light: background,
    },
    errorCorrectionLevel,
  });

  return buffer;
}

// Generate QR code with advanced styling options
export async function generateAdvancedQRCode(
  url: string,
  options: QROptions = {}
): Promise<{ dataUrl: string; svg: string }> {
  const dataUrl = await generateQRCodeDataURL(url, options);
  const svg = await generateQRCodeSVG(url, options);

  return { dataUrl, svg };
}
