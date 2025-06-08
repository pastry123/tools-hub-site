import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from "@/components/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserData } from "@/contexts/UserDataContext";
import { Heart, Star, ArrowRight, Trash2, Clock } from "lucide-react";

export default function FavoritesPage() {
  const { t } = useLanguage();
  const { favorites, removeFromFavorites, clearFavorites } = useUserData();

  const getCategoryColor = (categoryId: string) => {
    const category = toolCategories.find(cat => cat.id === categoryId);
    return category?.color || "blue";
  };

  const breadcrumbItems = [
    { name: t("header.dashboard"), href: "/" },
    { name: t("header.favorites") }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mt-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 dark:bg-pink-900 rounded-full mb-4">
            <Heart className="w-8 h-8 text-pink-600 dark:text-pink-400" />
          </div>
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white mb-4">
            {t("header.favorites")}
          </h1>
          <p className="text-xl text-slate-600 dark:text-gray-300 max-w-3xl mx-auto">
            Your saved tools for quick access
          </p>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16">
            <Star className="w-16 h-16 text-slate-300 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-white mb-2">
              No favorites yet
            </h2>
            <p className="text-slate-600 dark:text-gray-300 mb-8">
              Add tools to your favorites by clicking the heart icon on any tool page
            </p>
            <Link href="/" className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors">
              Browse Tools <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((tool) => {
              const categoryColor = getCategoryColor(tool.category);
              
              return (
                <div key={tool.id} className="relative group">
                  <Link href={`/tool/${tool.id}`}>
                    <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800">
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
                            <span className="text-xs text-slate-500 dark:text-gray-400 capitalize">
                              {tool.category}
                            </span>
                            <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex items-center">
                              Use Tool <ArrowRight className="w-3 h-3 ml-1" />
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  
                  {/* Remove from favorites button */}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      removeFavorite(tool.id);
                    }}
                    className="absolute top-2 right-2 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove from favorites"
                  >
                    <Heart className="w-4 h-4 text-pink-600 fill-current" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}