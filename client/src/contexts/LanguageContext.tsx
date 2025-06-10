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
    "header.title": "Aptexa's ToolHub",
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
    "category.barcode.title": "Barcode & QR Tools",
    "category.barcode.description": "Generate various types of barcodes, QR codes, and postal codes",
    "category.pdf.title": "PDF Tools",
    "category.pdf.description": "Convert, merge, split, compress and manipulate PDF documents",
    "category.image.title": "Image Tools",
    "category.image.description": "Resize, compress, convert and edit images in various formats",
    "category.text.title": "Text & Content Tools",
    "category.text.description": "Format, analyze and manipulate text content and code",
    "category.converter.title": "Converter Tools",
    "category.converter.description": "Convert units, currencies, colors and file formats",
    "category.converters.title": "Converters & Utilities",
    "category.converters.description": "Convert between different formats and units",
    "category.generator.title": "Generator Tools",
    "category.generator.description": "Create passwords, signatures, invoices and CSS gradients",
    "category.generators.title": "Generator Tools",
    "category.generators.description": "Create passwords, signatures, invoices and CSS gradients",
    "category.developer.title": "Developer Tools",
    "category.developer.description": "Web development utilities, validators and formatters",
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
  },
  es: {
    // Header
    "header.title": "Aptexa's ToolHub",
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
    "category.barcode.title": "Códigos de Barras y QR",
    "category.barcode.description": "Generar varios tipos de códigos de barras, códigos QR y códigos postales",
    "category.pdf.title": "Herramientas PDF",
    "category.pdf.description": "Convertir, fusionar, dividir, comprimir y manipular documentos PDF",
    "category.image.title": "Herramientas de Imagen",
    "category.image.description": "Redimensionar, comprimir, convertir y editar imágenes en varios formatos",
    "category.text.title": "Herramientas de Texto",
    "category.text.description": "Formatear, analizar y manipular contenido de texto y código",
    "category.converter.title": "Herramientas de Conversión",
    "category.converter.description": "Convertir unidades, monedas, colores y formatos de archivo",
    "category.generator.title": "Herramientas Generadoras",
    "category.generator.description": "Crear contraseñas, firmas, facturas y gradientes CSS",
    "category.developer.title": "Herramientas de Desarrollador",
    "category.developer.description": "Utilidades de desarrollo web, validadores y formateadores",
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
  },
  ar: {
    // Header
    "header.title": "Aptexa's ToolHub",
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
    "category.barcode.title": "أدوات الباركود و QR",
    "category.barcode.description": "إنشاء أنواع مختلفة من الباركود ورموز QR والرموز البريدية",
    "category.pdf.title": "أدوات PDF",
    "category.pdf.description": "تحويل ودمج وتقسيم وضغط ومعالجة مستندات PDF",
    "category.image.title": "أدوات الصور",
    "category.image.description": "تغيير الحجم والضغط والتحويل وتحرير الصور بتنسيقات مختلفة",
    "category.text.title": "أدوات النص والمحتوى",
    "category.text.description": "تنسيق وتحليل ومعالجة محتوى النص والكود",
    "category.converter.title": "أدوات التحويل",
    "category.converter.description": "تحويل الوحدات والعملات والألوان وتنسيقات الملفات",
    "category.converters.title": "المحولات والأدوات المساعدة",
    "category.converters.description": "التحويل بين التنسيقات والوحدات المختلفة",
    "category.generator.title": "أدوات الإنشاء",
    "category.generator.description": "إنشاء كلمات المرور والتوقيعات والفواتير وتدرجات CSS",
    "category.generators.title": "أدوات الإنشاء",
    "category.generators.description": "إنشاء كلمات المرور والتوقيعات والفواتير وتدرجات CSS",
    "category.developer.title": "أدوات المطورين",
    "category.developer.description": "أدوات تطوير الويب والمدققات والمنسقات",
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