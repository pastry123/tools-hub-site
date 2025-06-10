import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toolCategories, getPopularTools } from "@/lib/toolCategories";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowRight, Star, Zap, Shield, Smartphone } from "lucide-react";

export default function Dashboard() {
  const popularTools = getPopularTools();
  const { t } = useLanguage();

  // Helper function to replace placeholders in translations
  const formatTranslation = (key: string, replacements: Record<string, string> = {}) => {
    let translation = t(key);
    Object.entries(replacements).forEach(([placeholder, value]) => {
      translation = translation.replace(`{${placeholder}}`, value);
    });
    return translation;
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-800 dark:text-white mb-4">
          {t("dashboard.hero.title")}
        </h1>
        <p className="text-slate-600 dark:text-gray-300 text-xl mb-6 leading-relaxed">
          <span 
            dangerouslySetInnerHTML={{
              __html: formatTranslation("dashboard.hero.description", {
                barcodes: `<a href="/tool/barcode-generator" class="text-primary hover:underline">${t("dashboard.hero.barcodes")}</a>`,
                pdfs: `<a href="/tool/pdf-merger" class="text-primary hover:underline">${t("dashboard.hero.pdfs")}</a>`,
                signatures: `<a href="/tool/signature-generator" class="text-primary hover:underline">${t("dashboard.hero.signatures")}</a>`,
                development: `<a href="/category/developer-tools" class="text-primary hover:underline">${t("dashboard.hero.development")}</a>`
              })
            }}
          />
        </p>
        
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
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white mb-6">{t("dashboard.quickAccess.title")}</h2>
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
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white mb-6">{t("dashboard.categories.title")}</h2>
        <p className="text-slate-600 dark:text-gray-300 text-lg mb-8">
          <span 
            dangerouslySetInnerHTML={{
              __html: formatTranslation("dashboard.categories.description", {
                barcodeGeneration: `<a href="/category/barcodes" class="text-primary hover:underline">${t("dashboard.categories.barcodeGeneration")}</a>`,
                imageProcessing: `<a href="/category/image-tools" class="text-primary hover:underline">${t("dashboard.categories.imageProcessing")}</a>`
              })
            }}
          />
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {toolCategories.map((category) => (
            <Link key={category.id} href={category.id === 'barcodes' ? '/barcodes' : `/category/${category.id}`}>
              <Card className="tool-category-card">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors`}>
                    <i className={`fas ${category.icon} text-${category.color}-500 group-hover:text-white`}></i>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">{t(`category.${category.id}.title`)}</h3>
                  <p className="text-slate-600 dark:text-gray-300 text-sm mb-4">{t(`category.${category.id}.description`)}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {formatTranslation("dashboard.categories.toolsCount", { count: category.tools.length.toString() })}
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
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white mb-6">{t("dashboard.benefits.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="prose prose-lg dark:prose-invert">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">{t("dashboard.benefits.document.title")}</h3>
            <p className="text-slate-600 dark:text-gray-300 mb-4">
              <span 
                dangerouslySetInnerHTML={{
                  __html: formatTranslation("dashboard.benefits.document.description1", {
                    pdfTools: `<a href="/category/pdf-tools" class="text-primary hover:underline">PDF tools</a>`,
                    eSignature: `<a href="/tool/pdf-esign" class="text-primary hover:underline">e-signature feature</a>`
                  })
                }}
              />
            </p>
            <p className="text-slate-600 dark:text-gray-300">
              <span 
                dangerouslySetInnerHTML={{
                  __html: formatTranslation("dashboard.benefits.document.description2")
                }}
              />
            </p>
          </div>
          <div className="prose prose-lg dark:prose-invert">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">{t("dashboard.benefits.developer.title")}</h3>
            <p className="text-slate-600 dark:text-gray-300 mb-4">
              <span 
                dangerouslySetInnerHTML={{
                  __html: formatTranslation("dashboard.benefits.developer.description1", {
                    developerTools: `<a href="/category/developer-tools" class="text-primary hover:underline">developer tools</a>`,
                    invoiceGenerator: `<a href="/tool/invoice-generator" class="text-primary hover:underline">invoice generator</a>`
                  })
                }}
              />
            </p>
            <p className="text-slate-600 dark:text-gray-300">
              <span 
                dangerouslySetInnerHTML={{
                  __html: formatTranslation("dashboard.benefits.developer.description2")
                }}
              />
            </p>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-8">
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white mb-6 text-center">{t("dashboard.features.title")}</h2>
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
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white mb-6">{t("dashboard.tools.overview.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="prose prose-lg dark:prose-invert">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">{t("dashboard.tools.business.title")}</h3>
            <ul className="list-disc pl-6 text-slate-600 dark:text-gray-300 space-y-2">
              <li><a href="/tool/invoice-generator" className="text-primary hover:underline">{t("dashboard.tools.invoice")}</a> - {t("dashboard.tools.invoiceDesc")}</li>
              <li><a href="/tool/barcode-generator" className="text-primary hover:underline">{t("dashboard.tools.barcode")}</a> - {t("dashboard.tools.barcodeDesc")}</li>
              <li><a href="/tool/qr-code-generator" className="text-primary hover:underline">{t("dashboard.tools.qrcode")}</a> - {t("dashboard.tools.qrcodeDesc")}</li>
              <li><a href="/tool/signature-generator" className="text-primary hover:underline">{t("dashboard.tools.signature")}</a> - {t("dashboard.tools.signatureDesc")}</li>
              <li><a href="/tool/pdf-esign" className="text-primary hover:underline">{t("dashboard.tools.pdfsign")}</a> - {t("dashboard.tools.pdfsignDesc")}</li>
            </ul>
          </div>
          <div className="prose prose-lg dark:prose-invert">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">{t("dashboard.tools.developer.title")}</h3>
            <ul className="list-disc pl-6 text-slate-600 dark:text-gray-300 space-y-2">
              <li><a href="/tool/regex-tester" className="text-primary hover:underline">{t("dashboard.tools.regex")}</a> - {t("dashboard.tools.regexDesc")}</li>
              <li><a href="/tool/jwt-decoder" className="text-primary hover:underline">{t("dashboard.tools.jwt")}</a> - {t("dashboard.tools.jwtDesc")}</li>
              <li><a href="/tool/api-tester" className="text-primary hover:underline">{t("dashboard.tools.api")}</a> - {t("dashboard.tools.apiDesc")}</li>
              <li><a href="/tool/css-minifier" className="text-primary hover:underline">{t("dashboard.tools.cssmin")}</a> - {t("dashboard.tools.cssminDesc")}</li>
              <li><a href="/tool/js-minifier" className="text-primary hover:underline">{t("dashboard.tools.jsmin")}</a> - {t("dashboard.tools.jsminDesc")}</li>
            </ul>
          </div>
          <div className="prose prose-lg dark:prose-invert">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">{t("dashboard.tools.content.title")}</h3>
            <ul className="list-disc pl-6 text-slate-600 dark:text-gray-300 space-y-2">
              <li><a href="/tool/image-compressor" className="text-primary hover:underline">{t("dashboard.tools.imagecomp")}</a> - {t("dashboard.tools.imagecompDesc")}</li>
              <li><a href="/tool/pdf-merger" className="text-primary hover:underline">{t("dashboard.tools.pdfmerge")}</a> - {t("dashboard.tools.pdfmergeDesc")}</li>
              <li><a href="/tool/text-converter" className="text-primary hover:underline">{t("dashboard.tools.textconv")}</a> - {t("dashboard.tools.textconvDesc")}</li>
              <li><a href="/tool/color-converter" className="text-primary hover:underline">{t("dashboard.tools.colorconv")}</a> - {t("dashboard.tools.colorconvDesc")}</li>
              <li><a href="/tool/password-generator" className="text-primary hover:underline">{t("dashboard.tools.password")}</a> - {t("dashboard.tools.passwordDesc")}</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Security and Privacy */}
      <div className="bg-slate-50 dark:bg-slate-900 rounded-2xl p-8 mb-12">
        <h2 className="text-3xl font-semibold text-slate-800 dark:text-white mb-6 text-center">{t("dashboard.security.title")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">{t("dashboard.security.protection.title")}</h3>
            <p className="text-slate-600 dark:text-gray-300 mb-4">
              <span 
                dangerouslySetInnerHTML={{
                  __html: formatTranslation("dashboard.security.protection.description", {
                    pdfMerger: `<a href="/tool/pdf-merger" class="text-primary hover:underline">PDF merger</a>`,
                    imageCompressor: `<a href="/tool/image-compressor" class="text-primary hover:underline">image compressor</a>`
                  })
                }}
              />
            </p>
            <p className="text-slate-600 dark:text-gray-300">
              {t("footer.privacyPolicy")}
            </p>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-4">{t("footer.enterpriseStandards")}</h3>
            <p className="text-slate-600 dark:text-gray-300 mb-4">
              <span 
                dangerouslySetInnerHTML={{
                  __html: formatTranslation("footer.securityCompliance", {
                    barcodeScanner: `<a href="/tool/barcode-scanner" class="text-primary hover:underline">${t("footer.barcodeScanner")}</a>`,
                    signatureGenerator: `<a href="/tool/signature-generator" class="text-primary hover:underline">${t("footer.signatureGenerator")}</a>`
                  }) + ` ${t("footer.professionalCompliance")}`
                }}
              />
            </p>
            <p className="text-slate-600 dark:text-gray-300">
              {t("footer.regularAudits")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
