import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toolCategories, getPopularTools } from "@/lib/toolCategories";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Star, Zap, Shield, Smartphone } from "lucide-react";

export default function Dashboard() {
  const popularTools = getPopularTools();
  const { t } = useLanguage();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
          Professional Online Tools Dashboard - 50+ Free Utilities
        </h1>
        <p className="text-slate-600 dark:text-gray-300 text-xl mb-6 leading-relaxed">
          Access our comprehensive suite of professional-grade online tools designed for businesses, developers, and content creators. 
          From advanced <a href="/tool/barcode-generator" className="text-primary hover:underline">barcode generators</a> and 
          <a href="/tool/pdf-merger" className="text-primary hover:underline">PDF editing tools</a> to 
          <a href="/tool/signature-generator" className="text-primary hover:underline">digital signature generators</a> and 
          <a href="/category/developer-tools" className="text-primary hover:underline">developer utilities</a> - all completely free and secure.
        </p>
        
        <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
          <p className="text-slate-600 dark:text-gray-300">
            ToolHub provides instant access to over 50 specialized tools across 8 major categories. Whether you're processing 
            <a href="/category/image-tools" className="text-primary hover:underline">images</a>, 
            converting <a href="/category/text-tools" className="text-primary hover:underline">text formats</a>, 
            manipulating <a href="/category/pdf-tools" className="text-primary hover:underline">PDF documents</a>, or 
            testing <a href="/tool/api-tester" className="text-primary hover:underline">APIs</a>, 
            our platform delivers enterprise-quality results without requiring registration or payment. All tools run securely 
            in your browser, ensuring your data remains private and protected. Perfect for professionals who need reliable, 
            fast solutions for document processing, image manipulation, code development, and business operations.
          </p>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">{t("dashboard.stats.tools")}</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">180+</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <i className="fas fa-wrench text-primary"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">{t("dashboard.stats.categories")}</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">8</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-lg flex items-center justify-center">
                  <i className="fas fa-layer-group text-accent"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">{t("dashboard.stats.popular")}</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">PDF Tools</p>
                </div>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center">
                  <i className="fas fa-file-pdf text-red-500"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 dark:text-gray-400 font-medium">{t("dashboard.stats.free")}</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">100%</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-lg flex items-center justify-center">
                  <i className="fas fa-star text-amber-500"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Access */}
      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white mb-6">Most Popular Tools - Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularTools.slice(0, 4).map(({ tool, category }) => (
            <Link key={tool.id} href={`/tool/${tool.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-colors`}>
                    <i className={`fas ${tool.icon} text-${category.color}-500 group-hover:text-white`}></i>
                  </div>
                  <h4 className="font-medium text-slate-900 dark:text-white">{tool.name.split(' ')[0]}</h4>
                  <p className="text-sm text-slate-500 dark:text-gray-400">{tool.name.split(' ').slice(1).join(' ')}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Tool Categories Grid */}
      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white mb-6">Complete Tool Categories</h2>
        <p className="text-slate-600 dark:text-gray-300 text-lg mb-8">
          Explore our extensive collection of tools organized into specialized categories. Each category contains multiple tools 
          designed to handle specific tasks efficiently. From <a href="/category/barcodes" className="text-primary hover:underline">barcode generation</a> to 
          <a href="/category/image-tools" className="text-primary hover:underline">image processing</a>, find the perfect tool for your needs.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {toolCategories.map((category) => (
            <Link key={category.id} href={category.id === 'barcodes' ? '/barcodes' : `/category/${category.id}`}>
              <Card className="tool-category-card">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors`}>
                    <i className={`fas ${category.icon} text-${category.color}-500 group-hover:text-white`}></i>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">{category.title}</h3>
                  <p className="text-slate-600 dark:text-gray-300 text-sm mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {category.tools.length} tools
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Detailed Benefits Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white mb-6">Why Choose ToolHub for Your Professional Needs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="prose prose-lg dark:prose-invert">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Advanced Document Processing</h3>
            <p className="text-slate-600 dark:text-gray-300 mb-4">
              Our <a href="/category/pdf-tools" className="text-primary hover:underline">PDF tools</a> include merge, split, compress, 
              and watermark capabilities. The <a href="/tool/pdf-esign" className="text-primary hover:underline">e-signature feature</a> 
              enables legal document signing with AI-powered signature generation. Process multiple files simultaneously with 
              enterprise-grade security protocols ensuring your documents remain confidential.
            </p>
            <p className="text-slate-600 dark:text-gray-300">
              Advanced <a href="/tool/barcode-generator" className="text-primary hover:underline">barcode generation</a> supports 
              over 15 formats including QR codes, Code 128, and Data Matrix. Perfect for inventory management, product labeling, 
              and digital marketing campaigns.
            </p>
          </div>
          <div className="prose prose-lg dark:prose-invert">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Developer-Focused Utilities</h3>
            <p className="text-slate-600 dark:text-gray-300 mb-4">
              Comprehensive <a href="/category/developer-tools" className="text-primary hover:underline">developer tools</a> including 
              <a href="/tool/regex-tester" className="text-primary hover:underline">regex testing</a>, 
              <a href="/tool/jwt-decoder" className="text-primary hover:underline">JWT decoding</a>, and 
              <a href="/tool/api-tester" className="text-primary hover:underline">API testing</a>. Built for modern development workflows 
              with real-time validation and detailed error reporting.
            </p>
            <p className="text-slate-600 dark:text-gray-300">
              Code optimization tools like <a href="/tool/css-minifier" className="text-primary hover:underline">CSS</a> and 
              <a href="/tool/js-minifier" className="text-primary hover:underline">JavaScript minifiers</a> reduce file sizes 
              by up to 70%, improving website performance and loading speeds.
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-8">
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white mb-6 text-center">Core Platform Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{t("dashboard.features.secure")}</h4>
            <p className="text-slate-600 dark:text-gray-300 text-sm">{t("dashboard.features.secureDesc")}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{t("dashboard.features.fast")}</h4>
            <p className="text-slate-600 dark:text-gray-300 text-sm">{t("dashboard.features.fastDesc")}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-slate-800 dark:text-white mb-2">{t("dashboard.features.mobile")}</h4>
            <p className="text-slate-600 dark:text-gray-300 text-sm">{t("dashboard.features.mobileDesc")}</p>
          </div>
        </div>
      </div>

      {/* Comprehensive Tool Overview */}
      <div className="mb-12">
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white mb-6">Complete Tool Suite Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="prose prose-lg dark:prose-invert">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Business Tools</h3>
            <ul className="list-disc pl-6 text-slate-600 dark:text-gray-300 space-y-2">
              <li><a href="/tool/invoice-generator" className="text-primary hover:underline">Invoice Generator</a> - Create professional invoices instantly</li>
              <li><a href="/tool/barcode-generator" className="text-primary hover:underline">Barcode Generator</a> - Support for 15+ barcode formats</li>
              <li><a href="/tool/qr-code-generator" className="text-primary hover:underline">QR Code Generator</a> - Custom QR codes with logos</li>
              <li><a href="/tool/signature-generator" className="text-primary hover:underline">Digital Signatures</a> - AI-powered signature creation</li>
              <li><a href="/tool/pdf-esign" className="text-primary hover:underline">PDF E-Sign</a> - Legal document signing solution</li>
            </ul>
          </div>
          <div className="prose prose-lg dark:prose-invert">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Developer Tools</h3>
            <ul className="list-disc pl-6 text-slate-600 dark:text-gray-300 space-y-2">
              <li><a href="/tool/regex-tester" className="text-primary hover:underline">Regex Tester</a> - Pattern matching and validation</li>
              <li><a href="/tool/jwt-decoder" className="text-primary hover:underline">JWT Decoder</a> - Token parsing and verification</li>
              <li><a href="/tool/api-tester" className="text-primary hover:underline">API Tester</a> - REST endpoint testing</li>
              <li><a href="/tool/css-minifier" className="text-primary hover:underline">CSS Minifier</a> - Code optimization and compression</li>
              <li><a href="/tool/js-minifier" className="text-primary hover:underline">JS Minifier</a> - JavaScript file optimization</li>
            </ul>
          </div>
          <div className="prose prose-lg dark:prose-invert">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Content Tools</h3>
            <ul className="list-disc pl-6 text-slate-600 dark:text-gray-300 space-y-2">
              <li><a href="/tool/image-compressor" className="text-primary hover:underline">Image Compressor</a> - Reduce file sizes by 80%</li>
              <li><a href="/tool/pdf-merger" className="text-primary hover:underline">PDF Merger</a> - Combine multiple documents</li>
              <li><a href="/tool/text-converter" className="text-primary hover:underline">Text Converter</a> - Format transformation</li>
              <li><a href="/tool/color-converter" className="text-primary hover:underline">Color Converter</a> - HEX, RGB, HSL conversion</li>
              <li><a href="/tool/password-generator" className="text-primary hover:underline">Password Generator</a> - Secure password creation</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security and Privacy */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 mb-12">
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white mb-6 text-center">Security and Privacy Commitment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Data Protection</h3>
            <p className="text-slate-600 dark:text-gray-300 mb-4">
              All processing happens locally in your browser. Files uploaded to tools like our 
              <a href="/tool/pdf-merger" className="text-primary hover:underline">PDF merger</a> or 
              <a href="/tool/image-compressor" className="text-primary hover:underline">image compressor</a> 
              are never stored on our servers. Data is processed client-side and immediately discarded after use.
            </p>
            <p className="text-slate-600 dark:text-gray-300">
              Zero data collection policy ensures your privacy. No registration required, no tracking cookies, 
              and no personal information stored. Perfect for handling sensitive business documents and confidential data.
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">Enterprise Standards</h3>
            <p className="text-slate-600 dark:text-gray-300 mb-4">
              Built with enterprise-grade security protocols. SSL encryption protects all data transmission. 
              Tools like our <a href="/tool/barcode-scanner" className="text-primary hover:underline">barcode scanner</a> 
              and <a href="/tool/signature-generator" className="text-primary hover:underline">signature generator</a> 
              meet professional compliance standards.
            </p>
            <p className="text-slate-600 dark:text-gray-300">
              Regular security audits and updates ensure platform integrity. Compatible with corporate firewalls 
              and security policies. Trusted by thousands of professionals worldwide for daily business operations.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
