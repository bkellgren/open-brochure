import QRCode from 'qrcode';

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  darkColor?: string;
  lightColor?: string;
}

const DEFAULT_OPTIONS: Required<QRCodeOptions> = {
  width: 200,
  margin: 2,
  darkColor: '#000000',
  lightColor: '#ffffff',
};

/**
 * Generate a QR code as a data URL
 */
export async function generateQRCodeDataUrl(
  url: string,
  options: QRCodeOptions = {}
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return QRCode.toDataURL(url, {
    width: opts.width,
    margin: opts.margin,
    color: {
      dark: opts.darkColor,
      light: opts.lightColor,
    },
  });
}

/**
 * Generate a QR code as a canvas element
 */
export async function generateQRCodeCanvas(
  url: string,
  canvas: HTMLCanvasElement,
  options: QRCodeOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  await QRCode.toCanvas(canvas, url, {
    width: opts.width,
    margin: opts.margin,
    color: {
      dark: opts.darkColor,
      light: opts.lightColor,
    },
  });
}

/**
 * Download a QR code as PNG
 */
export async function downloadQRCode(
  url: string,
  filename: string,
  options: QRCodeOptions = {}
): Promise<void> {
  const dataUrl = await generateQRCodeDataUrl(url, {
    width: 400, // Higher resolution for download
    ...options,
  });

  const link = document.createElement('a');
  link.download = `${filename}-qr.png`;
  link.href = dataUrl;
  link.click();
}
