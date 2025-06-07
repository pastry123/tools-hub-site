export interface QROptions {
  text: string;
  size: number;
  format: 'png' | 'jpg' | 'svg';
  errorCorrectionLevel: 'L' | 'M' | 'Q' | 'H';
}

export function generateQRCodeURL(options: QROptions): string {
  const { text, size, format, errorCorrectionLevel } = options;
  
  // Using QR Server API for QR code generation
  const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: text,
    format: format === 'jpg' ? 'png' : format,
    ecc: errorCorrectionLevel
  });
  
  return `${baseUrl}?${params.toString()}`;
}

export function downloadQRCode(url: string, filename: string): void {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function validateQRContent(content: string): { isValid: boolean; error?: string } {
  if (!content.trim()) {
    return { isValid: false, error: 'Content cannot be empty' };
  }
  
  if (content.length > 4296) {
    return { isValid: false, error: 'Content is too long (max 4296 characters)' };
  }
  
  return { isValid: true };
}
