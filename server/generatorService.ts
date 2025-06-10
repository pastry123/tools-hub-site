import crypto from 'crypto';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

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

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  companyName: string;
  companyAddress: string;
  clientName: string;
  clientAddress: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  notes?: string;
  includeTax: boolean;
  taxRate: number;
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

  generateBoxShadow(options: { horizontal: number; vertical: number; blur: number; spread: number; color: string; inset?: boolean }): string {
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

  async generateInvoicePDF(data: InvoiceData, logoBuffer?: Buffer | null): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    let yPosition = 750;
    const leftMargin = 50;
    const rightMargin = 562;
    
    // Add logo if provided
    if (logoBuffer) {
      try {
        let logoImage;
        // Try to embed as PNG first, then JPG
        try {
          logoImage = await pdfDoc.embedPng(logoBuffer);
        } catch {
          logoImage = await pdfDoc.embedJpg(logoBuffer);
        }
        
        const logoSize = 60;
        page.drawImage(logoImage, {
          x: rightMargin - logoSize,
          y: yPosition - logoSize,
          width: logoSize,
          height: logoSize,
        });
      } catch (error) {
        console.warn('Failed to embed logo:', error);
      }
    }
    
    // Header
    page.drawText('INVOICE', {
      x: leftMargin,
      y: yPosition,
      size: 24,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2),
    });
    
    // Invoice number and date
    yPosition -= 30;
    page.drawText(`Invoice #: ${data.invoiceNumber}`, {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    page.drawText(`Date: ${data.invoiceDate}`, {
      x: rightMargin - 150,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    if (data.dueDate) {
      yPosition -= 20;
      page.drawText(`Due Date: ${data.dueDate}`, {
        x: rightMargin - 150,
        y: yPosition,
        size: 12,
        font: font,
      });
    }
    
    // Company info
    yPosition -= 50;
    page.drawText('From:', {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    
    yPosition -= 20;
    page.drawText(data.companyName, {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    if (data.companyAddress) {
      const addressLines = data.companyAddress.split('\n');
      for (const line of addressLines) {
        yPosition -= 15;
        page.drawText(line, {
          x: leftMargin,
          y: yPosition,
          size: 10,
          font: font,
        });
      }
    }
    
    // Client info
    yPosition -= 40;
    page.drawText('To:', {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    
    yPosition -= 20;
    page.drawText(data.clientName, {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    if (data.clientAddress) {
      const addressLines = data.clientAddress.split('\n');
      for (const line of addressLines) {
        yPosition -= 15;
        page.drawText(line, {
          x: leftMargin,
          y: yPosition,
          size: 10,
          font: font,
        });
      }
    }
    
    // Items table
    yPosition -= 50;
    const tableTop = yPosition;
    
    // Table headers
    page.drawText('Description', {
      x: leftMargin,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    
    page.drawText('Qty', {
      x: 350,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    
    page.drawText('Rate', {
      x: 400,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    
    page.drawText('Amount', {
      x: 480,
      y: yPosition,
      size: 12,
      font: boldFont,
    });
    
    // Table line
    yPosition -= 5;
    page.drawLine({
      start: { x: leftMargin, y: yPosition },
      end: { x: rightMargin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    // Items
    yPosition -= 20;
    for (const item of data.items) {
      if (item.description) {
        page.drawText(item.description.substring(0, 30), {
          x: leftMargin,
          y: yPosition,
          size: 10,
          font: font,
        });
        
        page.drawText(item.quantity.toString(), {
          x: 350,
          y: yPosition,
          size: 10,
          font: font,
        });
        
        page.drawText(`$${item.rate.toFixed(2)}`, {
          x: 400,
          y: yPosition,
          size: 10,
          font: font,
        });
        
        page.drawText(`$${item.amount.toFixed(2)}`, {
          x: 480,
          y: yPosition,
          size: 10,
          font: font,
        });
        
        yPosition -= 20;
      }
    }
    
    // Totals
    yPosition -= 20;
    page.drawLine({
      start: { x: 400, y: yPosition },
      end: { x: rightMargin, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    
    yPosition -= 20;
    page.drawText('Subtotal:', {
      x: 400,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    page.drawText(`$${data.subtotal.toFixed(2)}`, {
      x: 480,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    yPosition -= 20;
    page.drawText('Tax:', {
      x: 400,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    page.drawText(`$${data.tax.toFixed(2)}`, {
      x: 480,
      y: yPosition,
      size: 12,
      font: font,
    });
    
    yPosition -= 20;
    page.drawText('Total:', {
      x: 400,
      y: yPosition,
      size: 14,
      font: boldFont,
    });
    
    page.drawText(`$${data.total.toFixed(2)}`, {
      x: 480,
      y: yPosition,
      size: 14,
      font: boldFont,
    });
    
    // Notes
    if (data.notes) {
      yPosition -= 60;
      page.drawText('Notes:', {
        x: leftMargin,
        y: yPosition,
        size: 12,
        font: boldFont,
      });
      
      yPosition -= 20;
      const noteLines = data.notes.split('\n');
      for (const line of noteLines) {
        page.drawText(line.substring(0, 80), {
          x: leftMargin,
          y: yPosition,
          size: 10,
          font: font,
        });
        yPosition -= 15;
      }
    }
    
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
  }
}

export const generatorService = new GeneratorService();