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
      // Get image metadata first
      const metadata = await sharp(imageBuffer).metadata();
      console.log(`Processing image: ${metadata.width}x${metadata.height}, format: ${metadata.format}`);

      // Handle animated GIFs by extracting first frame
      if (metadata.format === 'gif' && metadata.pages && metadata.pages > 1) {
        imageBuffer = await sharp(imageBuffer, { page: 0 }).png().toBuffer();
      }

      // Try multiple preprocessing approaches for better detection
      const preprocessingOptions = [
        // Original image converted to PNG for consistency
        { operations: [{ png: true }] as any[] },
        // Enhanced contrast
        { operations: [{ png: true }, { normalize: true }, { sharpen: true }] as any[] },
        // Grayscale with higher contrast
        { operations: [{ png: true }, { greyscale: true }, { normalize: true }] as any[] },
        // High contrast binary-like processing
        { operations: [{ png: true }, { greyscale: true }, { threshold: 128 }] as any[] },
        // Resized for better detection
        { operations: [{ png: true }, { resize: { width: Math.min(600, metadata.width || 600) } }] as any[] }
      ];

      for (const { operations } of preprocessingOptions) {
        let sharpInstance = sharp(imageBuffer);
        
        // Apply preprocessing operations
        for (const op of operations) {
          if ('png' in op) sharpInstance = sharpInstance.png();
          if ('normalize' in op) sharpInstance = sharpInstance.normalize();
          if ('sharpen' in op) sharpInstance = sharpInstance.sharpen();
          if ('greyscale' in op) sharpInstance = sharpInstance.greyscale();
          if ('threshold' in op) sharpInstance = sharpInstance.threshold(op.threshold as number);
          if ('linear' in op && op.linear) sharpInstance = sharpInstance.linear(op.linear[0], op.linear[1]);
          if ('resize' in op && op.resize) sharpInstance = sharpInstance.resize(op.resize);
        }

        // Use a more controlled approach - convert to PNG buffer first, then process
        let processedBuffer: Buffer;
        try {
          processedBuffer = await sharpInstance.png().toBuffer();
        } catch (error) {
          console.log('Error converting to PNG:', error);
          continue;
        }

        // Now process the PNG buffer to get clean RGBA data
        let cleanData: Uint8ClampedArray;
        let width: number;
        let height: number;
        
        try {
          const { data, info } = await sharp(processedBuffer)
            .raw()
            .ensureAlpha()
            .toBuffer({ resolveWithObject: true });

          width = info.width;
          height = info.height;

          console.log(`Trying preprocessing variant: ${width}x${height}, channels: ${info.channels}, data length: ${data.length}`);

          // Validate data integrity
          const expectedLength = width * height * 4; // RGBA = 4 channels
          if (data.length !== expectedLength) {
            console.log(`Data length mismatch: expected ${expectedLength}, got ${data.length}`);
            continue;
          }

          // Create clean Uint8ClampedArray
          cleanData = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength);

          // Validate pixel data quality
          if (cleanData.length === 0) {
            console.log('Empty pixel data, skipping this variant');
            continue;
          }

          // Check for completely black or white images (potential processing errors)
          const nonZeroPixels = Array.from(cleanData).filter(val => val > 0 && val < 255).length;
          if (nonZeroPixels < cleanData.length * 0.1) {
            console.log('Image appears to be completely binary, trying anyway...');
          }

        } catch (error) {
          console.log('Error processing clean data:', error);
          continue;
        }

        // Try QR code detection with error handling
        let qrResult;
        try {
          qrResult = jsQR(cleanData, width, height);
        } catch (jsqrError) {
          console.log('jsQR processing error:', jsqrError);
          continue;
        }
        
        if (qrResult) {
          console.log('QR code detected successfully:', qrResult.data);
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
      }

      // Try linear barcode pattern detection
      const patternResult = await this.detectBarcodePattern(imageBuffer);
      if (patternResult) {
        return patternResult;
      }

      // Special handling for Data Matrix codes - they require different processing
      const dataMatrixResult = await this.tryDataMatrixDetection(imageBuffer);
      if (dataMatrixResult) {
        return dataMatrixResult;
      }

      console.log('No barcode or QR code detected after all preprocessing attempts');
      throw new Error('No barcode or QR code detected in the image. This scanner supports QR codes and can detect Data Matrix patterns, but content extraction for Data Matrix codes requires specialized libraries.');
    } catch (error) {
      console.error('Barcode scanning error:', error);
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

  private async tryDataMatrixDetection(imageBuffer: Buffer): Promise<BarcodeResult | null> {
    try {
      const metadata = await sharp(imageBuffer).metadata();
      if (!metadata.width || !metadata.height) return null;

      // Data Matrix codes have specific characteristics - square aspect ratio and high density
      const aspectRatio = metadata.width / metadata.height;
      
      // Check if it's roughly square (Data Matrix codes are typically square)
      if (aspectRatio < 0.8 || aspectRatio > 1.2) return null;

      // Convert to high contrast binary for pattern analysis
      const { data, info } = await sharp(imageBuffer)
        .greyscale()
        .threshold(128)
        .raw()
        .toBuffer({ resolveWithObject: true });

      // Analyze for Data Matrix finder pattern (L-shaped border)
      const hasDataMatrixPattern = this.detectDataMatrixFinderPattern(data, info.width, info.height);

      if (hasDataMatrixPattern) {
        return {
          value: 'DATA_MATRIX_DETECTED',
          type: 'Data Matrix',
          format: 'DATA_MATRIX',
          confidence: 0.8,
          metadata: {
            note: 'Data Matrix barcode pattern detected. Content extraction requires specialized decoding libraries like ZXing or libdmtx for accurate data reading.',
            aspectRatio,
            transitions: this.findMaxTransitions(data, info.width, info.height)
          }
        };
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  private detectDataMatrixFinderPattern(data: Buffer, width: number, height: number): boolean {
    // Data Matrix codes have an L-shaped finder pattern on two adjacent sides
    // Check for solid borders on left and bottom edges
    
    let leftBorderSolid = true;
    let bottomBorderSolid = true;
    
    // Check left border (should be mostly black)
    for (let y = 0; y < height; y++) {
      const pixelIndex = y * width;
      if (pixelIndex < data.length && data[pixelIndex] > 128) {
        leftBorderSolid = false;
        break;
      }
    }
    
    // Check bottom border (should be mostly black)
    for (let x = 0; x < width; x++) {
      const pixelIndex = (height - 1) * width + x;
      if (pixelIndex < data.length && data[pixelIndex] > 128) {
        bottomBorderSolid = false;
        break;
      }
    }
    
    // Data Matrix also has alternating pattern on opposite borders
    let topBorderAlternating = true;
    let rightBorderAlternating = true;
    
    // Check alternating pattern on top border
    for (let x = 0; x < width - 1; x += 2) {
      const evenPixel = data[x] || 0;
      const oddPixel = data[x + 1] || 0;
      if (Math.abs(evenPixel - oddPixel) < 100) {
        topBorderAlternating = false;
        break;
      }
    }
    
    // Check alternating pattern on right border
    for (let y = 0; y < height - 1; y += 2) {
      const evenIndex = y * width + (width - 1);
      const oddIndex = (y + 1) * width + (width - 1);
      const evenPixel = evenIndex < data.length ? data[evenIndex] : 0;
      const oddPixel = oddIndex < data.length ? data[oddIndex] : 0;
      if (Math.abs(evenPixel - oddPixel) < 100) {
        rightBorderAlternating = false;
        break;
      }
    }
    
    // Data Matrix pattern requires L-shaped solid border and alternating opposite borders
    return leftBorderSolid && bottomBorderSolid && (topBorderAlternating || rightBorderAlternating);
  }
}

export const barcodeService = new BarcodeService();