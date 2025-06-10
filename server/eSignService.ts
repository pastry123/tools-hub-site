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
      console.log(`Generating AI signature for ${options.name} in ${options.style} style`);
      
      // Use AI to generate signature instructions, then create SVG
      const aiInstructions = await this.getAISignatureInstructions(options.name, options.style);
      const signature = this.createAIEnhancedSVGSignature(options.name, options.style, aiInstructions);
      
      return {
        success: true,
        signature: signature
      };
    } catch (error) {
      console.error('AI signature generation error:', error);
      // Fallback to enhanced algorithmic generation
      const signature = this.createEnhancedSVGSignature(options.name, options.style);
      return {
        success: true,
        signature: signature
      };
    }
  }

  private async getAISignatureInstructions(name: string, style: string): Promise<any> {
    const styleDescriptions = {
      'professional-executive': 'formal, confident, clean lines with controlled flourishes',
      'artistic-flowing': 'creative, fluid, expressive with dramatic curves and loops',
      'traditional-formal': 'classic, conservative, minimal embellishments',
      'contemporary-clean': 'modern, geometric, sharp edges with minimal curves',
      'sophisticated-cursive': 'elegant, refined, graceful curves with subtle flourishes',
      'strong-confident': 'bold, powerful, thick strokes with strong presence'
    };

    const prompt = `Generate handwriting parameters for "${name}" signature in ${styleDescriptions[style as keyof typeof styleDescriptions] || 'elegant cursive'} style.

Respond with only this JSON format, no explanations:
{
  "letterSpacing": 1.2,
  "baselineVariation": 8,
  "strokeVariation": 2.0,
  "flourishIntensity": 0.7,
  "connectionStyle": "connected",
  "slantAngle": -5,
  "pressureVariation": 0.4
}`;

    const completion = await this.groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama3-8b-8192',
      temperature: 0.8,
      max_tokens: 200
    });

    const content = completion.choices[0]?.message?.content;
    
    if (content) {
      try {
        // Extract JSON from response that might contain extra text
        const codeBlockMatch = content.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
        let jsonText = content;
        
        if (codeBlockMatch) {
          jsonText = codeBlockMatch[1];
        } else {
          const jsonMatch = content.match(/\{[\s\S]*?\}/);
          if (jsonMatch) {
            jsonText = jsonMatch[0];
          }
        }
        
        const parsed = JSON.parse(jsonText);
        console.log('AI generated signature parameters:', parsed);
        return parsed;
      } catch (parseError) {
        console.error('Failed to parse AI response, using defaults');
        return this.getDefaultAIInstructions(style);
      }
    }
    
    return this.getDefaultAIInstructions(style);
  }

  private getDefaultAIInstructions(style: string): any {
    const defaults = {
      'professional-executive': {
        letterSpacing: 1.1, baselineVariation: 4, strokeVariation: 1.5,
        flourishIntensity: 0.3, connectionStyle: 'connected', slantAngle: -3,
        pressureVariation: 0.4
      },
      'artistic-flowing': {
        letterSpacing: 1.3, baselineVariation: 12, strokeVariation: 2.5,
        flourishIntensity: 0.8, connectionStyle: 'connected', slantAngle: -8,
        pressureVariation: 0.7
      },
      'traditional-formal': {
        letterSpacing: 0.9, baselineVariation: 2, strokeVariation: 1.0,
        flourishIntensity: 0.2, connectionStyle: 'partially-connected', slantAngle: 0,
        pressureVariation: 0.3
      },
      'contemporary-clean': {
        letterSpacing: 1.0, baselineVariation: 3, strokeVariation: 1.2,
        flourishIntensity: 0.4, connectionStyle: 'connected', slantAngle: -2,
        pressureVariation: 0.3
      },
      'sophisticated-cursive': {
        letterSpacing: 1.2, baselineVariation: 6, strokeVariation: 2.0,
        flourishIntensity: 0.6, connectionStyle: 'connected', slantAngle: -5,
        pressureVariation: 0.5
      },
      'strong-confident': {
        letterSpacing: 1.1, baselineVariation: 5, strokeVariation: 2.8,
        flourishIntensity: 0.5, connectionStyle: 'connected', slantAngle: -4,
        pressureVariation: 0.6
      }
    };
    
    return defaults[style as keyof typeof defaults] || defaults['sophisticated-cursive'];
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
      const cp1x = x + letterWidth * (0.2 + intensity * 0.1);
      const cp1y = baseY + variation - (10 + intensity * 15);
      const cp2x = x + letterWidth * (0.8 - intensity * 0.1);
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
        default:
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
      
      // Process signature fields and add signatures
      for (const field of fields) {
        if (field.page < pages.length) {
          const page = pages[field.page];
          const { width, height } = page.getSize();
          
          // Convert signature to image and embed
          if (signature.startsWith('data:image')) {
            const base64Data = signature.split(',')[1];
            const imageBytes = Buffer.from(base64Data, 'base64');
            
            let signatureImage;
            if (signature.includes('png')) {
              signatureImage = await pdfDoc.embedPng(imageBytes);
            } else {
              signatureImage = await pdfDoc.embedJpg(imageBytes);
            }
            
            page.drawImage(signatureImage, {
              x: field.x,
              y: height - field.y - field.height,
              width: field.width,
              height: field.height,
            });
          }
        }
      }
      
      return Buffer.from(await pdfDoc.save());
    } catch (error) {
      throw new Error(`Failed to add signature to PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generatePDFPreview(pdfBuffer: Buffer): Promise<{ success: boolean; pages?: string[]; error?: string }> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      
      const pageImages = pages.map((page, index) => {
        const { width, height } = page.getSize();
        return this.generateEnhancedPage(index + 1, width, height);
      });
      
      return {
        success: true,
        pages: pageImages
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate preview'
      };
    }
  }

  private generateEnhancedPage(pageNumber: number, pdfWidth: number, pdfHeight: number): string {
    return `
      <div class="pdf-page-preview" style="width: 100%; height: 400px; border: 1px solid #ccc; background: white; position: relative; margin: 10px 0;">
        <div style="position: absolute; top: 10px; left: 10px; font-size: 12px; color: #666;">
          Page ${pageNumber}
        </div>
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #999;">
          <div style="font-size: 24px; margin-bottom: 10px;">📄</div>
          <div>PDF Content Preview</div>
          <div style="font-size: 12px; margin-top: 5px;">${pdfWidth.toFixed(0)} × ${pdfHeight.toFixed(0)}</div>
        </div>
      </div>
    `;
  }

  async sendDocumentForSigning(
    pdfBuffer: Buffer,
    signers: Signer[],
    fields: SignatureField[],
    title: string,
    message: string
  ): Promise<{ success: boolean; documentId?: string; error?: string }> {
    try {
      const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
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
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      
      const pageImages = pages.map((page, index) => {
        const { width, height } = page.getSize();
        const pageFields = fields.filter(field => field.page === index);
        return this.generatePageWithSignatures(index + 1, width, height, pageFields, signature);
      });
      
      return {
        success: true,
        pages: pageImages
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate preview with signatures'
      };
    }
  }

  private generatePageWithSignatures(pageNumber: number, width: number, height: number, fields: SignatureField[], signature: string): string {
    const signatureElements = fields.map(field => `
      <div style="position: absolute; left: ${field.x}px; top: ${field.y}px; width: ${field.width}px; height: ${field.height}px; border: 2px dashed #007bff; background: rgba(0,123,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 12px; color: #007bff;">
        Signature Field
      </div>
    `).join('');
    
    return `
      <div class="pdf-page-preview" style="width: 100%; height: 400px; border: 1px solid #ccc; background: white; position: relative; margin: 10px 0;">
        <div style="position: absolute; top: 10px; left: 10px; font-size: 12px; color: #666;">
          Page ${pageNumber}
        </div>
        ${signatureElements}
        <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center; color: #999; z-index: -1;">
          <div style="font-size: 24px; margin-bottom: 10px;">📄</div>
          <div>PDF Content with Signature Fields</div>
          <div style="font-size: 12px; margin-top: 5px;">${width.toFixed(0)} × ${height.toFixed(0)}</div>
        </div>
      </div>
    `;
  }

  async addPageNumbers(
    pdfBuffer: Buffer,
    options: { position: string; format: string; startPage: number }
  ): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(pdfBuffer);
      const pages = pdfDoc.getPages();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      
      pages.forEach((page, index) => {
        if (index + 1 >= options.startPage) {
          const { width, height } = page.getSize();
          const pageNumber = index + 1;
          const text = options.format.replace('{n}', pageNumber.toString());
          
          let x, y;
          switch (options.position) {
            case 'top-center':
              x = width / 2;
              y = height - 30;
              break;
            case 'bottom-center':
              x = width / 2;
              y = 20;
              break;
            case 'bottom-right':
              x = width - 50;
              y = 20;
              break;
            default:
              x = width / 2;
              y = 20;
          }
          
          page.drawText(text, {
            x,
            y,
            size: 10,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
        }
      });
      
      return Buffer.from(await pdfDoc.save());
    } catch (error) {
      throw new Error(`Failed to add page numbers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const eSignService = new ESignService();