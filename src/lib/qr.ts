import QRCode from "qrcode";

interface QROptions {
  foreground?: string;
  background?: string;
  size?: number;
}

export async function generateQRCodeDataURL(
  url: string,
  options: QROptions = {}
): Promise<string> {
  const { foreground = "#000000", background = "#FFFFFF", size = 300 } = options;

  const dataUrl = await QRCode.toDataURL(url, {
    width: size,
    margin: 2,
    color: {
      dark: foreground,
      light: background,
    },
    errorCorrectionLevel: "M",
  });

  return dataUrl;
}

export async function generateQRCodeSVG(
  url: string,
  options: QROptions = {}
): Promise<string> {
  const { foreground = "#000000", background = "#FFFFFF" } = options;

  const svg = await QRCode.toString(url, {
    type: "svg",
    margin: 2,
    color: {
      dark: foreground,
      light: background,
    },
    errorCorrectionLevel: "M",
  });

  return svg;
}

export async function generateQRCodeBuffer(
  url: string,
  options: QROptions = {}
): Promise<Buffer> {
  const { foreground = "#000000", background = "#FFFFFF", size = 300 } = options;

  const buffer = await QRCode.toBuffer(url, {
    width: size,
    margin: 2,
    color: {
      dark: foreground,
      light: background,
    },
    errorCorrectionLevel: "M",
  });

  return buffer;
}
