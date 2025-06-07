import { PDFDocument, PDFPage, rgb, degrees } from 'pdf-lib';
import fs from 'fs';
import path from 'path';

export interface PDFProcessingOptions {
  quality?: number;
  compressionLevel?: string;
  outputFormat?: string;
  splitType?: string;
  splitValue?: string;
  pages?: number[];
  ranges?: { start: number; end: number }[];
}

export interface PDFInfo {
  pages: number;
  size: number;
  title?: string;
  author?: string;
  creator?: string;
}

export class PDFService {
  
  // Get PDF information
  async getPDFInfo(buffer: Buffer): Promise<PDFInfo> {
    try {
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPageCount();
      
      return {
        pages,
        size: buffer.length,
        title: pdfDoc.getTitle() || undefined,
        author: pdfDoc.getAuthor() || undefined,
        creator: pdfDoc.getCreator() || undefined,
      };
    } catch (error) {
      throw new Error(`Failed to read PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Merge multiple PDFs
  async mergePDFs(pdfBuffers: Buffer[], options: PDFProcessingOptions = {}): Promise<Buffer> {
    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const buffer of pdfBuffers) {
        const pdf = await PDFDocument.load(buffer);
        const pageIndices = pdf.getPageIndices();
        const pages = await mergedPdf.copyPages(pdf, pageIndices);
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      // Set metadata
      mergedPdf.setTitle('Merged PDF Document');
      mergedPdf.setCreator('ToolHub PDF Merger');
      mergedPdf.setCreationDate(new Date());

      const pdfBytes = await mergedPdf.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      throw new Error(`Failed to merge PDFs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Split PDF into multiple documents
  async splitPDF(buffer: Buffer, options: PDFProcessingOptions): Promise<Array<{ name: string; data: Buffer; pages: string }>> {
    try {
      const pdfDoc = await PDFDocument.load(buffer);
      const totalPages = pdfDoc.getPageCount();
      const results: Array<{ name: string; data: Buffer; pages: string }> = [];

      let pagesToExtract: number[][] = [];

      switch (options.splitType) {
        case 'pages': {
          const pages = options.splitValue?.split(',').map(p => parseInt(p.trim()) - 1) || [];
          pagesToExtract = pages.map(page => [page]);
          break;
        }
        case 'ranges': {
          const ranges = options.splitValue?.split(',') || [];
          for (const range of ranges) {
            if (range.includes('-')) {
              const [start, end] = range.split('-').map(p => parseInt(p.trim()));
              const pageRange = [];
              for (let i = start - 1; i < end; i++) {
                pageRange.push(i);
              }
              pagesToExtract.push(pageRange);
            } else {
              pagesToExtract.push([parseInt(range.trim()) - 1]);
            }
          }
          break;
        }
        case 'every': {
          const every = parseInt(options.splitValue || '1');
          for (let i = 0; i < totalPages; i += every) {
            const chunk = [];
            for (let j = i; j < Math.min(i + every, totalPages); j++) {
              chunk.push(j);
            }
            pagesToExtract.push(chunk);
          }
          break;
        }
        case 'size': {
          const size = parseInt(options.splitValue || '1');
          for (let i = 0; i < totalPages; i += size) {
            const chunk = [];
            for (let j = i; j < Math.min(i + size, totalPages); j++) {
              chunk.push(j);
            }
            pagesToExtract.push(chunk);
          }
          break;
        }
      }

      for (let i = 0; i < pagesToExtract.length; i++) {
        const pageIndices = pagesToExtract[i];
        const newPdf = await PDFDocument.create();
        const pages = await newPdf.copyPages(pdfDoc, pageIndices);
        pages.forEach((page) => newPdf.addPage(page));

        newPdf.setTitle(`Split PDF Document - Part ${i + 1}`);
        newPdf.setCreator('ToolHub PDF Splitter');
        newPdf.setCreationDate(new Date());

        const pdfBytes = await newPdf.save();
        const pageNumbers = pageIndices.map(idx => idx + 1).join(', ');
        
        results.push({
          name: `split-part-${i + 1}.pdf`,
          data: Buffer.from(pdfBytes),
          pages: pageNumbers
        });
      }

      return results;
    } catch (error) {
      throw new Error(`Failed to split PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Compress PDF
  async compressPDF(buffer: Buffer, options: PDFProcessingOptions = {}): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(buffer);
      
      // Basic compression by rewriting the PDF
      // In a real implementation, you would use more sophisticated compression
      // techniques based on the quality parameter
      
      const quality = options.quality || 70;
      
      // Set compression options in metadata
      pdfDoc.setTitle(pdfDoc.getTitle() || 'Compressed PDF Document');
      pdfDoc.setCreator('ToolHub PDF Compressor');
      pdfDoc.setCreationDate(new Date());

      // Save with compression
      const pdfBytes = await pdfDoc.save({
        useObjectStreams: true,
        addDefaultPage: false,
      });

      return Buffer.from(pdfBytes);
    } catch (error) {
      throw new Error(`Failed to compress PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Convert PDF to text
  async pdfToText(buffer: Buffer): Promise<string> {
    try {
      // This is a simplified implementation
      // In production, you would use a proper PDF text extraction library
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();
      
      let text = '';
      for (let i = 0; i < pages.length; i++) {
        text += `--- Page ${i + 1} ---\n`;
        // This is a placeholder - real text extraction would require additional libraries
        text += `[Text content from page ${i + 1}]\n\n`;
      }
      
      return text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Create PDF from images
  async imagesToPDF(imageBuffers: Buffer[], options: PDFProcessingOptions = {}): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.create();

      for (const imageBuffer of imageBuffers) {
        let image;
        
        // Detect image type and embed accordingly
        try {
          // Try PNG first
          image = await pdfDoc.embedPng(imageBuffer);
        } catch {
          try {
            // Try JPG if PNG fails
            image = await pdfDoc.embedJpg(imageBuffer);
          } catch {
            throw new Error('Unsupported image format');
          }
        }

        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        
        // Scale image to fit page while maintaining aspect ratio
        const imageAspectRatio = image.width / image.height;
        const pageAspectRatio = width / height;
        
        let drawWidth, drawHeight;
        if (imageAspectRatio > pageAspectRatio) {
          drawWidth = width - 40; // 20px margin on each side
          drawHeight = drawWidth / imageAspectRatio;
        } else {
          drawHeight = height - 40; // 20px margin on each side
          drawWidth = drawHeight * imageAspectRatio;
        }

        const x = (width - drawWidth) / 2;
        const y = (height - drawHeight) / 2;

        page.drawImage(image, {
          x,
          y,
          width: drawWidth,
          height: drawHeight,
        });
      }

      pdfDoc.setTitle('Images to PDF Document');
      pdfDoc.setCreator('ToolHub PDF Converter');
      pdfDoc.setCreationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      throw new Error(`Failed to create PDF from images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Add watermark to PDF
  async addWatermark(buffer: Buffer, watermarkText: string, options: PDFProcessingOptions = {}): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        
        page.drawText(watermarkText, {
          x: width / 2 - (watermarkText.length * 6), // Rough centering
          y: height / 2,
          size: 50,
          color: rgb(0.8, 0.8, 0.8), // Light gray
          opacity: 0.3,
        });
      }

      pdfDoc.setTitle(pdfDoc.getTitle() || 'Watermarked PDF Document');
      pdfDoc.setCreator('ToolHub PDF Editor');
      pdfDoc.setCreationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      throw new Error(`Failed to add watermark: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Rotate PDF pages
  async rotatePDF(buffer: Buffer, rotation: number, pageIndices?: number[]): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(buffer);
      const pages = pdfDoc.getPages();
      
      const pagesToRotate = pageIndices || pages.map((_, index) => index);
      
      for (const pageIndex of pagesToRotate) {
        if (pageIndex >= 0 && pageIndex < pages.length) {
          const page = pages[pageIndex];
          page.setRotation(degrees(rotation));
        }
      }

      pdfDoc.setTitle(pdfDoc.getTitle() || 'Rotated PDF Document');
      pdfDoc.setCreator('ToolHub PDF Editor');
      pdfDoc.setCreationDate(new Date());

      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      throw new Error(`Failed to rotate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Protect PDF with password
  async protectPDF(buffer: Buffer, userPassword: string, ownerPassword?: string): Promise<Buffer> {
    try {
      const pdfDoc = await PDFDocument.load(buffer);
      
      // Set document info
      pdfDoc.setTitle(pdfDoc.getTitle() || 'Protected PDF Document');
      pdfDoc.setCreator('ToolHub PDF Protector');
      pdfDoc.setCreationDate(new Date());

      // Note: pdf-lib doesn't directly support password protection
      // In a real implementation, you would use a library like PDFtk or similar
      // For now, we'll just return the original PDF with metadata updates
      
      const pdfBytes = await pdfDoc.save();
      return Buffer.from(pdfBytes);
    } catch (error) {
      throw new Error(`Failed to protect PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const pdfService = new PDFService();