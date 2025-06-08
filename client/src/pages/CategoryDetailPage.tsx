import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/Breadcrumb";
import { getCategoryById } from "@/lib/toolCategories";
import { useLanguage } from "@/contexts/LanguageContext";
import { ArrowLeft, Star } from "lucide-react";

export default function CategoryDetailPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = getCategoryById(categoryId!);
  const { t } = useLanguage();

  if (!category) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">Category Not Found</h2>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </main>
    );
  }

  const breadcrumbItems = [
    { name: category.title }
  ];

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        {/* Category Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <div className={`w-16 h-16 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-2xl flex items-center justify-center`}>
              <i className={`fas ${category.icon} text-${category.color}-500 text-2xl`}></i>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{category.title}</h1>
              <p className="text-slate-600 dark:text-gray-300">{category.description}</p>
              <Badge variant="secondary" className="mt-2">
                {category.tools.length} tools
              </Badge>
            </div>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {category.tools.map((tool) => (
            <Link key={tool.id} href={`/tool/${tool.id}`}>
              <Card className="h-full transition-all duration-200 hover:shadow-lg hover:scale-105 border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-800 group cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center">
                    <div className={`w-12 h-12 bg-${category.color}-100 dark:bg-${category.color}-900 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <i className={`fas ${tool.icon} text-${category.color}-600 dark:text-${category.color}-400`}></i>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                      {tool.name}
                    </h3>
                    
                    <p className="text-sm text-slate-600 dark:text-gray-300 mb-4 leading-relaxed">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center justify-center w-full pt-2 border-t border-slate-100 dark:border-gray-700">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 flex items-center">
                        Use Tool <Star className="w-3 h-3 ml-1" />
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}