import { createCanvas, loadImage, Canvas } from 'canvas';

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
    try {
      const img = await loadImage(buffer);
      const { width: originalWidth, height: originalHeight } = img;
      
      let newWidth = options.width || originalWidth;
      let newHeight = options.height || originalHeight;
      
      if (options.maintainAspectRatio && options.width && options.height) {
        const aspectRatio = originalWidth / originalHeight;
        if (newWidth / newHeight > aspectRatio) {
          newWidth = newHeight * aspectRatio;
        } else {
          newHeight = newWidth / aspectRatio;
        }
      }
      
      const canvas = createCanvas(newWidth, newHeight);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, newWidth, newHeight);
      
      return canvas.toBuffer('image/png');
    } catch (error: any) {
      throw new Error(`Image resize failed: ${error.message}`);
    }
  }

  async convertImageFormat(buffer: Buffer, targetFormat: 'jpeg' | 'png' | 'webp'): Promise<Buffer> {
    try {
      const img = await loadImage(buffer);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      switch (targetFormat) {
        case 'jpeg':
          return canvas.toBuffer('image/jpeg', { quality: 0.8 });
        case 'png':
          return canvas.toBuffer('image/png');
        default:
          return canvas.toBuffer('image/png');
      }
    } catch (error: any) {
      throw new Error(`Image conversion failed: ${error.message}`);
    }
  }

  async cropImage(buffer: Buffer, options: ImageCropOptions): Promise<Buffer> {
    try {
      const img = await loadImage(buffer);
      const canvas = createCanvas(options.width, options.height);
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(
        img,
        options.x, options.y, options.width, options.height,
        0, 0, options.width, options.height
      );
      
      return canvas.toBuffer('image/png');
    } catch (error: any) {
      throw new Error(`Image crop failed: ${error.message}`);
    }
  }

  async addWatermark(buffer: Buffer, options: WatermarkOptions): Promise<Buffer> {
    try {
      const img = await loadImage(buffer);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(img, 0, 0);
      
      if (options.text) {
        const fontSize = options.fontSize || Math.min(img.width, img.height) / 20;
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
            x = img.width - textMetrics.width - 20;
            y = fontSize + 20;
            break;
          case 'bottom-left':
            x = 20;
            y = img.height - 20;
            break;
          case 'bottom-right':
            x = img.width - textMetrics.width - 20;
            y = img.height - 20;
            break;
          default: // center
            x = (img.width - textMetrics.width) / 2;
            y = img.height / 2;
        }
        
        ctx.fillText(options.text, x, y);
      }
      
      return canvas.toBuffer('image/png');
    } catch (error: any) {
      throw new Error(`Watermark failed: ${error.message}`);
    }
  }

  async generateFavicons(buffer: Buffer, options: FaviconOptions = {}): Promise<Array<{ size: number; data: Buffer }>> {
    try {
      const img = await loadImage(buffer);
      const sizes = options.sizes || [16, 32, 48, 64, 128, 256];
      const favicons: Array<{ size: number; data: Buffer }> = [];

      for (const size of sizes) {
        const canvas = createCanvas(size, size);
        const ctx = canvas.getContext('2d');
        
        if (options.backgroundColor) {
          ctx.fillStyle = options.backgroundColor;
          ctx.fillRect(0, 0, size, size);
        }
        
        ctx.drawImage(img, 0, 0, size, size);
        favicons.push({ size, data: canvas.toBuffer('image/png') });
      }

      return favicons;
    } catch (error: any) {
      throw new Error(`Favicon generation failed: ${error.message}`);
    }
  }

  async extractColorPalette(buffer: Buffer, colorCount: number = 5): Promise<ColorPalette> {
    try {
      const img = await loadImage(buffer);
      const canvas = createCanvas(img.width, img.height);
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      
      const imageData = ctx.getImageData(0, 0, img.width, img.height);
      const data = imageData.data;
      const colors = new Map<string, number>();
      
      // Sample every 100th pixel to avoid performance issues
      for (let i = 0; i < data.length; i += 400) {
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
      
      const sortedColors = Array.from(colors.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, colorCount);
      
      const totalPixels = sortedColors.reduce((sum, [, count]) => sum + count, 0);
      const dominant = sortedColors[0]?.[0] || '#000000';
      
      const palette: ColorPalette = {
        dominant,
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
    } catch (error: any) {
      throw new Error(`Color extraction failed: ${error.message}`);
    }
  }

  async imageToText(buffer: Buffer): Promise<string> {
    // OCR placeholder - would require Tesseract.js or cloud OCR service
    return "OCR functionality requires additional setup with Tesseract.js or cloud OCR services. Please upload an image to see this feature in action.";
  }
}

export const simpleImageService = new SimpleImageService();