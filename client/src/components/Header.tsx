import { Link, useLocation } from "wouter";
import { Search, Bell, Bolt } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bolt className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800">ToolHub</h1>
            </Link>
            
            <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600">
              <span>Professional Online Bolt</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                isActive("/") ? "text-primary" : "text-slate-700 hover:text-primary"
              }`}
            >
              Dashboard
            </Link>
            <Link 
              href="/favorites" 
              className="text-slate-600 hover:text-primary transition-colors text-sm font-medium"
            >
              Favorites
            </Link>
            <Link 
              href="/recent" 
              className="text-slate-600 hover:text-primary transition-colors text-sm font-medium"
            >
              Recent
            </Link>
          </nav>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search tools..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
