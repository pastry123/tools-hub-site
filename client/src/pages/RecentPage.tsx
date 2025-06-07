import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import Breadcrumb from "@/components/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { toolCategories } from "@/lib/toolCategories";
import { Clock, History, ArrowRight } from "lucide-react";

interface RecentTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  lastUsed: number;
}

export default function RecentPage() {
  const { t } = useLanguage();
  const [recentTools, setRecentTools] = useState<RecentTool[]>([]);

  useEffect(() => {
    // Load recent tools from localStorage
    const savedRecent = localStorage.getItem("recentTools");
    if (savedRecent) {
      try {
        const parsed = JSON.parse(savedRecent);
        // Sort by most recent first
        const sorted = parsed.sort((a: RecentTool, b: RecentTool) => b.lastUsed - a.lastUsed);
        setRecentTools(sorted.slice(0, 20)); // Keep only last 20
      } catch (error) {
        console.error("Failed to parse recent tools:", error);
        setRecentTools([]);
      }
    }
  }, []);

  const clearRecent = () => {
    setRecentTools([]);
    localStorage.removeItem("recentTools");
  };

  const getCategoryColor = (categoryId: string) => {
    const category = toolCategories.find(cat => cat.id === categoryId);
    return category?.color || "blue";
  };

  const formatLastUsed = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return `${days}d ago`;
    }
  };

  const breadcrumbItems = [
    { name: t("header.dashboard"), href: "/" },
    { name: t("header.recent") }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mt-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full mb-4">
            <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
            {t("header.recent")}
          </h1>
          <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
            Recently used tools for quick access
          </p>
          {recentTools.length > 0 && (
            <button
              onClick={clearRecent}
              className="mt-4 text-sm text-slate-500 hover:text-slate-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Clear History
            </button>
          )}
        </div>

        {recentTools.length === 0 ? (
          <div className="text-center py-16">
            <History className="w-16 h-16 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">
              No recent tools
            </h2>
            <p className="text-slate-600 dark:text-gray-300 mb-8">
              Tools you use will appear here for quick access
            </p>
            <Link href="/" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
              Browse Tools <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {recentTools.map((tool) => {
              const categoryColor = getCategoryColor(tool.category);
              
              return (
                <Link key={`${tool.id}-${tool.lastUsed}`} href={`/tool/${tool.id}`}>
                  <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 group">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center">
                        <div className={`w-12 h-12 bg-${categoryColor}-100 dark:bg-${categoryColor}-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                          <i className={`${tool.icon} text-${categoryColor}-600 dark:text-${categoryColor}-400`}></i>
                        </div>
                        
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                          {tool.name}
                        </h3>
                        
                        <p className="text-sm text-slate-600 dark:text-gray-300 mb-4 leading-relaxed">
                          {tool.description}
                        </p>
                        
                        <div className="flex items-center justify-between w-full pt-2 border-t border-slate-100 dark:border-gray-700">
                          <span className="text-xs text-slate-500 dark:text-gray-400">
                            {formatLastUsed(tool.lastUsed)}
                          </span>
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex items-center">
                            Use Tool <ArrowRight className="w-3 h-3 ml-1" />
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}