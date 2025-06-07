import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toolCategories, getPopularTools } from "@/lib/toolCategories";
import { ArrowRight, Star, Zap, Shield, Smartphone } from "lucide-react";

export default function Dashboard() {
  const popularTools = getPopularTools();

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Professional Online Tools</h2>
        <p className="text-slate-600 text-lg mb-8">Access powerful tools to enhance your productivity and streamline your workflow</p>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Total Tools</p>
                  <p className="text-2xl font-bold text-slate-800">180+</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-wrench text-primary"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Categories</p>
                  <p className="text-2xl font-bold text-slate-800">8</p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-layer-group text-accent"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Most Popular</p>
                  <p className="text-2xl font-bold text-slate-800">PDF Tools</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-file-pdf text-red-500"></i>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600 font-medium">Free to Use</p>
                  <p className="text-2xl font-bold text-slate-800">100%</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                  <i className="fas fa-star text-amber-500"></i>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Quick Access */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-slate-800 mb-6">Quick Access</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {popularTools.slice(0, 4).map(({ tool, category }) => (
            <Link key={tool.id} href={`/tool/${tool.id}`}>
              <Card className="hover:shadow-md transition-all cursor-pointer group">
                <CardContent className="p-4 text-center">
                  <div className={`w-12 h-12 bg-${category.color}-100 rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-white transition-colors`}>
                    <i className={`fas ${tool.icon} text-${category.color}-500 group-hover:text-white`}></i>
                  </div>
                  <h4 className="font-medium text-slate-900">{tool.name.split(' ')[0]}</h4>
                  <p className="text-sm text-slate-500">{tool.name.split(' ').slice(1).join(' ')}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Tool Categories Grid */}
      <div className="mb-12">
        <h3 className="text-2xl font-semibold text-slate-800 mb-6">All Tool Categories</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {toolCategories.map((category) => (
            <Link key={category.id} href={`/category/${category.id}`}>
              <Card className="tool-category-card">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-${category.color}-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors`}>
                    <i className={`fas ${category.icon} text-${category.color}-500 group-hover:text-white`}></i>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-2">{category.title}</h3>
                  <p className="text-slate-600 text-sm mb-4">{category.description}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">
                      {category.tools.length} Tools
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
      <div className="bg-white rounded-2xl border border-slate-200 p-8">
        <h3 className="text-2xl font-semibold text-slate-800 mb-6 text-center">Why Choose ToolHub?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Secure & Private</h4>
            <p className="text-slate-600 text-sm">All processing happens in your browser. Your data never leaves your device.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Lightning Fast</h4>
            <p className="text-slate-600 text-sm">Optimized tools that work instantly without server delays.</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-8 h-8 text-purple-600" />
            </div>
            <h4 className="font-semibold text-slate-800 mb-2">Mobile Friendly</h4>
            <p className="text-slate-600 text-sm">Works perfectly on all devices, from desktop to mobile.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
