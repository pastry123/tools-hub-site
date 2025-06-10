// Simple image service providing placeholder functionality for demonstration
import sharp from 'sharp';

export interface ImageResizeOptions {
  width?: number;
  height?: number;
  maintainAspectRatio?: boolean;
  format?: 'jpeg' | 'png' | 'webp';
  quality?: number;
}

export interface ImageCropOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  format?: 'jpeg' | 'png' | 'webp';
}

export interface WatermarkOptions {
  text?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
  fontSize?: number;
  color?: string;
}

export interface FaviconOptions {
  sizes?: number[];
  backgroundColor?: string;
}

export interface ColorPalette {
  dominant: string;
  colors: Array<{
    hex: string;
    rgb: { r: number; g: number; b: number };
    percentage: number;
  }>;
}

export class SimpleImageService {
  async resizeImage(buffer: Buffer, options: ImageResizeOptions): Promise<Buffer> {
    // For demonstration - returns original buffer
    // In production, would use Sharp or Canvas for actual image processing
    return buffer;
  }

  async convertImageFormat(buffer: Buffer, targetFormat: 'jpeg' | 'png' | 'webp'): Promise<Buffer> {
    // For demonstration - returns original buffer
    // In production, would use Sharp or Canvas for format conversion
    return buffer;
  }

  async cropImage(buffer: Buffer, options: ImageCropOptions): Promise<Buffer> {
    try {
      console.log('Starting crop operation with options:', options);
      
      // Validate crop bounds first to avoid processing invalid crops
      if (options.width <= 0 || options.height <= 0) {
        throw new Error('Invalid crop dimensions');
      }

      // Use Sharp with optimized settings for speed
      const sharpInstance = sharp(buffer, {
        failOnError: false,
        limitInputPixels: false
      });

      // Get basic metadata quickly
      const metadata = await sharpInstance.metadata();
      const imgWidth = metadata.width!;
      const imgHeight = metadata.height!;
      
      console.log('Image metadata:', { 
        width: imgWidth, 
        height: imgHeight, 
        format: metadata.format,
        size: `${Math.round(buffer.length / 1024)}KB`
      });

      // Constrain crop bounds
      const x = Math.max(0, Math.min(Math.round(options.x), imgWidth - 1));
      const y = Math.max(0, Math.min(Math.round(options.y), imgHeight - 1));
      const width = Math.min(Math.round(options.width), imgWidth - x);
      const height = Math.min(Math.round(options.height), imgHeight - y);

      console.log('Final crop bounds:', { x, y, width, height, imgSize: `${imgWidth}x${imgHeight}` });

      // Handle large images differently for better performance
      let result: Buffer;
      
      if (imgWidth > 2000 || imgHeight > 2000) {
        console.log('Processing large image with compression');
        result = await sharp(buffer)
          .extract({ left: x, top: y, width, height })
          .jpeg({ quality: 80, progressive: true })
          .toBuffer();
      } else {
        // Respect original format for smaller images  
        const outputFormat = options.format === 'webp' ? 'webp' : 'jpeg';
        result = await sharp(buffer)
          .extract({ left: x, top: y, width, height })
          .toFormat(outputFormat as any)
          .toBuffer();
      }

      console.log('Crop completed successfully, output size:', Math.round(result.length / 1024) + 'KB');
      return result;
    } catch (error) {
      console.error('Crop operation failed:', error);
      throw new Error('Failed to crop image');
    }
  }

  async addWatermark(buffer: Buffer, options: WatermarkOptions): Promise<Buffer> {
    try {
      const text = options.text || 'WATERMARK';
      const fontSize = options.fontSize || 24;
      const opacity = options.opacity || 0.7;
      const color = options.color || 'rgba(255, 255, 255, 0.7)';
      
      // Get image metadata
      const metadata = await sharp(buffer).metadata();
      const width = metadata.width || 800;
      const height = metadata.height || 600;
      
      // Create watermark text as SVG
      const textColor = color.includes('rgba') ? color : `rgba(255, 255, 255, ${opacity})`;
      let x = 10, y = 30;
      
      // Position watermark based on options
      switch (options.position) {
        case 'top-right':
          x = width - (text.length * fontSize * 0.6) - 10;
          y = 30;
          break;
        case 'bottom-left':
          x = 10;
          y = height - 10;
          break;
        case 'bottom-right':
          x = width - (text.length * fontSize * 0.6) - 10;
          y = height - 10;
          break;
        case 'center':
          x = width / 2 - (text.length * fontSize * 0.3);
          y = height / 2;
          break;
        default: // top-left
          x = 10;
          y = 30;
      }
      
      const watermarkSvg = `
        <svg width="${width}" height="${height}">
          <text x="${x}" y="${y}" 
                font-family="Arial, sans-serif" 
                font-size="${fontSize}" 
                fill="${textColor}" 
                font-weight="bold">
            ${text}
          </text>
        </svg>
      `;
      
      // Apply watermark using composite
      const result = await sharp(buffer)
        .composite([
          {
            input: Buffer.from(watermarkSvg),
            blend: 'over'
          }
        ])
        .png()
        .toBuffer();
        
      return result;
    } catch (error) {
      console.error('Watermark error:', error);
      throw new Error('Failed to add watermark');
    }
  }

  async generateFavicons(buffer: Buffer, options: FaviconOptions = {}): Promise<Array<{ size: number; data: Buffer }>> {
    const sizes = options.sizes || [16, 32, 48, 64, 128, 256];
    // For demonstration - returns original buffer for each size
    // In production, would resize to each favicon size
    return sizes.map(size => ({ size, data: buffer }));
  }

  async extractColorPalette(buffer: Buffer, colorCount: number = 5): Promise<ColorPalette> {
    try {
      // Resize image for faster processing
      const processedBuffer = await sharp(buffer)
        .resize(200, 200, { fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { data, info } = processedBuffer;
      const pixels = data;
      const colorMap = new Map<string, number>();

      // Sample pixels to find dominant colors
      for (let i = 0; i < pixels.length; i += 12) { // Sample every 4th pixel
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        
        // Group similar colors by rounding to nearest 32
        const roundedR = Math.round(r / 32) * 32;
        const roundedG = Math.round(g / 32) * 32;
        const roundedB = Math.round(b / 32) * 32;
        
        const colorKey = `${roundedR},${roundedG},${roundedB}`;
        colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1);
      }

      // Sort colors by frequency
      const sortedColors = Array.from(colorMap.entries())
        .sort(([,a], [,b]) => b - a)
        .slice(0, colorCount);

      const totalPixels = pixels.length / 3;
      
      const colors = sortedColors.map(([colorKey, count]) => {
        const [r, g, b] = colorKey.split(',').map(Number);
        const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        const percentage = Math.round((count / totalPixels) * 100);
        
        return {
          hex,
          rgb: { r, g, b },
          percentage
        };
      });

      return {
        dominant: colors[0]?.hex || '#000000',
        colors
      };
    } catch (error) {
      console.error('Color palette extraction error:', error);
      throw new Error('Failed to extract color palette');
    }
  }

  async imageToText(buffer: Buffer): Promise<string> {
    // OCR placeholder - would require Tesseract.js or cloud OCR service
    return "This is sample text extracted from the image. OCR functionality requires additional setup with Tesseract.js or cloud OCR services for real text extraction.";
  }
}

export const simpleImageService = new SimpleImageService();