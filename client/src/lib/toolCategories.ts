export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  premium?: boolean;
}

export interface ToolCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  tools: Tool[];
}

export const toolCategories: ToolCategory[] = [
  {
    id: 'barcodes',
    title: 'Barcode & QR Tools',
    description: 'Generate and scan various barcode formats',
    icon: 'fa-qrcode',
    color: 'blue',
    tools: [
      {
        id: 'qr-generator',
        name: 'QR Code Generator',
        description: 'Create QR codes for text, URLs, and more',
        icon: 'fa-qrcode'
      },
      {
        id: 'barcode-generator',
        name: 'Barcode Generator',
        description: 'Generate various barcode formats',
        icon: 'fa-barcode'
      },
      {
        id: 'barcode-scanner',
        name: 'Barcode Scanner',
        description: 'Scan and decode barcodes from images',
        icon: 'fa-camera'
      },
      {
        id: 'code128-generator',
        name: 'Code 128 Generator',
        description: 'Generate Code 128 barcodes',
        icon: 'fa-barcode'
      },
      {
        id: 'ean13-generator',
        name: 'EAN-13 Generator',
        description: 'Generate EAN-13 product barcodes',
        icon: 'fa-barcode'
      },
      {
        id: 'datamatrix-generator',
        name: 'Data Matrix Generator',
        description: 'Generate Data Matrix 2D codes',
        icon: 'fa-qrcode'
      },
      {
        id: 'bulk-barcode-generator',
        name: 'Bulk Barcode Generator',
        description: 'Generate multiple barcodes from CSV files',
        icon: 'fa-list'
      },
      {
        id: 'rfid-reader',
        name: 'RFID/NFC Reader',
        description: 'Read and write NFC tags and RFID data',
        icon: 'fa-wifi'
      }
    ]
  },
  {
    id: 'pdf-tools',
    title: 'PDF Tools',
    description: 'Comprehensive PDF manipulation utilities',
    icon: 'fa-file-pdf',
    color: 'red',
    tools: [
      {
        id: 'pdf-merge',
        name: 'PDF Merge',
        description: 'Combine multiple PDF files into one',
        icon: 'fa-layer-group'
      },
      {
        id: 'pdf-split',
        name: 'PDF Split',
        description: 'Split PDF into separate pages or ranges',
        icon: 'fa-scissors'
      },
      {
        id: 'pdf-compress',
        name: 'PDF Compress',
        description: 'Reduce PDF file size',
        icon: 'fa-compress'
      },
      {
        id: 'pdf-to-text',
        name: 'PDF to Text',
        description: 'Extract text content from PDF files',
        icon: 'fa-file-alt'
      },
      {
        id: 'images-to-pdf',
        name: 'Images to PDF',
        description: 'Convert images to PDF format',
        icon: 'fa-images'
      },
      {
        id: 'pdf-to-images',
        name: 'PDF to Images',
        description: 'Convert PDF pages to image files',
        icon: 'fa-file-image'
      },
      {
        id: 'pdf-watermark',
        name: 'PDF Watermark',
        description: 'Add watermarks to PDF files',
        icon: 'fa-tint'
      },
      {
        id: 'pdf-rotate',
        name: 'PDF Rotate',
        description: 'Rotate PDF pages',
        icon: 'fa-redo'
      },
      {
        id: 'pdf-protect',
        name: 'PDF Protect',
        description: 'Password protect PDF files',
        icon: 'fa-lock'
      },
      {
        id: 'pdf-unlock',
        name: 'PDF Unlock',
        description: 'Remove password protection from PDF files',
        icon: 'fa-unlock'
      },
      {
        id: 'pdf-page-numbers',
        name: 'Add Page Numbers',
        description: 'Automatically number the pages of a PDF',
        icon: 'fa-list-ol'
      },
      {
        id: 'pdf-esign',
        name: 'eSign PDF',
        description: 'Draw or type signature and place it on PDF',
        icon: 'fa-signature'
      },


    ]
  },
  {
    id: 'image-tools',
    title: 'Image Tools',
    description: 'Image processing and manipulation utilities',
    icon: 'fa-image',
    color: 'green',
    tools: [
      {
        id: 'image-resize',
        name: 'Image Resize',
        description: 'Resize images to specific dimensions',
        icon: 'fa-expand-arrows-alt'
      },
      {
        id: 'image-format-converter',
        name: 'Format Converter',
        description: 'Convert between image formats',
        icon: 'fa-exchange-alt'
      },
      {
        id: 'image-crop',
        name: 'Image Crop',
        description: 'Crop images to specific areas',
        icon: 'fa-crop'
      },
      {
        id: 'background-remover',
        name: 'Background Remover',
        description: 'Remove backgrounds from images',
        icon: 'fa-magic'
      },
      {
        id: 'favicon-generator',
        name: 'Favicon Generator',
        description: 'Generate favicons from images',
        icon: 'fa-star'
      },
      {
        id: 'image-compressor',
        name: 'Image Compressor',
        description: 'Compress images to reduce file size',
        icon: 'fa-compress'
      },
      {
        id: 'color-palette-generator',
        name: 'Color Palette Generator',
        description: 'Extract color palettes from images',
        icon: 'fa-palette'
      },
      {
        id: 'image-watermark',
        name: 'Image Watermark',
        description: 'Add watermarks to images',
        icon: 'fa-tint'
      },
      {
        id: 'image-to-text',
        name: 'Image to Text',
        description: 'Extract text from images (OCR)',
        icon: 'fa-file-text'
      }
    ]
  },
  {
    id: 'text-tools',
    title: 'Text Tools',
    description: 'Text processing and manipulation utilities',
    icon: 'fa-font',
    color: 'purple',
    tools: [
      {
        id: 'word-counter',
        name: 'Word Counter',
        description: 'Count words, characters, and paragraphs',
        icon: 'fa-calculator'
      },
      {
        id: 'case-converter',
        name: 'Case Converter',
        description: 'Convert text case (uppercase, lowercase, etc.)',
        icon: 'fa-text-height'
      },
      {
        id: 'text-to-slug',
        name: 'Text to Slug',
        description: 'Convert text to URL-friendly slugs',
        icon: 'fa-link'
      },
      {
        id: 'dummy-text',
        name: 'Lorem Ipsum Generator',
        description: 'Generate placeholder text',
        icon: 'fa-paragraph'
      },
      {
        id: 'password-generator',
        name: 'Password Generator',
        description: 'Generate secure passwords',
        icon: 'fa-key'
      },
      {
        id: 'hash-generator',
        name: 'Hash Generator',
        description: 'Generate MD5, SHA1, SHA256 hashes',
        icon: 'fa-hashtag'
      },
      {
        id: 'text-diff',
        name: 'Text Diff',
        description: 'Compare and find differences between texts',
        icon: 'fa-code-branch'
      },
      {
        id: 'text-reverser',
        name: 'Text Reverser',
        description: 'Reverse text characters or words',
        icon: 'fa-exchange-alt'
      },


    ]
  },
  {
    id: 'converters',
    title: 'Converters & Utilities',
    description: 'Various conversion and utility tools',
    icon: 'fa-exchange-alt',
    color: 'amber',
    tools: [
      {
        id: 'color-converter',
        name: 'Color Converter',
        description: 'Convert between color formats (HEX, RGB, HSL)',
        icon: 'fa-palette'
      },
      {
        id: 'currency-converter',
        name: 'Currency Converter',
        description: 'Convert between different currencies with live rates',
        icon: 'fa-dollar-sign'
      },
      {
        id: 'timestamp-converter',
        name: 'Timestamp Converter',
        description: 'Convert between timestamp formats',
        icon: 'fa-clock'
      },
      {
        id: 'base64-encoder',
        name: 'Base64 Encoder/Decoder',
        description: 'Encode and decode Base64 strings',
        icon: 'fa-code'
      },
      {
        id: 'url-encoder',
        name: 'URL Encoder/Decoder',
        description: 'Encode and decode URLs',
        icon: 'fa-globe'
      },
      {
        id: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Format and validate JSON data',
        icon: 'fa-brackets-curly'
      },
      {
        id: 'csv-to-json',
        name: 'CSV to JSON',
        description: 'Convert CSV data to JSON format',
        icon: 'fa-table'
      },
      {
        id: 'markdown-to-html',
        name: 'Markdown to HTML',
        description: 'Convert Markdown to HTML',
        icon: 'fa-markdown'
      },
      {
        id: 'unit-converter',
        name: 'Unit Converter',
        description: 'Convert between various units of measurement',
        icon: 'fa-calculator'
      },
      {
        id: 'timezone-converter',
        name: 'Time Zone Converter',
        description: 'See what time it is in different parts of the world',
        icon: 'fa-globe'
      },
      {
        id: 'video-to-gif',
        name: 'Video to GIF Converter',
        description: 'Create animated GIF from video file',
        icon: 'fa-film'
      },
      {
        id: 'audio-converter',
        name: 'Audio Converter',
        description: 'Convert between MP3, WAV, OGG formats',
        icon: 'fa-music'
      }
    ]
  },
  {
    id: 'generators',
    title: 'Generators',
    description: 'Generate various codes and elements',
    icon: 'fa-magic',
    color: 'indigo',
    tools: [
      {
        id: 'uuid-generator',
        name: 'UUID Generator',
        description: 'Generate unique identifiers',
        icon: 'fa-fingerprint'
      },
      {
        id: 'placeholder-generator',
        name: 'Placeholder Image',
        description: 'Generate placeholder images',
        icon: 'fa-image'
      },
      {
        id: 'css-gradient',
        name: 'CSS Gradient Generator',
        description: 'Create CSS gradients',
        icon: 'fa-paint-brush'
      },
      {
        id: 'box-shadow',
        name: 'Box Shadow Generator',
        description: 'Generate CSS box shadows',
        icon: 'fa-square'
      },
      {
        id: 'meta-tag-generator',
        name: 'Meta Tag Generator',
        description: 'Generate HTML meta tags',
        icon: 'fa-tags'
      },
      {
        id: 'invoice-generator',
        name: 'Invoice Generator',
        description: 'Generate professional invoices',
        icon: 'fa-receipt'
      },
      {
        id: 'signature-generator',
        name: 'Signature Generator',
        description: 'Create digital signatures',
        icon: 'fa-signature'
      },
      {
        id: 'gradient-generator',
        name: 'CSS Gradient Generator',
        description: 'Create CSS gradients with live preview',
        icon: 'fa-paint-brush'
      }
    ]
  },
  {
    id: 'developer-tools',
    title: 'Developer Tools',
    description: 'Tools for developers and programmers',
    icon: 'fa-code',
    color: 'slate',
    tools: [
      {
        id: 'regex-tester',
        name: 'Regex Tester',
        description: 'Test and validate regular expressions',
        icon: 'fa-search'
      },
      {
        id: 'api-tester',
        name: 'API Tester',
        description: 'Test REST API endpoints',
        icon: 'fa-plug'
      },
      {
        id: 'jwt-decoder',
        name: 'JWT Decoder',
        description: 'Decode and validate JWT tokens',
        icon: 'fa-key'
      },
      {
        id: 'html-encoder',
        name: 'HTML Encoder/Decoder',
        description: 'Encode and decode HTML entities',
        icon: 'fa-code'
      },
      {
        id: 'css-minifier',
        name: 'CSS Minifier',
        description: 'Minify CSS code',
        icon: 'fa-compress'
      },
      {
        id: 'js-minifier',
        name: 'JavaScript Minifier',
        description: 'Minify JavaScript code',
        icon: 'fa-file-code'
      },
      {
        id: 'lorem-picsum',
        name: 'Lorem Picsum',
        description: 'Generate random images from Lorem Picsum',
        icon: 'fa-random'
      },
      {
        id: 'dns-lookup',
        name: 'DNS Lookup / Whois',
        description: 'Find information about a domain name',
        icon: 'fa-search'
      },
      {
        id: 'website-screenshot',
        name: 'Website Screenshot',
        description: 'Get full-page screenshot of any website',
        icon: 'fa-camera'
      },
      {
        id: 'api-access',
        name: 'API Access',
        description: 'Developer API keys and documentation',
        icon: 'fa-key'
      },
      {
        id: 'mobile-app-plan',
        name: 'Mobile App Plans',
        description: 'ToolHub mobile application roadmap and features',
        icon: 'fa-mobile-alt'
      }
    ]
  }
];

export function getToolById(toolId: string): { tool: Tool; category: ToolCategory } | null {
  for (const category of toolCategories) {
    const tool = category.tools.find(t => t.id === toolId);
    if (tool) {
      return { tool, category };
    }
  }
  return null;
}

export function getCategoryById(categoryId: string): ToolCategory | null {
  return toolCategories.find(c => c.id === categoryId) || null;
}

export function getPopularTools() {
  // Return a selection of popular tools from different categories
  const popularToolIds = ['qr-generator', 'currency-converter', 'background-remover', 'pdf-merge'];
  
  const popularTools = [];
  for (const toolId of popularToolIds) {
    const result = getToolById(toolId);
    if (result) {
      popularTools.push(result);
    }
  }
  
  return popularTools;
}