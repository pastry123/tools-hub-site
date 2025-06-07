import crypto from 'crypto';

export interface UUIDOptions {
  version: 'v1' | 'v4';
  uppercase?: boolean;
  hyphens?: boolean;
}

export interface PlaceholderOptions {
  width: number;
  height: number;
  backgroundColor?: string;
  textColor?: string;
  text?: string;
  format?: 'svg' | 'url';
}

export interface CSSGradient {
  type: 'linear' | 'radial';
  direction?: string;
  colors: Array<{ color: string; position: number }>;
  css: string;
}

export interface BoxShadow {
  horizontal: number;
  vertical: number;
  blur: number;
  spread: number;
  color: string;
  inset?: boolean;
  css: string;
}

export interface MetaTags {
  title: string;
  description: string;
  keywords: string;
  author?: string;
  viewport?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  html: string;
}

export class GeneratorService {
  generateUUID(options: UUIDOptions = { version: 'v4' }): string {
    let uuid: string;

    if (options.version === 'v1') {
      // Simple v1-like UUID (timestamp-based)
      const timestamp = Date.now().toString(16);
      const random = crypto.randomBytes(8).toString('hex');
      uuid = `${timestamp.slice(0, 8)}-${timestamp.slice(8)}-1${random.slice(0, 3)}-${random.slice(3, 7)}-${random.slice(7)}`;
    } else {
      // v4 UUID (random)
      const bytes = crypto.randomBytes(16);
      bytes[6] = (bytes[6] & 0x0f) | 0x40; // Version 4
      bytes[8] = (bytes[8] & 0x3f) | 0x80; // Variant 10

      const hex = bytes.toString('hex');
      uuid = `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
    }

    if (options.uppercase) {
      uuid = uuid.toUpperCase();
    }

    if (options.hyphens === false) {
      uuid = uuid.replace(/-/g, '');
    }

    return uuid;
  }

  generatePlaceholder(options: PlaceholderOptions): string {
    const { width, height, backgroundColor = '#cccccc', textColor = '#969696', text, format = 'svg' } = options;
    const displayText = text || `${width}x${height}`;

    if (format === 'url') {
      return `https://via.placeholder.com/${width}x${height}/${backgroundColor.replace('#', '')}/${textColor.replace('#', '')}?text=${encodeURIComponent(displayText)}`;
    }

    // Generate SVG
    const fontSize = Math.min(width, height) / 8;
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${backgroundColor}"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${textColor}" text-anchor="middle" dominant-baseline="middle">${displayText}</text>
    </svg>`;
  }

  generateCSSGradient(options: { type: 'linear' | 'radial'; direction?: string; colors: Array<{ color: string; position: number }> }): string {
    const { type, direction = 'to right', colors } = options;
    
    const colorStops = colors
      .sort((a, b) => a.position - b.position)
      .map(c => `${c.color} ${c.position}%`)
      .join(', ');

    if (type === 'radial') {
      return `radial-gradient(circle, ${colorStops})`;
    }

    return `linear-gradient(${direction}, ${colorStops})`;
  }

  generateBoxShadow(options: BoxShadow): string {
    const { horizontal, vertical, blur, spread, color, inset } = options;
    const insetStr = inset ? 'inset ' : '';
    return `${insetStr}${horizontal}px ${vertical}px ${blur}px ${spread}px ${color}`;
  }

  generateMetaTags(options: MetaTags): string {
    const tags = [];

    // Basic meta tags
    tags.push(`<title>${options.title}</title>`);
    tags.push(`<meta name="description" content="${options.description}">`);
    tags.push(`<meta name="keywords" content="${options.keywords}">`);
    
    if (options.author) {
      tags.push(`<meta name="author" content="${options.author}">`);
    }
    
    tags.push(`<meta name="viewport" content="${options.viewport || 'width=device-width, initial-scale=1.0'}">`);

    // Open Graph tags
    if (options.ogTitle) {
      tags.push(`<meta property="og:title" content="${options.ogTitle}">`);
    }
    if (options.ogDescription) {
      tags.push(`<meta property="og:description" content="${options.ogDescription}">`);
    }
    if (options.ogImage) {
      tags.push(`<meta property="og:image" content="${options.ogImage}">`);
    }

    // Twitter Card tags
    if (options.twitterCard) {
      tags.push(`<meta name="twitter:card" content="${options.twitterCard}">`);
    }

    return tags.join('\n');
  }
}

export const generatorService = new GeneratorService();