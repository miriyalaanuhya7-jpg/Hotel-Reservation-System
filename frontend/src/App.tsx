import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function Router() {
  return (
    <Switch>
      <Route path="/" component={() => <Home />} />
      <Route
        path="/reservations"
        component={() => <Home initialSection="Reservations" />}
      />
      <Route path="/rooms" component={() => <Home initialSection="Rooms" />} />
      <Route
        path="/guests"
        component={() => <Home initialSection="Guests" />}
      />
      <Route
        path="/reports"
        component={() => <Home initialSection="Reports" />}
      />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
