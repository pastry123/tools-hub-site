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

  const breadcrumbItems = [
    { name: "Favorites" }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Favorite Tools</h1>
            <p className="text-slate-600 dark:text-gray-300">
              Tools you've marked as favorites for quick access
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Heart className="w-8 h-8 text-red-500" />
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {favorites.length}
              </Badge>
            </div>
            {favorites.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFavorites}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              No Favorite Tools Yet
            </h3>
            <p className="text-slate-600 dark:text-gray-300 mb-6">
              Start exploring tools and click the heart icon to add them to your favorites
            </p>
            <Link href="/">
              <Button>
                Browse All Tools
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <Link key={favorite.toolId} href={`/tool/${favorite.toolId}`}>
              <Card className="group hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                      <i className="fas fa-tools text-blue-500"></i>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromFavorites(favorite.toolId);
                      }}
                    >
                      <Heart className="w-4 h-4 fill-current" />
                    </Button>
                  </div>
                  
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-primary transition-colors">
                    {t(`tools.${favorite.toolId}`) || favorite.toolName}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {favorite.category}
                    </Badge>
                    <div className="flex items-center text-xs text-slate-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {new Date(favorite.addedAt).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-sm text-slate-600 dark:text-gray-300">
                      Click to use tool
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}