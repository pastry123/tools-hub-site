import { createContext, useContext, useState } from "react";

export type Language = "en" | "es" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    "header.title": "Aptexa ToolHub",
    "header.subtitle": "Professional Online Tools",
    "header.search": "Search tools...",
    "header.dashboard": "Dashboard",
    "header.favorites": "Favorites",
    "header.recent": "Recent",
    
    // Dashboard
    "dashboard.title": "Professional Online Tools",
    "dashboard.description": "Access powerful tools to enhance your productivity and streamline your workflow",
    "dashboard.stats.tools": "Total Tools",
    "dashboard.stats.categories": "Categories",
    "dashboard.stats.popular": "Most Popular",
    "dashboard.stats.free": "Free to Use",
    "dashboard.quickAccess": "Quick Access",
    "dashboard.allCategories": "All Tool Categories",
    "dashboard.features.title": "Why Choose Aptexa's ToolHub?",
    "dashboard.features.secure": "Secure & Private",
    "dashboard.features.secureDesc": "All processing happens in your browser. Your data never leaves your device.",
    "dashboard.features.fast": "Lightning Fast",
    "dashboard.features.fastDesc": "Optimized tools that work instantly without server delays.",
    "dashboard.features.mobile": "Mobile Friendly",
    "dashboard.features.mobileDesc": "Works perfectly on all devices, from desktop to mobile.",
    
    // Categories
    "category.barcodes.title": "Barcode & QR Tools",
    "category.barcodes.description": "Generate and scan various barcode formats",
    "category.pdf-tools.title": "PDF Tools",
    "category.pdf-tools.description": "Convert, merge, split, compress and manipulate PDF documents",
    "category.image-tools.title": "Image Tools",
    "category.image-tools.description": "Resize, compress, convert and edit images in various formats",
    "category.text-tools.title": "Text & Content Tools",
    "category.text-tools.description": "Format, analyze and manipulate text content and code",
    "category.converters.title": "Converter Tools",
    "category.converters.description": "Convert units, currencies, colors and file formats",
    "category.generators.title": "Generator Tools",
    "category.generators.description": "Create passwords, signatures, invoices and CSS gradients",
    "category.developer-tools.title": "Developer Tools",
    "category.developer-tools.description": "Web development utilities, validators and formatters",
    "category.rfid.title": "RFID & Labels",
    "category.rfid.description": "RFID tag generators and professional label design tools",
    
    // Common
    "common.tools": "Tools",
    "common.popular": "Popular",
    "common.free": "Free",
    "common.useTool": "Use Tool",
    "common.back": "Back to Dashboard",
    "common.notFound": "Not Found",
    "common.generate": "Generate",
    "common.download": "Download",
    "common.copy": "Copy",
    "common.clear": "Clear",
    
    // Barcode subcategories
    "barcode.linear": "Linear Codes",
    "barcode.postal": "Postal Codes", 
    "barcode.gs1databar": "GS1 DataBar",
    "barcode.ean-upc": "EAN / UPC",
    "barcode.2d": "2D Codes",
    "barcode.gs1-2d": "GS1 2D Barcodes",
    "barcode.banking": "Banking and Payments",
    "barcode.mobile": "Mobile Tagging",
    "barcode.healthcare": "Healthcare Codes",
    "barcode.isbn": "ISBN Codes",
    "barcode.business": "Business Cards",
    "barcode.events": "Event Barcodes",
    "barcode.wifi": "Wi-Fi Barcodes",
    
    // Dashboard Hero Section
    "dashboard.hero.title": "Aptexa ToolHub - 50+ Free Online Utilities",
    "dashboard.hero.description": "50+ professional tools for {barcodes}, {pdfs}, {signatures}, and {development}. Free, secure, browser-based tools for businesses and developers.",
    "dashboard.hero.barcodes": "barcodes",
    "dashboard.hero.pdfs": "PDFs",
    "dashboard.hero.signatures": "signatures", 
    "dashboard.hero.development": "development",
    
    // Dashboard Sections
    "dashboard.quickAccess.title": "Most Popular Tools - Quick Access",
    "dashboard.categories.title": "Complete Tool Categories",
    "dashboard.categories.description": "Explore our extensive collection of tools organized into specialized categories. Each category contains multiple tools designed to handle specific tasks efficiently. From {barcodeGeneration} to {imageProcessing}, find the perfect tool for your needs.",
    "dashboard.categories.barcodeGeneration": "barcode generation",
    "dashboard.categories.imageProcessing": "image processing",
    "dashboard.categories.toolsCount": "{count} tools",
    
    // Dashboard Benefits
    "dashboard.benefits.title": "Why Choose Aptexa ToolHub for Your Professional Needs",
    "dashboard.benefits.document.title": "Advanced Document Processing",
    "dashboard.benefits.document.description1": "Our {pdfTools} include merge, split, compress, and watermark capabilities. The {eSignature} enables legal document signing with AI-powered signature generation. Process multiple files simultaneously with enterprise-grade security protocols ensuring your documents remain confidential.",
    "dashboard.benefits.document.description2": "Advanced OCR technology extracts text from scanned documents, while intelligent compression reduces file sizes without quality loss. Batch processing capabilities handle hundreds of documents efficiently.",
    "dashboard.benefits.barcode.title": "Professional Barcode & QR Generation",
    "dashboard.benefits.barcode.description1": "Generate industry-standard barcodes including {code128}, {qrCodes}, {dataMatrix}, and postal codes. Our {barcodeScanner} uses advanced computer vision to decode any barcode format with high accuracy rates.",
    "dashboard.benefits.barcode.description2": "Support for business cards, event tickets, inventory management, and Wi-Fi sharing. Bulk generation capabilities for enterprise applications with custom branding options.",
    "dashboard.benefits.image.title": "Comprehensive Image Processing",
    "dashboard.benefits.image.description1": "Professional {imageTools} for resizing, format conversion, compression, and editing. Advanced features include watermarking, background removal, and batch processing for multiple files.",
    "dashboard.benefits.image.description2": "Support for all major formats including JPEG, PNG, WebP, SVG, and TIFF. Intelligent compression algorithms maintain visual quality while reducing file sizes significantly.",
    "dashboard.benefits.developer.title": "Developer & Business Tools",
    "dashboard.benefits.developer.description1": "Essential {developerTools} including regex testers, API validators, JWT decoders, and code formatters. The {invoiceGenerator} creates professional invoices with customizable templates and automatic calculations.",
    "dashboard.benefits.developer.description2": "Text processing tools for case conversion, hash generation, and content analysis. Currency converters with real-time exchange rates for international business operations.",
    "dashboard.features.security.title": "Enterprise-Grade Security",
    "dashboard.features.security.description": "All processing occurs client-side in your browser. Zero data transmission to external servers ensures complete privacy. Your sensitive documents and information never leave your device.",
    "dashboard.features.performance.title": "Optimized Performance",
    "dashboard.features.performance.description": "Lightning-fast processing with minimal resource usage. Tools are optimized for both desktop and mobile devices, ensuring consistent performance across all platforms.",
    "dashboard.features.accessibility.title": "Universal Accessibility",
    "dashboard.features.accessibility.description": "Full multilingual support with right-to-left language compatibility. Responsive design works seamlessly on smartphones, tablets, and desktop computers.",
    "dashboard.features.business.title": "Business-Ready Features",
    "dashboard.features.business.description": "Professional templates for invoices, certificates, and business documents. Batch processing capabilities handle large volumes efficiently for enterprise workflows.",
    
    // Tool Overview Section
    "dashboard.tools.overview.title": "Complete Tool Suite Overview",
    "dashboard.tools.business.title": "Business Tools",
    "dashboard.tools.developer.title": "Developer Tools", 
    "dashboard.tools.content.title": "Content Tools",
    "dashboard.tools.invoice": "Invoice Generator",
    "dashboard.tools.invoiceDesc": "Create professional invoices instantly",
    "dashboard.tools.barcode": "Barcode Generator",
    "dashboard.tools.barcodeDesc": "Support for 15+ barcode formats",
    "dashboard.tools.qrcode": "QR Code Generator",
    "dashboard.tools.qrcodeDesc": "Custom QR codes with logos",
    "dashboard.tools.signature": "Digital Signatures",
    "dashboard.tools.signatureDesc": "AI-powered signature creation",
    "dashboard.tools.pdfsign": "PDF E-Sign",
    "dashboard.tools.pdfsignDesc": "Legal document signing solution",
    "dashboard.tools.regex": "Regex Tester",
    "dashboard.tools.regexDesc": "Pattern matching and validation",
    "dashboard.tools.jwt": "JWT Decoder",
    "dashboard.tools.jwtDesc": "Token parsing and verification",
    "dashboard.tools.api": "API Tester",
    "dashboard.tools.apiDesc": "REST endpoint testing",
    "dashboard.tools.cssmin": "CSS Minifier",
    "dashboard.tools.cssminDesc": "Code optimization and compression",
    "dashboard.tools.jsmin": "JS Minifier",
    "dashboard.tools.jsminDesc": "JavaScript file optimization",
    "dashboard.tools.imagecomp": "Image Compressor",
    "dashboard.tools.imagecompDesc": "Reduce file sizes by 80%",
    "dashboard.tools.pdfmerge": "PDF Merger",
    "dashboard.tools.pdfmergeDesc": "Combine multiple documents",
    "dashboard.tools.textconv": "Text Converter",
    "dashboard.tools.textconvDesc": "Format transformation",
    "dashboard.tools.colorconv": "Color Converter",
    "dashboard.tools.colorconvDesc": "HEX, RGB, HSL conversion",
    "dashboard.tools.password": "Password Generator",
    "dashboard.tools.passwordDesc": "Secure password creation",
    
    // Security Section
    "dashboard.security.title": "Security and Privacy Commitment",
    "dashboard.security.protection.title": "Data Protection",
    "dashboard.security.protection.description": "All processing happens locally in your browser. Files uploaded to tools like our {pdfMerger} or {imageCompressor} are never stored on our servers. Data is processed client-side and immediately discarded after use.",
    
    // Category Pages
    "category.notFound": "Category Not Found",
    "category.backToDashboard": "Back to Dashboard",
    "category.toolsCount": "tools",
    "category.useTool": "Use Tool",
    
    // Tool Pages - Common Elements
    "tool.addToFavorites": "Add to Favorites",
    "tool.removeFromFavorites": "Remove from Favorites",
    "tool.multipleFormats": "Multiple Formats",
    "tool.multipleFormats.desc": "Download results in various formats for maximum compatibility",
    "tool.mobileOptimized": "Mobile Optimized",
    "tool.mobileOptimized.desc": "Works perfectly on all devices and screen sizes",
    "tool.securePrivate": "Secure & Private",
    "tool.securePrivate.desc": "All processing happens in your browser. Your data never leaves your device",
    
    // Lorem Ipsum Generator
    "lorem.title": "Lorem Ipsum Generator",
    "lorem.subtitle": "Generate placeholder text",
    "lorem.textType": "Text Type",
    "lorem.loremIpsum": "Lorem Ipsum",
    "lorem.randomWords": "Random Words",
    "lorem.count": "Count",
    "lorem.generate": "Generate",
    "lorem.words": "Words",
    "lorem.sentences": "Sentences",
    "lorem.paragraphs": "Paragraphs",
    "lorem.generateText": "Generate Text",
    "lorem.generatedText": "Generated Text",
    "lorem.copy": "Copy",
    "lorem.clear": "Clear",
    
    // Text to Slug
    "textSlug.title": "Text to Slug",
    "textSlug.subtitle": "Convert text to URL-friendly slugs",
    "textSlug.inputText": "Input Text",
    "textSlug.enterText": "Enter your text here",
    "textSlug.maxLength": "Max Length (optional)",
    "textSlug.separator": "Separator",
    "textSlug.convertLowercase": "Convert to lowercase",
    "textSlug.removeDiacritics": "Remove diacritics (accents)",
    "textSlug.generateSlug": "Generate Slug",
    "textSlug.generatedSlug": "Generated Slug",
    "textSlug.copying": "Copying...",
    
    // Tool Page
    "toolPage.notFound": "Tool Not Found",
    "toolPage.addToFavorites": "Add to Favorites",
    "toolPage.removeFromFavorites": "Remove from Favorites",
    
    // Case Converter
    "caseConverter.title": "Case Converter",
    "caseConverter.inputText": "Input Text",
    "caseConverter.enterText": "Enter your text here...",
    "caseConverter.conversionType": "Conversion Type",
    "caseConverter.uppercase": "UPPERCASE",
    "caseConverter.lowercase": "lowercase",
    "caseConverter.titleCase": "Title Case",
    "caseConverter.sentenceCase": "Sentence case",
    "caseConverter.camelCase": "camelCase",
    "caseConverter.pascalCase": "PascalCase",
    "caseConverter.snakeCase": "snake_case",
    "caseConverter.kebabCase": "kebab-case",
    "caseConverter.convertCase": "Convert Case",
    "caseConverter.converting": "Converting...",
    "caseConverter.outputText": "Output Text",
    "caseConverter.copy": "Copy",
    
    // Background Remover
    "backgroundRemover.title": "Background Remover",
    "backgroundRemover.subtitle": "Remove backgrounds from images",
    "backgroundRemover.uploadImage": "Upload Image",
    "backgroundRemover.dropImage": "Drop your image here",
    "backgroundRemover.clickToBrowse": "or click to browse (max 10MB)",
    "backgroundRemover.chooseImage": "Choose Image",
    "backgroundRemover.subjectType": "Subject Type",
    "backgroundRemover.autoDetect": "Auto Detect",
    "backgroundRemover.outputSize": "Output Size",
    "backgroundRemover.auto": "Auto",
    "backgroundRemover.backgroundColor": "Background Color (optional)",
    "backgroundRemover.outputFormat": "Output Format",
    "backgroundRemover.pngTransparent": "PNG (Transparent)",
    "backgroundRemover.autoCrop": "Auto Crop",
    "backgroundRemover.addShadow": "Add Shadow",
    "backgroundRemover.removeBackground": "Remove Background",
    "backgroundRemover.reset": "Reset",
    
    // Image Cropper
    "imageCropper.title": "Image Crop",
    "imageCropper.subtitle": "Crop images to specific areas",
    "imageCropper.uploadImage": "Upload Image",
    "imageCropper.noFileChosen": "No file chosen",
    "imageCropper.chooseFile": "Choose File",
    
    // Tool Cards and Actions
    "tools.useTool": "Use Tool",
    "tools.analyzeColors": "Analyze Colors",
    "tools.uploadImage": "Upload Image",
    "tools.chooseFile": "Choose File",
    "tools.noFileChosen": "No file chosen",
    
    // Tool Names
    "tools.background-remover": "Background Remover",
    "tools.background-remover.desc": "Remove backgrounds from images",
    "tools.image-crop": "Image Crop", 
    "tools.image-crop.desc": "Crop images to specific areas",
    "tools.format-converter": "Format Converter",
    "tools.format-converter.desc": "Convert between image formats", 
    "tools.image-resize": "Image Resize",
    "tools.image-resize.desc": "Resize images to specific dimensions",
    "tools.image-watermark": "Image Watermark",
    "tools.image-watermark.desc": "Add watermarks to images",
    "tools.color-palette-generator": "Color Palette Generator",
    "tools.color-palette-generator.desc": "Extract color palettes from images",
    "tools.image-compressor": "Image Compressor", 
    "tools.image-compressor.desc": "Compress images to reduce file size",
    "tools.favicon-generator": "Favicon Generator",
    "tools.favicon-generator.desc": "Generate favicons from images",
    "tools.image-to-text": "Image to Text",
    "tools.image-to-text.desc": "Extract text from images (OCR)",
    
    // Footer sections
    "footer.enterpriseStandards": "Enterprise Standards",
    "footer.dataProtection": "Data Protection", 
    "footer.securityCompliance": "Built with enterprise-grade security protocols. SSL encryption protects all data transmission. Tools like our",
    "footer.barcodeScanner": "barcode scanner",
    "footer.signatureGenerator": "signature generator", 
    "footer.professionalCompliance": "meet professional compliance standards",
    "footer.regularAudits": "Regular security audits and updates ensure platform integrity. Compatible with corporate firewalls and security policies. Trusted by thousands of professionals worldwide for daily business operations",
    "footer.privacyPolicy": "Zero data collection policy ensures your privacy. No registration required, no tracking cookies, and no personal information stored. Perfect for handling sensitive business documents and confidential data",
    
    // Color Analyzer Tool
    "colorAnalyzer.title": "Color Analyzer",
    "colorAnalyzer.uploadImage": "Upload Image",
    "colorAnalyzer.analyzeColors": "Analyze Colors",
    "colorAnalyzer.noFileChosen": "No file chosen",
    "colorAnalyzer.chooseFile": "Choose File",
  },
  es: {
    // Header
    "header.title": "Aptexa ToolHub",
    "header.subtitle": "Herramientas Profesionales en Línea",
    "header.search": "Buscar herramientas...",
    "header.dashboard": "Panel",
    "header.favorites": "Favoritos",
    "header.recent": "Recientes",
    
    // Dashboard
    "dashboard.title": "Herramientas Profesionales en Línea",
    "dashboard.description": "Accede a herramientas poderosas para mejorar tu productividad y optimizar tu flujo de trabajo",
    "dashboard.stats.tools": "Total de Herramientas",
    "dashboard.stats.categories": "Categorías",
    "dashboard.stats.popular": "Más Popular",
    "dashboard.stats.free": "Gratis",
    "dashboard.quickAccess": "Acceso Rápido",
    "dashboard.allCategories": "Todas las Categorías",
    "dashboard.features.title": "¿Por qué elegir Aptexa's ToolHub?",
    "dashboard.features.secure": "Seguro y Privado",
    "dashboard.features.secureDesc": "Todo el procesamiento ocurre en tu navegador. Tus datos nunca salen de tu dispositivo.",
    "dashboard.features.fast": "Súper Rápido",
    "dashboard.features.fastDesc": "Herramientas optimizadas que funcionan instantáneamente sin retrasos del servidor.",
    "dashboard.features.mobile": "Compatible con Móviles",
    "dashboard.features.mobileDesc": "Funciona perfectamente en todos los dispositivos, desde escritorio hasta móvil.",
    
    // Categories
    "category.barcodes.title": "Códigos de Barras y QR",
    "category.barcodes.description": "Generar y escanear varios formatos de códigos de barras",
    "category.pdf-tools.title": "Herramientas PDF",
    "category.pdf-tools.description": "Convertir, fusionar, dividir, comprimir y manipular documentos PDF",
    "category.image-tools.title": "Herramientas de Imagen",
    "category.image-tools.description": "Redimensionar, comprimir, convertir y editar imágenes en varios formatos",
    "category.text-tools.title": "Herramientas de Texto",
    "category.text-tools.description": "Formatear, analizar y manipular contenido de texto y código",
    "category.converters.title": "Herramientas de Conversión",
    "category.converters.description": "Convertir unidades, monedas, colores y formatos de archivo",
    "category.generators.title": "Herramientas Generadoras",
    "category.generators.description": "Crear contraseñas, firmas, facturas y gradientes CSS",
    "category.developer-tools.title": "Herramientas de Desarrollador",
    "category.developer-tools.description": "Utilidades de desarrollo web, validadores y formateadores",
    "category.rfid.title": "RFID y Etiquetas",
    "category.rfid.description": "Generadores de etiquetas RFID y herramientas de diseño profesional",
    
    // Common
    "common.tools": "Herramientas",
    "common.popular": "Popular",
    "common.free": "Gratis",
    "common.useTool": "Usar Herramienta",
    "common.back": "Volver al Panel",
    "common.notFound": "No Encontrado",
    "common.generate": "Generar",
    "common.download": "Descargar",
    "common.copy": "Copiar",
    "common.clear": "Limpiar",
    
    // Barcode subcategories
    "barcode.linear": "Códigos Lineales",
    "barcode.postal": "Códigos Postales", 
    "barcode.gs1databar": "GS1 DataBar",
    "barcode.ean-upc": "EAN / UPC",
    "barcode.2d": "Códigos 2D",
    "barcode.gs1-2d": "Códigos 2D GS1",
    "barcode.banking": "Banca y Pagos",
    "barcode.mobile": "Etiquetado Móvil",
    "barcode.healthcare": "Códigos Sanitarios",
    "barcode.isbn": "Códigos ISBN",
    "barcode.business": "Tarjetas de Visita",
    "barcode.events": "Códigos de Eventos",
    "barcode.wifi": "Códigos Wi-Fi",
    
    // Dashboard Hero Section
    "dashboard.hero.title": "Aptexa ToolHub - 50+ Utilidades Gratuitas en Línea",
    "dashboard.hero.description": "50+ herramientas profesionales para {barcodes}, {pdfs}, {signatures}, y {development}. Herramientas gratuitas, seguras y basadas en navegador para empresas y desarrolladores.",
    "dashboard.hero.barcodes": "códigos de barras",
    "dashboard.hero.pdfs": "PDFs",
    "dashboard.hero.signatures": "firmas", 
    "dashboard.hero.development": "desarrollo",
    
    // Dashboard Sections
    "dashboard.quickAccess.title": "Herramientas Más Populares - Acceso Rápido",
    "dashboard.categories.title": "Categorías Completas de Herramientas",
    "dashboard.categories.description": "Explora nuestra extensa colección de herramientas organizadas en categorías especializadas. Cada categoría contiene múltiples herramientas diseñadas para manejar tareas específicas de manera eficiente. Desde {barcodeGeneration} hasta {imageProcessing}, encuentra la herramienta perfecta para tus necesidades.",
    "dashboard.categories.barcodeGeneration": "generación de códigos de barras",
    "dashboard.categories.imageProcessing": "procesamiento de imágenes",
    "dashboard.categories.toolsCount": "{count} herramientas",
    
    // Dashboard Benefits
    "dashboard.benefits.title": "Por Qué Elegir Aptexa ToolHub para Tus Necesidades Profesionales",
    "dashboard.benefits.document.title": "Procesamiento Avanzado de Documentos",
    "dashboard.benefits.document.description1": "Nuestras {pdfTools} incluyen capacidades de fusión, división, compresión y marca de agua. La {eSignature} permite la firma legal de documentos con generación de firmas impulsada por IA. Procesa múltiples archivos simultáneamente con protocolos de seguridad de nivel empresarial que garantizan la confidencialidad de tus documentos.",
    "dashboard.benefits.document.description2": "La tecnología OCR avanzada extrae texto de documentos escaneados, mientras que la compresión inteligente reduce el tamaño de los archivos sin pérdida de calidad. Las capacidades de procesamiento por lotes manejan cientos de documentos de manera eficiente.",
    "dashboard.benefits.barcode.title": "Generación Profesional de Códigos de Barras y QR",
    "dashboard.benefits.barcode.description1": "Genera códigos de barras estándar de la industria incluyendo {code128}, {qrCodes}, {dataMatrix}, y códigos postales. Nuestro {barcodeScanner} utiliza visión por computadora avanzada para decodificar cualquier formato de código de barras con altas tasas de precisión.",
    "dashboard.benefits.barcode.description2": "Soporte para tarjetas de visita, boletos de eventos, gestión de inventario y compartir Wi-Fi. Capacidades de generación masiva para aplicaciones empresariales con opciones de marca personalizada.",
    "dashboard.benefits.image.title": "Procesamiento Integral de Imágenes",
    "dashboard.benefits.image.description1": "{imageTools} profesionales para redimensionar, conversión de formato, compresión y edición. Las características avanzadas incluyen marcas de agua, eliminación de fondo y procesamiento por lotes para múltiples archivos.",
    "dashboard.benefits.image.description2": "Soporte para todos los formatos principales incluyendo JPEG, PNG, WebP, SVG y TIFF. Los algoritmos de compresión inteligente mantienen la calidad visual mientras reducen significativamente el tamaño de los archivos.",
    "dashboard.benefits.developer.title": "Herramientas para Desarrolladores y Empresas",
    "dashboard.benefits.developer.description1": "{developerTools} esenciales incluyendo probadores de regex, validadores de API, decodificadores JWT y formateadores de código. El {invoiceGenerator} crea facturas profesionales con plantillas personalizables y cálculos automáticos.",
    "dashboard.benefits.developer.description2": "Herramientas de procesamiento de texto para conversión de casos, generación de hash y análisis de contenido. Convertidores de moneda con tasas de cambio en tiempo real para operaciones comerciales internacionales.",
    "dashboard.features.security.title": "Seguridad de Nivel Empresarial",
    "dashboard.features.security.description": "Todo el procesamiento ocurre del lado del cliente en tu navegador. Cero transmisión de datos a servidores externos garantiza privacidad completa. Tus documentos e información sensibles nunca salen de tu dispositivo.",
    "dashboard.features.performance.title": "Rendimiento Optimizado",
    "dashboard.features.performance.description": "Procesamiento ultrarrápido con uso mínimo de recursos. Las herramientas están optimizadas tanto para dispositivos de escritorio como móviles, asegurando rendimiento consistente en todas las plataformas.",
    "dashboard.features.accessibility.title": "Accesibilidad Universal",
    "dashboard.features.accessibility.description": "Soporte multilingüe completo con compatibilidad para idiomas de derecha a izquierda. El diseño responsivo funciona perfectamente en smartphones, tablets y computadoras de escritorio.",
    "dashboard.features.business.title": "Características Listas para Empresas",
    "dashboard.features.business.description": "Plantillas profesionales para facturas, certificados y documentos comerciales. Las capacidades de procesamiento por lotes manejan grandes volúmenes de manera eficiente para flujos de trabajo empresariales.",
    
    // Tool Overview Section
    "dashboard.tools.overview.title": "Visión General Completa del Conjunto de Herramientas",
    "dashboard.tools.business.title": "Herramientas de Negocio",
    "dashboard.tools.developer.title": "Herramientas de Desarrollador", 
    "dashboard.tools.content.title": "Herramientas de Contenido",
    "dashboard.tools.invoice": "Generador de Facturas",
    "dashboard.tools.invoiceDesc": "Crear facturas profesionales al instante",
    "dashboard.tools.barcode": "Generador de Códigos de Barras",
    "dashboard.tools.barcodeDesc": "Soporte para más de 15 formatos de códigos de barras",
    "dashboard.tools.qrcode": "Generador de Códigos QR",
    "dashboard.tools.qrcodeDesc": "Códigos QR personalizados con logos",
    "dashboard.tools.signature": "Firmas Digitales",
    "dashboard.tools.signatureDesc": "Creación de firmas impulsada por IA",
    "dashboard.tools.pdfsign": "Firma Electrónica PDF",
    "dashboard.tools.pdfsignDesc": "Solución de firma de documentos legales",
    "dashboard.tools.regex": "Probador de Regex",
    "dashboard.tools.regexDesc": "Coincidencia de patrones y validación",
    "dashboard.tools.jwt": "Decodificador JWT",
    "dashboard.tools.jwtDesc": "Análisis y verificación de tokens",
    "dashboard.tools.api": "Probador de API",
    "dashboard.tools.apiDesc": "Pruebas de endpoints REST",
    "dashboard.tools.cssmin": "Minificador CSS",
    "dashboard.tools.cssminDesc": "Optimización y compresión de código",
    "dashboard.tools.jsmin": "Minificador JS",
    "dashboard.tools.jsminDesc": "Optimización de archivos JavaScript",
    "dashboard.tools.imagecomp": "Compresor de Imágenes",
    "dashboard.tools.imagecompDesc": "Reducir tamaños de archivo hasta 80%",
    "dashboard.tools.pdfmerge": "Fusionador de PDF",
    "dashboard.tools.pdfmergeDesc": "Combinar múltiples documentos",
    "dashboard.tools.textconv": "Convertidor de Texto",
    "dashboard.tools.textconvDesc": "Transformación de formato",
    "dashboard.tools.colorconv": "Convertidor de Color",
    "dashboard.tools.colorconvDesc": "Conversión HEX, RGB, HSL",
    "dashboard.tools.password": "Generador de Contraseñas",
    "dashboard.tools.passwordDesc": "Creación de contraseñas seguras",
    
    // Security Section
    "dashboard.security.title": "Compromiso de Seguridad y Privacidad",
    "dashboard.security.protection.title": "Protección de Datos",
    "dashboard.security.protection.description": "Todo el procesamiento ocurre localmente en tu navegador. Los archivos subidos a herramientas como nuestro {pdfMerger} o {imageCompressor} nunca se almacenan en nuestros servidores. Los datos se procesan del lado del cliente y se descartan inmediatamente después del uso.",
    
    // Category Pages
    "category.notFound": "Categoría No Encontrada",
    "category.backToDashboard": "Volver al Panel",
    "category.toolsCount": "herramientas",
    "category.useTool": "Usar Herramienta",
    
    // Tool Pages - Common Elements
    "tool.addToFavorites": "Agregar a Favoritos",
    "tool.removeFromFavorites": "Eliminar de Favoritos",
    "tool.multipleFormats": "Múltiples Formatos",
    "tool.multipleFormats.desc": "Descargar resultados en varios formatos para máxima compatibilidad",
    "tool.mobileOptimized": "Optimizado para Móvil",
    "tool.mobileOptimized.desc": "Funciona perfectamente en todos los dispositivos y tamaños de pantalla",
    "tool.securePrivate": "Seguro y Privado",
    "tool.securePrivate.desc": "Todo el procesamiento ocurre en tu navegador. Tus datos nunca salen de tu dispositivo",
    
    // Lorem Ipsum Generator
    "lorem.title": "Generador Lorem Ipsum",
    "lorem.subtitle": "Generar texto de relleno",
    "lorem.textType": "Tipo de Texto",
    "lorem.loremIpsum": "Lorem Ipsum",
    "lorem.randomWords": "Palabras Aleatorias",
    "lorem.count": "Cantidad",
    "lorem.generate": "Generar",
    "lorem.words": "Palabras",
    "lorem.sentences": "Oraciones",
    "lorem.paragraphs": "Párrafos",
    "lorem.generateText": "Generar Texto",
    "lorem.generatedText": "Texto Generado",
    "lorem.copy": "Copiar",
    "lorem.clear": "Limpiar",
    
    // Text to Slug
    "textSlug.title": "Texto a Slug",
    "textSlug.subtitle": "Convertir texto a slugs amigables para URL",
    "textSlug.inputText": "Texto de Entrada",
    "textSlug.enterText": "Ingresa tu texto aquí",
    "textSlug.maxLength": "Longitud Máxima (opcional)",
    "textSlug.separator": "Separador",
    "textSlug.convertLowercase": "Convertir a minúsculas",
    "textSlug.removeDiacritics": "Eliminar diacríticos (acentos)",
    "textSlug.generateSlug": "Generar Slug",
    "textSlug.generatedSlug": "Slug Generado",
    "textSlug.copying": "Copiando...",
    
    // Tool Page
    "toolPage.notFound": "Herramienta No Encontrada",
    "toolPage.addToFavorites": "Agregar a Favoritos",
    "toolPage.removeFromFavorites": "Quitar de Favoritos",
    
    // Case Converter
    "caseConverter.title": "Convertidor de Caso",
    "caseConverter.inputText": "Texto de Entrada",
    "caseConverter.enterText": "Ingresa tu texto aquí...",
    "caseConverter.conversionType": "Tipo de Conversión",
    "caseConverter.uppercase": "MAYÚSCULAS",
    "caseConverter.lowercase": "minúsculas",
    "caseConverter.titleCase": "Título Case",
    "caseConverter.sentenceCase": "Oración case",
    "caseConverter.camelCase": "camelCase",
    "caseConverter.pascalCase": "PascalCase",
    "caseConverter.snakeCase": "snake_case",
    "caseConverter.kebabCase": "kebab-case",
    "caseConverter.convertCase": "Convertir Caso",
    "caseConverter.converting": "Convirtiendo...",
    "caseConverter.outputText": "Texto de Salida",
    "caseConverter.copy": "Copiar",
    
    // Background Remover
    "backgroundRemover.title": "Removedor de Fondo",
    "backgroundRemover.subtitle": "Eliminar fondos de imágenes",
    "backgroundRemover.uploadImage": "Subir Imagen",
    "backgroundRemover.dropImage": "Arrastra tu imagen aquí",
    "backgroundRemover.clickToBrowse": "o haz clic para navegar (máx 10MB)",
    "backgroundRemover.chooseImage": "Elegir Imagen",
    "backgroundRemover.subjectType": "Tipo de Sujeto",
    "backgroundRemover.autoDetect": "Auto Detectar",
    "backgroundRemover.outputSize": "Tamaño de Salida",
    "backgroundRemover.auto": "Auto",
    "backgroundRemover.backgroundColor": "Color de Fondo (opcional)",
    "backgroundRemover.outputFormat": "Formato de Salida",
    "backgroundRemover.pngTransparent": "PNG (Transparente)",
    "backgroundRemover.autoCrop": "Recorte Automático",
    "backgroundRemover.addShadow": "Agregar Sombra",
    "backgroundRemover.removeBackground": "Eliminar Fondo",
    "backgroundRemover.reset": "Reiniciar",
    
    // Image Cropper
    "imageCropper.title": "Recorte de Imagen",
    "imageCropper.subtitle": "Recortar imágenes a áreas específicas",
    "imageCropper.uploadImage": "Subir Imagen",
    "imageCropper.noFileChosen": "Ningún archivo seleccionado",
    "imageCropper.chooseFile": "Elegir Archivo",
    
    // Tool Cards and Actions
    "tools.useTool": "Usar Herramienta",
    "tools.analyzeColors": "Analizar Colores",
    "tools.uploadImage": "Subir Imagen",
    "tools.chooseFile": "Elegir Archivo",
    "tools.noFileChosen": "Ningún archivo seleccionado",
    
    // Tool Names
    "tools.background-remover": "Removedor de Fondo",
    "tools.background-remover.desc": "Eliminar fondos de imágenes",
    "tools.image-crop": "Recorte de Imagen", 
    "tools.image-crop.desc": "Recortar imágenes a áreas específicas",
    "tools.format-converter": "Convertidor de Formato",
    "tools.format-converter.desc": "Convertir entre formatos de imagen", 
    "tools.image-resize": "Redimensionar Imagen",
    "tools.image-resize.desc": "Redimensionar imágenes a dimensiones específicas",
    "tools.image-watermark": "Marca de Agua en Imagen",
    "tools.image-watermark.desc": "Agregar marcas de agua a imágenes",
    "tools.color-palette-generator": "Generador de Paleta de Colores",
    "tools.color-palette-generator.desc": "Extraer paletas de colores de imágenes",
    "tools.image-compressor": "Compresor de Imagen", 
    "tools.image-compressor.desc": "Comprimir imágenes para reducir el tamaño del archivo",
    "tools.favicon-generator": "Generador de Favicon",
    "tools.favicon-generator.desc": "Generar favicons a partir de imágenes",
    "tools.image-to-text": "Imagen a Texto",
    "tools.image-to-text.desc": "Extraer texto de imágenes (OCR)",
    
    // Footer sections
    "footer.enterpriseStandards": "Estándares Empresariales",
    "footer.dataProtection": "Protección de Datos", 
    "footer.securityCompliance": "Construido con protocolos de seguridad de nivel empresarial. El cifrado SSL protege toda la transmisión de datos. Herramientas como nuestro",
    "footer.barcodeScanner": "escáner de códigos de barras",
    "footer.signatureGenerator": "generador de firmas", 
    "footer.professionalCompliance": "cumplen con estándares de cumplimiento profesional",
    "footer.regularAudits": "Las auditorías de seguridad regulares y las actualizaciones garantizan la integridad de la plataforma. Compatible con firewalls corporativos y políticas de seguridad. Confiado por miles de profesionales en todo el mundo para operaciones comerciales diarias",
    "footer.privacyPolicy": "La política de cero recopilación de datos garantiza su privacidad. No se requiere registro, no hay cookies de seguimiento y no se almacena información personal. Perfecto para manejar documentos comerciales sensibles y datos confidenciales",
    
    // Color Analyzer Tool
    "colorAnalyzer.title": "Analizador de Colores",
    "colorAnalyzer.uploadImage": "Subir Imagen",
    "colorAnalyzer.analyzeColors": "Analizar Colores",
    "colorAnalyzer.noFileChosen": "Ningún archivo seleccionado",
    "colorAnalyzer.chooseFile": "Elegir Archivo",
  },
  ar: {
    // Header
    "header.title": "Aptexa ToolHub",
    "header.subtitle": "أدوات احترافية على الإنترنت",
    "header.search": "البحث في الأدوات...",
    "header.dashboard": "لوحة التحكم",
    "header.favorites": "المفضلة",
    "header.recent": "الحديثة",
    
    // Dashboard
    "dashboard.title": "أدوات احترافية على الإنترنت",
    "dashboard.description": "احصل على أدوات قوية لتعزيز إنتاجيتك وتحسين سير عملك",
    "dashboard.stats.tools": "إجمالي الأدوات",
    "dashboard.stats.categories": "الفئات",
    "dashboard.stats.popular": "الأكثر شعبية",
    "dashboard.stats.free": "مجاني للاستخدام",
    "dashboard.quickAccess": "الوصول السريع",
    "dashboard.allCategories": "جميع فئات الأدوات",
    "dashboard.features.title": "لماذا تختار Aptexa's ToolHub؟",
    "dashboard.features.secure": "آمن وخاص",
    "dashboard.features.secureDesc": "تتم جميع العمليات في متصفحك. بياناتك لا تغادر جهازك أبداً.",
    "dashboard.features.fast": "سريع جداً",
    "dashboard.features.fastDesc": "أدوات محسنة تعمل فوراً بدون تأخير من الخادم.",
    "dashboard.features.mobile": "متوافق مع الجوال",
    "dashboard.features.mobileDesc": "يعمل بشكل مثالي على جميع الأجهزة، من سطح المكتب إلى الجوال.",
    
    // Categories
    "category.barcodes.title": "أدوات الباركود و QR",
    "category.barcodes.description": "إنشاء ومسح تنسيقات مختلفة من الباركود",
    "category.pdf-tools.title": "أدوات PDF",
    "category.pdf-tools.description": "تحويل ودمج وتقسيم وضغط ومعالجة مستندات PDF",
    "category.image-tools.title": "أدوات الصور",
    "category.image-tools.description": "تغيير الحجم والضغط والتحويل وتحرير الصور بتنسيقات مختلفة",
    "category.text-tools.title": "أدوات النص والمحتوى",
    "category.text-tools.description": "تنسيق وتحليل ومعالجة محتوى النص والكود",
    "category.converters.title": "أدوات التحويل",
    "category.converters.description": "تحويل الوحدات والعملات والألوان وتنسيقات الملفات",
    "category.generators.title": "أدوات الإنشاء",
    "category.generators.description": "إنشاء كلمات المرور والتوقيعات والفواتير وتدرجات CSS",
    "category.developer-tools.title": "أدوات المطورين",
    "category.developer-tools.description": "أدوات تطوير الويب والمدققات والمنسقات",
    "category.rfid.title": "RFID والملصقات",
    "category.rfid.description": "مولدات علامات RFID وأدوات تصميم الملصقات الاحترافية",
    
    // Common
    "common.tools": "الأدوات",
    "common.popular": "شائع",
    "common.free": "مجاني",
    "common.useTool": "استخدم الأداة",
    "common.back": "العودة للوحة التحكم",
    "common.notFound": "غير موجود",
    "common.generate": "إنشاء",
    "common.download": "تحميل",
    "common.copy": "نسخ",
    "common.clear": "مسح",
    
    // Barcode subcategories
    "barcode.linear": "الأكواد الخطية",
    "barcode.postal": "الأكواد البريدية", 
    "barcode.gs1databar": "GS1 DataBar",
    "barcode.ean-upc": "EAN / UPC",
    "barcode.2d": "الأكواد ثنائية الأبعاد",
    "barcode.gs1-2d": "أكواد GS1 ثنائية الأبعاد",
    "barcode.banking": "البنوك والمدفوعات",
    "barcode.mobile": "العلامات المحمولة",
    "barcode.healthcare": "أكواد الرعاية الصحية",
    "barcode.isbn": "أكواد ISBN",
    "barcode.business": "بطاقات العمل",
    "barcode.events": "أكواد الأحداث",
    "barcode.wifi": "أكواد الواي فاي",
    
    // Dashboard Hero Section
    "dashboard.hero.title": "Aptexa ToolHub - 50+ أداة مجانية على الإنترنت",
    "dashboard.hero.description": "50+ أداة احترافية لـ {barcodes} و {pdfs} و {signatures} و {development}. أدوات مجانية وآمنة تعمل في المتصفح للشركات والمطورين.",
    "dashboard.hero.barcodes": "الباركود",
    "dashboard.hero.pdfs": "ملفات PDF",
    "dashboard.hero.signatures": "التوقيعات", 
    "dashboard.hero.development": "التطوير",
    
    // Dashboard Sections
    "dashboard.quickAccess.title": "الأدوات الأكثر شعبية - الوصول السريع",
    "dashboard.categories.title": "فئات الأدوات الكاملة",
    "dashboard.categories.description": "استكشف مجموعتنا الواسعة من الأدوات المنظمة في فئات متخصصة. كل فئة تحتوي على أدوات متعددة مصممة للتعامل مع مهام محددة بكفاءة. من {barcodeGeneration} إلى {imageProcessing}، اعثر على الأداة المثالية لاحتياجاتك.",
    "dashboard.categories.barcodeGeneration": "إنشاء الباركود",
    "dashboard.categories.imageProcessing": "معالجة الصور",
    "dashboard.categories.toolsCount": "{count} أداة",
    
    // Dashboard Benefits
    "dashboard.benefits.title": "لماذا تختار Aptexa ToolHub لاحتياجاتك المهنية",
    "dashboard.benefits.document.title": "معالجة متقدمة للمستندات",
    "dashboard.benefits.document.description1": "تشمل {pdfTools} إمكانيات الدمج والتقسيم والضغط والعلامة المائية. تمكن {eSignature} من توقيع المستندات القانونية مع إنشاء التوقيعات المدعوم بالذكاء الاصطناعي. معالجة ملفات متعددة بشكل متزامن مع بروتوكولات أمان على مستوى المؤسسات لضمان سرية مستنداتك.",
    "dashboard.benefits.document.description2": "تقنية OCR المتقدمة تستخرج النص من المستندات الممسوحة ضوئياً، بينما يقلل الضغط الذكي من أحجام الملفات دون فقدان الجودة. قدرات المعالجة المجمعة تتعامل مع مئات المستندات بكفاءة.",
    "dashboard.benefits.barcode.title": "إنشاء احترافي للباركود ورموز QR",
    "dashboard.benefits.barcode.description1": "إنشاء باركود معياري في الصناعة بما في ذلك {code128} و {qrCodes} و {dataMatrix} والرموز البريدية. يستخدم {barcodeScanner} رؤية الكمبيوتر المتقدمة لفك تشفير أي تنسيق باركود بمعدلات دقة عالية.",
    "dashboard.benefits.barcode.description2": "دعم لبطاقات العمل وتذاكر الأحداث وإدارة المخزون ومشاركة الواي فاي. قدرات الإنشاء الجماعي للتطبيقات المؤسسية مع خيارات العلامة التجارية المخصصة.",
    "dashboard.benefits.image.title": "معالجة شاملة للصور",
    "dashboard.benefits.image.description1": "{imageTools} احترافية لتغيير الحجم وتحويل التنسيق والضغط والتحرير. الميزات المتقدمة تشمل العلامات المائية وإزالة الخلفية والمعالجة المجمعة لملفات متعددة.",
    "dashboard.benefits.image.description2": "دعم لجميع التنسيقات الرئيسية بما في ذلك JPEG و PNG و WebP و SVG و TIFF. خوارزميات الضغط الذكية تحافظ على الجودة البصرية مع تقليل أحجام الملفات بشكل كبير.",
    "dashboard.benefits.developer.title": "أدوات المطورين والأعمال",
    "dashboard.benefits.developer.description1": "{developerTools} أساسية بما في ذلك مختبري regex ومدققي API ومفكك تشفير JWT ومنسقي الكود. ينشئ {invoiceGenerator} فواتير احترافية مع قوالب قابلة للتخصيص وحسابات تلقائية.",
    "dashboard.benefits.developer.description2": "أدوات معالجة النص لتحويل الحالات وإنشاء التجزئة وتحليل المحتوى. محولات العملة مع أسعار الصرف في الوقت الفعلي للعمليات التجارية الدولية.",
    "dashboard.features.security.title": "أمان على مستوى المؤسسات",
    "dashboard.features.security.description": "تتم جميع العمليات من جانب العميل في متصفحك. عدم نقل البيانات إلى خوادم خارجية يضمن الخصوصية الكاملة. مستنداتك ومعلوماتك الحساسة لا تغادر جهازك أبداً.",
    "dashboard.features.performance.title": "أداء محسن",
    "dashboard.features.performance.description": "معالجة فائقة السرعة مع استخدام الحد الأدنى من الموارد. الأدوات محسنة لكل من أجهزة سطح المكتب والأجهزة المحمولة، مما يضمن أداءً متسقاً عبر جميع المنصات.",
    "dashboard.features.accessibility.title": "إمكانية وصول شاملة",
    "dashboard.features.accessibility.description": "دعم متعدد اللغات كامل مع توافق للغات من اليمين إلى اليسار. التصميم المتجاوب يعمل بسلاسة على الهواتف الذكية والأجهزة اللوحية وأجهزة الكمبيوتر المكتبية.",
    "dashboard.features.business.title": "ميزات جاهزة للأعمال",
    "dashboard.features.business.description": "قوالب احترافية للفواتير والشهادات والوثائق التجارية. قدرات المعالجة المجمعة تتعامل مع أحجام كبيرة بكفاءة لسير العمل المؤسسي.",
    
    // Tool Overview Section
    "dashboard.tools.overview.title": "نظرة شاملة على مجموعة الأدوات الكاملة",
    "dashboard.tools.business.title": "أدوات الأعمال",
    "dashboard.tools.developer.title": "أدوات المطورين", 
    "dashboard.tools.content.title": "أدوات المحتوى",
    "dashboard.tools.invoice": "مولد الفواتير",
    "dashboard.tools.invoiceDesc": "إنشاء فواتير احترافية فورياً",
    "dashboard.tools.barcode": "مولد الباركود",
    "dashboard.tools.barcodeDesc": "دعم لأكثر من 15 تنسيق باركود",
    "dashboard.tools.qrcode": "مولد رمز QR",
    "dashboard.tools.qrcodeDesc": "رموز QR مخصصة مع الشعارات",
    "dashboard.tools.signature": "التوقيعات الرقمية",
    "dashboard.tools.signatureDesc": "إنشاء التوقيعات بقوة الذكاء الاصطناعي",
    "dashboard.tools.pdfsign": "التوقيع الإلكتروني PDF",
    "dashboard.tools.pdfsignDesc": "حل توقيع الوثائق القانونية",
    "dashboard.tools.regex": "اختبار Regex",
    "dashboard.tools.regexDesc": "مطابقة الأنماط والتحقق",
    "dashboard.tools.jwt": "فك تشفير JWT",
    "dashboard.tools.jwtDesc": "تحليل والتحقق من الرموز",
    "dashboard.tools.api": "اختبار API",
    "dashboard.tools.apiDesc": "اختبار نقاط نهاية REST",
    "dashboard.tools.cssmin": "مضغط CSS",
    "dashboard.tools.cssminDesc": "تحسين وضغط الكود",
    "dashboard.tools.jsmin": "مضغط JS",
    "dashboard.tools.jsminDesc": "تحسين ملفات JavaScript",
    "dashboard.tools.imagecomp": "ضاغط الصور",
    "dashboard.tools.imagecompDesc": "تقليل أحجام الملفات بنسبة 80%",
    "dashboard.tools.pdfmerge": "دمج PDF",
    "dashboard.tools.pdfmergeDesc": "دمج عدة مستندات",
    "dashboard.tools.textconv": "محول النص",
    "dashboard.tools.textconvDesc": "تحويل التنسيق",
    "dashboard.tools.colorconv": "محول الألوان",
    "dashboard.tools.colorconvDesc": "تحويل HEX، RGB، HSL",
    "dashboard.tools.password": "مولد كلمات المرور",
    "dashboard.tools.passwordDesc": "إنشاء كلمات مرور آمنة",
    
    // Security Section
    "dashboard.security.title": "التزام الأمان والخصوصية",
    "dashboard.security.protection.title": "حماية البيانات",
    "dashboard.security.protection.description": "تتم جميع العمليات محلياً في متصفحك. الملفات المرفوعة لأدوات مثل {pdfMerger} أو {imageCompressor} لا تُخزن أبداً على خوادمنا. تتم معالجة البيانات من جانب العميل ويتم التخلص منها فوراً بعد الاستخدام.",
    
    // Category Pages
    "category.notFound": "الفئة غير موجودة",
    "category.backToDashboard": "العودة إلى لوحة التحكم",
    "category.toolsCount": "أدوات",
    "category.useTool": "استخدام الأداة",
    
    // Tool Pages - Common Elements
    "tool.addToFavorites": "إضافة إلى المفضلة",
    "tool.removeFromFavorites": "إزالة من المفضلة",
    "tool.multipleFormats": "تنسيقات متعددة",
    "tool.multipleFormats.desc": "تحميل النتائج بتنسيقات مختلفة لأقصى توافق",
    "tool.mobileOptimized": "محسن للجوال",
    "tool.mobileOptimized.desc": "يعمل بشكل مثالي على جميع الأجهزة وأحجام الشاشات",
    "tool.securePrivate": "آمن وخاص",
    "tool.securePrivate.desc": "تتم جميع العمليات في متصفحك. بياناتك لا تغادر جهازك أبداً",
    
    // Lorem Ipsum Generator
    "lorem.title": "مولد Lorem Ipsum",
    "lorem.subtitle": "إنشاء نص تجريبي",
    "lorem.generate": "إنشاء",
    "lorem.paragraphs": "فقرات",
    "lorem.count": "العدد",
    "lorem.textType": "نوع النص",
    "lorem.loremIpsum": "Lorem Ipsum",
    "lorem.generateText": "إنشاء النص",
    
    // Text to Slug
    "textSlug.title": "النص إلى Slug",
    "textSlug.subtitle": "تحويل النص إلى slugs صديقة للروابط",
    "textSlug.inputText": "النص المدخل",
    "textSlug.enterText": "أدخل نصك هنا",
    "textSlug.maxLength": "الطول الأقصى (اختياري)",
    "textSlug.separator": "الفاصل",
    "textSlug.convertLowercase": "تحويل إلى أحرف صغيرة",
    "textSlug.removeDiacritics": "إزالة علامات التشكيل",
    "textSlug.generateSlug": "إنشاء Slug",
    "textSlug.generatedSlug": "Slug المنشأ",
    "textSlug.copying": "جاري النسخ...",
    
    // Lorem Generator additional keys
    "lorem.randomWords": "كلمات عشوائية",
    "lorem.words": "كلمات",
    "lorem.sentences": "جمل",
    "lorem.generatedText": "النص المنشأ",
    "lorem.copy": "نسخ",
    "lorem.clear": "مسح",
    
    // Tool Page
    "toolPage.notFound": "الأداة غير موجودة",
    "toolPage.addToFavorites": "إضافة إلى المفضلة",
    "toolPage.removeFromFavorites": "إزالة من المفضلة",
    
    // Case Converter
    "caseConverter.title": "محول الحالة",
    "caseConverter.inputText": "النص المدخل",
    "caseConverter.enterText": "أدخل نصك هنا...",
    "caseConverter.conversionType": "نوع التحويل",
    "caseConverter.uppercase": "أحرف كبيرة",
    "caseConverter.lowercase": "أحرف صغيرة",
    "caseConverter.titleCase": "حالة العنوان",
    "caseConverter.sentenceCase": "حالة الجملة",
    "caseConverter.camelCase": "camelCase",
    "caseConverter.pascalCase": "PascalCase",
    "caseConverter.snakeCase": "snake_case",
    "caseConverter.kebabCase": "kebab-case",
    "caseConverter.convertCase": "تحويل الحالة",
    "caseConverter.converting": "جاري التحويل...",
    "caseConverter.outputText": "النص الناتج",
    "caseConverter.copy": "نسخ",
    
    // Background Remover
    "backgroundRemover.title": "إزالة الخلفية",
    "backgroundRemover.subtitle": "إزالة الخلفيات من الصور",
    "backgroundRemover.uploadImage": "رفع صورة",
    "backgroundRemover.dropImage": "اسحب صورتك هنا",
    "backgroundRemover.clickToBrowse": "أو انقر للتصفح (حد أقصى 10 ميجابايت)",
    "backgroundRemover.chooseImage": "اختر صورة",
    "backgroundRemover.subjectType": "نوع الموضوع",
    "backgroundRemover.autoDetect": "كشف تلقائي",
    "backgroundRemover.outputSize": "حجم الإخراج",
    "backgroundRemover.auto": "تلقائي",
    "backgroundRemover.backgroundColor": "لون الخلفية (اختياري)",
    "backgroundRemover.outputFormat": "تنسيق الإخراج",
    "backgroundRemover.pngTransparent": "PNG (شفاف)",
    "backgroundRemover.autoCrop": "قص تلقائي",
    "backgroundRemover.addShadow": "إضافة ظل",
    "backgroundRemover.removeBackground": "إزالة الخلفية",
    "backgroundRemover.reset": "إعادة تعيين",
    
    // Image Cropper
    "imageCropper.title": "قص الصورة",
    "imageCropper.subtitle": "قص الصور إلى مناطق محددة",
    "imageCropper.uploadImage": "رفع صورة",
    "imageCropper.noFileChosen": "لم يتم اختيار ملف",
    "imageCropper.chooseFile": "اختر ملف",
    
    // Tool Cards and Actions
    "tools.useTool": "استخدم الأداة",
    "tools.analyzeColors": "تحليل الألوان",
    "tools.uploadImage": "رفع صورة",
    "tools.chooseFile": "اختر ملف",
    "tools.noFileChosen": "لم يتم اختيار ملف",
    
    // Tool Names
    "tools.background-remover": "إزالة الخلفية",
    "tools.background-remover.desc": "إزالة الخلفيات من الصور",
    "tools.image-crop": "قص الصورة", 
    "tools.image-crop.desc": "قص الصور إلى مناطق محددة",
    "tools.format-converter": "محول التنسيق",
    "tools.format-converter.desc": "التحويل بين تنسيقات الصور", 
    "tools.image-resize": "تغيير حجم الصورة",
    "tools.image-resize.desc": "تغيير حجم الصور إلى أبعاد محددة",
    "tools.image-watermark": "علامة مائية للصورة",
    "tools.image-watermark.desc": "إضافة علامات مائية للصور",
    "tools.color-palette-generator": "مولد لوحة الألوان",
    "tools.color-palette-generator.desc": "استخراج لوحات الألوان من الصور",
    "tools.image-compressor": "ضاغط الصور", 
    "tools.image-compressor.desc": "ضغط الصور لتقليل حجم الملف",
    "tools.favicon-generator": "مولد أيقونة الموقع",
    "tools.favicon-generator.desc": "إنشاء أيقونات مواقع من الصور",
    "tools.image-to-text": "الصورة إلى نص",
    "tools.image-to-text.desc": "استخراج النص من الصور (OCR)",
    
    // Footer sections
    "footer.enterpriseStandards": "معايير المؤسسات",
    "footer.dataProtection": "حماية البيانات", 
    "footer.securityCompliance": "مبني بروتوكولات أمان على مستوى المؤسسات. تشفير SSL يحمي جميع عمليات نقل البيانات. أدوات مثل",
    "footer.barcodeScanner": "ماسح الباركود",
    "footer.signatureGenerator": "مولد التوقيع", 
    "footer.professionalCompliance": "تلبي معايير الامتثال المهني",
    "footer.regularAudits": "عمليات التدقيق الأمني المنتظمة والتحديثات تضمن سلامة المنصة. متوافق مع جدران الحماية المؤسسية وسياسات الأمان. موثوق به من قبل آلاف المحترفين حول العالم للعمليات التجارية اليومية",
    "footer.privacyPolicy": "سياسة عدم جمع البيانات تضمن خصوصيتك. لا يتطلب تسجيل، لا توجد ملفات تعريف ارتباط للتتبع، ولا يتم تخزين معلومات شخصية. مثالي للتعامل مع الوثائق التجارية الحساسة والبيانات السرية",
    
    // Color Analyzer Tool
    "colorAnalyzer.title": "محلل الألوان",
    "colorAnalyzer.uploadImage": "رفع صورة",
    "colorAnalyzer.analyzeColors": "تحليل الألوان",
    "colorAnalyzer.noFileChosen": "لم يتم اختيار ملف",
    "colorAnalyzer.chooseFile": "اختر ملف",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("language") as Language;
      if (stored && stored in translations) {
        // Set initial direction
        document.documentElement.dir = stored === "ar" ? "rtl" : "ltr";
        document.documentElement.lang = stored;
        return stored;
      }
      
      const browserLang = navigator.language.split('-')[0] as Language;
      const lang = browserLang in translations ? browserLang : "en";
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
      return lang;
    }
    return "en";
  });

  const t = (key: string): string => {
    const langTranslations = translations[language as keyof typeof translations];
    if (!langTranslations) return key;
    
    const translation = langTranslations[key as keyof typeof langTranslations];
    return translation || key;
  };

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("language", lang);
    
    // Update document direction for RTL languages
    if (typeof document !== "undefined") {
      document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
      document.documentElement.lang = lang;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}