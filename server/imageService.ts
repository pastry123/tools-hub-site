import { createCanvas, loadImage } from 'canvas';
import fetch from 'node-fetch';

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
  image?: Buffer;
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

export class ImageService {
  async resizeImage(buffer: Buffer, options: ImageResizeOptions): Promise<Buffer> {
    try {
      let image = sharp(buffer);
      
      if (options.width || options.height) {
        image = image.resize(options.width, options.height, {
          fit: options.maintainAspectRatio ? 'inside' : 'fill',
          withoutEnlargement: false
        });
      }

      switch (options.format) {
        case 'jpeg':
          return await image.jpeg({ quality: options.quality || 80 }).toBuffer();
        case 'png':
          return await image.png().toBuffer();
        case 'webp':
          return await image.webp({ quality: options.quality || 80 }).toBuffer();
        default:
          return await image.toBuffer();
      }
    } catch (error: any) {
      throw new Error(`Image resize failed: ${error.message}`);
    }
  }

  async convertImageFormat(buffer: Buffer, targetFormat: 'jpeg' | 'png' | 'webp', quality: number = 80): Promise<Buffer> {
    try {
      const image = sharp(buffer);
      
      switch (targetFormat) {
        case 'jpeg':
          return await image.jpeg({ quality }).toBuffer();
        case 'png':
          return await image.png().toBuffer();
        case 'webp':
          return await image.webp({ quality }).toBuffer();
        default:
          throw new Error('Unsupported format');
      }
    } catch (error: any) {
      throw new Error(`Image conversion failed: ${error.message}`);
    }
  }

  async cropImage(buffer: Buffer, options: ImageCropOptions): Promise<Buffer> {
    try {
      let image = sharp(buffer)
        .extract({
          left: Math.round(options.x),
          top: Math.round(options.y),
          width: Math.round(options.width),
          height: Math.round(options.height)
        });

      switch (options.format) {
        case 'jpeg':
          return await image.jpeg({ quality: 80 }).toBuffer();
        case 'png':
          return await image.png().toBuffer();
        case 'webp':
          return await image.webp({ quality: 80 }).toBuffer();
        default:
          return await image.toBuffer();
      }
    } catch (error: any) {
      throw new Error(`Image crop failed: ${error.message}`);
    }
  }

  async addWatermark(buffer: Buffer, options: WatermarkOptions): Promise<Buffer> {
    try {
      const image = sharp(buffer);
      const { width, height } = await image.metadata();

      if (!width || !height) {
        throw new Error('Could not determine image dimensions');
      }

      if (options.text) {
        // Create text watermark using canvas
        const canvas = createCanvas(width, height);
        const ctx = canvas.getContext('2d');
        
        // Load original image
        const originalImage = await loadImage(buffer);
        ctx.drawImage(originalImage, 0, 0);
        
        // Add text watermark
        const fontSize = options.fontSize || Math.min(width, height) / 20;
        ctx.font = `${fontSize}px Arial`;
        ctx.fillStyle = options.color || 'rgba(255, 255, 255, 0.7)';
        ctx.globalAlpha = options.opacity || 0.7;
        
        const textMetrics = ctx.measureText(options.text);
        let x, y;
        
        switch (options.position) {
          case 'top-left':
            x = 20;
            y = fontSize + 20;
            break;
          case 'top-right':
            x = width - textMetrics.width - 20;
            y = fontSize + 20;
            break;
          case 'bottom-left':
            x = 20;
            y = height - 20;
            break;
          case 'bottom-right':
            x = width - textMetrics.width - 20;
            y = height - 20;
            break;
          default: // center
            x = (width - textMetrics.width) / 2;
            y = height / 2;
        }
        
        ctx.fillText(options.text, x, y);
        
        return canvas.toBuffer('image/png');
      }
      
      return buffer;
    } catch (error: any) {
      throw new Error(`Watermark failed: ${error.message}`);
    }
  }

  async generateFavicons(buffer: Buffer, options: FaviconOptions = {}): Promise<Array<{ size: number; data: Buffer }>> {
    try {
      const sizes = options.sizes || [16, 32, 48, 64, 128, 256];
      const favicons: Array<{ size: number; data: Buffer }> = [];

      for (const size of sizes) {
        const favicon = await sharp(buffer)
          .resize(size, size, { fit: 'cover' })
          .png()
          .toBuffer();
        
        favicons.push({ size, data: favicon });
      }

      return favicons;
    } catch (error: any) {
      throw new Error(`Favicon generation failed: ${error.message}`);
    }
  }

  async extractColorPalette(buffer: Buffer, colorCount: number = 5): Promise<ColorPalette> {
    try {
      const image = sharp(buffer);
      const stats = await image.stats();
      
      // Get dominant color
      const dominantHex = `#${Math.round(dominant.r).toString(16).padStart(2, '0')}${Math.round(dominant.g).toString(16).padStart(2, '0')}${Math.round(dominant.b).toString(16).padStart(2, '0')}`;
      
      // Extract colors from image data
      const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
      const colors = new Map<string, number>();
      
      // Sample colors (every 100th pixel to avoid performance issues)
      for (let i = 0; i < data.length; i += info.channels * 100) {
        if (i + 2 < data.length) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Quantize colors to reduce palette size
          const qR = Math.round(r / 32) * 32;
          const qG = Math.round(g / 32) * 32;
          const qB = Math.round(b / 32) * 32;
          
          const hex = `#${qR.toString(16).padStart(2, '0')}${qG.toString(16).padStart(2, '0')}${qB.toString(16).padStart(2, '0')}`;
          colors.set(hex, (colors.get(hex) || 0) + 1);
        }
      }
      
      // Sort by frequency and take top colors
      const sortedColors = Array.from(colors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, colorCount);
      
      const totalPixels = sortedColors.reduce((sum, [, count]) => sum + count, 0);
      
      const palette: ColorPalette = {
        dominant: dominantHex,
        colors: sortedColors.map(([hex, count]) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          
          return {
            hex,
            rgb: { r, g, b },
            percentage: Math.round((count / totalPixels) * 100)
          };
        })
      };
      
      return palette;
    } catch (error) {
      throw new Error(`Color extraction failed: ${error.message}`);
    }
  }

  async imageToText(buffer: Buffer): Promise<string> {
    // This would require OCR functionality - for now return a placeholder
    // In a real implementation, you'd use Tesseract.js or Google Vision API
    try {
      // Placeholder OCR functionality
      return "OCR functionality requires additional setup with Tesseract.js or cloud OCR services.";
    } catch (error) {
      throw new Error(`OCR failed: ${error.message}`);
    }
  }
}

export const imageService = new ImageService();