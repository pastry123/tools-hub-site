import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { RemoveBgService } from "./removeBgService";
import { pdfService } from "./pdfService";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Configure multer for PDF uploads with larger file size limit
const uploadPDF = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB limit for PDFs
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/') || 
        file.mimetype.includes('document') || file.mimetype.includes('spreadsheet')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and document files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize Remove.bg service
  const removeBgService = new RemoveBgService(process.env.REMOVEBG_API_KEY || '');

  // Background removal endpoint
  app.post('/api/remove-background', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      if (!process.env.REMOVEBG_API_KEY) {
        return res.status(500).json({ error: 'Remove.bg API key not configured' });
      }

      const options = {
        size: (req.body.size as any) || 'auto',
        type: (req.body.type as any) || 'auto',
        format: (req.body.format as any) || 'png',
        crop: req.body.crop === 'true',
        add_shadow: req.body.add_shadow === 'true',
        bg_color: req.body.bg_color || undefined
      };

      const result = await removeBgService.removeBackground(req.file.buffer, options);

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        image: result.result_b64,
        credits_charged: result.credits_charged,
        credits_remaining: result.credits_remaining
      });

    } catch (error) {
      console.error('Background removal error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  });

  // Account info endpoint
  app.get('/api/remove-bg/account', async (req, res) => {
    try {
      if (!process.env.REMOVEBG_API_KEY) {
        return res.status(500).json({ error: 'Remove.bg API key not configured' });
      }

      const result = await removeBgService.getAccountInfo();

      if (!result.success) {
        return res.status(400).json({ error: result.error });
      }

      res.json({
        success: true,
        credits: result.credits
      });

    } catch (error) {
      console.error('Account info error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Internal server error' 
      });
    }
  });

  // PDF Processing Routes

  // Get PDF info
  app.post('/api/pdf/info', uploadPDF.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const info = await pdfService.getPDFInfo(req.file.buffer);
      res.json(info);
    } catch (error) {
      console.error('PDF info error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to get PDF info' 
      });
    }
  });

  // Merge PDFs
  app.post('/api/pdf/merge', uploadPDF.array('files'), async (req, res) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length < 2) {
        return res.status(400).json({ error: 'At least 2 PDF files are required for merging' });
      }

      const pdfBuffers = req.files.map(file => file.buffer);
      const mergedPdf = await pdfService.mergePDFs(pdfBuffers);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${req.body.outputName || 'merged.pdf'}"`);
      res.send(mergedPdf);
    } catch (error) {
      console.error('PDF merge error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to merge PDFs' 
      });
    }
  });

  // Split PDF
  app.post('/api/pdf/split', uploadPDF.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const options = {
        splitType: req.body.splitType,
        splitValue: req.body.splitValue
      };

      const splitResults = await pdfService.splitPDF(req.file.buffer, options);
      
      // Convert buffers to base64 for JSON response
      const results = splitResults.map(result => ({
        name: result.name,
        pages: result.pages,
        data: result.data.toString('base64')
      }));

      res.json({ files: results });
    } catch (error) {
      console.error('PDF split error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to split PDF' 
      });
    }
  });

  // Compress PDF
  app.post('/api/pdf/compress', uploadPDF.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const options = {
        quality: parseInt(req.body.quality) || 70,
        compressionLevel: req.body.compressionLevel || 'medium'
      };

      const compressedPdf = await pdfService.compressPDF(req.file.buffer, options);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="compressed.pdf"');
      res.send(compressedPdf);
    } catch (error) {
      console.error('PDF compress error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to compress PDF' 
      });
    }
  });

  // Convert PDF/Document
  app.post('/api/pdf/convert', uploadPDF.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
      }

      const outputFormat = req.body.outputFormat;
      const conversionType = req.body.conversionType;

      let result: Buffer;
      let contentType: string;
      let filename: string;

      switch (outputFormat) {
        case 'txt':
          const text = await pdfService.pdfToText(req.file.buffer);
          result = Buffer.from(text, 'utf-8');
          contentType = 'text/plain';
          filename = 'extracted-text.txt';
          break;
        case 'pdf':
          if (conversionType === 'images-to-pdf') {
            // Handle multiple images to PDF conversion
            result = await pdfService.imagesToPDF([req.file.buffer]);
          } else {
            // Other document formats to PDF would require additional libraries
            throw new Error('Document to PDF conversion not yet implemented');
          }
          contentType = 'application/pdf';
          filename = 'converted.pdf';
          break;
        default:
          throw new Error(`Unsupported output format: ${outputFormat}`);
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(result);
    } catch (error) {
      console.error('PDF convert error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to convert file' 
      });
    }
  });

  // Add watermark to PDF
  app.post('/api/pdf/watermark', uploadPDF.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const watermarkText = req.body.watermarkText || 'WATERMARK';
      const watermarkedPdf = await pdfService.addWatermark(req.file.buffer, watermarkText);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="watermarked.pdf"');
      res.send(watermarkedPdf);
    } catch (error) {
      console.error('PDF watermark error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to add watermark' 
      });
    }
  });

  // Rotate PDF pages
  app.post('/api/pdf/rotate', uploadPDF.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const rotation = parseInt(req.body.rotation) || 90;
      const pageIndices = req.body.pageIndices ? JSON.parse(req.body.pageIndices) : undefined;
      
      const rotatedPdf = await pdfService.rotatePDF(req.file.buffer, rotation, pageIndices);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="rotated.pdf"');
      res.send(rotatedPdf);
    } catch (error) {
      console.error('PDF rotate error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to rotate PDF' 
      });
    }
  });

  // Protect PDF with password
  app.post('/api/pdf/protect', uploadPDF.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const userPassword = req.body.userPassword;
      const ownerPassword = req.body.ownerPassword;

      if (!userPassword) {
        return res.status(400).json({ error: 'Password is required' });
      }

      const protectedPdf = await pdfService.protectPDF(req.file.buffer, userPassword, ownerPassword);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="protected.pdf"');
      res.send(protectedPdf);
    } catch (error) {
      console.error('PDF protect error:', error);
      res.status(500).json({ 
        error: error instanceof Error ? error.message : 'Failed to protect PDF' 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
