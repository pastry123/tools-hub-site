import { Link, useLocation } from "wouter";
import { Search, Bell, Bolt, Moon, Sun, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { useLanguage, type Language } from "@/contexts/LanguageContext";
import { useState } from "react";

export default function Header() {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-slate-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bolt className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-800 dark:text-white">{t("header.title")}</h1>
            </Link>
            
            <div className="hidden md:flex items-center space-x-2 text-sm text-slate-600 dark:text-gray-300">
              <span>{t("header.subtitle")}</span>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors ${
                isActive("/") ? "text-primary" : "text-slate-700 dark:text-gray-300 hover:text-primary"
              }`}
            >
              {t("header.dashboard")}
            </Link>
            <Link 
              href="/favorites" 
              className="text-slate-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium"
            >
              {t("header.favorites")}
            </Link>
            <Link 
              href="/recent" 
              className="text-slate-600 dark:text-gray-400 hover:text-primary transition-colors text-sm font-medium"
            >
              {t("header.recent")}
            </Link>
          </nav>
          
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={t("header.search")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48 md:w-64"
              />
            </div>
            
            <Select value={language} onValueChange={(value: Language) => setLanguage(value)}>
              <SelectTrigger className="w-auto border-none bg-transparent">
                <Globe className="w-4 h-4" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
                <SelectItem value="ar">العربية</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={toggleTheme}
              className="w-9 h-9 p-0"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </Button>
            
            <Button variant="ghost" size="sm" className="w-9 h-9 p-0">
              <Bell className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
