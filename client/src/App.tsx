import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import UploadPDF from "./pages/UploadPDF";
import CreateQuiz from "./pages/CreateQuiz";
import ViewQuiz from "./pages/ViewQuiz";


function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/upload"} component={UploadPDF} />
      <Route path={"/quiz/create" component={CreateQuiz} />
      <Route path={"/quiz/:id">
        {(params) => <ViewQuiz params={params} />}
      </Route>
      <Route path={"/pdfs"} component={Dashboard} />
      <Route path={"/quizzes"} component={Dashboard} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
      >
        <TooltipProvider>
          <Navigation />
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
