import { useParams, Link } from "wouter";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/Breadcrumb";
import { getToolCategory } from "@/lib/toolCategories";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Star, Menu, X } from "lucide-react";

export default function CategoryDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = getToolCategory(categoryId!);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { t } = useLanguage();

  if (!category) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{t("common.notFound")}</h2>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t("common.back")}
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const breadcrumbItems = [
    { name: t(`category.${category.id}.title`) }
  ];

  const displayTools = selectedSubcategory 
    ? category.subcategories?.find(sub => sub.id === selectedSubcategory)?.tools || []
    : category.tools;

  const subcategoryInfo = selectedSubcategory 
    ? category.subcategories?.find(sub => sub.id === selectedSubcategory)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/">
              <Button variant="ghost" className="mb-2">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t("common.back")}
              </Button>
            </Link>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
              {subcategoryInfo?.name || t(`category.${category.id}.title`)}
            </h2>
            <p className="text-slate-600 dark:text-gray-300 text-lg">
              {subcategoryInfo?.description || t(`category.${category.id}.description`)}
            </p>
          </div>
          
          {category.subcategories && (
            <Button
              variant="outline"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          )}
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          {category.subcategories && (
            <div className={`
              ${sidebarOpen ? 'block' : 'hidden'} lg:block
              w-full lg:w-80 lg:min-w-80
              ${sidebarOpen ? 'fixed inset-0 z-50 bg-background lg:relative lg:inset-auto lg:z-auto' : ''}
            `}>
              <Card className="sticky top-24">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-800 dark:text-white">Subcategories</h3>
                    {sidebarOpen && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setSelectedSubcategory(null);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        !selectedSubcategory 
                          ? 'bg-primary text-white' 
                          : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300'
                      }`}
                    >
                      <div className="font-medium">All Tools</div>
                      <div className="text-sm opacity-80">{category.tools.length} tools</div>
                    </button>
                    
                    {category.subcategories.map((subcategory) => (
                      <button
                        key={subcategory.id}
                        onClick={() => {
                          setSelectedSubcategory(subcategory.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full text-left p-3 rounded-lg transition-colors ${
                          selectedSubcategory === subcategory.id 
                            ? 'bg-primary text-white' 
                            : 'hover:bg-slate-100 dark:hover:bg-gray-800 text-slate-700 dark:text-gray-300'
                        }`}
                      >
                        <div className="font-medium">{subcategory.name}</div>
                        <div className="text-sm opacity-80">{subcategory.tools.length} tools</div>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tools Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayTools.map((tool) => (
                <Link key={tool.id} href={`/tool/${tool.id}`}>
                  <Card className="tool-item-card group">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className={`w-10 h-10 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-lg flex items-center justify-center`}>
                          <i className={`fas ${tool.icon} text-${category.color}-500`}></i>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                            {tool.name}
                          </h3>
                          {tool.popular && (
                            <Badge variant="secondary" className="mt-1">
                              <Star className="w-3 h-3 mr-1" />
                              {t("common.popular")}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-slate-600 dark:text-gray-300 text-sm mb-4">{tool.description}</p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="text-xs">{t("common.free")}</Badge>
                        <span className="text-primary hover:text-blue-700 font-medium text-sm transition-colors">
                          {t("common.useTool")} →
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {displayTools.length === 0 && (
              <div className="text-center py-12">
                <div className={`w-16 h-16 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                  <i className={`fas ${category.icon} text-${category.color}-500 text-2xl`}></i>
                </div>
                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">No Tools Available</h3>
                <p className="text-slate-600 dark:text-gray-300">This subcategory will be populated with tools soon.</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}