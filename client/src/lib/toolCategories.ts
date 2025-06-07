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
    id: "barcode",
    title: "Barcode & QR Tools",
    description: "Generate various types of barcodes, QR codes, and postal codes",
    icon: "fa-qrcode",
    color: "blue",
    tools: [
      { id: "qr-generator", name: "QR Code Generator", description: "Create custom QR codes for various content types", icon: "fa-qrcode", popular: true, subcategory: "2d-codes" },
      { id: "code-128", name: "Code-128 Generator", description: "Generate Code-128 linear barcodes", icon: "fa-barcode", subcategory: "linear-codes" },
      { id: "ean-13", name: "EAN-13 Generator", description: "Create EAN-13 product barcodes", icon: "fa-barcode", subcategory: "ean-upc" },
      { id: "upc-a", name: "UPC-A Generator", description: "Generate UPC-A universal product codes", icon: "fa-barcode", subcategory: "ean-upc" },
      { id: "data-matrix", name: "Data Matrix Generator", description: "Create 2D Data Matrix codes", icon: "fa-th", subcategory: "2d-codes" },
      { id: "pdf417", name: "PDF417 Generator", description: "Generate PDF417 2D barcodes", icon: "fa-qrcode", subcategory: "2d-codes" },
      { id: "aztec", name: "Aztec Code Generator", description: "Create Aztec 2D matrix codes", icon: "fa-qrcode", subcategory: "2d-codes" },
      { id: "code-39", name: "Code-39 Generator", description: "Generate Code-39 alpha-numeric barcodes", icon: "fa-barcode", subcategory: "linear-codes" },
      { id: "postal", name: "Postal Barcode Generator", description: "Create postal service barcodes", icon: "fa-barcode", subcategory: "postal-codes" }
    ],
    subcategories: [
      {
        id: "linear-codes",
        name: "Linear Codes",
        description: "One-dimensional barcodes for product identification",
        tools: [
          { id: "code-128", name: "Code-128", description: "High-density linear barcode symbology", icon: "fa-barcode" },
          { id: "code-11", name: "Code-11", description: "Discrete barcode symbology used in telecommunications", icon: "fa-barcode" },
          { id: "code-2of5", name: "Code-2of5 Interleaved", description: "Numeric-only barcode format", icon: "fa-barcode" },
          { id: "code-39", name: "Code-39", description: "Variable length alphanumeric barcode", icon: "fa-barcode" },
          { id: "code-39-ascii", name: "Code-39 Full ASCII", description: "Extended Code-39 with full ASCII support", icon: "fa-barcode" },
          { id: "code-93", name: "Code-93", description: "Compact alphanumeric barcode", icon: "fa-barcode" },
          { id: "flattermarken", name: "Flattermarken", description: "German pharmaceutical barcode", icon: "fa-barcode" },
          { id: "gs1-128", name: "GS1-128 (UCC/EAN-128)", description: "Application identifier barcode", icon: "fa-barcode" },
          { id: "msi", name: "MSI", description: "Modified Plessey barcode", icon: "fa-barcode" },
          { id: "pharmacode-one", name: "Pharmacode One-Track", description: "Pharmaceutical barcode standard", icon: "fa-barcode" },
          { id: "pharmacode-two", name: "Pharmacode Two-Track", description: "Two-track pharmaceutical barcode", icon: "fa-barcode" },
          { id: "telepen-alpha", name: "Telepen Alpha", description: "Full ASCII character set barcode", icon: "fa-barcode" }
        ]
      },
      {
        id: "postal-codes",
        name: "Postal Codes",
        description: "Barcodes for postal and shipping services",
        tools: [
          { id: "australia-post", name: "Australian Post Standard Customer", description: "Australia Post customer barcode", icon: "fa-barcode" },
          { id: "daft", name: "DAFT", description: "Four-state postal barcode", icon: "fa-barcode" },
          { id: "dpd-barcode", name: "DPD Barcode (DPD Parcel Label)", description: "DPD shipping label barcode", icon: "fa-barcode" },
          { id: "japanese-postal", name: "Japanese Postal (Customer) Code", description: "Japan Post customer barcode", icon: "fa-barcode" },
          { id: "kix", name: "KIX (TNT Post Netherlands)", description: "Netherlands postal barcode", icon: "fa-barcode" },
          { id: "korean-postal", name: "Korean Postal Authority Code", description: "Korea Post barcode system", icon: "fa-barcode" },
          { id: "planet-12", name: "Planet Code 12", description: "USPS Planet barcode 12-digit", icon: "fa-barcode" },
          { id: "royal-mail-4state", name: "Royal Mail 4-State", description: "UK Royal Mail barcode", icon: "fa-barcode" },
          { id: "royal-mail-mailmark-4state", name: "Royal Mail Mailmark 4-State", description: "Updated Royal Mail barcode", icon: "fa-barcode" },
          { id: "royal-mail-mailmark-2d", name: "Royal Mail Mailmark 2D", description: "2D Royal Mail barcode", icon: "fa-qrcode" },
          { id: "usps-postnet-5", name: "USPS PostNet 5", description: "5-digit ZIP code barcode", icon: "fa-barcode" },
          { id: "usps-postnet-9", name: "USPS PostNet 9", description: "9-digit ZIP+4 barcode", icon: "fa-barcode" },
          { id: "usps-postnet-11", name: "USPS PostNet 11", description: "11-digit delivery point barcode", icon: "fa-barcode" },
          { id: "usps-im-package", name: "USPS IM Package", description: "USPS Intelligent Mail barcode", icon: "fa-barcode" },
          { id: "upu-s10", name: "UPU S10", description: "Universal Postal Union standard", icon: "fa-barcode" }
        ]
      },
      {
        id: "gs1-databar",
        name: "GS1 DataBar",
        description: "Compact barcodes for retail applications",
        tools: [
          { id: "gs1-databar-stacked", name: "GS1-DataBar Stacked", description: "Stacked version of GS1 DataBar", icon: "fa-barcode" },
          { id: "gs1-databar-stacked-omni", name: "GS1-DataBar Stacked Omni", description: "Omnidirectional stacked DataBar", icon: "fa-barcode" },
          { id: "gs1-databar-limited", name: "GS1-DataBar Limited", description: "Compact DataBar for small items", icon: "fa-barcode" },
          { id: "gs1-databar-expanded", name: "GS1-DataBar Expanded", description: "Variable length DataBar", icon: "fa-barcode" },
          { id: "gs1-databar-expanded-stacked", name: "GS1-DataBar Expanded Stacked", description: "Stacked expanded DataBar", icon: "fa-barcode" },
          { id: "gs1-128-composite", name: "GS1-128 Composite Symbology", description: "Composite barcode with GS1-128", icon: "fa-barcode" },
          { id: "gs1-databar-composite", name: "GS1-DataBar Composite", description: "DataBar with composite component", icon: "fa-barcode" }
        ]
      },
      {
        id: "ean-upc",
        name: "EAN / UPC",
        description: "Retail product identification barcodes",
        tools: [
          { id: "ean-8", name: "EAN-8", description: "8-digit European Article Number", icon: "fa-barcode" },
          { id: "ean-13", name: "EAN-13", description: "13-digit European Article Number", icon: "fa-barcode" },
          { id: "ean-14", name: "EAN-14", description: "14-digit shipping container code", icon: "fa-barcode" },
          { id: "ean-8-composite", name: "EAN-8 Composite Symbology", description: "EAN-8 with composite component", icon: "fa-barcode" },
          { id: "ean-13-composite", name: "EAN-13 Composite Symbology", description: "EAN-13 with composite component", icon: "fa-barcode" },
          { id: "upc-a", name: "UPC-A", description: "Universal Product Code format A", icon: "fa-barcode" },
          { id: "upc-e", name: "UPC-E", description: "Universal Product Code format E", icon: "fa-barcode" },
          { id: "upc-a-composite", name: "UPC-A Composite Symbology", description: "UPC-A with composite component", icon: "fa-barcode" },
          { id: "upc-e-composite", name: "UPC-E Composite Symbology", description: "UPC-E with composite component", icon: "fa-barcode" }
        ]
      },
      {
        id: "2d-codes",
        name: "2D Codes",
        description: "Two-dimensional matrix and stacked barcodes",
        tools: [
          { id: "qr-code", name: "QR Code", description: "Quick Response matrix barcode", icon: "fa-qrcode", popular: true },
          { id: "qr-code-mobile", name: "QR Code (Mobile/Smartphone)", description: "Mobile-optimized QR codes", icon: "fa-mobile-alt" },
          { id: "data-matrix", name: "Data Matrix", description: "2D matrix barcode for small items", icon: "fa-th" },
          { id: "aztec", name: "Aztec", description: "2D matrix symbology", icon: "fa-qrcode" },
          { id: "codablock-f", name: "Codablock-F", description: "Stacked linear barcode", icon: "fa-barcode" },
          { id: "maxicode", name: "MaxiCode", description: "Fixed-size 2D barcode", icon: "fa-qrcode" },
          { id: "micropdf417", name: "MicroPDF417", description: "Compact version of PDF417", icon: "fa-qrcode" },
          { id: "pdf417", name: "PDF417", description: "Portable Data File 417", icon: "fa-qrcode" },
          { id: "micro-qr", name: "Micro QR Code", description: "Compact QR code variant", icon: "fa-qrcode" },
          { id: "han-xin", name: "Han Xin", description: "Chinese 2D barcode standard", icon: "fa-qrcode" },
          { id: "dotcode", name: "DotCode", description: "2D dot matrix barcode", icon: "fa-braille" },
          { id: "royal-mail-mailmark-2d", name: "Royal Mail Mailmark 2D", description: "2D Royal Mail barcode", icon: "fa-qrcode" },
          { id: "ntin-code", name: "NTIN Code", description: "National Trade Item Number", icon: "fa-qrcode" },
          { id: "ppn-code", name: "PPN Code", description: "Pharmacy Product Number", icon: "fa-qrcode" }
        ]
      },
      {
        id: "gs1-2d",
        name: "GS1 2D Barcodes",
        description: "GS1 compliant 2D barcodes",
        tools: [
          { id: "gs1-qr", name: "GS1 QR Code", description: "GS1 compliant QR code", icon: "fa-qrcode" },
          { id: "gs1-datamatrix", name: "GS1 DataMatrix", description: "GS1 compliant Data Matrix", icon: "fa-th" },
          { id: "gs1-digital-link-qr", name: "GS1 Digital Link QR code", description: "Digital Link QR implementation", icon: "fa-qrcode" },
          { id: "gs1-digital-link-dm", name: "GS1 Digital Link Data Matrix", description: "Digital Link Data Matrix", icon: "fa-th" }
        ]
      },
      {
        id: "banking-payments",
        name: "Banking and Payments",
        description: "Financial and payment barcodes",
        tools: [
          { id: "generate-free-barcodes", name: "Generate Free Barcodes Online", description: "Free online barcode generator", icon: "fa-barcode" },
          { id: "linear-2d-gs1-postal", name: "Linear Barcodes, 2D Codes, GS1 DataBar, Postal Barcodes and many more!", description: "Comprehensive barcode generation", icon: "fa-barcode" },
          { id: "epc-qr-v2", name: "EPC QR Code V2", description: "European Payments Council QR", icon: "fa-qrcode" },
          { id: "swiss-qr-v1", name: "Swiss QR Code v.1.0", description: "Swiss payment QR code v1", icon: "fa-qrcode" },
          { id: "swiss-qr-v2-no-ref", name: "Swiss QR Code v.2.2 (No Reference)", description: "Swiss QR without reference", icon: "fa-qrcode" },
          { id: "swiss-qr-v2-creditor", name: "Swiss QR Code v.2.2 (Creditor Reference)", description: "Swiss QR with creditor reference", icon: "fa-qrcode" },
          { id: "swiss-qr-v2-qr-ref", name: "Swiss QR Code v.2.2 (QR Reference)", description: "Swiss QR with QR reference", icon: "fa-qrcode" },
          { id: "zatca-qr", name: "ZATCA QR Code", description: "Saudi Arabia tax authority QR", icon: "fa-qrcode" }
        ]
      },
      {
        id: "mobile-tagging",
        name: "Mobile Tagging",
        description: "Mobile-optimized barcodes",
        tools: [
          { id: "mobile-qr", name: "QR Code", description: "Mobile QR code generator", icon: "fa-qrcode" },
          { id: "mobile-datamatrix", name: "Data Matrix", description: "Mobile Data Matrix generator", icon: "fa-th" },
          { id: "mobile-aztec", name: "Aztec", description: "Mobile Aztec code generator", icon: "fa-qrcode" }
        ]
      },
      {
        id: "healthcare-codes",
        name: "Healthcare Codes",
        description: "Medical and pharmaceutical barcodes",
        tools: [
          { id: "code32", name: "Code32", description: "Italian pharmacode", icon: "fa-barcode" },
          { id: "flattermarken", name: "Flattermarken", description: "German pharmaceutical barcode", icon: "fa-barcode" },
          { id: "hibc-lic-128", name: "HIBC LIC 128", description: "Healthcare Industry Bar Code 128", icon: "fa-barcode" },
          { id: "hibc-lic-39", name: "HIBC LIC 39", description: "HIBC with Code 39", icon: "fa-barcode" },
          { id: "hibc-lic-aztec", name: "HIBC LIC Aztec", description: "HIBC with Aztec code", icon: "fa-qrcode" },
          { id: "hibc-lic-codablock-f", name: "HIBC LIC Codablock-F", description: "HIBC with Codablock-F", icon: "fa-barcode" },
          { id: "hibc-lic-datamatrix", name: "HIBC LIC Data Matrix", description: "HIBC with Data Matrix", icon: "fa-th" },
          { id: "hibc-lic-micropdf417", name: "HIBC LIC Micro PDF 417", description: "HIBC with Micro PDF417", icon: "fa-qrcode" },
          { id: "hibc-lic-pdf417", name: "HIBC LIC PDF417", description: "HIBC with PDF417", icon: "fa-qrcode" },
          { id: "hibc-lic-qr", name: "HIBC LIC QR-Code", description: "HIBC with QR Code", icon: "fa-qrcode" },
          { id: "hibc-pas-128", name: "HIBC PAS 128", description: "HIBC Patient Safety with Code 128", icon: "fa-barcode" },
          { id: "hibc-pas-39", name: "HIBC PAS 39", description: "HIBC Patient Safety with Code 39", icon: "fa-barcode" },
          { id: "hibc-pas-aztec", name: "HIBC PAS Aztec", description: "HIBC Patient Safety with Aztec", icon: "fa-qrcode" },
          { id: "hibc-pas-codablock-f", name: "HIBC PAS Codablock-F", description: "HIBC Patient Safety with Codablock-F", icon: "fa-barcode" },
          { id: "hibc-pas-datamatrix", name: "HIBC PAS Data Matrix", description: "HIBC Patient Safety with Data Matrix", icon: "fa-th" },
          { id: "hibc-pas-micropdf417", name: "HIBC PAS Micro PDF417", description: "HIBC Patient Safety with Micro PDF417", icon: "fa-qrcode" },
          { id: "hibc-pas-pdf417", name: "HIBC PAS PDF417", description: "HIBC Patient Safety with PDF417", icon: "fa-qrcode" },
          { id: "hibc-pas-qr", name: "HIBC PAS QR-Code", description: "HIBC Patient Safety with QR Code", icon: "fa-qrcode" },
          { id: "ntin-datamatrix", name: "NTIN (Data Matrix)", description: "National Trade Item Number Data Matrix", icon: "fa-th" },
          { id: "pharmacode-one-track", name: "Pharmacode One-Track", description: "Single-track pharmaceutical barcode", icon: "fa-barcode" },
          { id: "pharmacode-two-track", name: "Pharmacode Two-Track", description: "Two-track pharmaceutical barcode", icon: "fa-barcode" },
          { id: "ppn-pharmacy", name: "PPN (Pharmacy Product Number)", description: "Pharmacy Product Number", icon: "fa-qrcode" },
          { id: "pzn7", name: "PZN7", description: "7-digit German pharmaceutical number", icon: "fa-barcode" },
          { id: "pzn8", name: "PZN8", description: "8-digit German pharmaceutical number", icon: "fa-barcode" }
        ]
      },
      {
        id: "isbn-codes",
        name: "ISBN Codes",
        description: "Book and publication identification",
        tools: [
          { id: "isbn-13", name: "ISBN 13", description: "13-digit International Standard Book Number", icon: "fa-book" },
          { id: "isbn-13-5", name: "ISBN 13 + 5 Digits", description: "ISBN with 5-digit add-on", icon: "fa-book" },
          { id: "ismn", name: "ISMN", description: "International Standard Music Number", icon: "fa-music" },
          { id: "issn", name: "ISSN", description: "International Standard Serial Number", icon: "fa-newspaper" },
          { id: "issn-2", name: "ISSN + 2 Digits", description: "ISSN with 2-digit add-on", icon: "fa-newspaper" }
        ]
      },
      {
        id: "business-cards",
        name: "Business Cards",
        description: "Contact information barcodes",
        tools: [
          { id: "qr-vcard", name: "QR Code vCard", description: "QR code with vCard contact info", icon: "fa-address-card" },
          { id: "datamatrix-vcard", name: "Data Matrix vCard", description: "Data Matrix with vCard info", icon: "fa-address-card" },
          { id: "qr-mecard", name: "QR Code MeCard", description: "QR code with MeCard format", icon: "fa-id-card" },
          { id: "datamatrix-mecard", name: "Data Matrix MeCard", description: "Data Matrix with MeCard format", icon: "fa-id-card" }
        ]
      },
      {
        id: "event-barcodes",
        name: "Event Barcodes",
        description: "Event and ticket barcodes",
        tools: [
          { id: "event-qr", name: "QR Code", description: "Event QR code generator", icon: "fa-ticket-alt" },
          { id: "event-datamatrix", name: "Data Matrix", description: "Event Data Matrix generator", icon: "fa-ticket-alt" }
        ]
      },
      {
        id: "wifi-barcodes",
        name: "Wi-Fi Barcodes",
        description: "Wi-Fi connection barcodes",
        tools: [
          { id: "wifi-qr", name: "QR Code", description: "Wi-Fi connection QR code", icon: "fa-wifi" },
          { id: "wifi-datamatrix", name: "Data Matrix", description: "Wi-Fi connection Data Matrix", icon: "fa-wifi" }
        ]
      }
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
