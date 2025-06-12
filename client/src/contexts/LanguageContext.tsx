import { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "es" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
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
    "dashboard.hero.title": "Professional Online Tools",
    "dashboard.hero.description": "Access powerful tools to enhance your productivity and streamline your workflow - from {barcodes} and {pdfs} to {signatures} and {development} utilities.",
    "dashboard.hero.barcodes": "barcode generation",
    "dashboard.hero.pdfs": "PDF processing",
    "dashboard.hero.signatures": "digital signatures",
    "dashboard.hero.development": "development tools",
    "dashboard.stats.tools": "Total Tools",
    "dashboard.stats.categories": "Categories",
    "dashboard.stats.popular": "Most Popular",
    "dashboard.stats.popularTool": "PDF Tools",
    "dashboard.stats.free": "Free to Use",
    "dashboard.quickAccess": "Quick Access",
    "dashboard.allCategories": "All Tool Categories",
    "dashboard.popularTools": "Popular Tools",
    "dashboard.quickActions": "Quick Actions", 
    "dashboard.recentlyUsed": "Recently Used",
    "dashboard.quickAccess.title": "Quick Access",
    "dashboard.categories.title": "All Tool Categories",
    "dashboard.categories.description": "Explore our comprehensive collection of professional tools including {barcodeGeneration}, {imageProcessing}, and more advanced utilities.",
    "dashboard.categories.barcodeGeneration": "barcode generation",
    "dashboard.categories.imageProcessing": "image processing",
    "dashboard.categories.toolsCount": "{count} tools",

    // Navigation
    "nav.dashboard": "Dashboard",
    "nav.favorites": "Favorites", 
    "nav.recent": "Recent",

    // Categories
    "category.barcodes": "Barcodes & QR",
    "category.imageProcessing": "Image Processing",
    "category.textUtils": "Text Utilities",
    "category.webDeveloper": "Developer Tools",
    "category.converters": "Converters",
    "category.utilities": "Utilities",
    "category.generators": "Generators",
    "category.encoders": "Encoders",
    "category.security": "Security",
    "category.pdf": "PDF Tools",

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
    "backgroundRemover.subtitle": "Remove backgrounds from images automatically",
    "backgroundRemover.dropImage": "Drop your image here",
    "backgroundRemover.clickToBrowse": "or click to browse (max 10MB)",
    "backgroundRemover.chooseImage": "Choose Image",
    "backgroundRemover.outputSize": "Output Size",
    "backgroundRemover.subjectType": "Subject Type",
    "backgroundRemover.auto": "Auto",
    "backgroundRemover.autoDetect": "Auto Detect",
    "backgroundRemover.outputFormat": "Output Format",
    "backgroundRemover.transparent": "Transparent",
    "backgroundRemover.whiteBackground": "White background",
    "backgroundRemover.backgroundColor": "Background Color (optional)",
    "backgroundRemover.colorPlaceholder": "e.g., #ffffff or red",
    "backgroundRemover.autoCrop": "Auto Crop",
    "backgroundRemover.addShadow": "Add Shadow",
    "backgroundRemover.removeBackground": "Remove Background",
    "backgroundRemover.processing": "Processing...",
    "backgroundRemover.reset": "Reset",
    "backgroundRemover.aiProcessing": "AI is processing your image...",
    "backgroundRemover.creditsRemaining": "Credits remaining:",
    "backgroundRemover.unknown": "Unknown"
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
    "dashboard.hero.title": "Herramientas Profesionales en Línea",
    "dashboard.hero.description": "Accede a herramientas poderosas para mejorar tu productividad y optimizar tu flujo de trabajo - desde {barcodes} y {pdfs} hasta {signatures} y utilidades de {development}.",
    "dashboard.hero.barcodes": "generación de códigos de barras",
    "dashboard.hero.pdfs": "procesamiento de PDF",
    "dashboard.hero.signatures": "firmas digitales",
    "dashboard.hero.development": "herramientas de desarrollo",
    "dashboard.stats.tools": "Total de Herramientas",
    "dashboard.stats.categories": "Categorías",
    "dashboard.stats.popular": "Más Popular",
    "dashboard.stats.popularTool": "Herramientas PDF",
    "dashboard.stats.free": "Gratis de Usar",
    "dashboard.quickAccess": "Acceso Rápido",
    "dashboard.allCategories": "Todas las Categorías de Herramientas",
    "dashboard.popularTools": "Herramientas Populares",
    "dashboard.quickActions": "Acciones Rápidas",
    "dashboard.recentlyUsed": "Usadas Recientemente",
    "dashboard.quickAccess.title": "Acceso Rápido",
    "dashboard.categories.title": "Todas las Categorías de Herramientas",
    "dashboard.categories.description": "Explora nuestra colección completa de herramientas profesionales incluyendo {barcodeGeneration}, {imageProcessing}, y más utilidades avanzadas.",
    "dashboard.categories.barcodeGeneration": "generación de códigos de barras",
    "dashboard.categories.imageProcessing": "procesamiento de imágenes",
    "dashboard.categories.toolsCount": "{count} herramientas",

    // Navigation
    "nav.dashboard": "Panel",
    "nav.favorites": "Favoritos",
    "nav.recent": "Recientes",

    // Categories
    "category.barcodes": "Códigos de Barras y QR",
    "category.imageProcessing": "Procesamiento de Imágenes",
    "category.textUtils": "Utilidades de Texto",
    "category.webDeveloper": "Herramientas para Desarrolladores",
    "category.converters": "Convertidores",
    "category.utilities": "Utilidades",
    "category.generators": "Generadores",
    "category.encoders": "Codificadores",
    "category.security": "Seguridad",
    "category.pdf": "Herramientas PDF",

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
    "backgroundRemover.chooseImage": "Elegir Imagen",
    "backgroundRemover.outputSize": "Tamaño de Salida",
    "backgroundRemover.subjectType": "Tipo de Sujeto",
    "backgroundRemover.auto": "Automático",
    "backgroundRemover.autoDetect": "Detección Automática",
    "backgroundRemover.outputFormat": "Formato de Salida",
    "backgroundRemover.transparent": "Transparente",
    "backgroundRemover.whiteBackground": "Fondo blanco",
    "backgroundRemover.backgroundColor": "Color de Fondo (opcional)",
    "backgroundRemover.colorPlaceholder": "ej., #ffffff o rojo",
    "backgroundRemover.autoCrop": "Recorte Automático",
    "backgroundRemover.addShadow": "Añadir Sombra",
    "backgroundRemover.removeBackground": "Remover Fondo",
    "backgroundRemover.processing": "Procesando...",
    "backgroundRemover.reset": "Restablecer",
    "backgroundRemover.aiProcessing": "La IA está procesando tu imagen...",
    "backgroundRemover.creditsRemaining": "Créditos restantes:",
    "backgroundRemover.unknown": "Desconocido"
  },

  ar: {
    // Header
    "header.title": "Aptexa ToolHub",
    "header.subtitle": "أدوات احترافية عبر الإنترنت",
    "header.search": "البحث عن الأدوات...",
    "header.dashboard": "لوحة التحكم",
    "header.favorites": "المفضلة",
    "header.recent": "الحديثة",
    
    // Dashboard
    "dashboard.title": "أدوات احترافية عبر الإنترنت",
    "dashboard.description": "الوصول إلى أدوات قوية لتعزيز إنتاجيتك وتبسيط سير عملك",
    "dashboard.hero.title": "أدوات احترافية عبر الإنترنت",
    "dashboard.hero.description": "الوصول إلى أدوات قوية لتعزيز إنتاجيتك وتبسيط سير عملك - من {barcodes} و {pdfs} إلى {signatures} و أدوات {development}.",
    "dashboard.hero.barcodes": "إنشاء الباركود",
    "dashboard.hero.pdfs": "معالجة PDF",
    "dashboard.hero.signatures": "التوقيعات الرقمية",
    "dashboard.hero.development": "أدوات التطوير",
    "dashboard.stats.tools": "إجمالي الأدوات",
    "dashboard.stats.categories": "الفئات",
    "dashboard.stats.popular": "الأكثر شعبية",
    "dashboard.stats.popularTool": "أدوات PDF",
    "dashboard.stats.free": "مجاني للاستخدام",
    "dashboard.quickAccess": "الوصول السريع",
    "dashboard.allCategories": "جميع فئات الأدوات",
    "dashboard.popularTools": "الأدوات الشائعة",
    "dashboard.quickActions": "الإجراءات السريعة",
    "dashboard.recentlyUsed": "المستخدمة مؤخراً",
    "dashboard.quickAccess.title": "الوصول السريع",
    "dashboard.categories.title": "جميع فئات الأدوات",
    "dashboard.categories.description": "استكشف مجموعتنا الشاملة من الأدوات المهنية بما في ذلك {barcodeGeneration} و {imageProcessing} والمزيد من الأدوات المتقدمة.",
    "dashboard.categories.barcodeGeneration": "إنشاء الباركود",
    "dashboard.categories.imageProcessing": "معالجة الصور",
    "dashboard.categories.toolsCount": "{count} أدوات",

    // Navigation
    "nav.dashboard": "لوحة التحكم",
    "nav.favorites": "المفضلة",
    "nav.recent": "الحديثة",

    // Categories
    "category.barcodes": "الباركود و QR",
    "category.imageProcessing": "معالجة الصور",
    "category.textUtils": "أدوات النص",
    "category.webDeveloper": "أدوات المطورين",
    "category.converters": "المحولات",
    "category.utilities": "الأدوات المساعدة",
    "category.generators": "المولدات",
    "category.encoders": "المشفرات",
    "category.security": "الأمان",
    "category.pdf": "أدوات PDF",

    // Tool Features
    "toolPage.addToFavorites": "إضافة إلى المفضلة",
    "toolPage.removeFromFavorites": "إزالة من المفضلة",
    "tool.features": "الميزات الرئيسية",
    "tool.freeToUse": "مجاني للاستخدام",
    "tool.freeToUse.desc": "لا يتطلب تسجيل أو دفع",
    "tool.fastProcessing": "معالجة سريعة",
    "tool.fastProcessing.desc": "نتائج سريعة مع خوارزميات محسنة",
    "tool.multipleFormats": "تنسيقات متعددة",
    "tool.multipleFormats.desc": "يدعم تنسيقات إدخال وإخراج متنوعة",
    "tool.mobileOptimized": "محسن للجوال",
    "tool.mobileOptimized.desc": "يعمل بشكل مثالي على جميع الأجهزة وأحجام الشاشات",
    "tool.securePrivate": "آمن وخاص",
    "tool.securePrivate.desc": "تتم جميع العمليات محلياً دون جمع البيانات",

    // Background Remover
    "backgroundRemover.title": "إزالة الخلفية",
    "backgroundRemover.subtitle": "إزالة خلفيات الصور تلقائياً",
    "backgroundRemover.dropImage": "اسحب صورتك هنا",
    "backgroundRemover.clickToBrowse": "أو انقر للتصفح (حد أقصى 10 ميجا)",
    "backgroundRemover.chooseImage": "اختر صورة",
    "backgroundRemover.outputSize": "حجم الإخراج",
    "backgroundRemover.subjectType": "نوع الموضوع",
    "backgroundRemover.auto": "تلقائي",
    "backgroundRemover.autoDetect": "كشف تلقائي",
    "backgroundRemover.outputFormat": "تنسيق الإخراج",
    "backgroundRemover.transparent": "شفاف",
    "backgroundRemover.whiteBackground": "خلفية بيضاء",
    "backgroundRemover.backgroundColor": "لون الخلفية (اختياري)",
    "backgroundRemover.colorPlaceholder": "مثال: #ffffff أو أحمر",
    "backgroundRemover.autoCrop": "قص تلقائي",
    "backgroundRemover.addShadow": "إضافة ظل",
    "backgroundRemover.removeBackground": "إزالة الخلفية",
    "backgroundRemover.processing": "جاري المعالجة...",
    "backgroundRemover.reset": "إعادة تعيين",
    "backgroundRemover.aiProcessing": "الذكاء الاصطناعي يعالج صورتك...",
    "backgroundRemover.creditsRemaining": "الأرصدة المتبقية:",
    "backgroundRemover.unknown": "غير معروف"
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("language");
    return (saved as Language) || "en";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
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
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}