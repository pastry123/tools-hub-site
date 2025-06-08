import { Card, CardContent } from "@/components/ui/card";
import Breadcrumb from "@/components/Breadcrumb";
import BarcodeScanner from "@/components/tools/BarcodeScanner";
import { Shield, Smartphone, Download } from "lucide-react";

export default function BarcodeScannerPage() {
  const breadcrumbItems = [
    { name: "Generators & Tools", href: "/category/generators" },
    { name: "Barcode Scanner" }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Tool Header */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-8 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900 rounded-2xl flex items-center justify-center">
            <i className="fas fa-camera text-teal-500 text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Barcode Scanner</h1>
            <p className="text-slate-600 dark:text-gray-300">Scan and decode barcodes and QR codes from images</p>
          </div>
        </div>

        {/* Tool Component */}
        <BarcodeScanner />
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Shield className="h-6 w-6 text-blue-500" />
              <h3 className="font-semibold text-slate-800 dark:text-white">Secure & Private</h3>
            </div>
            <p className="text-slate-600 dark:text-gray-300 text-sm">
              All scanning is performed locally in your browser. Your images never leave your device.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Smartphone className="h-6 w-6 text-green-500" />
              <h3 className="font-semibold text-slate-800 dark:text-white">Multiple Formats</h3>
            </div>
            <p className="text-slate-600 dark:text-gray-300 text-sm">
              Supports QR codes and various linear barcode formats including Code 128, Code 39, EAN, UPC.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-3">
              <Download className="h-6 w-6 text-purple-500" />
              <h3 className="font-semibold text-slate-800 dark:text-white">Instant Results</h3>
            </div>
            <p className="text-slate-600 dark:text-gray-300 text-sm">
              Get decoded barcode content instantly with confidence scores and metadata information.
            </p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}