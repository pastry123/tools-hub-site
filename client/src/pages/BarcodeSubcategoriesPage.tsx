import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import Breadcrumb from "@/components/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { QrCode, Barcode, Mail, Package, CreditCard, Smartphone, Heart, BookOpen, Users, Calendar, Wifi, Tag } from "lucide-react";

const barcodeSubcategories = [
  {
    id: "linear-codes",
    name: "Linear Codes",
    description: "Traditional one-dimensional barcodes",
    icon: Barcode,
    color: "blue",
    toolCount: 13
  },
  {
    id: "postal-codes", 
    name: "Postal Codes",
    description: "Postal service barcodes worldwide",
    icon: Mail,
    color: "green",
    toolCount: 15
  },
  {
    id: "gs1-databar",
    name: "GS1 DataBar", 
    description: "Compact barcodes for retail applications",
    icon: Package,
    color: "purple",
    toolCount: 12
  },
  {
    id: "ean-upc",
    name: "EAN / UPC",
    description: "Retail product identification barcodes", 
    icon: Tag,
    color: "orange",
    toolCount: 9
  },
  {
    id: "2d-codes",
    name: "2D Codes",
    description: "Two-dimensional matrix and stacked barcodes",
    icon: QrCode,
    color: "indigo",
    toolCount: 13
  },
  {
    id: "gs1-2d",
    name: "GS1 2D Barcodes",
    description: "GS1 compliant 2D barcodes",
    icon: QrCode,
    color: "teal",
    toolCount: 4
  },
  {
    id: "banking-payments",
    name: "Banking and Payments",
    description: "Payment and financial barcodes",
    icon: CreditCard,
    color: "emerald",
    toolCount: 6
  },
  {
    id: "mobile-tagging",
    name: "Mobile Tagging",
    description: "Mobile-optimized barcode solutions",
    icon: Smartphone,
    color: "pink",
    toolCount: 8
  },
  {
    id: "healthcare-codes",
    name: "Healthcare Codes", 
    description: "Medical and pharmaceutical barcodes",
    icon: Heart,
    color: "red",
    toolCount: 10
  },
  {
    id: "isbn-codes",
    name: "ISBN Codes",
    description: "Publishing industry barcodes",
    icon: BookOpen,
    color: "amber",
    toolCount: 5
  },
  {
    id: "business-cards",
    name: "Business Cards",
    description: "QR codes for business information",
    icon: Users,
    color: "slate",
    toolCount: 4
  },
  {
    id: "event-barcodes",
    name: "Event Barcodes",
    description: "Event tickets and registration codes",
    icon: Calendar,
    color: "rose",
    toolCount: 6
  },
  {
    id: "wifi-barcodes",
    name: "Wi-Fi Barcodes",
    description: "WiFi connection QR codes",
    icon: Wifi,
    color: "cyan",
    toolCount: 3
  }
];

export default function BarcodeSubcategoriesPage() {
  const { t } = useLanguage();

  const breadcrumbItems = [
    { name: t("header.dashboard"), href: "/" },
    { name: t("category.barcode.title") }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mt-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
            <QrCode className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
            {t("category.barcode.title")}
          </h1>
          <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
            {t("category.barcode.description")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {barcodeSubcategories.map((subcategory) => {
            const IconComponent = subcategory.icon;
            
            return (
              <Link 
                key={subcategory.id} 
                href={`/category/barcodes/${subcategory.id}`}
                className="group"
              >
                <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-12 h-12 bg-${subcategory.color}-100 dark:bg-${subcategory.color}-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                        <IconComponent className={`w-6 h-6 text-${subcategory.color}-600 dark:text-${subcategory.color}-400`} />
                      </div>
                      
                      <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                        {subcategory.name}
                      </h3>
                      
                      <p className="text-sm text-slate-600 dark:text-gray-300 mb-4 leading-relaxed">
                        {subcategory.description}
                      </p>
                      
                      <div className="flex items-center justify-between w-full pt-2 border-t border-slate-100 dark:border-gray-700">
                        <span className="text-xs text-slate-500 dark:text-gray-400">
                          {subcategory.toolCount} tools
                        </span>
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                          View Tools →
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="mt-16 bg-slate-50 dark:bg-gray-900 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white text-center mb-8">
            Professional Barcode Generation
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                180+ Barcode Types
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
                Support for all major barcode standards including linear, 2D, postal, and specialty formats
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                Industry Standards
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
                GS1, ISO, ANSI compliant barcodes for retail, healthcare, logistics, and more
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                High Quality Output
              </h3>
              <p className="text-slate-600 dark:text-gray-300">
                Vector SVG and high-resolution PNG downloads with customizable styling options
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}