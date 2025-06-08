export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  popular?: boolean;
  subcategory?: string;
}

export interface Subcategory {
  id: string;
  name: string;
  description: string;
  tools: Tool[];
}

export interface ToolCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  tools: Tool[];
  subcategories?: Subcategory[];
}

export const toolCategories: ToolCategory[] = [
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
      { id: "image-compressor", name: "Image Compressor", description: "Reduce image file size while maintaining quality", icon: "fa-compress-arrows-alt" },
      { id: "image-resizer", name: "Image Resizer", description: "Change image dimensions and aspect ratio", icon: "fa-expand-arrows-alt" },
      { id: "image-converter", name: "Image Converter", description: "Convert between JPG, PNG, WEBP, GIF formats", icon: "fa-exchange-alt" },
      { id: "image-cropper", name: "Image Cropper", description: "Cut out specific portions of images", icon: "fa-crop" },
      { id: "background-remover", name: "Background Remover", description: "Automatically remove image backgrounds", icon: "fa-eraser", popular: true },
      { id: "image-to-text", name: "Image to Text (OCR)", description: "Extract text content from images", icon: "fa-font" },
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
      { id: "word-counter", name: "Word Counter", description: "Count words, characters, and paragraphs", icon: "fa-calculator" },
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
    id: "converters",
    title: "Converters & Utilities",
    description: "Convert between different formats and units",
    icon: "fa-exchange-alt",
    color: "orange",
    tools: [
      { id: "currency-converter", name: "Currency Converter", description: "Convert between currencies with live exchange rates", icon: "fa-coins", popular: true },
      { id: "unit-converter", name: "Unit Converter", description: "Convert between different measurement units", icon: "fa-balance-scale" },
      { id: "color-converter", name: "Color Converter", description: "Convert between HEX, RGB, HSL color formats", icon: "fa-palette" },
      { id: "timestamp-converter", name: "Timestamp Converter", description: "Convert Unix timestamps to readable dates", icon: "fa-clock" },
      { id: "base64-encoder", name: "Base64 Encoder/Decoder", description: "Encode and decode Base64 strings", icon: "fa-code" },
      { id: "url-encoder", name: "URL Encoder/Decoder", description: "Encode and decode URLs", icon: "fa-link" },
      { id: "json-formatter", name: "JSON Formatter", description: "Format and validate JSON data", icon: "fa-code" },
      { id: "csv-to-json", name: "CSV to JSON", description: "Convert CSV files to JSON format", icon: "fa-table" },
      { id: "markdown-to-html", name: "Markdown to HTML", description: "Convert Markdown to HTML", icon: "fa-markdown" }
    ]
  },
  {
    id: "generators",
    title: "Generators & Tools",
    description: "Generate passwords, QR codes, and other useful content",
    icon: "fa-cogs",
    color: "teal",
    tools: [
      { id: "qr-generator", name: "QR & Barcode Generator", description: "Generate QR codes and 200+ barcode types", icon: "fa-qrcode", popular: true },
      { id: "barcode-scanner", name: "Barcode Scanner", description: "Scan and decode barcodes and QR codes from images", icon: "fa-camera", popular: true },
      { id: "password-generator", name: "Password Generator", description: "Create secure passwords with custom options", icon: "fa-key", popular: true },
      { id: "uuid-generator", name: "UUID Generator", description: "Generate unique identifiers", icon: "fa-fingerprint" },
      { id: "placeholder-generator", name: "Placeholder Generator", description: "Generate placeholder images and text", icon: "fa-image" },
      { id: "gradient-generator", name: "CSS Gradient Generator", description: "Create CSS gradients visually", icon: "fa-paint-brush" },
      { id: "box-shadow", name: "Box Shadow Generator", description: "Generate CSS box shadows", icon: "fa-square" },
      { id: "meta-tags", name: "Meta Tag Generator", description: "Generate HTML meta tags for SEO", icon: "fa-tags" }
    ]
  },
  {
    id: "developer",
    title: "Developer Tools",
    description: "Essential tools for web developers and programmers",
    icon: "fa-code",
    color: "indigo",
    tools: [
      { id: "regex-tester", name: "Regex Tester", description: "Test and debug regular expressions", icon: "fa-search", popular: true },
      { id: "api-tester", name: "API Tester", description: "Test REST API endpoints", icon: "fa-plug" },
      { id: "jwt-decoder", name: "JWT Decoder", description: "Decode and validate JSON Web Tokens", icon: "fa-key" },
      { id: "html-encoder", name: "HTML Encoder/Decoder", description: "Encode and decode HTML entities", icon: "fa-code" },
      { id: "css-minifier", name: "CSS Minifier", description: "Minify CSS code for production", icon: "fa-compress" },
      { id: "js-minifier", name: "JavaScript Minifier", description: "Minify JavaScript code", icon: "fa-file-code" },
      { id: "lorem-picsum", name: "Lorem Picsum", description: "Generate placeholder images", icon: "fa-image" }
    ]
  }
];

export function getCategoryById(id: string): ToolCategory | undefined {
  return toolCategories.find(category => category.id === id);
}

export function getToolCategory(id: string): ToolCategory | undefined {
  return toolCategories.find(category => category.id === id);
}

export function getToolById(id: string): { tool: Tool; category: ToolCategory } | undefined {
  for (const category of toolCategories) {
    const tool = category.tools.find(t => t.id === id);
    if (tool) {
      return { tool, category };
    }
    
    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        const subTool = subcategory.tools.find(t => t.id === id);
        if (subTool) {
          return { tool: subTool, category };
        }
      }
    }
  }
  return undefined;
}

export function getPopularTools(): { tool: Tool; category: ToolCategory }[] {
  const popularTools: { tool: Tool; category: ToolCategory }[] = [];
  
  for (const category of toolCategories) {
    const categoryPopularTools = category.tools.filter(tool => tool.popular);
    popularTools.push(...categoryPopularTools.map(tool => ({ tool, category })));
    
    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        const subcategoryPopularTools = subcategory.tools.filter(tool => tool.popular);
        popularTools.push(...subcategoryPopularTools.map(tool => ({ tool, category })));
      }
    }
  }
  
  // Prioritize QR generator in quick access by moving it to the front
  const qrGeneratorIndex = popularTools.findIndex(item => item.tool.id === 'qr-generator');
  if (qrGeneratorIndex > -1) {
    const qrGenerator = popularTools.splice(qrGeneratorIndex, 1)[0];
    popularTools.unshift(qrGenerator);
  }
  
  return popularTools;
}

export function searchTools(query: string): { tool: Tool; category: ToolCategory }[] {
  const results: { tool: Tool; category: ToolCategory }[] = [];
  const searchTerm = query.toLowerCase();
  
  for (const category of toolCategories) {
    for (const tool of category.tools) {
      if (
        tool.name.toLowerCase().includes(searchTerm) ||
        tool.description.toLowerCase().includes(searchTerm)
      ) {
        results.push({ tool, category });
      }
    }
    
    if (category.subcategories) {
      for (const subcategory of category.subcategories) {
        for (const tool of subcategory.tools) {
          if (
            tool.name.toLowerCase().includes(searchTerm) ||
            tool.description.toLowerCase().includes(searchTerm)
          ) {
            results.push({ tool, category });
          }
        }
      }
    }
  }
  
  return results;
}