import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { FileText, BookOpen, Upload, Home, Sparkles, Edit } from "lucide-react";

export default function Navigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/upload", label: "Upload PDF", icon: Upload },
    { path: "/upload/smart", label: "Smart Upload", icon: Sparkles },
    { path: "/quiz/editor", label: "Soạn Quiz", icon: Edit },
  ];

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold">PDF to Quiz</span>
          </div>
          <div className="flex items-center gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? "default" : "ghost"}
                  onClick={() => setLocation(item.path)}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
