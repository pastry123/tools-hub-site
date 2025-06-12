import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "es" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.favorites": "Favorites",
    "nav.recent": "Recent",

    // Header
    "header.language": "Language",
    "header.toggleTheme": "Toggle theme",

    // Dashboard
    "dashboard.title": "50+ Free Online Utilities",
    "dashboard.subtitle": "Professional tools for developers, businesses, and content creators",
    "dashboard.searchPlaceholder": "Search tools...",
    "dashboard.allCategories": "All Categories",
    "dashboard.category.barcodes": "Barcodes & QR",
    "dashboard.category.imageProcessing": "Image Processing",
    "dashboard.category.textUtils": "Text Utilities",
    "dashboard.category.webDeveloper": "Developer Tools",
    "dashboard.category.converters": "Converters",
    "dashboard.category.utilities": "Utilities",
    "dashboard.category.generators": "Generators",
    "dashboard.category.encoders": "Encoders",
    "dashboard.category.security": "Security",
    "dashboard.category.pdf": "PDF Tools",

    // Category Detail Page
    "categoryDetail.backToDashboard": "← Back to Dashboard",
    "categoryDetail.toolsInCategory": "Tools in {category}",

    // Tool Features
    "toolPage.addToFavorites": "Add to Favorites",
    "toolPage.removeFromFavorites": "Remove from Favorites",
    "tool.features": "Key Features",
    "tool.freeToUse": "Free to Use",
    "tool.freeToUse.desc": "No registration or payment required",
    "tool.fastProcessing": "Fast Processing",
    "tool.fastProcessing.desc": "Quick results with optimized algorithms",
    "tool.multipleFormats": "Multiple Formats",
    "tool.multipleFormats.desc": "Supports various input and output formats",
    "tool.mobileOptimized": "Mobile Optimized",
    "tool.mobileOptimized.desc": "Works perfectly on all devices and screen sizes",
    "tool.securePrivate": "Secure & Private",
    "tool.securePrivate.desc": "All processing happens locally with no data collection",

    // Background Remover
    "backgroundRemover.title": "Background Remover",
    "backgroundRemover.subtitle": "Remove image backgrounds automatically",
    "backgroundRemover.dropImage": "Drop your image here",
    "backgroundRemover.clickToBrowse": "or click to browse (max 10MB)",
    "backgroundRemover.chooseImage": "Choose image",
    "backgroundRemover.subjectType": "Subject Type",
    "backgroundRemover.autoDetect": "Auto Detect",
    "backgroundRemover.outputSize": "Output Size",
    "backgroundRemover.auto": "Auto",
    "backgroundRemover.backgroundColorOptional": "Background Color (optional)",
    "backgroundRemover.outputFormat": "Output Format",
    "backgroundRemover.pngTransparent": "PNG (Transparent)",
    "backgroundRemover.autoCrop": "Auto Crop",
    "backgroundRemover.addShadow": "Add Shadow",
    "backgroundRemover.removeBackground": "Remove Background",
    "backgroundRemover.reset": "Reset",
    "backgroundRemover.creditsRemaining": "Credits remaining:",
    "backgroundRemover.unknown": "Unknown",

    // Image Cropper
    "imageCropper.title": "Image Cropper",
    "imageCropper.uploadImage": "Upload Image",
    "imageCropper.noFileChosen": "No file chosen",
    "imageCropper.chooseFile": "Choose File",

    // Image Converter
    "imageConverter.title": "Image Converter",
    "imageConverter.convertToFormat": "Convert to Format",
    "imageConverter.uploadImage": "Upload Image",
    "imageConverter.noFileChosen": "No file chosen",
    "imageConverter.chooseFile": "Choose File",
    "imageConverter.convertTo": "Convert to",
    "imageConverter.losslessCompression": "Lossless compression, supports transparency",
    "imageConverter.supportedInputFormats": "Supported input formats:",
    "imageConverter.outputFormats": "Output formats:",
    "imageConverter.formats10Including": "10 formats including modern AVIF and HEIC",

    // Image Resizer
    "imageResizer.title": "Image Resizer",
    "imageResizer.uploadImage": "Upload Image",
    "imageResizer.noFileChosen": "No file chosen",
    "imageResizer.chooseFile": "Choose File",
    "imageResizer.heightPixels": "Height (pixels)",
    "imageResizer.widthPixels": "Width (pixels)",
    "imageResizer.outputFormat": "Output Format",
    "imageResizer.maintainAspectRatio": "Maintain aspect ratio",
    "imageResizer.resizeImage": "Resize Image",

    // Image Watermark
    "imageWatermark.title": "Image Watermark",
    "imageWatermark.uploadImage": "Upload Image",
    "imageWatermark.noFileChosen": "No file chosen",
    "imageWatermark.chooseFile": "Choose File",

    // Image Compressor
    "imageCompressor.title": "Image Compressor",
    "imageCompressor.dragAndDrop": "Drag and drop an image here or click to browse",
    "imageCompressor.chooseImageFile": "Choose Image File",

    // Barcode Generator
    "barcodeGenerator.title": "Barcode & QR Code Generator",
    "barcodeGenerator.subtitle": "Generate 85+ barcode types including QR codes, linear barcodes, postal codes, business cards, Wi-Fi, events, and specialty formats",
    "barcodeGenerator.barcodeType": "Barcode Type",
    "barcodeGenerator.available": "available",
    "barcodeGenerator.searchTypes": "Search barcode types...",
    "barcodeGenerator.data": "Data/Text",
    "barcodeGenerator.placeholder": "Enter your text or data",
    "barcodeGenerator.size": "Size",
    "barcodeGenerator.width": "Width",
    "barcodeGenerator.height": "Height",
    "barcodeGenerator.generateBarcode": "Generate Barcode",
    "barcodeGenerator.downloadPNG": "Download PNG",
    "barcodeGenerator.downloadSVG": "Download SVG",

    // Barcode Scanner
    "barcodeScanner.title": "Barcode & QR Code Scanner",
    "barcodeScanner.subtitle": "Scan barcodes and QR codes using your camera or upload images",
    "barcodeScanner.useCamera": "Use Camera",
    "barcodeScanner.uploadImage": "Upload Image",
    "barcodeScanner.scanFromCamera": "Scan from Camera",
    "barcodeScanner.scanFromFile": "Scan from File",
    "barcodeScanner.result": "Scan Result:",
    "barcodeScanner.noResultFound": "No barcode found in the image",
    "barcodeScanner.cameraNotSupported": "Camera not supported in this browser",

    // RFID Reader
    "rfidReader.title": "RFID Tag Reader & Decoder",
    "rfidReader.subtitle": "Read and interpret data from RFID tags via NFC-enabled devices",
    "rfidReader.startReading": "Start Reading",
    "rfidReader.stopReading": "Stop Reading",
    "rfidReader.result": "Tag Data:",
    "rfidReader.noNFCSupport": "NFC not supported in this browser",
    "rfidReader.readingInstructions": "Bring your device close to an RFID/NFC tag",

    // Bulk Barcode Generator
    "bulkBarcodeGenerator.title": "Bulk Barcode Generator",
    "bulkBarcodeGenerator.subtitle": "Generate multiple barcodes at once from CSV or text input",
    "bulkBarcodeGenerator.inputMethod": "Input Method",
    "bulkBarcodeGenerator.textInput": "Text Input",
    "bulkBarcodeGenerator.csvUpload": "CSV Upload",
    "bulkBarcodeGenerator.barcodeType": "Barcode Type",
    "bulkBarcodeGenerator.dataInput": "Data Input (one per line)",
    "bulkBarcodeGenerator.uploadCSV": "Upload CSV File",
    "bulkBarcodeGenerator.generateAll": "Generate All",
    "bulkBarcodeGenerator.downloadZip": "Download ZIP",

    // Barcode Types
    "qrcode.title": "QR Code",
    "code128.title": "Code 128",
    "code39.title": "Code 39",
    "ean13.title": "EAN-13",
    "ean8.title": "EAN-8",
    "upca.title": "UPC-A",
    "upce.title": "UPC-E",
    "datamatrix.title": "Data Matrix",
    "pdf417.title": "PDF417",
    "aztec.title": "Aztec Code"
  },

  es: {
    // Navigation
    "nav.dashboard": "Panel",
    "nav.favorites": "Favoritos",
    "nav.recent": "Recientes",

    // Header
    "header.language": "Idioma",
    "header.toggleTheme": "Cambiar tema",

    // Dashboard
    "dashboard.title": "50+ Utilidades Gratuitas en Línea",
    "dashboard.subtitle": "Herramientas profesionales para desarrolladores, empresas y creadores de contenido",
    "dashboard.searchPlaceholder": "Buscar herramientas...",
    "dashboard.allCategories": "Todas las Categorías",
    "dashboard.category.barcodes": "Códigos de Barras y QR",
    "dashboard.category.imageProcessing": "Procesamiento de Imágenes",
    "dashboard.category.textUtils": "Utilidades de Texto",
    "dashboard.category.webDeveloper": "Herramientas para Desarrolladores",
    "dashboard.category.converters": "Convertidores",
    "dashboard.category.utilities": "Utilidades",
    "dashboard.category.generators": "Generadores",
    "dashboard.category.encoders": "Codificadores",
    "dashboard.category.security": "Seguridad",
    "dashboard.category.pdf": "Herramientas PDF",

    // Category Detail Page
    "categoryDetail.backToDashboard": "← Volver al Panel",
    "categoryDetail.toolsInCategory": "Herramientas en {category}",

    // Tool Features
    "toolPage.addToFavorites": "Añadir a Favoritos",
    "toolPage.removeFromFavorites": "Quitar de Favoritos",
    "tool.features": "Características Principales",
    "tool.freeToUse": "Gratuito",
    "tool.freeToUse.desc": "No requiere registro ni pago",
    "tool.fastProcessing": "Procesamiento Rápido",
    "tool.fastProcessing.desc": "Resultados rápidos con algoritmos optimizados",
    "tool.multipleFormats": "Múltiples Formatos",
    "tool.multipleFormats.desc": "Soporta varios formatos de entrada y salida",
    "tool.mobileOptimized": "Optimizado para Móviles",
    "tool.mobileOptimized.desc": "Funciona perfectamente en todos los dispositivos y tamaños de pantalla",
    "tool.securePrivate": "Seguro y Privado",
    "tool.securePrivate.desc": "Todo el procesamiento ocurre localmente sin recopilación de datos",

    // Background Remover
    "backgroundRemover.title": "Removedor de Fondo",
    "backgroundRemover.subtitle": "Remover fondos de imágenes automáticamente",
    "backgroundRemover.dropImage": "Suelta tu imagen aquí",
    "backgroundRemover.clickToBrowse": "o haz clic para navegar (máx 10MB)",
    "backgroundRemover.chooseImage": "Elegir imagen",
    "backgroundRemover.subjectType": "Tipo de Sujeto",
    "backgroundRemover.autoDetect": "Detección Automática",
    "backgroundRemover.outputSize": "Tamaño de Salida",
    "backgroundRemover.auto": "Automático",
    "backgroundRemover.backgroundColorOptional": "Color de Fondo (opcional)",
    "backgroundRemover.outputFormat": "Formato de Salida",
    "backgroundRemover.pngTransparent": "PNG (Transparente)",
    "backgroundRemover.autoCrop": "Recorte Automático",
    "backgroundRemover.addShadow": "Añadir Sombra",
    "backgroundRemover.removeBackground": "Remover Fondo",
    "backgroundRemover.reset": "Restablecer",
    "backgroundRemover.creditsRemaining": "Créditos restantes:",
    "backgroundRemover.unknown": "Desconocido",

    // Image Cropper
    "imageCropper.title": "Recortador de Imágenes",
    "imageCropper.uploadImage": "Subir Imagen",
    "imageCropper.noFileChosen": "No se ha elegido archivo",
    "imageCropper.chooseFile": "Elegir Archivo",

    // Image Converter
    "imageConverter.title": "Convertidor de Imágenes",
    "imageConverter.convertToFormat": "Convertir a Formato",
    "imageConverter.uploadImage": "Subir Imagen",
    "imageConverter.noFileChosen": "No se ha elegido archivo",
    "imageConverter.chooseFile": "Elegir Archivo",
    "imageConverter.convertTo": "Convertir a",
    "imageConverter.losslessCompression": "Compresión sin pérdida, soporta transparencia",
    "imageConverter.supportedInputFormats": "Formatos de entrada soportados:",
    "imageConverter.outputFormats": "Formatos de salida:",
    "imageConverter.formats10Including": "10 formatos incluyendo AVIF y HEIC modernos",

    // Image Resizer
    "imageResizer.title": "Redimensionador de Imágenes",
    "imageResizer.uploadImage": "Subir Imagen",
    "imageResizer.noFileChosen": "No se ha elegido archivo",
    "imageResizer.chooseFile": "Elegir Archivo",
    "imageResizer.heightPixels": "Altura (píxeles)",
    "imageResizer.widthPixels": "Ancho (píxeles)",
    "imageResizer.outputFormat": "Formato de Salida",
    "imageResizer.maintainAspectRatio": "Mantener relación de aspecto",
    "imageResizer.resizeImage": "Redimensionar Imagen",

    // Image Watermark
    "imageWatermark.title": "Marca de Agua de Imagen",
    "imageWatermark.uploadImage": "Subir Imagen",
    "imageWatermark.noFileChosen": "No se ha elegido archivo",
    "imageWatermark.chooseFile": "Elegir Archivo",

    // Image Compressor
    "imageCompressor.title": "Compresor de Imágenes",
    "imageCompressor.dragAndDrop": "Arrastra y suelta una imagen aquí o haz clic para navegar",
    "imageCompressor.chooseImageFile": "Elegir Archivo de Imagen",

    // Barcode Generator
    "barcodeGenerator.title": "Generador de Códigos de Barras y QR",
    "barcodeGenerator.subtitle": "Genera más de 85 tipos de códigos de barras",
    "barcodeGenerator.barcodeType": "Tipo de Código de Barras",
    "barcodeGenerator.available": "disponibles",
    "barcodeGenerator.searchTypes": "Buscar tipos de códigos...",
    "barcodeGenerator.data": "Datos/Texto",
    "barcodeGenerator.placeholder": "Ingresa tu texto o datos",
    "barcodeGenerator.size": "Tamaño",
    "barcodeGenerator.width": "Ancho",
    "barcodeGenerator.height": "Alto",
    "barcodeGenerator.generateBarcode": "Generar Código",
    "barcodeGenerator.downloadPNG": "Descargar PNG",
    "barcodeGenerator.downloadSVG": "Descargar SVG",

    // Barcode Scanner
    "barcodeScanner.title": "Escáner de Códigos de Barras y QR",
    "barcodeScanner.subtitle": "Escanea códigos de barras y QR usando tu cámara o subiendo imágenes",
    "barcodeScanner.useCamera": "Usar Cámara",
    "barcodeScanner.uploadImage": "Subir Imagen",
    "barcodeScanner.scanFromCamera": "Escanear desde Cámara",
    "barcodeScanner.scanFromFile": "Escanear desde Archivo",
    "barcodeScanner.result": "Resultado del Escaneo:",
    "barcodeScanner.noResultFound": "No se encontró código de barras en la imagen",
    "barcodeScanner.cameraNotSupported": "Cámara no soportada en este navegador",

    // RFID Reader
    "rfidReader.title": "Lector y Decodificador de Etiquetas RFID",
    "rfidReader.subtitle": "Lee e interpreta datos de etiquetas RFID a través de dispositivos con NFC",
    "rfidReader.startReading": "Iniciar Lectura",
    "rfidReader.stopReading": "Detener Lectura",
    "rfidReader.result": "Datos de la Etiqueta:",
    "rfidReader.noNFCSupport": "NFC no soportado en este navegador",
    "rfidReader.readingInstructions": "Acerca tu dispositivo a una etiqueta RFID/NFC",

    // Bulk Barcode Generator
    "bulkBarcodeGenerator.title": "Generador de Códigos en Lote",
    "bulkBarcodeGenerator.subtitle": "Genera múltiples códigos de barras a la vez desde CSV o entrada de texto",
    "bulkBarcodeGenerator.inputMethod": "Método de Entrada",
    "bulkBarcodeGenerator.textInput": "Entrada de Texto",
    "bulkBarcodeGenerator.csvUpload": "Subida de CSV",
    "bulkBarcodeGenerator.barcodeType": "Tipo de Código de Barras",
    "bulkBarcodeGenerator.dataInput": "Entrada de Datos (uno por línea)",
    "bulkBarcodeGenerator.uploadCSV": "Subir Archivo CSV",
    "bulkBarcodeGenerator.generateAll": "Generar Todos",
    "bulkBarcodeGenerator.downloadZip": "Descargar ZIP",

    // Barcode Types
    "qrcode.title": "Código QR",
    "code128.title": "Código 128",
    "code39.title": "Código 39",
    "ean13.title": "EAN-13",
    "ean8.title": "EAN-8",
    "upca.title": "UPC-A",
    "upce.title": "UPC-E",
    "datamatrix.title": "Matriz de Datos",
    "pdf417.title": "PDF417",
    "aztec.title": "Código Azteca"
  },

  ar: {
    // Navigation
    "nav.dashboard": "لوحة التحكم",
    "nav.favorites": "المفضلة",
    "nav.recent": "الحديثة",

    // Header
    "header.language": "اللغة",
    "header.toggleTheme": "تغيير المظهر",

    // Dashboard
    "dashboard.title": "50+ أداة مجانية عبر الإنترنت",
    "dashboard.subtitle": "أدوات احترافية للمطورين والشركات ومنشئي المحتوى",
    "dashboard.searchPlaceholder": "البحث عن الأدوات...",
    "dashboard.allCategories": "جميع الفئات",
    "dashboard.category.barcodes": "الباركود و QR",
    "dashboard.category.imageProcessing": "معالجة الصور",
    "dashboard.category.textUtils": "أدوات النصوص",
    "dashboard.category.webDeveloper": "أدوات المطورين",
    "dashboard.category.converters": "المحولات",
    "dashboard.category.utilities": "الأدوات المساعدة",
    "dashboard.category.generators": "المولدات",
    "dashboard.category.encoders": "المشفرات",
    "dashboard.category.security": "الأمان",
    "dashboard.category.pdf": "أدوات PDF",

    // Category Detail Page
    "categoryDetail.backToDashboard": "← العودة للوحة التحكم",
    "categoryDetail.toolsInCategory": "الأدوات في {category}",

    // Tool Features
    "toolPage.addToFavorites": "إضافة للمفضلة",
    "toolPage.removeFromFavorites": "إزالة من المفضلة",
    "tool.features": "الميزات الرئيسية",
    "tool.freeToUse": "مجاني الاستخدام",
    "tool.freeToUse.desc": "لا يتطلب تسجيل أو دفع",
    "tool.fastProcessing": "معالجة سريعة",
    "tool.fastProcessing.desc": "نتائج سريعة مع خوارزميات محسنة",
    "tool.multipleFormats": "تنسيقات متعددة",
    "tool.multipleFormats.desc": "يدعم تنسيقات الإدخال والإخراج المختلفة",
    "tool.mobileOptimized": "محسن للجوال",
    "tool.mobileOptimized.desc": "يعمل بشكل مثالي على جميع الأجهزة وأحجام الشاشات",
    "tool.securePrivate": "آمن وخاص",
    "tool.securePrivate.desc": "تتم جميع المعالجات محلياً بدون جمع البيانات",

    // Background Remover
    "backgroundRemover.title": "مزيل الخلفية",
    "backgroundRemover.subtitle": "إزالة خلفيات الصور تلقائياً",
    "backgroundRemover.dropImage": "اسحب صورتك هنا",
    "backgroundRemover.clickToBrowse": "أو انقر للتصفح (الحد الأقصى 10 ميجا)",
    "backgroundRemover.chooseImage": "اختر صورة",
    "backgroundRemover.subjectType": "نوع الموضوع",
    "backgroundRemover.autoDetect": "كشف تلقائي",
    "backgroundRemover.outputSize": "حجم الإخراج",
    "backgroundRemover.auto": "تلقائي",
    "backgroundRemover.backgroundColorOptional": "لون الخلفية (اختياري)",
    "backgroundRemover.outputFormat": "تنسيق الإخراج",
    "backgroundRemover.pngTransparent": "PNG (شفاف)",
    "backgroundRemover.autoCrop": "قص تلقائي",
    "backgroundRemover.addShadow": "إضافة ظل",
    "backgroundRemover.removeBackground": "إزالة الخلفية",
    "backgroundRemover.reset": "إعادة تعيين",
    "backgroundRemover.creditsRemaining": "الرصيد المتبقي:",
    "backgroundRemover.unknown": "غير معروف",

    // Image Cropper
    "imageCropper.title": "قص الصورة",
    "imageCropper.uploadImage": "رفع صورة",
    "imageCropper.noFileChosen": "لم يتم اختيار ملف",
    "imageCropper.chooseFile": "اختر ملف",

    // Image Converter
    "imageConverter.title": "محول التنسيق",
    "imageConverter.convertToFormat": "التحويل إلى تنسيق",
    "imageConverter.uploadImage": "رفع صورة",
    "imageConverter.noFileChosen": "لم يتم اختيار ملف",
    "imageConverter.chooseFile": "اختر ملف",
    "imageConverter.convertTo": "تحويل إلى",
    "imageConverter.losslessCompression": "ضغط بدون فقدان، يدعم الشفافية",
    "imageConverter.supportedInputFormats": "تنسيقات الإدخال المدعومة:",
    "imageConverter.outputFormats": "تنسيقات الإخراج:",
    "imageConverter.formats10Including": "10 تنسيقات تشمل AVIF و HEIC الحديثة",

    // Image Resizer
    "imageResizer.title": "تغيير حجم الصورة",
    "imageResizer.uploadImage": "رفع صورة",
    "imageResizer.noFileChosen": "لم يتم اختيار ملف",
    "imageResizer.chooseFile": "اختر ملف",
    "imageResizer.heightPixels": "الارتفاع (بكسل)",
    "imageResizer.widthPixels": "العرض (بكسل)",
    "imageResizer.outputFormat": "تنسيق الإخراج",
    "imageResizer.maintainAspectRatio": "الحفاظ على نسبة العرض إلى الارتفاع",
    "imageResizer.resizeImage": "تغيير حجم الصورة",

    // Image Watermark
    "imageWatermark.title": "علامة مائية للصورة",
    "imageWatermark.uploadImage": "رفع صورة",
    "imageWatermark.noFileChosen": "لم يتم اختيار ملف",
    "imageWatermark.chooseFile": "اختر ملف",

    // Image Compressor
    "imageCompressor.title": "ضاغط الصور",
    "imageCompressor.dragAndDrop": "اسحب وأفلت صورة هنا أو انقر للتصفح",
    "imageCompressor.chooseImageFile": "اختر ملف صورة",

    // Barcode Generator
    "barcodeGenerator.title": "مولد الباركود و QR",
    "barcodeGenerator.subtitle": "إنتاج أكثر من 85 نوع من أكواد الباركود",
    "barcodeGenerator.barcodeType": "نوع الباركود",
    "barcodeGenerator.available": "متاح",
    "barcodeGenerator.searchTypes": "البحث عن أنواع الباركود...",
    "barcodeGenerator.data": "البيانات/النص",
    "barcodeGenerator.placeholder": "أدخل النص أو البيانات",
    "barcodeGenerator.size": "الحجم",
    "barcodeGenerator.width": "العرض",
    "barcodeGenerator.height": "الارتفاع",
    "barcodeGenerator.generateBarcode": "إنشاء الباركود",
    "barcodeGenerator.downloadPNG": "تحميل PNG",
    "barcodeGenerator.downloadSVG": "تحميل SVG",

    // Barcode Scanner
    "barcodeScanner.title": "ماسح الباركود و QR",
    "barcodeScanner.subtitle": "مسح أكواد الباركود و QR باستخدام الكاميرا أو رفع الصور",
    "barcodeScanner.useCamera": "استخدم الكاميرا",
    "barcodeScanner.uploadImage": "رفع صورة",
    "barcodeScanner.scanFromCamera": "مسح من الكاميرا",
    "barcodeScanner.scanFromFile": "مسح من ملف",
    "barcodeScanner.result": "نتيجة المسح:",
    "barcodeScanner.noResultFound": "لم يتم العثور على باركود في الصورة",
    "barcodeScanner.cameraNotSupported": "الكاميرا غير مدعومة في هذا المتصفح",

    // RFID Reader
    "rfidReader.title": "قارئ ومفكك شفرة علامات RFID",
    "rfidReader.subtitle": "قراءة وتفسير البيانات من علامات RFID عبر الأجهزة المزودة بـ NFC",
    "rfidReader.startReading": "بدء القراءة",
    "rfidReader.stopReading": "إيقاف القراءة",
    "rfidReader.result": "بيانات العلامة:",
    "rfidReader.noNFCSupport": "NFC غير مدعوم في هذا المتصفح",
    "rfidReader.readingInstructions": "قرب جهازك من علامة RFID/NFC",

    // Bulk Barcode Generator
    "bulkBarcodeGenerator.title": "مولد الباركود بالجملة",
    "bulkBarcodeGenerator.subtitle": "إنتاج عدة أكواد باركود في مرة واحدة من CSV أو إدخال نصي",
    "bulkBarcodeGenerator.inputMethod": "طريقة الإدخال",
    "bulkBarcodeGenerator.textInput": "إدخال نصي",
    "bulkBarcodeGenerator.csvUpload": "رفع CSV",
    "bulkBarcodeGenerator.barcodeType": "نوع الباركود",
    "bulkBarcodeGenerator.dataInput": "إدخال البيانات (واحد في كل سطر)",
    "bulkBarcodeGenerator.uploadCSV": "رفع ملف CSV",
    "bulkBarcodeGenerator.generateAll": "إنتاج الكل",
    "bulkBarcodeGenerator.downloadZip": "تحميل ZIP",

    // Barcode Types
    "qrcode.title": "رمز QR",
    "code128.title": "كود 128",
    "code39.title": "كود 39",
    "ean13.title": "EAN-13",
    "ean8.title": "EAN-8",
    "upca.title": "UPC-A",
    "upce.title": "UPC-E",
    "datamatrix.title": "مصفوفة البيانات",
    "pdf417.title": "PDF417",
    "aztec.title": "كود الأزتك"
  }
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("language");
      if (saved && ["en", "es", "ar"].includes(saved)) {
        return saved as Language;
      }
      
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith("es")) return "es";
      if (browserLang.startsWith("ar")) return "ar";
    }
    return "en";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem("language", lang);
      
      if (lang === "ar") {
        document.documentElement.setAttribute("dir", "rtl");
        document.documentElement.setAttribute("lang", "ar");
      } else {
        document.documentElement.setAttribute("dir", "ltr");
        document.documentElement.setAttribute("lang", lang);
      }
    }
  };

  useEffect(() => {
    handleSetLanguage(language);
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === "object" && k in value) {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === "string" ? value : key;
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