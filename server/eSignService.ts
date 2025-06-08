import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export interface SignatureOptions {
  name: string;
  style: string;
  format: 'svg' | 'png' | 'canvas';
  width?: number;
  height?: number;
}

export interface SignatureField {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  required: boolean;
  signerName?: string;
  signerEmail?: string;
}

export interface Signer {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'pending' | 'signed' | 'viewed';
}

export class ESignService {
  async generateAISignature(options: SignatureOptions): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      // Generate an enhanced SVG signature based on the name and style
      const signature = this.createEnhancedSVGSignature(options.name, options.style);
      
      return {
        success: true,
        signature: signature
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate signature'
      };
    }
  }

  private createEnhancedSVGSignature(name: string, style: string): string {
    const width = 400;
    const height = 120;
    
    // Different signature styles
    const styles = {
      'professional-executive': {
        fontFamily: 'serif',
        fontSize: 32,
        transform: 'rotate(-2deg)',
        strokeWidth: 2.5,
        color: '#1a365d'
      },
      'artistic-flowing': {
        fontFamily: 'cursive',
        fontSize: 36,
        transform: 'rotate(-1deg) skewX(-5deg)',
        strokeWidth: 2,
        color: '#2d3748'
      },
      'traditional-formal': {
        fontFamily: 'serif',
        fontSize: 28,
        transform: 'rotate(0deg)',
        strokeWidth: 3,
        color: '#000000'
      },
      'contemporary-clean': {
        fontFamily: 'sans-serif',
        fontSize: 30,
        transform: 'rotate(-1deg)',
        strokeWidth: 2,
        color: '#2b6cb0'
      },
      'sophisticated-cursive': {
        fontFamily: 'cursive',
        fontSize: 34,
        transform: 'rotate(-2deg) skewX(-3deg)',
        strokeWidth: 2.5,
        color: '#1a202c'
      },
      'strong-confident': {
        fontFamily: 'sans-serif',
        fontSize: 32,
        transform: 'rotate(-1deg)',
        strokeWidth: 3.5,
        color: '#2d3748'
      }
    };

    const currentStyle = styles[style as keyof typeof styles] || styles['sophisticated-cursive'];
    
    // Create path data for a more natural signature look
    const pathData = this.generateSignaturePath(name);
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="roughPaper" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence baseFrequency="0.04" numOctaves="5" seed="1" stitchTiles="stitch"/>
            <feColorMatrix type="saturate" values="0"/>
          </filter>
        </defs>
        <g transform="translate(20, ${height/2}) ${currentStyle.transform}">
          <path d="${pathData}" 
                fill="none" 
                stroke="${currentStyle.color}" 
                stroke-width="${currentStyle.strokeWidth}"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.9"/>
          <text x="0" y="10" 
                font-family="${currentStyle.fontFamily}" 
                font-size="${currentStyle.fontSize}" 
                fill="${currentStyle.color}"
                opacity="0.3">${name}</text>
        </g>
      </svg>
    `;
  }

  private generateSignaturePath(name: string): string {
    const letters = name.toLowerCase().split('');
    let path = '';
    let x = 0;
    const baseY = 0;
    
    letters.forEach((letter, index) => {
      const variation = Math.sin(index * 0.5) * 8;
      const letterWidth = 25 + Math.random() * 10;
      
      if (index === 0) {
        path += `M ${x} ${baseY + variation}`;
      }
      
      // Create natural curves for each letter
      const cp1x = x + letterWidth * 0.3;
      const cp1y = baseY + variation - 15 + Math.random() * 10;
      const cp2x = x + letterWidth * 0.7;
      const cp2y = baseY + variation + 15 + Math.random() * 10;
      const endX = x + letterWidth;
      const endY = baseY + Math.sin((index + 1) * 0.5) * 8;
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
      x = endX;
    });
    
    return path;
  }

  async addSignatureToPDF(pdfBuffer: Buffer, signature: string, fields: SignatureField[]): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      
      // Convert signature from base64 to image if needed
      let signatureImage;
      if (signature.startsWith('data:image')) {
        const base64Data = signature.split(',')[1];
        const imageBytes = Buffer.from(base64Data, 'base64');
        
        if (signature.includes('png')) {
          signatureImage = await pdfDoc.embedPng(imageBytes);
        } else {
          signatureImage = await pdfDoc.embedJpg(imageBytes);
        }
      }
      
      for (const field of fields) {
        if (field.page < pages.length) {
          const page = pages[field.page];
          const { width: pageWidth, height: pageHeight } = page.getSize();
          
          // Convert coordinates (assuming web coordinates to PDF coordinates)
          const pdfX = field.x;
          const pdfY = pageHeight - field.y - field.height;
          
          if (signatureImage) {
            page.drawImage(signatureImage, {
              x: pdfX,
              y: pdfY,
              width: field.width,
              height: field.height,
            });
          } else {
            // Fallback to text signature
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            page.drawText('Digitally Signed', {
              x: pdfX,
              y: pdfY + field.height / 2,
              size: 12,
              font: helveticaFont,
              color: rgb(0, 0, 0),
            });
          }
        }
      }
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      throw new Error(`Failed to add signature to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generatePDFPreview(pdfBuffer: Buffer): Promise<{ success: boolean; pages?: string[]; error?: string }> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      // For now, return placeholder page previews
      // In a real implementation, you'd use a library like pdf2pic or similar
      const pages = Array.from({ length: pageCount }, (_, i) => 
        `data:image/svg+xml;base64,${Buffer.from(`
          <svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6"/>
            <text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="20" fill="#6c757d">
              Page ${i + 1}
            </text>
            <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="14" fill="#adb5bd">
              PDF Preview
            </text>
          </svg>
        `).toString('base64')}`
      );
      
      return { success: true, pages };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate preview'
      };
    }
  }

  async sendDocumentForSigning(
    pdfBuffer: Buffer,
    signers: Signer[],
    fields: SignatureField[],
    title: string,
    message: string
  ): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      // In a real implementation, this would integrate with OpenSign API
      // For now, we'll simulate the process
      
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Simulate sending emails to signers
      console.log(`Sending document "${title}" to ${signers.length} signers:`);
      signers.forEach(signer => {
        console.log(`- ${signer.name} (${signer.email}) - Role: ${signer.role}`);
      });
      
      return {
        success: true,
        documentId: documentId
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send document'
      };
    }
  }

  async addPageNumbers(
    pdfBuffer: Buffer,
    options: {
      position: string;
      startNumber: number;
      fontSize: number;
      marginX: number;
      marginY: number;
    }
  ): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        const pageNumber = options.startNumber + index;
        
        let x, y;
        
        // Calculate position based on selected option
        switch (options.position) {
          case 'top-left':
            x = options.marginX;
            y = height - options.marginY;
            break;
          case 'top-center':
            x = width / 2;
            y = height - options.marginY;
            break;
          case 'top-right':
            x = width - options.marginX;
            y = height - options.marginY;
            break;
          case 'bottom-left':
            x = options.marginX;
            y = options.marginY;
            break;
          case 'bottom-right':
            x = width - options.marginX;
            y = options.marginY;
            break;
          default: // bottom-center
            x = width / 2;
            y = options.marginY;
            break;
        }
        
        page.drawText(pageNumber.toString(), {
          x,
          y,
          size: options.fontSize,
          font,
          color: rgb(0, 0, 0),
        });
      });
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      throw new Error(`Failed to add page numbers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const eSignService = new ESignService();