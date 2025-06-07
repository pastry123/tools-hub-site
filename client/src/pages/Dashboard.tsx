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
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">{t("dashboard.title")}</h2>
        <p className="text-slate-600 dark:text-gray-300 text-lg mb-8">{t("dashboard.description")}</p>
        
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
        <h3 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">{t("dashboard.quickAccess")}</h3>
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
        <h3 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6">{t("dashboard.allCategories")}</h3>
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
                      {category.tools.length} {t("common.tools")}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-gray-700 p-8">
        <h3 className="text-2xl font-semibold text-slate-800 dark:text-white mb-6 text-center">{t("dashboard.features.title")}</h3>
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
    </main>
  );
}
