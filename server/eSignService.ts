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
      const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
      
      // Load the PDF document
      const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
      const pdfDocument = await loadingTask.promise;
      
      const pages: string[] = [];
      const numPages = pdfDocument.numPages;
      
      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        try {
          const page = await pdfDocument.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });
          
          // Create canvas for rendering
          const canvas = require('canvas').createCanvas(viewport.width, viewport.height);
          const context = canvas.getContext('2d');
          
          const renderContext = {
            canvasContext: context,
            viewport: viewport,
          };
          
          await page.render(renderContext).promise;
          
          // Convert to base64
          const imageData = canvas.toDataURL('image/png');
          pages.push(imageData);
          
        } catch (pageError) {
          console.log(`Failed to render page ${pageNum}, using placeholder`);
          pages.push(this.generatePlaceholderPage(pageNum));
        }
      }
      
      return { success: true, pages };
    } catch (error) {
      console.log('PDF rendering failed, using placeholders:', error);
      // Fallback to placeholder pages
      try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pageCount = pdfDoc.getPageCount();
        const pages = Array.from({ length: pageCount }, (_, i) => 
          this.generatePlaceholderPage(i + 1)
        );
        return { success: true, pages };
      } catch (fallbackError) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate preview'
        };
      }
    }
  }

  private generatePlaceholderPage(pageNumber: number): string {
    const svg = `
      <svg width="600" height="800" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f0f0f0" stroke-width="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="white" stroke="#ddd" stroke-width="2"/>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.3"/>
        
        <!-- Header area -->
        <rect x="40" y="40" width="520" height="60" fill="#f8f9fa" stroke="#dee2e6"/>
        <text x="50%" y="80" text-anchor="middle" font-family="Arial" font-size="16" fill="#495057">
          PDF Document - Page ${pageNumber}
        </text>
        
        <!-- Content lines simulation -->
        <rect x="60" y="140" width="480" height="8" fill="#e9ecef"/>
        <rect x="60" y="165" width="400" height="8" fill="#e9ecef"/>
        <rect x="60" y="190" width="460" height="8" fill="#e9ecef"/>
        <rect x="60" y="215" width="380" height="8" fill="#e9ecef"/>
        
        <rect x="60" y="260" width="320" height="8" fill="#e9ecef"/>
        <rect x="60" y="285" width="440" height="8" fill="#e9ecef"/>
        <rect x="60" y="310" width="300" height="8" fill="#e9ecef"/>
        
        <!-- Signature area indicator -->
        <rect x="60" y="600" width="200" height="80" fill="none" stroke="#007bff" stroke-width="2" stroke-dasharray="5,5"/>
        <text x="160" y="640" text-anchor="middle" font-family="Arial" font-size="12" fill="#007bff">
          Signature Area
        </text>
        
        <!-- Footer -->
        <text x="50%" y="760" text-anchor="middle" font-family="Arial" font-size="10" fill="#6c757d">
          Click to place signature fields
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
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

  async generatePDFPreviewWithSignatures(
    pdfBuffer: Buffer,
    signature: string,
    fields: SignatureField[]
  ): Promise<{ success: boolean; pages?: string[]; error?: string }> {
    try {
      // First, add signatures to the PDF
      const signedPdfBuffer = await this.addSignatureToPDF(pdfBuffer, signature, fields);
      
      // Then generate preview of the signed PDF
      return await this.generatePDFPreview(signedPdfBuffer);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate preview with signatures'
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