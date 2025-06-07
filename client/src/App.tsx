import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Dashboard from "@/pages/Dashboard";
import CategoryPage from "@/pages/CategoryPage";
import ToolPage from "@/pages/ToolPage";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <>
      <Header />
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/category/:categoryId" component={CategoryPage} />
        <Route path="/tool/:toolId" component={ToolPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
