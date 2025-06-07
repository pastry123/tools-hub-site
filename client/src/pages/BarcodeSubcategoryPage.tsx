import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import Breadcrumb from "@/components/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { toolCategories } from "@/lib/toolCategories";
import { QrCode, ArrowRight } from "lucide-react";

export default function BarcodeSubcategoryPage() {
  const { subcategoryId } = useParams<{ subcategoryId: string }>();
  const { t } = useLanguage();

  // Find the barcode category and specific subcategory
  const barcodeCategory = toolCategories.find((cat: any) => cat.id === "barcodes");
  const subcategory = barcodeCategory?.subcategories?.find((sub: any) => sub.id === subcategoryId);

  if (!subcategory) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Subcategory Not Found</h1>
          <p className="text-slate-600 dark:text-gray-300 mt-2">The requested barcode subcategory could not be found.</p>
          <Link href="/barcodes" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            ← Back to Barcode Categories
          </Link>
        </div>
      </main>
    );
  }

  const breadcrumbItems = [
    { name: t("header.dashboard"), href: "/" },
    { name: t("category.barcode.title"), href: "/barcodes" },
    { name: subcategory.name }
  ];

  const getSubcategoryIcon = (subcategoryId: string) => {
    const iconMap: Record<string, string> = {
      'linear-codes': 'fas fa-barcode',
      'postal-codes': 'fas fa-mail-bulk',
      'gs1-databar': 'fas fa-layer-group',
      'ean-upc': 'fas fa-tag',
      '2d-codes': 'fas fa-qrcode',
      'gs1-2d': 'fas fa-qrcode',
      'banking-payments': 'fas fa-credit-card',
      'mobile-tagging': 'fas fa-mobile-alt',
      'healthcare-codes': 'fas fa-heartbeat',
      'isbn-codes': 'fas fa-book',
      'business-cards': 'fas fa-address-card',
      'event-barcodes': 'fas fa-calendar',
      'wifi-barcodes': 'fas fa-wifi'
    };
    return iconMap[subcategoryId] || 'fas fa-barcode';
  };

  const getSubcategoryColor = (subcategoryId: string) => {
    const colorMap: Record<string, string> = {
      'linear-codes': 'blue',
      'postal-codes': 'green',
      'gs1-databar': 'purple',
      'ean-upc': 'orange',
      '2d-codes': 'indigo',
      'gs1-2d': 'teal',
      'banking-payments': 'emerald',
      'mobile-tagging': 'pink',
      'healthcare-codes': 'red',
      'isbn-codes': 'amber',
      'business-cards': 'slate',
      'event-barcodes': 'rose',
      'wifi-barcodes': 'cyan'
    };
    return colorMap[subcategoryId] || 'blue';
  };

  const subcategoryColor = getSubcategoryColor(subcategoryId!);
  const subcategoryIcon = getSubcategoryIcon(subcategoryId!);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mt-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className={`inline-flex items-center justify-center w-16 h-16 bg-${subcategoryColor}-100 dark:bg-${subcategoryColor}-900 rounded-full mb-4`}>
            <i className={`${subcategoryIcon} text-2xl text-${subcategoryColor}-600 dark:text-${subcategoryColor}-400`}></i>
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
            {subcategory.name}
          </h1>
          <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
            {subcategory.description}
          </p>
          <div className="mt-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {subcategory.tools.length} Available Tools
            </span>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {subcategory.tools.map((tool: any) => (
            <Link 
              key={tool.id} 
              href={`/tool/${tool.id}`}
              className="group"
            >
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 bg-${subcategoryColor}-100 dark:bg-${subcategoryColor}-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <i className={`${tool.icon} text-${subcategoryColor}-600 dark:text-${subcategoryColor}-400`}></i>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                      {tool.name}
                    </h3>
                    
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center justify-center w-full pt-2 border-t border-slate-100 dark:border-gray-700">
                      <span className="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex items-center">
                        Generate <ArrowRight className="w-4 h-4 ml-1" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Technical Information */}
        <div className="mt-16 bg-slate-50 dark:bg-gray-900 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-8">
            About {subcategory.name}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                Key Features
              </h3>
              <ul className="space-y-2 text-slate-600 dark:text-gray-300">
                <li className="flex items-start">
                  <QrCode className="w-4 h-4 mt-1 mr-2 text-blue-600" />
                  High-quality barcode generation using bwip-js library
                </li>
                <li className="flex items-start">
                  <QrCode className="w-4 h-4 mt-1 mr-2 text-blue-600" />
                  Multiple output formats (PNG, SVG)
                </li>
                <li className="flex items-start">
                  <QrCode className="w-4 h-4 mt-1 mr-2 text-blue-600" />
                  Customizable sizing and styling options
                </li>
                <li className="flex items-start">
                  <QrCode className="w-4 h-4 mt-1 mr-2 text-blue-600" />
                  Industry-standard compliance
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">
                Common Use Cases
              </h3>
              <div className="text-slate-600 dark:text-gray-300">
                {getUseCases(subcategoryId!).map((useCase, index) => (
                  <div key={index} className="flex items-start mb-2">
                    <ArrowRight className="w-4 h-4 mt-1 mr-2 text-green-600" />
                    {useCase}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function getUseCases(subcategoryId: string): string[] {
  const useCases: Record<string, string[]> = {
    'linear-codes': [
      'Product identification and inventory management',
      'Library and asset tracking systems',
      'Manufacturing and quality control',
      'Retail point-of-sale applications'
    ],
    'postal-codes': [
      'Mail sorting and delivery tracking',
      'Package and shipment identification',
      'International postal services',
      'Logistics and supply chain management'
    ],
    'gs1-databar': [
      'Fresh food and produce labeling',
      'Small item identification',
      'Coupon and promotional applications',
      'Healthcare product tracking'
    ],
    'ean-upc': [
      'Retail product identification',
      'Point-of-sale scanning',
      'Inventory management systems',
      'E-commerce product catalogs'
    ],
    '2d-codes': [
      'Mobile marketing campaigns',
      'Document and certificate authentication',
      'Industrial data encoding',
      'Authentication and security applications'
    ]
  };
  
  return useCases[subcategoryId] || [
    'Data encoding and identification',
    'Tracking and authentication',
    'Mobile and digital applications',
    'Industrial and commercial use'
  ];
}