import { useParams } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import Breadcrumb from "@/components/Breadcrumb";
import { getToolById } from "@/lib/toolCategories";
import QRGenerator from "@/components/tools/QRGenerator";
import PDFMerger from "@/components/tools/PDFMerger";
import PasswordGenerator from "@/components/tools/PasswordGenerator";
import ImageCompressor from "@/components/tools/ImageCompressor";
import WordCounter from "@/components/tools/WordCounter";
import UnitConverter from "@/components/tools/UnitConverter";
import { Shield, Smartphone, Download } from "lucide-react";

export default function ToolPage() {
  const { toolId } = useParams<{ toolId: string }>();
  const toolData = getToolById(toolId!);

  if (!toolData) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Tool Not Found</h2>
        </div>
      </main>
    );
  }

  const { tool, category } = toolData;

  const breadcrumbItems = [
    { name: category.title, href: `/category/${category.id}` },
    { name: tool.name }
  ];

  const renderTool = () => {
    switch (tool.id) {
      case 'qr-generator':
        return <QRGenerator />;
      case 'pdf-merger':
        return <PDFMerger />;
      case 'password-generator':
        return <PasswordGenerator />;
      case 'image-compressor':
        return <ImageCompressor />;
      case 'word-counter':
        return <WordCounter />;
      case 'unit-converter':
        return <UnitConverter />;
      default:
        return (
          <Card>
            <CardContent className="p-8 text-center">
              <div className={`w-16 h-16 bg-${category.color}-100 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <i className={`fas ${tool.icon} text-${category.color}-500 text-2xl`}></i>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2">Tool Coming Soon</h3>
              <p className="text-slate-600">{tool.description}</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      {/* Tool Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 mb-8">
        <div className="flex items-center space-x-4 mb-6">
          <div className={`w-16 h-16 bg-${category.color}-100 rounded-2xl flex items-center justify-center`}>
            <i className={`fas ${tool.icon} text-${category.color}-500 text-2xl`}></i>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{tool.name}</h1>
            <p className="text-slate-600">{tool.description}</p>
          </div>
        </div>

        {/* Tool Component */}
        {renderTool()}
      </div>

      {/* Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <Shield className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">Secure & Private</h3>
            <p className="text-slate-600 text-sm">All processing happens in your browser. Your data never leaves your device.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Smartphone className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">Mobile Optimized</h3>
            <p className="text-slate-600 text-sm">Works perfectly on all devices and screen sizes.</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Download className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-slate-800 mb-2">Multiple Formats</h3>
            <p className="text-slate-600 text-sm">Download results in various formats for maximum compatibility.</p>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
