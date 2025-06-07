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

  // IMAGE TOOLS ENDPOINTS

  // Image Resizer
  app.post('/api/image/resize', upload.single('image'), async (req, res) => {
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
  app.post('/api/image/convert', upload.single('image'), async (req, res) => {
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
  app.post('/api/image/crop', upload.single('image'), async (req, res) => {
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
  app.post('/api/image/ocr', upload.single('image'), async (req, res) => {
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
  app.post('/api/image/favicon', upload.single('image'), async (req, res) => {
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
  app.post('/api/image/palette', upload.single('image'), async (req, res) => {
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
  app.post('/api/image/watermark', upload.single('image'), async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
