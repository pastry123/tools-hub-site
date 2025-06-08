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

      // Comprehensive barcode type detection
      const barcodeTypeResult = await this.detectAnyBarcodeType(imageBuffer);
      if (barcodeTypeResult) {
        return barcodeTypeResult;
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

      // Check for different barcode types with comprehensive pattern analysis
      const barcodeTypes = [
        { name: 'Linear Barcode', minAspectRatio: 2.0, maxAspectRatio: 10.0 },
        { name: 'Data Matrix', minAspectRatio: 0.8, maxAspectRatio: 1.2 },
        { name: 'Code 128', minAspectRatio: 3.0, maxAspectRatio: 8.0 },
        { name: 'PDF417', minAspectRatio: 2.5, maxAspectRatio: 6.0 }
      ];

      // Convert to binary for pattern analysis with multiple thresholds
      const thresholds = [100, 128, 150, 180];
      
      for (const threshold of thresholds) {
        const { data, info } = await sharp(imageBuffer)
          .greyscale()
          .threshold(threshold)
          .raw()
          .toBuffer({ resolveWithObject: true });

        // Analyze patterns for each barcode type
        for (const barcodeType of barcodeTypes) {
          if (aspectRatio >= barcodeType.minAspectRatio && aspectRatio <= barcodeType.maxAspectRatio) {
            const transitions = this.findMaxTransitions(data, info.width, info.height);
            const verticalTransitions = this.findVerticalTransitions(data, info.width, info.height);
            
            // Enhanced pattern detection
            if (this.validateBarcodePattern(data, info.width, info.height, barcodeType.name, transitions, verticalTransitions)) {
              console.log(`${barcodeType.name} pattern detected with ${transitions} horizontal transitions`);
              
              throw new Error(`${barcodeType.name} detected but content extraction requires specialized decoding libraries. This scanner currently supports QR code content reading only.`);
            }
          }
        }
      }

      return null;
    } catch (error) {
      if (error instanceof Error && error.message.includes('detected but content extraction')) {
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

  private findVerticalTransitions(data: Buffer, width: number, height: number): number {
    let maxTransitions = 0;

    // Sample vertical lines across the middle section
    for (let x = Math.floor(width * 0.3); x <= Math.floor(width * 0.7); x += Math.floor(width * 0.1)) {
      let transitions = 0;
      let lastPixel = -1;

      for (let y = 0; y < height; y++) {
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

  private validateBarcodePattern(data: Buffer, width: number, height: number, type: string, horizontalTransitions: number, verticalTransitions: number): boolean {
    const aspectRatio = width / height;
    
    switch (type) {
      case 'Linear Barcode':
        // Linear barcodes have many horizontal transitions, few vertical
        return horizontalTransitions >= 15 && horizontalTransitions > verticalTransitions * 2;
        
      case 'Code 128':
        // Code 128 has specific characteristics
        return horizontalTransitions >= 20 && horizontalTransitions <= 100 && aspectRatio >= 3;
        
      case 'Data Matrix':
        // Data Matrix has roughly equal transitions in both directions
        return horizontalTransitions >= 10 && verticalTransitions >= 10 && 
               Math.abs(horizontalTransitions - verticalTransitions) < horizontalTransitions * 0.5;
        
      case 'PDF417':
        // PDF417 has multiple rows of patterns
        return horizontalTransitions >= 25 && verticalTransitions >= 5 && 
               horizontalTransitions > verticalTransitions && aspectRatio >= 2.5;
        
      default:
        return false;
    }
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
    // Enhanced Data Matrix detection for dense patterns
    
    // Check for high density of black/white transitions (characteristic of Data Matrix)
    const totalPixels = width * height;
    let blackPixels = 0;
    let whitePixels = 0;
    
    for (let i = 0; i < Math.min(data.length, totalPixels); i++) {
      if (data[i] < 128) {
        blackPixels++;
      } else {
        whitePixels++;
      }
    }
    
    const blackWhiteRatio = blackPixels / whitePixels;
    
    // Data Matrix typically has 40-60% black pixels
    if (blackWhiteRatio < 0.3 || blackWhiteRatio > 2.0) {
      return false;
    }
    
    // Check for finder pattern borders with more flexibility
    let borderPatternFound = false;
    
    // Sample multiple threshold levels for border detection
    for (let threshold = 100; threshold <= 180; threshold += 40) {
      let leftBorderConsistent = 0;
      let bottomBorderConsistent = 0;
      let totalBorderPixels = height + width;
      
      // Check left border consistency
      for (let y = 0; y < height; y++) {
        const pixelIndex = y * width;
        if (pixelIndex < data.length) {
          const isBlack = data[pixelIndex] < threshold;
          if (isBlack) leftBorderConsistent++;
        }
      }
      
      // Check bottom border consistency
      for (let x = 0; x < width; x++) {
        const pixelIndex = (height - 1) * width + x;
        if (pixelIndex < data.length) {
          const isBlack = data[pixelIndex] < threshold;
          if (isBlack) bottomBorderConsistent++;
        }
      }
      
      // Data Matrix should have consistent borders (at least 70% of border pixels follow pattern)
      if ((leftBorderConsistent / height) > 0.7 || (bottomBorderConsistent / width) > 0.7) {
        borderPatternFound = true;
        break;
      }
    }
    
    // Additional check: high frequency patterns in center area
    const centerStartX = Math.floor(width * 0.2);
    const centerEndX = Math.floor(width * 0.8);
    const centerStartY = Math.floor(height * 0.2);
    const centerEndY = Math.floor(height * 0.8);
    
    let centerTransitions = 0;
    
    // Count transitions in center area (both horizontal and vertical)
    for (let y = centerStartY; y < centerEndY; y++) {
      for (let x = centerStartX; x < centerEndX - 1; x++) {
        const currentIndex = y * width + x;
        const nextIndex = y * width + (x + 1);
        
        if (currentIndex < data.length && nextIndex < data.length) {
          if (Math.abs(data[currentIndex] - data[nextIndex]) > 100) {
            centerTransitions++;
          }
        }
      }
    }
    
    const centerArea = (centerEndX - centerStartX) * (centerEndY - centerStartY);
    const transitionDensity = centerTransitions / centerArea;
    
    // Data Matrix has high transition density in center (dense pattern)
    return borderPatternFound && transitionDensity > 0.3;
  }
}

export const barcodeService = new BarcodeService();