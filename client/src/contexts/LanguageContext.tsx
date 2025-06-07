import { createContext, useContext, useState } from "react";

export type Language = "en" | "es";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Header
    "header.title": "ToolHub",
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
    "dashboard.features.title": "Why Choose ToolHub?",
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
    "category.generator.title": "Generator Tools",
    "category.generator.description": "Create passwords, signatures, invoices and CSS gradients",
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
  },
  es: {
    // Header
    "header.title": "ToolHub",
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
    "dashboard.features.title": "¿Por qué elegir ToolHub?",
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
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("language") as Language;
      if (stored && stored in translations) return stored;
      
      const browserLang = navigator.language.split('-')[0] as Language;
      return browserLang in translations ? browserLang : "en";
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