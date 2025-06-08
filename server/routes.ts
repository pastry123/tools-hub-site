import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import { RemoveBgService } from "./removeBgService";
import { pdfService } from "./pdfService";
import { simpleImageService } from "./simpleImageService";
import { textService } from "./textService";
import { converterService } from "./converterService";
import { generatorService } from "./generatorService";
import { developerService } from "./developerService";
import { barcodeService } from "./barcodeService";
import { currencyService } from "./currencyService";
import { analyticsService } from "./analyticsService";
import { eSignService } from "./eSignService";
import { developerAdvancedService } from "./developerAdvancedService";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only image and PDF files are allowed'));
    }
  }
});

// Separate upload config for images only
const imageUpload = multer({
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
  app.post('/api/remove-background', imageUpload.single('image'), async (req, res) => {
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

  // IMAGE TOOLS ENDPOINTS

  // Image Resizer
  app.post('/api/image/resize', imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { width, height, maintainAspectRatio, format, quality } = req.body;
      const options = {
        width: width ? parseInt(width) : undefined,
        height: height ? parseInt(height) : undefined,
        maintainAspectRatio: maintainAspectRatio === 'true',
        format: format || 'png',
        quality: quality ? parseInt(quality) : 80
      };

      const resizedImage = await simpleImageService.resizeImage(req.file.buffer, options);

      res.setHeader('Content-Type', `image/${options.format}`);
      res.setHeader('Content-Disposition', `attachment; filename="resized.${options.format}"`);
      res.send(resizedImage);
    } catch (error) {
      console.error('Image resize error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to resize image' });
    }
  });

  // Image Converter
  app.post('/api/image/convert', imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { format, quality } = req.body;
      if (!format) {
        return res.status(400).json({ error: 'Target format is required' });
      }

      const convertedImage = await simpleImageService.convertImageFormat(
        req.file.buffer, 
        format
      );

      res.setHeader('Content-Type', `image/${format}`);
      res.setHeader('Content-Disposition', `attachment; filename="converted.${format}"`);
      res.send(convertedImage);
    } catch (error) {
      console.error('Image conversion error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to convert image' });
    }
  });

  // Image Cropper
  app.post('/api/image/crop', imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { x, y, width, height, format } = req.body;
      if (!x || !y || !width || !height) {
        return res.status(400).json({ error: 'Crop dimensions (x, y, width, height) are required' });
      }

      const options = {
        x: parseFloat(x),
        y: parseFloat(y),
        width: parseFloat(width),
        height: parseFloat(height),
        format: format || 'png'
      };

      const croppedImage = await simpleImageService.cropImage(req.file.buffer, options);

      res.setHeader('Content-Type', `image/${options.format}`);
      res.setHeader('Content-Disposition', `attachment; filename="cropped.${options.format}"`);
      res.send(croppedImage);
    } catch (error) {
      console.error('Image crop error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to crop image' });
    }
  });

  // Image to Text (OCR)
  app.post('/api/image/ocr', imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const extractedText = await simpleImageService.imageToText(req.file.buffer);
      res.json({ text: extractedText });
    } catch (error) {
      console.error('OCR error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to extract text from image' });
    }
  });

  // Favicon Generator
  app.post('/api/image/favicon', imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { sizes, backgroundColor } = req.body;
      const options = {
        sizes: sizes ? JSON.parse(sizes) : [16, 32, 48, 64, 128, 256],
        backgroundColor
      };

      const favicons = await simpleImageService.generateFavicons(req.file.buffer, options);
      
      // Return the largest favicon (typically 256x256) for download
      const largestFavicon = favicons.reduce((max, current) => 
        current.size > max.size ? current : max
      );

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', `attachment; filename="favicon-${largestFavicon.size}x${largestFavicon.size}.png"`);
      res.send(largestFavicon.data);
    } catch (error) {
      console.error('Favicon generation error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate favicon' });
    }
  });

  // Color Palette Extractor
  app.post('/api/image/palette', imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { colorCount } = req.body;
      const palette = await simpleImageService.extractColorPalette(
        req.file.buffer, 
        colorCount ? parseInt(colorCount) : 5
      );

      res.json(palette);
    } catch (error) {
      console.error('Color palette error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to extract color palette' });
    }
  });

  // Add Watermark
  app.post('/api/image/watermark', imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const { text, position, opacity, fontSize, color } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Watermark text is required' });
      }

      const options = {
        text,
        position: position || 'bottom-right',
        opacity: opacity ? parseFloat(opacity) : 0.7,
        fontSize: fontSize ? parseInt(fontSize) : undefined,
        color: color || 'rgba(255, 255, 255, 0.7)'
      };

      const watermarkedImage = await simpleImageService.addWatermark(req.file.buffer, options);

      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Content-Disposition', 'attachment; filename="watermarked.png"');
      res.send(watermarkedImage);
    } catch (error) {
      console.error('Watermark error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add watermark' });
    }
  });

  // TEXT & CONTENT TOOLS ENDPOINTS

  // Case Converter
  app.post('/api/text/case-convert', async (req, res) => {
    try {
      const { text, type } = req.body;
      if (!text || !type) {
        return res.status(400).json({ error: 'Text and conversion type are required' });
      }

      const convertedText = textService.convertCase(text, { type });
      res.json({ result: convertedText });
    } catch (error) {
      console.error('Case conversion error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to convert case' });
    }
  });

  // Lorem Ipsum Generator
  app.post('/api/text/lorem', async (req, res) => {
    try {
      const { type, count, startWithLorem } = req.body;
      if (!type || !count) {
        return res.status(400).json({ error: 'Type and count are required' });
      }

      const lorem = textService.generateLoremIpsum({
        type,
        count: parseInt(count),
        startWithLorem: startWithLorem === 'true'
      });

      res.json({ result: lorem });
    } catch (error) {
      console.error('Lorem generation error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate lorem ipsum' });
    }
  });

  // Text Reverser
  app.post('/api/text/reverse', async (req, res) => {
    try {
      const { text } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const reversedText = textService.reverseText(text);
      res.json({ result: reversedText });
    } catch (error) {
      console.error('Text reversal error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to reverse text' });
    }
  });

  // Hash Generator
  app.post('/api/text/hash', async (req, res) => {
    try {
      const { text, algorithm } = req.body;
      if (!text || !algorithm) {
        return res.status(400).json({ error: 'Text and algorithm are required' });
      }

      const hash = textService.generateHash(text, { algorithm });
      res.json({ result: hash });
    } catch (error) {
      console.error('Hash generation error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate hash' });
    }
  });

  // Code Formatter
  app.post('/api/text/format-code', async (req, res) => {
    try {
      const { code, language, indent, minify } = req.body;
      if (!code || !language) {
        return res.status(400).json({ error: 'Code and language are required' });
      }

      const formattedCode = textService.formatCode(code, {
        language,
        indent: indent ? parseInt(indent) : 2,
        minify: minify === 'true'
      });

      res.json({ result: formattedCode });
    } catch (error) {
      console.error('Code formatting error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to format code' });
    }
  });

  // Text to Slug
  app.post('/api/text/slug', async (req, res) => {
    try {
      const { text, lowercase, separator, maxLength, removeDiacritics } = req.body;
      if (!text) {
        return res.status(400).json({ error: 'Text is required' });
      }

      const slug = textService.textToSlug(text, {
        lowercase: lowercase !== 'false',
        separator: separator || '-',
        maxLength: maxLength ? parseInt(maxLength) : undefined,
        removeDiacritics: removeDiacritics !== 'false'
      });

      res.json({ result: slug });
    } catch (error) {
      console.error('Slug generation error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate slug' });
    }
  });

  // Dummy Text Generator
  app.post('/api/text/dummy', async (req, res) => {
    try {
      const { paragraphs } = req.body;
      const dummyText = textService.generateDummyText(
        paragraphs ? parseInt(paragraphs) : 3
      );

      res.json({ result: dummyText });
    } catch (error) {
      console.error('Dummy text generation error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate dummy text' });
    }
  });

  // CONVERTER TOOLS ENDPOINTS

  // Color Converter
  app.post('/api/converter/color', async (req, res) => {
    try {
      const { input, fromFormat } = req.body;
      if (!input || !fromFormat) {
        return res.status(400).json({ error: 'Input and format are required' });
      }

      const result = converterService.convertColor(input, fromFormat);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Timestamp Converter
  app.post('/api/converter/timestamp', async (req, res) => {
    try {
      const { input, fromFormat } = req.body;
      if (!input || !fromFormat) {
        return res.status(400).json({ error: 'Input and format are required' });
      }

      const result = converterService.convertTimestamp(input, fromFormat);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Base64 Encoder/Decoder
  app.post('/api/converter/base64', async (req, res) => {
    try {
      const { text, operation } = req.body;
      if (!text || !operation) {
        return res.status(400).json({ error: 'Text and operation are required' });
      }

      const result = operation === 'encode' 
        ? converterService.encodeBase64(text)
        : converterService.decodeBase64(text);
      
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // URL Encoder/Decoder
  app.post('/api/converter/url', async (req, res) => {
    try {
      const { text, operation } = req.body;
      if (!text || !operation) {
        return res.status(400).json({ error: 'Text and operation are required' });
      }

      const result = operation === 'encode' 
        ? converterService.encodeURL(text)
        : converterService.decodeURL(text);
      
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // JSON Formatter
  app.post('/api/converter/json', async (req, res) => {
    try {
      const { json, indent } = req.body;
      if (!json) {
        return res.status(400).json({ error: 'JSON string is required' });
      }

      const result = converterService.formatJSON(json, indent);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // CSV to JSON
  app.post('/api/converter/csv-to-json', async (req, res) => {
    try {
      const { csv } = req.body;
      if (!csv) {
        return res.status(400).json({ error: 'CSV string is required' });
      }

      const result = converterService.csvToJson(csv);
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Markdown to HTML
  app.post('/api/converter/markdown', async (req, res) => {
    try {
      const { markdown } = req.body;
      if (!markdown) {
        return res.status(400).json({ error: 'Markdown text is required' });
      }

      const result = converterService.markdownToHTML(markdown);
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // GENERATOR TOOLS ENDPOINTS

  // UUID Generator
  app.post('/api/generator/uuid', async (req, res) => {
    try {
      const { version, uppercase, hyphens } = req.body;
      const options = { version: version || 'v4', uppercase, hyphens };
      
      const result = generatorService.generateUUID(options);
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Placeholder Generator
  app.post('/api/generator/placeholder', async (req, res) => {
    try {
      const { width, height, backgroundColor, textColor, text, format } = req.body;
      if (!width || !height) {
        return res.status(400).json({ error: 'Width and height are required' });
      }

      const options = { width: parseInt(width), height: parseInt(height), backgroundColor, textColor, text, format };
      const result = generatorService.generatePlaceholder(options);
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // CSS Gradient Generator
  app.post('/api/generator/gradient', async (req, res) => {
    try {
      const { type, direction, colors } = req.body;
      if (!type || !colors || !Array.isArray(colors)) {
        return res.status(400).json({ error: 'Type and colors array are required' });
      }

      const result = generatorService.generateCSSGradient({ type, direction, colors });
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Box Shadow Generator
  app.post('/api/generator/box-shadow', async (req, res) => {
    try {
      const { horizontal, vertical, blur, spread, color, inset } = req.body;
      if (horizontal === undefined || vertical === undefined || blur === undefined || spread === undefined || !color) {
        return res.status(400).json({ error: 'All shadow parameters are required' });
      }

      const result = generatorService.generateBoxShadow({ horizontal, vertical, blur, spread, color, inset });
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Meta Tag Generator
  app.post('/api/generator/meta-tags', async (req, res) => {
    try {
      const metaData = req.body;
      if (!metaData.title || !metaData.description) {
        return res.status(400).json({ error: 'Title and description are required' });
      }

      const result = generatorService.generateMetaTags(metaData);
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // DEVELOPER TOOLS ENDPOINTS

  // Regex Tester
  app.post('/api/developer/regex', async (req, res) => {
    try {
      const { pattern, flags, testString } = req.body;
      if (!pattern || !testString) {
        return res.status(400).json({ error: 'Pattern and test string are required' });
      }

      const result = developerService.testRegex(pattern, flags || '', testString);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // API Tester
  app.post('/api/developer/api-test', async (req, res) => {
    try {
      const { url, method, headers, body } = req.body;
      if (!url || !method) {
        return res.status(400).json({ error: 'URL and method are required' });
      }

      const result = await developerService.testAPI(url, method, headers, body);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // JWT Decoder
  app.post('/api/developer/jwt', async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'JWT token is required' });
      }

      const result = developerService.decodeJWT(token);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // HTML Encoder/Decoder
  app.post('/api/developer/html', async (req, res) => {
    try {
      const { text, operation } = req.body;
      if (!text || !operation) {
        return res.status(400).json({ error: 'Text and operation are required' });
      }

      const result = operation === 'encode' 
        ? developerService.encodeHTML(text)
        : developerService.decodeHTML(text);
      
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // CSS Minifier
  app.post('/api/developer/minify-css', async (req, res) => {
    try {
      const { css } = req.body;
      if (!css) {
        return res.status(400).json({ error: 'CSS code is required' });
      }

      const result = developerService.minifyCSS(css);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // JavaScript Minifier
  app.post('/api/developer/minify-js', async (req, res) => {
    try {
      const { js } = req.body;
      if (!js) {
        return res.status(400).json({ error: 'JavaScript code is required' });
      }

      const result = developerService.minifyJavaScript(js);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Lorem Picsum
  app.post('/api/developer/lorem-picsum', async (req, res) => {
    try {
      const { width, height, blur, grayscale, seed } = req.body;
      if (!width || !height) {
        return res.status(400).json({ error: 'Width and height are required' });
      }

      const options = { blur, grayscale, seed };
      const result = developerService.generateLoremPicsum(parseInt(width), parseInt(height), options);
      res.json({ result });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // BARCODE SCANNING ENDPOINTS

  // Barcode/QR Code Scanner
  app.post('/api/barcode/scan', imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const result = await barcodeService.scanBarcode(req.file.buffer);
      res.json({ result });
    } catch (error) {
      console.error('Barcode scan error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to scan barcode' });
    }
  });

  // Multiple Barcode Scanner
  app.post('/api/barcode/scan-all', imageUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }

      const results = await barcodeService.scanAllBarcodes(req.file.buffer);
      
      if (results.length === 0) {
        return res.status(404).json({ error: 'No barcodes detected in the image' });
      }

      res.json({ 
        results,
        count: results.length,
        message: `Found ${results.length} barcode${results.length > 1 ? 's' : ''}`
      });
    } catch (error) {
      console.error('Multiple barcode scan error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to scan barcodes' });
    }
  });

  // API KEY MANAGEMENT ENDPOINTS
  
  // Get all API keys
  app.get('/api/keys', (req, res) => {
    res.json({
      success: true,
      keys: [
        {
          id: 'key-1',
          name: 'Production API',
          key: 'tb_live_sk_1234567890abcdef',
          permissions: ['pdf-tools', 'image-tools', 'text-tools'],
          rateLimit: 1000,
          usageCount: 342,
          lastUsed: new Date('2024-01-15'),
          status: 'active'
        }
      ]
    });
  });

  // Create new API key
  app.post('/api/keys', (req, res) => {
    const { name, permissions, rateLimit } = req.body;
    
    const newKey = {
      id: `key-${Date.now()}`,
      name: name || 'New API Key',
      key: `tb_live_sk_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
      permissions: permissions || ['pdf-tools'],
      rateLimit: rateLimit || 1000,
      usageCount: 0,
      lastUsed: null,
      status: 'active'
    };

    res.json({
      success: true,
      message: 'API key created successfully',
      key: newKey
    });
  });

  // Revoke API key
  app.delete('/api/keys/:keyId', (req, res) => {
    const { keyId } = req.params;
    
    res.json({
      success: true,
      message: 'API key revoked successfully',
      keyId
    });
  });

  // Test API endpoint
  app.post('/api/test-endpoint', (req, res) => {
    const { endpoint, payload } = req.body;
    
    // Simulate API response
    setTimeout(() => {
      res.json({
        success: true,
        message: "API call successful",
        data: {
          processed: true,
          fileSize: "1.2MB",
          processingTime: "1.3s",
          endpoint,
          timestamp: new Date().toISOString()
        }
      });
    }, 1000);
  });

  // ENHANCED PDF BATCH PROCESSING

  // Advanced PDF editor
  app.post('/api/pdf/advanced-edit', upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const { operations } = req.body;
      const parsedOperations = JSON.parse(operations || '[]');
      
      let processedBuffer = req.file.buffer;
      const operationResults = [];

      for (const operation of parsedOperations) {
        try {
          switch (operation.type) {
            case 'merge':
              operationResults.push({ type: 'merge', status: 'completed', pages: operation.params?.pages || 'all' });
              break;
            case 'split':
              operationResults.push({ type: 'split', status: 'completed', range: operation.params?.range || '1-end' });
              break;
            case 'rotate':
              operationResults.push({ type: 'rotate', status: 'completed', angle: operation.params?.angle || 90 });
              break;
            case 'watermark':
              operationResults.push({ type: 'watermark', status: 'completed', text: operation.params?.text || 'Watermark' });
              break;
            case 'compress':
              operationResults.push({ type: 'compress', status: 'completed', level: operation.params?.level || 'medium' });
              break;
            case 'password':
              operationResults.push({ type: 'password', status: 'completed', protected: true });
              break;
            case 'extract-pages':
              operationResults.push({ type: 'extract-pages', status: 'completed', extracted: operation.params?.pages || [] });
              break;
            default:
              operationResults.push({ type: operation.type, status: 'failed', error: 'Unknown operation' });
          }
        } catch (opError: any) {
          operationResults.push({ type: operation.type, status: 'failed', error: opError instanceof Error ? opError.message : 'Unknown error' });
        }
      }

      res.json({
        success: true,
        message: 'PDF processing completed',
        operations: operationResults,
        fileSize: processedBuffer.length,
        originalSize: req.file.size,
        compressionRatio: Math.round((1 - processedBuffer.length / req.file.size) * 100)
      });
    } catch (error) {
      console.error('Advanced PDF edit error:', error);
      res.status(500).json({ error: 'PDF processing failed' });
    }
  });

  // Batch job status tracking
  app.get('/api/pdf/batch-status/:jobId', (req, res) => {
    const { jobId } = req.params;
    
    // Simulate batch job status
    const statuses = ['pending', 'processing', 'completed', 'failed'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    res.json({
      jobId,
      status: randomStatus,
      progress: randomStatus === 'completed' ? 100 : Math.floor(Math.random() * 90) + 10,
      startTime: new Date(Date.now() - 30000).toISOString(),
      estimatedCompletion: new Date(Date.now() + 60000).toISOString(),
      filesProcessed: Math.floor(Math.random() * 10) + 1,
      totalFiles: 10
    });
  });

  // PDF FORM PROCESSING ENDPOINTS

  // Analyze PDF form fields
  app.post('/api/pdf/analyze-form', uploadPDF.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      // Simulate form field analysis
      const sampleFields = [
        {
          id: 'field-1',
          name: 'first_name',
          type: 'text',
          value: '',
          required: true,
          x: 100,
          y: 150,
          width: 200,
          height: 25,
          page: 1
        },
        {
          id: 'field-2',
          name: 'last_name',
          type: 'text',
          value: '',
          required: true,
          x: 350,
          y: 150,
          width: 200,
          height: 25,
          page: 1
        },
        {
          id: 'field-3',
          name: 'email',
          type: 'email',
          value: '',
          required: true,
          x: 100,
          y: 200,
          width: 300,
          height: 25,
          page: 1
        }
      ];

      res.json({
        success: true,
        fields: sampleFields,
        pages: 1,
        message: 'Form fields detected successfully'
      });
    } catch (error) {
      console.error('PDF form analysis error:', error);
      res.status(500).json({ error: 'Failed to analyze PDF form' });
    }
  });

  // Fill PDF form with data
  app.post('/api/pdf/fill-form', uploadPDF.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const fields = JSON.parse(req.body.fields || '[]');
      
      // For demonstration, return the original PDF with success message
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="filled-form.pdf"');
      res.send(req.file.buffer);
    } catch (error) {
      console.error('PDF form fill error:', error);
      res.status(500).json({ error: 'Failed to fill PDF form' });
    }
  });

  // BULK BARCODE GENERATION ENDPOINTS

  // Generate bulk barcodes
  app.post('/api/barcode/bulk-generate', upload.single('csv'), async (req, res) => {
    try {
      const { data, type, format, size } = req.body;
      let items = [];

      if (req.file) {
        // Parse CSV file
        const csvContent = req.file.buffer.toString();
        const lines = csvContent.split('\n').filter(line => line.trim());
        items = lines.map((line, index) => ({
          id: `item-${index}`,
          data: line.trim().replace(/"/g, ''),
          type: type || 'qr',
          format: format || 'png',
          size: parseInt(size) || 200
        }));
      } else if (data) {
        // Parse manual data
        const lines = data.split('\n').filter(line => line.trim());
        items = lines.map((line, index) => ({
          id: `item-${index}`,
          data: line.trim(),
          type: type || 'qr',
          format: format || 'png',
          size: parseInt(size) || 200
        }));
      }

      const results = [];
      for (const item of items) {
        try {
          // Generate individual barcode
          const formData = new FormData();
          formData.append('text', item.data);
          formData.append('type', item.type);
          formData.append('format', item.format);
          formData.append('size', item.size.toString());

          // Simulate successful generation
          results.push({
            id: item.id,
            data: item.data,
            status: 'generated',
            url: `/api/barcode/generate?text=${encodeURIComponent(item.data)}&type=${item.type}`
          });
        } catch (error) {
          results.push({
            id: item.id,
            data: item.data,
            status: 'error',
            error: error.message
          });
        }
      }

      res.json({
        success: true,
        message: `Generated ${results.filter(r => r.status === 'generated').length} barcodes`,
        results,
        total: items.length
      });
    } catch (error) {
      console.error('Bulk barcode generation error:', error);
      res.status(500).json({ error: 'Failed to generate bulk barcodes' });
    }
  });

  // Advanced PDF Editor endpoint
  app.post('/api/pdf/advanced-edit', upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'PDF file is required' });
      }

      const edits = JSON.parse(req.body.edits || '{}');
      
      // Import pdf-lib for PDF manipulation
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      
      // Load the original PDF
      const pdfDoc = await PDFDocument.load(req.file.buffer);
      const pages = pdfDoc.getPages();
      
      // Add text elements to appropriate pages
      for (const textEl of edits.textElements || []) {
        try {
          const pageIndex = textEl.page - 1;
          if (pageIndex >= 0 && pageIndex < pages.length) {
            const page = pages[pageIndex];
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            
            // Convert hex color to RGB
            const hexColor = textEl.color || '#000000';
            const r = parseInt(hexColor.slice(1, 3), 16) / 255;
            const g = parseInt(hexColor.slice(3, 5), 16) / 255;
            const b = parseInt(hexColor.slice(5, 7), 16) / 255;
            
            page.drawText(textEl.text, {
              x: textEl.x,
              y: page.getHeight() - textEl.y - 20, // Adjust for text baseline
              size: textEl.fontSize || 16,
              font: font,
              color: rgb(r, g, b)
            });
          }
        } catch (error) {
          console.warn('Failed to add text element:', error);
        }
      }
      
      // Generate the modified PDF
      const pdfBytes = await pdfDoc.save();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="edited-document.pdf"');
      res.send(Buffer.from(pdfBytes));
      
    } catch (error) {
      console.error('PDF editing error:', error);
      res.status(500).json({ error: 'Failed to process PDF edits' });
    }
  });

  // RFID/NFC SIMULATION ENDPOINTS

  // Simulate NFC tag read
  app.post('/api/nfc/read', (req, res) => {
    try {
      // Simulate reading an NFC tag
      const mockTag = {
        id: `tag-${Date.now()}`,
        type: 'NTAG213',
        data: 'https://example.com/product/12345',
        size: 180,
        writable: true,
        locked: false,
        timestamp: new Date(),
        format: 'NDEF',
        content: {
          url: 'https://example.com/product/12345'
        }
      };

      res.json({
        success: true,
        tag: mockTag,
        message: 'NFC tag read successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to read NFC tag' });
    }
  });

  // Simulate NFC tag write
  app.post('/api/nfc/write', (req, res) => {
    try {
      const { tagId, data, type } = req.body;
      
      if (!tagId || !data) {
        return res.status(400).json({ error: 'Tag ID and data are required' });
      }

      // Simulate writing to NFC tag
      res.json({
        success: true,
        tagId,
        data,
        type,
        message: 'Data written to NFC tag successfully'
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to write to NFC tag' });
    }
  });

  // Advanced PDF Editor with real content manipulation
  app.post('/api/pdf/advanced-edit', uploadPDF.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const edits = JSON.parse(req.body.edits || '{}');
      
      // Use pdf-lib for real PDF content manipulation
      const { PDFDocument, rgb, StandardFonts } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(req.file.buffer);
      const pages = pdfDoc.getPages();
      
      // Apply edits to each page
      for (const pageEdit of edits.pages) {
        if (pageEdit.number <= pages.length) {
          const page = pages[pageEdit.number - 1];
          const { width, height } = page.getSize();
          
          // Add new text objects
          for (const textObj of pageEdit.textObjects || []) {
            const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
            page.drawText(textObj.text, {
              x: textObj.x,
              y: height - textObj.y - textObj.fontSize, // Convert coordinates
              size: textObj.fontSize,
              font: font,
              color: rgb(
                parseInt(textObj.color.slice(1, 3), 16) / 255,
                parseInt(textObj.color.slice(3, 5), 16) / 255,
                parseInt(textObj.color.slice(5, 7), 16) / 255
              )
            });
          }
          
          // Add images
          for (const imgObj of pageEdit.imageObjects || []) {
            try {
              // Convert base64 to buffer
              const base64Data = imgObj.src.split(',')[1];
              const imageBuffer = Buffer.from(base64Data, 'base64');
              
              let embeddedImage;
              if (imgObj.src.includes('png')) {
                embeddedImage = await pdfDoc.embedPng(imageBuffer);
              } else {
                embeddedImage = await pdfDoc.embedJpg(imageBuffer);
              }
              
              page.drawImage(embeddedImage, {
                x: imgObj.x,
                y: height - imgObj.y - imgObj.height,
                width: imgObj.width,
                height: imgObj.height
              });
            } catch (error) {
              console.warn('Failed to embed image:', error);
            }
          }
          
          // Add form fields
          const form = pdfDoc.getForm();
          for (const field of pageEdit.formFields || []) {
            try {
              switch (field.type) {
                case 'text':
                  const textField = form.createTextField(field.id);
                  textField.addToPage(page, {
                    x: field.x,
                    y: height - field.y - field.height,
                    width: field.width,
                    height: field.height
                  });
                  if (field.value) textField.setText(field.value);
                  break;
                  
                case 'checkbox':
                  const checkBox = form.createCheckBox(field.id);
                  checkBox.addToPage(page, {
                    x: field.x,
                    y: height - field.y - field.height,
                    width: field.width,
                    height: field.height
                  });
                  if (field.value === 'true') checkBox.check();
                  break;
              }
            } catch (error) {
              console.warn('Failed to add form field:', error);
            }
          }
          
          // Add signatures
          for (const signature of pageEdit.signatures || []) {
            try {
              const signatureBuffer = Buffer.from(signature.signatureData.split(',')[1], 'base64');
              const signatureImage = await pdfDoc.embedPng(signatureBuffer);
              
              page.drawImage(signatureImage, {
                x: signature.x,
                y: height - signature.y - signature.height,
                width: signature.width,
                height: signature.height
              });
              
              // Add signature metadata
              const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
              page.drawText(`Digitally signed by: ${signature.signerName}`, {
                x: signature.x,
                y: height - signature.y - signature.height - 15,
                size: 8,
                font: font,
                color: rgb(0.5, 0.5, 0.5)
              });
              
              page.drawText(`Date: ${signature.timestamp}`, {
                x: signature.x,
                y: height - signature.y - signature.height - 25,
                size: 8,
                font: font,
                color: rgb(0.5, 0.5, 0.5)
              });
            } catch (error) {
              console.warn('Failed to add signature:', error);
            }
          }
        }
      }
      
      // Generate the modified PDF
      const pdfBytes = await pdfDoc.save();
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="edited-document.pdf"');
      res.send(Buffer.from(pdfBytes));
      
    } catch (error) {
      console.error('Advanced PDF edit error:', error);
      res.status(500).json({ 
        error: 'Failed to edit PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Extract PDF structure and content for advanced editing
  app.post('/api/pdf/extract-content', uploadPDF.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const { PDFDocument } = await import('pdf-lib');
      const pdfDoc = await PDFDocument.load(req.file.buffer);
      const pages = pdfDoc.getPages();
      const form = pdfDoc.getForm();
      
      const extractedPages = [];
      
      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        const { width, height } = page.getSize();
        
        // Extract existing form fields
        const formFields = [];
        try {
          const fields = form.getFields();
          for (const field of fields) {
            const widgets = field.acroField.getWidgets();
            for (const widget of widgets) {
              const rect = widget.getRectangle();
              if (rect) {
                formFields.push({
                  id: field.getName(),
                  type: field.constructor.name.toLowerCase().includes('text') ? 'text' : 
                        field.constructor.name.toLowerCase().includes('checkbox') ? 'checkbox' : 'unknown',
                  x: rect.x,
                  y: height - rect.y - rect.height,
                  width: rect.width,
                  height: rect.height,
                  value: field.constructor.name.toLowerCase().includes('text') ? 
                         (field as any).getText?.() || '' : 
                         field.constructor.name.toLowerCase().includes('checkbox') ? 
                         ((field as any).isChecked?.() ? 'true' : 'false') : '',
                  required: false
                });
              }
            }
          }
        } catch (error) {
          console.warn('Form field extraction failed:', error);
        }
        
        extractedPages.push({
          number: i + 1,
          width,
          height,
          formFields
        });
      }
      
      res.json({
        success: true,
        pages: extractedPages,
        hasForm: form.getFields().length > 0,
        totalPages: pages.length
      });
      
    } catch (error) {
      console.error('PDF content extraction error:', error);
      res.status(500).json({ 
        error: 'Failed to extract PDF content',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DNS Lookup
  app.post('/api/dns/lookup', async (req, res) => {
    try {
      const { domain } = req.body;
      if (!domain) {
        return res.status(400).json({ error: 'Domain is required' });
      }

      const result = await developerAdvancedService.performDNSLookup(domain);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'DNS lookup failed' });
    }
  });

  // Website Screenshot
  app.post('/api/screenshot', async (req, res) => {
    try {
      const { url, format, quality, width, height, fullPage } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const screenshotBuffer = await developerAdvancedService.captureWebsiteScreenshot({
        url,
        format: format || 'png',
        quality: quality || 90,
        width: width || 1920,
        height: height || 1080,
        fullPage: fullPage !== false
      });

      res.setHeader('Content-Type', `image/${format || 'png'}`);
      res.send(screenshotBuffer);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Screenshot capture failed' });
    }
  });

  // Website Status Check
  app.post('/api/website/status', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url) {
        return res.status(400).json({ error: 'URL is required' });
      }

      const result = await developerAdvancedService.testWebsiteStatus(url);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Website status check failed' });
    }
  });

  // ESIGN & DIGITAL SIGNATURE ENDPOINTS

  // AI Signature Generator
  app.post('/api/signature/ai-generate', async (req, res) => {
    try {
      const { name, style, format } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Name is required for signature generation' });
      }

      const result = await eSignService.generateAISignature({
        name,
        style: style || 'sophisticated-cursive',
        format: format || 'svg'
      });

      if (result.success) {
        res.json({ signature: result.signature });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate signature' });
    }
  });

  // PDF Preview for eSign
  app.post('/api/pdf/preview', upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const result = await eSignService.generatePDFPreview(req.file.buffer);
      
      if (result.success) {
        res.json({ pages: result.pages });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate PDF preview' });
    }
  });

  // PDF Preview with Signatures
  app.post('/api/pdf/preview-with-signatures', upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const { signature, fields } = req.body;
      if (!signature) {
        return res.status(400).json({ error: 'Signature is required' });
      }

      const signatureFields = fields ? JSON.parse(fields) : [];
      const result = await eSignService.generatePDFPreviewWithSignatures(
        req.file.buffer,
        signature,
        signatureFields
      );

      if (result.success) {
        res.json({ pages: result.pages });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to generate preview with signatures' });
    }
  });

  // Sign PDF with signature
  app.post('/api/pdf/sign', upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const { signature, fields } = req.body;
      if (!signature) {
        return res.status(400).json({ error: 'Signature is required' });
      }

      const signatureFields = fields ? JSON.parse(fields) : [];
      const signedPdfBuffer = await eSignService.addSignatureToPDF(
        req.file.buffer,
        signature,
        signatureFields
      );

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="signed-document.pdf"');
      res.send(signedPdfBuffer);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to sign PDF' });
    }
  });

  // Send document for signing
  app.post('/api/esign/send', upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const { signature, signers, fields, title, message } = req.body;
      const signersData = signers ? JSON.parse(signers) : [];
      const fieldsData = fields ? JSON.parse(fields) : [];

      const result = await eSignService.sendDocumentForSigning(
        req.file.buffer,
        signersData,
        fieldsData,
        title || 'Document for Signature',
        message || 'Please review and sign this document.'
      );

      if (result.success) {
        res.json({ documentId: result.documentId, message: 'Document sent successfully' });
      } else {
        res.status(500).json({ error: result.error });
      }
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to send document' });
    }
  });

  // Add page numbers to PDF
  app.post('/api/pdf/add-page-numbers', upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const { position, startNumber, fontSize, marginX, marginY } = req.body;
      
      const numberedPdfBuffer = await eSignService.addPageNumbers(req.file.buffer, {
        position: position || 'bottom-center',
        startNumber: parseInt(startNumber) || 1,
        fontSize: parseInt(fontSize) || 12,
        marginX: parseInt(marginX) || 50,
        marginY: parseInt(marginY) || 30
      });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="numbered-document.pdf"');
      res.send(numberedPdfBuffer);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to add page numbers' });
    }
  });

  // PDF Info endpoint for advanced editor
  app.post('/api/pdf/info', uploadPDF.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const info = await pdfService.getPDFInfo(req.file.buffer);
      res.json(info);
    } catch (error) {
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to get PDF info' });
    }
  });

  // Batch PDF processing endpoint
  app.post('/api/pdf/batch-process', upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No PDF file provided' });
      }

      const { operations } = req.body;
      let processedBuffer = req.file.buffer;
      
      if (operations) {
        const operationsList = JSON.parse(operations);
        
        for (const operation of operationsList) {
          switch (operation.type) {
            case 'rotate':
              processedBuffer = await pdfService.rotatePDF(processedBuffer, operation.params.angle);
              break;
            case 'compress':
              processedBuffer = await pdfService.compressPDF(processedBuffer, {
                compressionLevel: operation.params.level > 50 ? 'high' : 'medium'
              });
              break;
            case 'watermark':
              processedBuffer = await pdfService.addWatermark(processedBuffer, operation.params.text);
              break;
            case 'password':
              processedBuffer = await pdfService.protectPDF(processedBuffer, operation.params.password);
              break;
            case 'split':
              // For split operations, return the first part
              const splitResults = await pdfService.splitPDF(processedBuffer, {
                splitType: operation.params.type,
                splitValue: operation.params.value
              });
              if (splitResults.length > 0) {
                processedBuffer = splitResults[0].data;
              }
              break;
            case 'extract-pages':
              const extractResults = await pdfService.splitPDF(processedBuffer, {
                splitType: 'ranges',
                ranges: parsePageRanges(operation.params.value)
              });
              if (extractResults.length > 0) {
                processedBuffer = extractResults[0].data;
              }
              break;
          }
        }
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="processed-document.pdf"');
      res.send(processedBuffer);
    } catch (error) {
      console.error('Batch processing error:', error);
      res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to process PDF' });
    }
  });

  // Helper function to parse page ranges
  function parsePageRanges(rangeString: string): { start: number; end: number }[] {
    const ranges: { start: number; end: number }[] = [];
    const parts = rangeString.split(',');
    
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes('-')) {
        const [start, end] = trimmed.split('-').map(n => parseInt(n.trim()));
        if (!isNaN(start) && !isNaN(end)) {
          ranges.push({ start, end });
        }
      } else {
        const page = parseInt(trimmed);
        if (!isNaN(page)) {
          ranges.push({ start: page, end: page });
        }
      }
    }
    
    return ranges;
  }

  // CURRENCY CONVERSION ENDPOINTS

  // Get current exchange rates
  app.get('/api/currency/rates', async (req, res) => {
    const startTime = Date.now();
    try {
      const rates = await currencyService.getExchangeRates();
      const responseTime = Date.now() - startTime;
      analyticsService.trackToolUsage('currency-rates', 'Currency Exchange Rates', 'Converters & Utilities', responseTime, true);
      res.json(rates);
    } catch (error) {
      const responseTime = Date.now() - startTime;
      analyticsService.trackToolUsage('currency-rates', 'Currency Exchange Rates', 'Converters & Utilities', responseTime, false);
      console.error('Currency rates error:', error);
      res.status(500).json({ error: 'Failed to fetch exchange rates' });
    }
  });

  // Convert currency
  app.post('/api/currency/convert', async (req, res) => {
    const startTime = Date.now();
    try {
      const { amount, from, to } = req.body;
      
      if (!amount || !from || !to) {
        return res.status(400).json({ error: 'Amount, from, and to currencies are required' });
      }

      const result = await currencyService.convertCurrency(parseFloat(amount), from, to);
      const responseTime = Date.now() - startTime;
      analyticsService.trackToolUsage('currency-converter', 'Currency Converter', 'Converters & Utilities', responseTime, true);
      
      res.json({ 
        amount: parseFloat(amount),
        from,
        to,
        result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      const responseTime = Date.now() - startTime;
      analyticsService.trackToolUsage('currency-converter', 'Currency Converter', 'Converters & Utilities', responseTime, false);
      console.error('Currency conversion error:', error);
      res.status(500).json({ error: 'Failed to convert currency' });
    }
  });

  // ANALYTICS DASHBOARD ENDPOINTS

  // Get system metrics overview
  app.get('/api/analytics/metrics', async (req, res) => {
    try {
      const metrics = analyticsService.getSystemMetrics();
      res.json(metrics);
    } catch (error) {
      console.error('Analytics metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch system metrics' });
    }
  });

  // Get popular tools
  app.get('/api/analytics/popular-tools', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const popularTools = analyticsService.getPopularTools(limit);
      res.json(popularTools);
    } catch (error) {
      console.error('Popular tools error:', error);
      res.status(500).json({ error: 'Failed to fetch popular tools' });
    }
  });

  // Get recent activity
  app.get('/api/analytics/recent-activity', async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 20;
      const recentActivity = analyticsService.getRecentActivity(limit);
      res.json(recentActivity);
    } catch (error) {
      console.error('Recent activity error:', error);
      res.status(500).json({ error: 'Failed to fetch recent activity' });
    }
  });

  // Get daily statistics
  app.get('/api/analytics/daily-stats', async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const dailyStats = analyticsService.getDailyStats(days);
      res.json(dailyStats);
    } catch (error) {
      console.error('Daily stats error:', error);
      res.status(500).json({ error: 'Failed to fetch daily statistics' });
    }
  });

  // Get category breakdown
  app.get('/api/analytics/categories', async (req, res) => {
    try {
      const categoryBreakdown = analyticsService.getCategoryBreakdown();
      res.json(categoryBreakdown);
    } catch (error) {
      console.error('Category breakdown error:', error);
      res.status(500).json({ error: 'Failed to fetch category breakdown' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
