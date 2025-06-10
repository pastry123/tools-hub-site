import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Breadcrumb from "@/components/Breadcrumb";
import { useLanguage } from "@/contexts/LanguageContext";
import { useUserData } from "@/contexts/UserDataContext";
import { Clock, ArrowRight, Trash2, RotateCcw } from "lucide-react";

export default function RecentPage() {
  const { t } = useLanguage();
  const { recentTools, clearRecent } = useUserData();

  const formatTimeAgo = (timestamp: string) => {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const breadcrumbItems = [
    { name: "Recent Tools" }
  ];

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={breadcrumbItems} />
      
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Recent Tools</h1>
            <p className="text-slate-600 dark:text-gray-300">
              Tools you've used recently on this computer
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Clock className="w-8 h-8 text-blue-500" />
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {recentTools.length}
              </Badge>
            </div>
            {recentTools.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearRecent}
                className="flex items-center gap-2 text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4" />
                Clear History
              </Button>
            )}
          </div>
        </div>
      </div>

      {recentTools.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
              No Recent Activity
            </h3>
            <p className="text-slate-600 dark:text-gray-300 mb-6">
              Tools you use will appear here for quick access
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
          {recentTools.map((recent) => (
            <Link key={recent.toolId} href={`/tool/${recent.toolId}`}>
              <Card className="group hover:shadow-lg transition-all cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                      <RotateCcw className="w-6 h-6 text-green-500" />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 mb-1">
                        {formatTimeAgo(recent.visitedAt)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {recent.visitCount} visit{recent.visitCount !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-slate-800 dark:text-white mb-2 group-hover:text-primary transition-colors">
                    {t(`tools.${recent.toolId}`) || recent.toolName}
                  </h3>
                  
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="secondary" className="text-xs">
                      {recent.category}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                    <span className="text-sm text-slate-600 dark:text-gray-300">
                      Click to use again
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