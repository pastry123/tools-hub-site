import { useParams, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Breadcrumb from "@/components/Breadcrumb";
import { getCategoryById } from "@/lib/toolCategories";
import { ArrowLeft, Star } from "lucide-react";

export default function CategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = getCategoryById(categoryId!);

  if (!category) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Category Not Found</h2>
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/">
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
          <h2 className="text-3xl font-bold text-slate-800 mb-2">{category.title}</h2>
          <p className="text-slate-600 text-lg">{category.description}</p>
        </div>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {category.tools.map((tool) => (
          <Link key={tool.id} href={`/tool/${tool.id}`}>
            <Card className="tool-item-card">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className={`w-10 h-10 bg-${category.color}-100 rounded-lg flex items-center justify-center`}>
                    <i className={`fas ${tool.icon} text-${category.color}-500`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900">{tool.name}</h3>

                  </div>
                </div>
                <p className="text-slate-600 text-sm mb-4">{tool.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">Free</Badge>
                  <span className="text-primary hover:text-blue-700 font-medium text-sm transition-colors">
                    Use Tool →
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
