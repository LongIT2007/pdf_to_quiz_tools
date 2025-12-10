import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useRoute } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navigation from "./components/Navigation";
import Dashboard from "./pages/Dashboard";
import UploadPDF from "./pages/UploadPDF";
import SmartUpload from "./pages/SmartUpload";
import CreateQuiz from "./pages/CreateQuiz";
import SmartCreateQuiz from "./pages/SmartCreateQuiz";
import ViewQuiz from "./pages/ViewQuiz";
import EditorQuiz from "./pages/EditorQuiz";

// Wrapper component để nhận params từ wouter Route
function ViewQuizWrapper() {
  const [, params] = useRoute("/quiz/:id");
  return <ViewQuiz params={params} />;
}

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Dashboard} />
      <Route path={"/upload"} component={UploadPDF} />
      <Route path={"/upload/smart"} component={SmartUpload} />
      <Route path={"/quiz/create"} component={CreateQuiz} />
      <Route path={"/quiz/smart-create"} component={SmartCreateQuiz} />
      <Route path={"/quiz/editor"} component={EditorQuiz} />
      <Route path={"/quiz/:id"} component={ViewQuizWrapper} />
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
