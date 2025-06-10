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

export interface ColorAnalysis {
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
      const opacity = Math.round((options.opacity || 0.7) * 255);
      
      // Get image metadata
      const metadata = await sharp(buffer).metadata();
      const width = metadata.width || 800;
      const height = metadata.height || 600;
      
      // Calculate position
      let x = 10, y = fontSize + 10;
      const textWidth = text.length * fontSize * 0.6;
      
      switch (options.position) {
        case 'top-right':
          x = width - textWidth - 10;
          y = fontSize + 10;
          break;
        case 'bottom-left':
          x = 10;
          y = height - 10;
          break;
        case 'bottom-right':
          x = width - textWidth - 10;
          y = height - 10;
          break;
        case 'center':
          x = (width - textWidth) / 2;
          y = height / 2;
          break;
        default: // top-left
          x = 10;
          y = fontSize + 10;
      }
      
      // Create simple SVG watermark
      const watermarkSvg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
          <text x="${x}" y="${y}" 
                font-family="Arial, sans-serif" 
                font-size="${fontSize}" 
                fill="white" 
                fill-opacity="${opacity / 255}"
                font-weight="bold">
            ${text}
          </text>
        </svg>
      `;
      
      // Apply watermark
      const result = await sharp(buffer)
        .composite([
          {
            input: Buffer.from(watermarkSvg),
            top: 0,
            left: 0
          }
        ])
        .jpeg({ quality: 90 })
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

  async analyzeImageColors(buffer: Buffer): Promise<ColorAnalysis> {
    try {
      // Process image to extract pixel data
      const { data, info } = await sharp(buffer)
        .resize(300, 300, { fit: 'inside', withoutEnlargement: true })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const { width, height, channels } = info;
      const colorFreq = new Map<string, number>();
      
      // Process pixels with reduced sampling for performance
      const step = Math.max(1, Math.floor(data.length / (channels * 5000))); // Sample ~5k pixels
      
      for (let i = 0; i < data.length; i += channels * step) {
        if (i + 2 < data.length) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Group similar colors
          const qR = Math.floor(r / 15) * 15;
          const qG = Math.floor(g / 15) * 15;
          const qB = Math.floor(b / 15) * 15;
          
          const key = `${qR},${qG},${qB}`;
          colorFreq.set(key, (colorFreq.get(key) || 0) + 1);
        }
      }

      // Sort by frequency
      const sortedColors = Array.from(colorFreq.entries())
        .map(([key, count]) => {
          const [r, g, b] = key.split(',').map(Number);
          return { r, g, b, count };
        })
        .sort((a, b) => b.count - a.count);

      const totalSamples = sortedColors.reduce((sum, c) => sum + c.count, 0);
      
      // Filter colors with meaningful representation
      const significantColors = sortedColors
        .filter(color => color.count / totalSamples >= 0.01) // At least 1%
        .map(color => ({
          hex: `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`,
          rgb: { r: color.r, g: color.g, b: color.b },
          percentage: Math.round((color.count / totalSamples) * 100)
        }));

      return {
        dominant: significantColors[0]?.hex || '#000000',
        colors: significantColors
      };
    } catch (error) {
      console.error('Color analysis error:', error);
      throw new Error('Failed to analyze image colors');
    }
  }

  async imageToText(buffer: Buffer): Promise<string> {
    // OCR placeholder - would require Tesseract.js or cloud OCR service
    return "This is sample text extracted from the image. OCR functionality requires additional setup with Tesseract.js or cloud OCR services for real text extraction.";
  }
}

export const simpleImageService = new SimpleImageService();