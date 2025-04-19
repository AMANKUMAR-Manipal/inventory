import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/layouts/AppLayout";
import DashboardPage from "@/pages/dashboard";
import InventoryPage from "@/pages/inventory";
import ProductsPage from "@/pages/products";
import CategoriesPage from "@/pages/categories";
import LocationsPage from "@/pages/locations";
import ReportsPage from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import ImportExportPage from "@/pages/import-export";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={DashboardPage} />
        <Route path="/inventory" component={InventoryPage} />
        <Route path="/products" component={ProductsPage} />
        <Route path="/categories" component={CategoriesPage} />
        <Route path="/locations" component={LocationsPage} />
        <Route path="/reports" component={ReportsPage} />
        <Route path="/settings" component={SettingsPage} />
        <Route path="/import-export" component={ImportExportPage} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
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
