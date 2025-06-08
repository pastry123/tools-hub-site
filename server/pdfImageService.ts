import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { nanoid } from 'nanoid';

const execAsync = promisify(exec);

export class PDFImageService {
  private tempDir = '/tmp';

  async convertPDFToImages(pdfBuffer: Buffer, dpi: number = 150): Promise<string[]> {
    const tempId = nanoid();
    const pdfPath = path.join(this.tempDir, `pdf_${tempId}.pdf`);
    const outputPattern = path.join(this.tempDir, `page_${tempId}_%d.png`);

    try {
      // Write PDF buffer to temporary file
      await fs.promises.writeFile(pdfPath, pdfBuffer);

      // Convert PDF pages to PNG images using pdftoppm
      const command = `pdftoppm -png -r ${dpi} "${pdfPath}" "${path.join(this.tempDir, `page_${tempId}_`)}"`;
      await execAsync(command);

      // Find generated image files
      const files = await fs.promises.readdir(this.tempDir);
      const imageFiles = files
        .filter(file => file.startsWith(`page_${tempId}_`) && file.endsWith('.png'))
        .sort((a, b) => {
          const numA = parseInt(a.match(/page_.*_(\d+)\.png$/)?.[1] || '0');
          const numB = parseInt(b.match(/page_.*_(\d+)\.png$/)?.[1] || '0');
          return numA - numB;
        });

      // Convert images to base64 data URLs
      const base64Images: string[] = [];
      for (const imageFile of imageFiles) {
        const imagePath = path.join(this.tempDir, imageFile);
        const imageBuffer = await fs.promises.readFile(imagePath);
        const base64 = imageBuffer.toString('base64');
        base64Images.push(`data:image/png;base64,${base64}`);
        
        // Clean up temporary image file
        await fs.promises.unlink(imagePath).catch(() => {});
      }

      // Clean up temporary PDF file
      await fs.promises.unlink(pdfPath).catch(() => {});

      return base64Images;
    } catch (error) {
      // Clean up files on error
      await fs.promises.unlink(pdfPath).catch(() => {});
      
      // Try to clean up any generated images
      try {
        const files = await fs.promises.readdir(this.tempDir);
        const cleanup = files
          .filter(file => file.startsWith(`page_${tempId}_`))
          .map(file => fs.promises.unlink(path.join(this.tempDir, file)).catch(() => {}));
        await Promise.all(cleanup);
      } catch {}

      throw new Error(`Failed to convert PDF to images: ${error}`);
    }
  }

  async convertSinglePage(pdfBuffer: Buffer, pageNumber: number, dpi: number = 150): Promise<string> {
    const tempId = nanoid();
    const pdfPath = path.join(this.tempDir, `pdf_${tempId}.pdf`);

    try {
      // Write PDF buffer to temporary file
      await fs.promises.writeFile(pdfPath, pdfBuffer);

      // Convert specific page to PNG
      const outputPath = path.join(this.tempDir, `page_${tempId}.png`);
      const command = `pdftoppm -png -r ${dpi} -f ${pageNumber} -l ${pageNumber} "${pdfPath}" "${path.join(this.tempDir, `page_${tempId}`)}"`;
      await execAsync(command);

      // Find the generated image file
      const files = await fs.promises.readdir(this.tempDir);
      const imageFile = files.find(file => file.startsWith(`page_${tempId}`) && file.endsWith('.png'));

      if (!imageFile) {
        throw new Error('No image file generated');
      }

      const imagePath = path.join(this.tempDir, imageFile);
      const imageBuffer = await fs.promises.readFile(imagePath);
      const base64 = imageBuffer.toString('base64');

      // Clean up temporary files
      await fs.promises.unlink(pdfPath).catch(() => {});
      await fs.promises.unlink(imagePath).catch(() => {});

      return `data:image/png;base64,${base64}`;
    } catch (error) {
      // Clean up files on error
      await fs.promises.unlink(pdfPath).catch(() => {});
      throw new Error(`Failed to convert PDF page to image: ${error}`);
    }
  }
}

export const pdfImageService = new PDFImageService();