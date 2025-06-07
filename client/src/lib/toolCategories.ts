export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  popular?: boolean;
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
    id: "barcode",
    title: "Barcode & QR Tools",
    description: "Generate various types of barcodes, QR codes, and postal codes",
    icon: "fa-qrcode",
    color: "blue",
    tools: [
      { id: "qr-generator", name: "QR Code Generator", description: "Create custom QR codes for various content types", icon: "fa-qrcode", popular: true },
      { id: "code-128", name: "Code-128 Generator", description: "Generate Code-128 linear barcodes", icon: "fa-barcode" },
      { id: "ean-13", name: "EAN-13 Generator", description: "Create EAN-13 product barcodes", icon: "fa-barcode" },
      { id: "upc-a", name: "UPC-A Generator", description: "Generate UPC-A universal product codes", icon: "fa-barcode" },
      { id: "data-matrix", name: "Data Matrix Generator", description: "Create 2D Data Matrix codes", icon: "fa-th" },
      { id: "pdf417", name: "PDF417 Generator", description: "Generate PDF417 2D barcodes", icon: "fa-qrcode" },
      { id: "aztec", name: "Aztec Code Generator", description: "Create Aztec 2D matrix codes", icon: "fa-qrcode" },
      { id: "code-39", name: "Code-39 Generator", description: "Generate Code-39 alpha-numeric barcodes", icon: "fa-barcode" },
      { id: "postal", name: "Postal Barcode Generator", description: "Create postal service barcodes", icon: "fa-barcode" }
    ]
  },
  {
    id: "pdf",
    title: "PDF Tools",
    description: "Convert, merge, split, compress and manipulate PDF documents",
    icon: "fa-file-pdf",
    color: "red",
    tools: [
      { id: "pdf-merger", name: "PDF Merger", description: "Combine multiple PDF files into one", icon: "fa-compress", popular: true },
      { id: "pdf-splitter", name: "PDF Splitter", description: "Extract pages from PDF documents", icon: "fa-cut" },
      { id: "pdf-to-word", name: "PDF to Word", description: "Convert PDF files to editable Word documents", icon: "fa-file-word" },
      { id: "word-to-pdf", name: "Word to PDF", description: "Convert Word documents to PDF format", icon: "fa-file-pdf" },
      { id: "pdf-compressor", name: "PDF Compressor", description: "Reduce PDF file size without quality loss", icon: "fa-compress-arrows-alt" },
      { id: "pdf-to-images", name: "PDF to Images", description: "Convert PDF pages to JPG/PNG images", icon: "fa-images" },
      { id: "pdf-protector", name: "Protect PDF", description: "Add password protection to PDFs", icon: "fa-lock" },
      { id: "pdf-unlock", name: "Unlock PDF", description: "Remove password from PDF files", icon: "fa-unlock" },
      { id: "pdf-watermark", name: "Add Watermark", description: "Add text or image watermarks to PDFs", icon: "fa-tint" },
      { id: "pdf-rotate", name: "Rotate PDF", description: "Change orientation of PDF pages", icon: "fa-redo" }
    ]
  },
  {
    id: "image",
    title: "Image Tools",
    description: "Resize, compress, convert and edit images in various formats",
    icon: "fa-image",
    color: "purple",
    tools: [
      { id: "image-compressor", name: "Image Compressor", description: "Reduce image file size while maintaining quality", icon: "fa-compress-arrows-alt", popular: true },
      { id: "image-resizer", name: "Image Resizer", description: "Change image dimensions and aspect ratio", icon: "fa-expand-arrows-alt" },
      { id: "image-converter", name: "Image Converter", description: "Convert between JPG, PNG, WEBP, GIF formats", icon: "fa-exchange-alt" },
      { id: "image-cropper", name: "Image Cropper", description: "Cut out specific portions of images", icon: "fa-crop" },
      { id: "background-remover", name: "Background Remover", description: "Automatically remove image backgrounds", icon: "fa-eraser" },
      { id: "image-ocr", name: "Image to Text (OCR)", description: "Extract text content from images", icon: "fa-font" },
      { id: "favicon-generator", name: "Favicon Generator", description: "Create favicon.ico files from images", icon: "fa-star" },
      { id: "color-palette", name: "Color Palette Extractor", description: "Extract color schemes from images", icon: "fa-palette" },
      { id: "image-watermark", name: "Add Watermark", description: "Add text or logo watermarks to images", icon: "fa-tint" }
    ]
  },
  {
    id: "text",
    title: "Text & Content Tools",
    description: "Format, analyze and manipulate text content and code",
    icon: "fa-font",
    color: "green",
    tools: [
      { id: "word-counter", name: "Word Counter", description: "Count words, characters, and paragraphs", icon: "fa-calculator", popular: true },
      { id: "case-converter", name: "Case Converter", description: "Convert text between different cases", icon: "fa-text-height" },
      { id: "lorem-generator", name: "Lorem Ipsum Generator", description: "Generate placeholder text for designs", icon: "fa-paragraph" },
      { id: "text-reverser", name: "Text Reverser", description: "Flip text backward character by character", icon: "fa-exchange-alt" },
      { id: "hash-generator", name: "Hash Generator", description: "Create MD5, SHA1, SHA256 hashes", icon: "fa-hashtag" },
      { id: "code-formatter", name: "Code Formatter", description: "Format and beautify HTML, CSS, JS code", icon: "fa-code" },
      { id: "text-to-slug", name: "Text to Slug", description: "Convert titles to URL-friendly slugs", icon: "fa-link" },
      { id: "dummy-text", name: "Dummy Text Generator", description: "Create realistic-looking text blocks", icon: "fa-file-alt" }
    ]
  },
  {
    id: "converter",
    title: "Converter Tools",
    description: "Convert units, currencies, colors and file formats",
    icon: "fa-exchange-alt",
    color: "indigo",
    tools: [
      { id: "unit-converter", name: "Unit Converter", description: "Convert length, weight, temperature units", icon: "fa-ruler", popular: true },
      { id: "currency-converter", name: "Currency Converter", description: "Convert between world currencies", icon: "fa-dollar-sign" },
      { id: "timezone-converter", name: "Time Zone Converter", description: "Convert time between different zones", icon: "fa-clock" },
      { id: "color-converter", name: "Color Converter", description: "Convert HEX, RGB, HSL color codes", icon: "fa-palette" },
      { id: "base64-converter", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64 data", icon: "fa-code" },
      { id: "url-encoder", name: "URL Encoder/Decoder", description: "Encode special characters in URLs", icon: "fa-link" },
      { id: "audio-converter", name: "Audio Converter", description: "Convert between MP3, WAV, OGG formats", icon: "fa-music" },
      { id: "video-to-gif", name: "Video to GIF", description: "Create animated GIFs from videos", icon: "fa-video" }
    ]
  },
  {
    id: "generator",
    title: "Generator Tools",
    description: "Create passwords, signatures, invoices and CSS gradients",
    icon: "fa-magic",
    color: "yellow",
    tools: [
      { id: "password-generator", name: "Password Generator", description: "Create strong, secure random passwords", icon: "fa-key", popular: true },
      { id: "uuid-generator", name: "UUID Generator", description: "Generate universally unique identifiers", icon: "fa-fingerprint" },
      { id: "invoice-generator", name: "Invoice Generator", description: "Create professional invoices as PDFs", icon: "fa-file-invoice" },
      { id: "signature-generator", name: "Signature Generator", description: "Create digital signature images", icon: "fa-signature" },
      { id: "css-gradient", name: "CSS Gradient Generator", description: "Visual tool for creating CSS gradients", icon: "fa-paint-brush" },
      { id: "lorem-ipsum", name: "Lorem Ipsum Generator", description: "Generate placeholder text content", icon: "fa-paragraph" },
      { id: "color-palette-gen", name: "Color Palette Generator", description: "Create harmonious color schemes", icon: "fa-palette" }
    ]
  },
  {
    id: "developer",
    title: "Developer Tools",
    description: "Web development utilities, validators and formatters",
    icon: "fa-code",
    color: "gray",
    tools: [
      { id: "whats-my-ip", name: "What's My IP?", description: "Display your public IP address and info", icon: "fa-globe" },
      { id: "json-validator", name: "JSON Validator", description: "Validate and format JSON data", icon: "fa-code" },
      { id: "dns-lookup", name: "DNS Lookup", description: "Find domain name information", icon: "fa-search" },
      { id: "website-screenshot", name: "Website Screenshot", description: "Capture full-page website screenshots", icon: "fa-camera" },
      { id: "css-minifier", name: "CSS/JS Minifier", description: "Compress CSS and JavaScript files", icon: "fa-compress" },
      { id: "regex-tester", name: "RegEx Tester", description: "Test regular expressions with examples", icon: "fa-search" },
      { id: "sql-formatter", name: "SQL Formatter", description: "Format and beautify SQL queries", icon: "fa-database" },
      { id: "whois-lookup", name: "Whois Lookup", description: "Get domain registration information", icon: "fa-info-circle" }
    ]
  },
  {
    id: "rfid",
    title: "RFID & Labels",
    description: "RFID tag generators and professional label design tools",
    icon: "fa-tags",
    color: "teal",
    tools: [
      { id: "rfid-writer", name: "RFID Tag Writer", description: "Encode and write RFID tags", icon: "fa-wifi" },
      { id: "nfc-generator", name: "NFC Tag Generator", description: "Create NFC tags for smartphones", icon: "fa-mobile-alt" },
      { id: "label-designer", name: "Label Designer", description: "Design professional barcode labels", icon: "fa-tags" },
      { id: "inventory-barcode", name: "Inventory Barcode", description: "Generate inventory tracking codes", icon: "fa-warehouse" },
      { id: "asset-tag", name: "Asset Tag Generator", description: "Create asset management tags", icon: "fa-tag" },
      { id: "shipping-label", name: "Shipping Label Maker", description: "Design shipping and mailing labels", icon: "fa-shipping-fast" }
    ]
  }
];

export function getToolCategory(categoryId: string): ToolCategory | undefined {
  return toolCategories.find(cat => cat.id === categoryId);
}

export function getToolById(toolId: string): { tool: Tool; category: ToolCategory } | undefined {
  for (const category of toolCategories) {
    const tool = category.tools.find(t => t.id === toolId);
    if (tool) {
      return { tool, category };
    }
  }
  return undefined;
}

export function getPopularTools(): Array<{ tool: Tool; category: ToolCategory }> {
  const popularTools: Array<{ tool: Tool; category: ToolCategory }> = [];
  
  for (const category of toolCategories) {
    for (const tool of category.tools) {
      if (tool.popular) {
        popularTools.push({ tool, category });
      }
    }
  }
  
  return popularTools;
}
