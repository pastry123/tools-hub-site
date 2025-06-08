import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { UserDataProvider } from "@/contexts/UserDataContext";
import Header from "@/components/Header";
import Dashboard from "@/pages/Dashboard";
import CategoryPage from "@/pages/CategoryPage";
import CategoryDetailPage from "@/pages/CategoryDetailPage";
import ToolPage from "@/pages/ToolPage";
import BarcodeScannerPage from "@/pages/BarcodeScannerPage";
import FavoritesPage from "@/pages/FavoritesPage";
import RecentPage from "@/pages/RecentPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/favorites" component={FavoritesPage} />
        <Route path="/recent" component={RecentPage} />
        <Route path="/category/:categoryId" component={CategoryDetailPage} />
        <Route path="/tool/:toolId" component={ToolPage} />
        <Route path="/tools/barcode-qr/scanner" component={BarcodeScannerPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <UserDataProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </UserDataProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
