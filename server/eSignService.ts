import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');
import fs from 'fs';
import path from 'path';
import Groq from 'groq-sdk';

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
  private groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
  });

  async generateAISignature(options: SignatureOptions): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      // Use AI to generate signature instructions, then create SVG
      const aiInstructions = await this.getAISignatureInstructions(options.name, options.style);
      const signature = this.createAIEnhancedSVGSignature(options.name, options.style, aiInstructions);
      
      return {
        success: true,
        signature: signature
      };
    } catch (error) {
      console.error('AI signature generation error:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      // Fallback to enhanced algorithmic generation
      const signature = this.createEnhancedSVGSignature(options.name, options.style);
      return {
        success: true,
        signature: signature
      };
    }
  }

  private async getAISignatureInstructions(name: string, style: string): Promise<any> {
    console.log(`Generating AI instructions for ${name} in ${style} style`);
    
    const styleDescriptions = {
      'professional-executive': 'formal, confident, clean lines with controlled flourishes',
      'artistic-flowing': 'creative, fluid, expressive with dramatic curves and loops',
      'traditional-formal': 'classic, conservative, minimal embellishments',
      'contemporary-clean': 'modern, geometric, sharp edges with minimal curves',
      'sophisticated-cursive': 'elegant, refined, graceful curves with subtle flourishes',
      'strong-confident': 'bold, powerful, thick strokes with strong presence'
    };

    const prompt = `Create unique handwriting characteristics for a signature of "${name}" in ${styleDescriptions[style as keyof typeof styleDescriptions] || 'elegant cursive'} style.

Respond with JSON containing:
{
  "letterSpacing": number (0.8-1.5),
  "baselineVariation": number (2-15),
  "strokeVariation": number (0.5-3),
  "flourishIntensity": number (0.1-0.9),
  "connectionStyle": "connected" | "partially-connected" | "disconnected",
  "slantAngle": number (-15 to 15),
  "pressureVariation": number (0.1-0.8),
  "uniqueCharacteristics": [string array of 2-3 unique traits]
}`;

    console.log('Calling Groq API...');
    
    const completion = await this.groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.8,
      max_tokens: 300
    });

    console.log('Groq API response received');
    
    const content = completion.choices[0]?.message?.content;
    console.log('AI response content:', content);
    
    if (content) {
      try {
        const parsed = JSON.parse(content);
        console.log('Successfully parsed AI instructions:', parsed);
        return parsed;
      } catch (parseError) {
        console.error('Failed to parse AI response:', parseError);
        return this.getDefaultAIInstructions(style);
      }
    }
    
    console.log('No content in AI response, using defaults');
    return this.getDefaultAIInstructions(style);
  }

  private getDefaultAIInstructions(style: string): any {
    const defaults = {
      'professional-executive': {
        letterSpacing: 1.1, baselineVariation: 4, strokeVariation: 1.5,
        flourishIntensity: 0.3, connectionStyle: 'connected', slantAngle: -3,
        pressureVariation: 0.4, uniqueCharacteristics: ['controlled loops', 'consistent height']
      },
      'artistic-flowing': {
        letterSpacing: 1.3, baselineVariation: 12, strokeVariation: 2.5,
        flourishIntensity: 0.8, connectionStyle: 'connected', slantAngle: -8,
        pressureVariation: 0.7, uniqueCharacteristics: ['dramatic ascenders', 'flowing connections']
      },
      'traditional-formal': {
        letterSpacing: 0.9, baselineVariation: 2, strokeVariation: 1.0,
        flourishIntensity: 0.2, connectionStyle: 'partially-connected', slantAngle: 0,
        pressureVariation: 0.3, uniqueCharacteristics: ['uniform strokes', 'minimal decoration']
      }
    };
    
    return defaults[style as keyof typeof defaults] || defaults['professional-executive'];
  }

  private createAIEnhancedSVGSignature(name: string, style: string, aiInstructions: any): string {
    const width = 400;
    const height = 120;
    
    const styleConfig = this.getStyleConfig(style);
    const pathData = this.generateAISignaturePath(name, aiInstructions);
    
    return `
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="inkBleed" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="${aiInstructions.pressureVariation || 0.5}" result="blur"/>
            <feOffset in="blur" dx="0.5" dy="0.5" result="offset"/>
            <feMerge>
              <feMergeNode in="offset"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(20, ${height/2}) rotate(${aiInstructions.slantAngle || 0}deg)">
          <path d="${pathData}" 
                fill="none" 
                stroke="${styleConfig.color}" 
                stroke-width="${styleConfig.strokeWidth * (aiInstructions.strokeVariation || 1)}"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="0.95"
                filter="url(#inkBleed)"/>
          ${aiInstructions.flourishIntensity > 0.5 ? this.addFlourishes(name, aiInstructions) : ''}
        </g>
      </svg>
    `;
  }

  private generateAISignaturePath(name: string, aiInstructions: any): string {
    const letters = name.split('');
    let path = '';
    let x = 0;
    const baseY = 0;
    
    letters.forEach((letter, index) => {
      const letterWidth = 25 * (aiInstructions.letterSpacing || 1);
      const variation = (Math.sin(index * 0.5) + Math.random() * 0.5 - 0.25) * (aiInstructions.baselineVariation || 5);
      
      if (index === 0) {
        path += `M ${x} ${baseY + variation}`;
      }
      
      // AI-influenced curve generation
      const intensity = aiInstructions.flourishIntensity || 0.5;
      const cp1x = x + letterWidth * (0.2 + intensity * 0.2);
      const cp1y = baseY + variation - (10 + intensity * 15);
      const cp2x = x + letterWidth * (0.8 - intensity * 0.2);
      const cp2y = baseY + variation + (10 + intensity * 15);
      const endX = x + letterWidth;
      const endY = baseY + (Math.sin((index + 1) * 0.7) * (aiInstructions.baselineVariation || 5));
      
      if (aiInstructions.connectionStyle === 'disconnected' && index > 0) {
        path += ` M ${x + 5} ${baseY + variation}`;
      }
      
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX} ${endY}`;
      x = endX;
    });
    
    return path;
  }

  private addFlourishes(name: string, aiInstructions: any): string {
    const intensity = aiInstructions.flourishIntensity;
    const length = name.length * 25;
    
    return `
      <path d="M ${length + 10} 0 Q ${length + 20 + intensity * 30} ${-intensity * 20} ${length + 30 + intensity * 40} ${intensity * 10}"
            fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.7"/>
    `;
  }

  private getStyleConfig(style: string) {
    const styles = {
      'professional-executive': { color: '#1a365d', strokeWidth: 2.5 },
      'artistic-flowing': { color: '#2d3748', strokeWidth: 2.0 },
      'traditional-formal': { color: '#000000', strokeWidth: 3.0 },
      'contemporary-clean': { color: '#2b6cb0', strokeWidth: 2.0 },
      'sophisticated-cursive': { color: '#1a202c', strokeWidth: 2.5 },
      'strong-confident': { color: '#2d3748', strokeWidth: 3.5 }
    };
    
    return styles[style as keyof typeof styles] || styles['sophisticated-cursive'];
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
    const pathData = this.generateSignaturePath(name, style);
    
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

  private generateSignaturePath(name: string, style?: string): string {
    const letters = name.toLowerCase().split('');
    let path = '';
    let x = 0;
    const baseY = 0;
    
    // Different path generation styles
    const styleParams = {
      'professional-executive': { amplitude: 4, frequency: 0.3, curves: 'tight' },
      'artistic-flowing': { amplitude: 12, frequency: 0.8, curves: 'flowing' },
      'traditional-formal': { amplitude: 2, frequency: 0.2, curves: 'minimal' },
      'contemporary-clean': { amplitude: 6, frequency: 0.4, curves: 'smooth' },
      'sophisticated-cursive': { amplitude: 8, frequency: 0.5, curves: 'elegant' },
      'strong-confident': { amplitude: 10, frequency: 0.6, curves: 'bold' }
    };
    
    const params = styleParams[style as keyof typeof styleParams] || styleParams['sophisticated-cursive'];
    
    letters.forEach((letter, index) => {
      const variation = Math.sin(index * params.frequency) * params.amplitude;
      const letterWidth = 25 + Math.random() * 10;
      
      if (index === 0) {
        path += `M ${x} ${baseY + variation}`;
      }
      
      // Create natural curves for each letter based on style
      let cp1x, cp1y, cp2x, cp2y, endX, endY;
      
      switch (params.curves) {
        case 'tight':
          cp1x = x + letterWidth * 0.2;
          cp1y = baseY + variation - 8;
          cp2x = x + letterWidth * 0.8;
          cp2y = baseY + variation + 8;
          break;
        case 'flowing':
          cp1x = x + letterWidth * 0.1;
          cp1y = baseY + variation - 20;
          cp2x = x + letterWidth * 0.9;
          cp2y = baseY + variation + 20;
          break;
        case 'minimal':
          cp1x = x + letterWidth * 0.4;
          cp1y = baseY + variation - 5;
          cp2x = x + letterWidth * 0.6;
          cp2y = baseY + variation + 5;
          break;
        case 'bold':
          cp1x = x + letterWidth * 0.25;
          cp1y = baseY + variation - 12;
          cp2x = x + letterWidth * 0.75;
          cp2y = baseY + variation + 12;
          break;
        default: // smooth, elegant
          cp1x = x + letterWidth * 0.3;
          cp1y = baseY + variation - 15;
          cp2x = x + letterWidth * 0.7;
          cp2y = baseY + variation + 15;
      }
      
      endX = x + letterWidth;
      endY = baseY + Math.sin((index + 1) * params.frequency) * params.amplitude;
      
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
      console.log('Processing signature data:', signature.substring(0, 50) + '...');
      
      if (signature.startsWith('data:image')) {
        const base64Data = signature.split(',')[1];
        const imageBytes = Buffer.from(base64Data, 'base64');
        
        try {
          if (signature.includes('png') || signature.includes('PNG')) {
            signatureImage = await pdfDoc.embedPng(imageBytes);
            console.log('Successfully embedded PNG signature');
          } else if (signature.includes('jpg') || signature.includes('jpeg') || signature.includes('JPEG')) {
            signatureImage = await pdfDoc.embedJpg(imageBytes);
            console.log('Successfully embedded JPG signature');
          } else {
            // Default to PNG for canvas data URLs
            signatureImage = await pdfDoc.embedPng(imageBytes);
            console.log('Successfully embedded signature as PNG (default)');
          }
        } catch (imageError) {
          console.error('Failed to embed signature image:', imageError);
          signatureImage = null;
        }
      } else {
        console.log('Signature is not a data URL, using text fallback');
      }
      
      for (const field of fields) {
        // Fix page indexing (frontend sends 1-based, convert to 0-based)
        const pageIndex = (field.page || 1) - 1;
        
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const page = pages[pageIndex];
          const { width: pageWidth, height: pageHeight } = page.getSize();
          
          // Convert canvas coordinates to PDF coordinates
          // Canvas uses top-left origin, PDF uses bottom-left origin
          const pdfX = Math.max(0, Math.min(field.x, pageWidth - field.width));
          const pdfY = Math.max(0, Math.min(pageHeight - field.y - field.height, pageHeight - field.height));
          
          console.log(`Adding signature to page ${field.page} at (${pdfX}, ${pdfY}) size ${field.width}x${field.height}`);
          
          if (signatureImage) {
            // Successfully embedded image signature
            page.drawImage(signatureImage, {
              x: pdfX,
              y: pdfY,
              width: field.width,
              height: field.height,
            });
            console.log(`Image signature placed at (${pdfX}, ${pdfY})`);
          } else {
            // Always place a visible signature, even if image failed
            const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
            
            // Draw signature background
            page.drawRectangle({
              x: pdfX,
              y: pdfY,
              width: field.width,
              height: field.height,
              color: rgb(0.95, 0.95, 0.95),
              borderColor: rgb(0.5, 0.5, 0.5),
              borderWidth: 1,
            });
            
            // Add signature text
            const fontSize = Math.min(14, field.height / 4, field.width / 8);
            page.drawText('Digital Signature', {
              x: pdfX + 5,
              y: pdfY + field.height - fontSize - 5,
              size: fontSize,
              font: helveticaFont,
              color: rgb(0.2, 0.2, 0.2),
            });
            
            // Add timestamp
            const timestamp = new Date().toLocaleDateString();
            page.drawText(`Signed: ${timestamp}`, {
              x: pdfX + 5,
              y: pdfY + 5,
              size: Math.max(8, fontSize - 2),
              font: helveticaFont,
              color: rgb(0.4, 0.4, 0.4),
            });
            
            console.log(`Text signature placed at (${pdfX}, ${pdfY})`);
          }
        } else {
          console.warn(`Invalid page index: ${pageIndex} (total pages: ${pages.length})`);
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
      // Extract text content and structure from PDF
      const pdfData = await pdfParse(pdfBuffer);
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      console.log(`Extracted ${pdfData.text.length} characters from PDF with ${pageCount} pages`);
      
      // Analyze text content for intelligent layout
      const textAnalysis = this.analyzeTextContent(pdfData.text, pageCount);
      const pages: string[] = [];
      
      for (let i = 0; i < pageCount; i++) {
        const page = pdfDoc.getPage(i);
        const { width, height } = page.getSize();
        
        // Get content for this specific page
        const pageContent = textAnalysis.pages[i] || { lines: [], emptyAreas: [], hasContent: false };
        
        console.log(`Page ${i + 1}: ${pageContent.lines.length} lines, ${pageContent.emptyAreas.length} empty areas`);
        
        // Create realistic preview with actual content structure
        const contentPage = this.generateContentBasedPage(i + 1, width, height, pageContent);
        pages.push(contentPage);
      }
      
      return { success: true, pages };
    } catch (error) {
      console.error('PDF preview generation failed:', error);
      
      // Fallback with enhanced previews
      try {
        const pdfDoc = await PDFDocument.load(pdfBuffer);
        const pageCount = pdfDoc.getPageCount();
        const pages = [];
        
        for (let i = 0; i < pageCount; i++) {
          const page = pdfDoc.getPage(i);
          const { width, height } = page.getSize();
          const fallbackPage = this.generateEnhancedPage(i + 1, width, height);
          pages.push(fallbackPage);
        }
        
        return { success: true, pages };
      } catch (fallbackError) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Failed to generate preview'
        };
      }
    }
  }

  private generateEnhancedPage(pageNumber: number, pdfWidth: number, pdfHeight: number): string {
    const scaleFactor = Math.min(600 / pdfWidth, 800 / pdfHeight);
    const width = pdfWidth * scaleFactor;
    const height = pdfHeight * scaleFactor;
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="docGrid" width="40" height="24" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 24" fill="none" stroke="#f8f9fa" stroke-width="0.5"/>
          </pattern>
          <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2" dy="2" stdDeviation="2" flood-color="#00000020"/>
          </filter>
        </defs>
        
        <!-- Document background -->
        <rect width="100%" height="100%" fill="white" stroke="#ddd" stroke-width="1" filter="url(#shadow)"/>
        <rect width="100%" height="100%" fill="url(#docGrid)" opacity="0.1"/>
        
        <!-- Document margins -->
        <rect x="40" y="40" width="${width - 80}" height="${height - 80}" fill="none" stroke="#e9ecef" stroke-width="1" stroke-dasharray="3,3"/>
        
        <!-- Header section -->
        <rect x="60" y="60" width="${width - 120}" height="40" fill="#f8f9fa" stroke="#dee2e6"/>
        <text x="${width / 2}" y="85" text-anchor="middle" font-family="Arial" font-size="14" fill="#495057" font-weight="bold">
          Document Page ${pageNumber}
        </text>
        
        <!-- Content simulation with realistic text blocks -->
        <g fill="#343a40">
          <rect x="60" y="130" width="${(width - 120) * 0.8}" height="6" fill="#495057"/>
          <rect x="60" y="145" width="${(width - 120) * 0.6}" height="6" fill="#6c757d"/>
          <rect x="60" y="160" width="${(width - 120) * 0.9}" height="6" fill="#495057"/>
          <rect x="60" y="175" width="${(width - 120) * 0.7}" height="6" fill="#6c757d"/>
          
          <rect x="60" y="200" width="${(width - 120) * 0.5}" height="6" fill="#495057"/>
          <rect x="60" y="215" width="${(width - 120) * 0.8}" height="6" fill="#6c757d"/>
          <rect x="60" y="230" width="${(width - 120) * 0.6}" height="6" fill="#495057"/>
          <rect x="60" y="245" width="${(width - 120) * 0.9}" height="6" fill="#6c757d"/>
          
          <rect x="60" y="270" width="${(width - 120) * 0.7}" height="6" fill="#495057"/>
          <rect x="60" y="285" width="${(width - 120) * 0.4}" height="6" fill="#6c757d"/>
          <rect x="60" y="300" width="${(width - 120) * 0.8}" height="6" fill="#495057"/>
        </g>
        
        <!-- Signature placement area -->
        <rect x="60" y="${height - 150}" width="200" height="80" fill="none" stroke="#007bff" stroke-width="2" stroke-dasharray="8,4"/>
        <text x="160" y="${height - 110}" text-anchor="middle" font-family="Arial" font-size="11" fill="#007bff">
          Click to place signature
        </text>
        
        <!-- Page number footer -->
        <text x="${width / 2}" y="${height - 20}" text-anchor="middle" font-family="Arial" font-size="10" fill="#6c757d">
          Page ${pageNumber} • ${Math.round(pdfWidth)}x${Math.round(pdfHeight)}pt
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
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

  private analyzeTextContent(text: string, pageCount: number) {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const linesPerPage = Math.ceil(lines.length / pageCount);
    
    const pages = [];
    for (let i = 0; i < pageCount; i++) {
      const startIndex = i * linesPerPage;
      const endIndex = Math.min((i + 1) * linesPerPage, lines.length);
      const pageLines = lines.slice(startIndex, endIndex);
      
      // Analyze empty areas for signature placement
      const emptyAreas = this.findEmptyAreas(pageLines);
      
      pages.push({
        lines: pageLines,
        emptyAreas,
        hasContent: pageLines.length > 0
      });
    }
    
    return { pages, totalLines: lines.length };
  }

  private findEmptyAreas(lines: string[]) {
    const emptyAreas = [];
    let currentEmptyStart = -1;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isEmpty = line.trim().length < 10; // Consider short lines as potential empty areas
      
      if (isEmpty && currentEmptyStart === -1) {
        currentEmptyStart = i;
      } else if (!isEmpty && currentEmptyStart !== -1) {
        // Found end of empty area
        if (i - currentEmptyStart >= 2) { // At least 2 lines of space
          emptyAreas.push({
            start: currentEmptyStart,
            end: i - 1,
            height: (i - currentEmptyStart) * 20 // Approximate line height
          });
        }
        currentEmptyStart = -1;
      }
    }
    
    // Check for empty area at the end
    if (currentEmptyStart !== -1 && lines.length - currentEmptyStart >= 2) {
      emptyAreas.push({
        start: currentEmptyStart,
        end: lines.length - 1,
        height: (lines.length - currentEmptyStart) * 20
      });
    }
    
    return emptyAreas;
  }

  private generateContentBasedPage(pageNumber: number, pdfWidth: number, pdfHeight: number, pageContent: any): string {
    const scaleFactor = Math.min(600 / pdfWidth, 800 / pdfHeight);
    const width = pdfWidth * scaleFactor;
    const height = pdfHeight * scaleFactor;
    
    // Generate realistic text representation based on actual content
    let textElements = '';
    let yPosition = 80;
    const lineHeight = 18;
    const maxWidth = width - 120;
    
    if (pageContent.lines && pageContent.lines.length > 0) {
      pageContent.lines.forEach((line: string, index: number) => {
        if (yPosition > height - 100) return; // Stop if near bottom
        
        const trimmedLine = line.trim();
        if (trimmedLine.length === 0) {
          yPosition += lineHeight * 0.5; // Half spacing for empty lines
          return;
        }
        
        // Determine line characteristics
        const isTitle = trimmedLine.length < 50 && (trimmedLine.includes(':') || /^[A-Z\s]+$/.test(trimmedLine));
        const isHeader = trimmedLine.length < 30 && /^[A-Z]/.test(trimmedLine) && !trimmedLine.includes('.');
        const lineWidth = Math.min((trimmedLine.length * 7) + 20, maxWidth);
        const fontSize = isTitle ? 14 : isHeader ? 12 : 10;
        const fontWeight = isTitle || isHeader ? 'bold' : 'normal';
        const color = isTitle ? '#1a202c' : isHeader ? '#2d3748' : '#4a5568';
        
        // Add actual text content as SVG text
        textElements += `
          <text x="60" y="${yPosition + fontSize}" 
                font-family="Arial, sans-serif" 
                font-size="${fontSize}" 
                font-weight="${fontWeight}"
                fill="${color}"
                xml:space="preserve">${trimmedLine.substring(0, Math.floor(maxWidth / 8))}</text>
        `;
        
        yPosition += lineHeight;
      });
    } else {
      // Minimal fallback structure
      textElements = `
        <text x="60" y="100" font-family="Arial" font-size="14" fill="#2d3748" font-weight="bold">Document Content</text>
        <text x="60" y="130" font-family="Arial" font-size="12" fill="#4a5568">No text content extracted</text>
      `;
    }
    
    // Highlight suggested signature areas
    let signatureAreas = '';
    if (pageContent.emptyAreas && pageContent.emptyAreas.length > 0) {
      pageContent.emptyAreas.forEach((area: any, index: number) => {
        const areaY = 80 + (area.start * lineHeight);
        const areaHeight = Math.min(area.height, 80);
        
        signatureAreas += `
          <rect x="60" y="${areaY}" width="200" height="${areaHeight}" 
                fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="8,4" opacity="0.6"/>
          <text x="160" y="${areaY + areaHeight/2}" text-anchor="middle" 
                font-family="Arial" font-size="10" fill="#10b981">
            Suggested signature area
          </text>
        `;
      });
    } else {
      // Default signature area at bottom
      signatureAreas = `
        <rect x="60" y="${height - 150}" width="200" height="80" 
              fill="none" stroke="#10b981" stroke-width="2" stroke-dasharray="8,4" opacity="0.6"/>
        <text x="160" y="${height - 110}" text-anchor="middle" 
              font-family="Arial" font-size="10" fill="#10b981">
          Suggested signature area
        </text>
      `;
    }
    
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="docShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="1" dy="1" stdDeviation="1" flood-color="#00000015"/>
          </filter>
        </defs>
        
        <!-- Document background -->
        <rect width="100%" height="100%" fill="white" stroke="#d1d5db" stroke-width="1" filter="url(#docShadow)"/>
        
        <!-- Document margins -->
        <rect x="40" y="40" width="${width - 80}" height="${height - 80}" 
              fill="none" stroke="#f3f4f6" stroke-width="1" stroke-dasharray="2,2"/>
        
        <!-- Page header -->
        <rect x="60" y="50" width="${width - 120}" height="25" fill="#f8fafc" stroke="#e5e7eb"/>
        <text x="${width / 2}" y="67" text-anchor="middle" 
              font-family="Arial" font-size="12" fill="#374151" font-weight="bold">
          ${pageContent.hasContent ? 'Document Content' : 'Document Page'} ${pageNumber}
        </text>
        
        <!-- Actual content representation -->
        <g>
          ${textElements}
        </g>
        
        <!-- Suggested signature areas -->
        ${signatureAreas}
        
        <!-- Page footer -->
        <text x="${width / 2}" y="${height - 15}" text-anchor="middle" 
              font-family="Arial" font-size="9" fill="#9ca3af">
          Page ${pageNumber} • ${Math.round(pdfWidth)}×${Math.round(pdfHeight)}pt • 
          ${pageContent.lines ? pageContent.lines.length : 0} content lines
        </text>
      </svg>
    `;
    
    return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
  }
}

export const eSignService = new ESignService();