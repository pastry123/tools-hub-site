import sharp from 'sharp';
import jsQR from 'jsqr';

export interface BarcodeResult {
  value: string;
  type: string;
  format: string;
  confidence: number;
  metadata?: {
    errorCorrectionLevel?: string;
    version?: string;
    mask?: string;
    scanLine?: number;
    bars?: number;
    transitions?: number;
    aspectRatio?: number;
    note?: string;
    segments?: Array<{
      mode: string;
      data: string;
    }>;
  };
}

export class BarcodeService {
  async scanBarcode(imageBuffer: Buffer): Promise<BarcodeResult> {
    try {
      // Convert image to RGBA format for jsQR
      const { data, info } = await sharp(imageBuffer)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Try QR code detection with jsQR
      const qrResult = jsQR(new Uint8ClampedArray(data), info.width, info.height);
      
      if (qrResult) {
        return {
          value: qrResult.data,
          type: 'QR Code',
          format: 'QR_CODE',
          confidence: 0.95,
          metadata: {
            version: qrResult.version?.toString(),
            segments: [{
              mode: 'BYTE',
              data: qrResult.data
            }]
          }
        };
      }

      // For linear barcodes, detect patterns but note limitations
      const patternResult = await this.detectBarcodePattern(imageBuffer);
      if (patternResult) {
        return patternResult;
      }

      throw new Error('No barcode or QR code detected in the image');
    } catch (error) {
      throw new Error(`Failed to scan barcode: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async detectBarcodePattern(imageBuffer: Buffer): Promise<BarcodeResult | null> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      if (!metadata.width || !metadata.height) return null;

      const aspectRatio = metadata.width / metadata.height;

      // Only analyze images with linear barcode characteristics
      if (aspectRatio < 1.8) return null;

      // Convert to binary for pattern analysis
      const { data, info } = await sharp(imageBuffer)
        .greyscale()
        .threshold(128)
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Analyze scan lines for barcode patterns
      const transitions = this.findMaxTransitions(data, info.width, info.height);

      // Linear barcodes require 20+ transitions across the width
      if (transitions >= 20) {
        throw new Error('Linear barcode pattern detected but content extraction requires specialized decoding libraries (ZXing, QuaggaJS) or commercial APIs. Please use a dedicated barcode scanning service for accurate content reading.');
      }

      return null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('Linear barcode pattern detected')) {
        throw error;
      }
      return null;
    }
  }

  private findMaxTransitions(data: Buffer, width: number, height: number): number {
    let maxTransitions = 0;

    // Sample horizontal lines across the middle section
    for (let y = Math.floor(height * 0.3); y <= Math.floor(height * 0.7); y += Math.floor(height * 0.1)) {
      let transitions = 0;
      let lastPixel = -1;

      for (let x = 0; x < width; x++) {
        const pixelIndex = y * width + x;
        if (pixelIndex < data.length) {
          const pixel = data[pixelIndex] > 0 ? 1 : 0;
          if (lastPixel !== -1 && pixel !== lastPixel) {
            transitions++;
          }
          lastPixel = pixel;
        }
      }

      maxTransitions = Math.max(maxTransitions, transitions);
    }

    return maxTransitions;
  }
}

export const barcodeService = new BarcodeService();