import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Pencil,
  Eraser,
  Trash2,
  Palette,
  Underline,
  X,
} from "lucide-react";

interface DrawingToolbarProps {
  onColorChange: (color: string) => void;
  onToolChange: (tool: "pen" | "eraser" | "underline") => void;
  onClear: () => void;
  onToggleDrawing: () => void;
  currentColor: string;
  currentTool: "pen" | "eraser" | "underline";
  drawingEnabled: boolean;
}

const COLORS = [
  { name: "Đỏ", value: "#ef4444" },
  { name: "Xanh dương", value: "#3b82f6" },
  { name: "Xanh lá", value: "#22c55e" },
  { name: "Vàng", value: "#eab308" },
  { name: "Cam", value: "#f97316" },
  { name: "Tím", value: "#a855f7" },
  { name: "Hồng", value: "#ec4899" },
  { name: "Đen", value: "#000000" },
];

export function DrawingToolbar({
  onColorChange,
  onToolChange,
  onClear,
  onToggleDrawing,
  currentColor,
  currentTool,
  drawingEnabled,
}: DrawingToolbarProps) {
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] bg-white/95 backdrop-blur-sm border rounded-lg shadow-lg p-2 flex items-center gap-2 pointer-events-auto">
      {/* Toggle Drawing Button */}
      <Button
        variant={drawingEnabled ? "default" : "outline"}
        size="sm"
        onClick={onToggleDrawing}
        title={drawingEnabled ? "Tắt vẽ" : "Bật vẽ"}
      >
        <Pencil className="w-4 h-4 mr-1" />
        {drawingEnabled ? "Tắt vẽ" : "Bật vẽ"}
      </Button>

      {drawingEnabled && (
        <>
          <Separator orientation="vertical" className="h-6" />
          
          {/* Pen Tool */}
      <Button
        variant={currentTool === "pen" ? "default" : "outline"}
        size="sm"
        onClick={() => onToolChange("pen")}
        title="Bút vẽ"
      >
        <Pencil className="w-4 h-4" />
      </Button>

      {/* Underline Tool */}
      <Button
        variant={currentTool === "underline" ? "default" : "outline"}
        size="sm"
        onClick={() => onToolChange("underline")}
        title="Gạch chân"
      >
        <Underline className="w-4 h-4" />
      </Button>

      {/* Eraser Tool */}
      <Button
        variant={currentTool === "eraser" ? "default" : "outline"}
        size="sm"
        onClick={() => onToolChange("eraser")}
        title="Tẩy"
      >
        <Eraser className="w-4 h-4" />
      </Button>

      <Separator orientation="vertical" className="h-6" />

      {/* Color Picker */}
      <Popover open={isColorPickerOpen} onOpenChange={setIsColorPickerOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" title="Chọn màu">
            <div
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: currentColor }}
            />
            <Palette className="w-4 h-4 ml-2" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-2">
            <div className="text-sm font-semibold mb-2">Chọn màu</div>
            <div className="grid grid-cols-4 gap-2">
              {COLORS.map((color) => (
                <button
                  key={color.value}
                  className={`w-10 h-10 rounded border-2 transition-all ${
                    currentColor === color.value
                      ? "border-gray-900 scale-110"
                      : "border-gray-300 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => {
                    onColorChange(color.value);
                    setIsColorPickerOpen(false);
                  }}
                  title={color.name}
                />
              ))}
            </div>
            <Separator />
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={currentColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-full h-8 rounded border cursor-pointer"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>

          <Separator orientation="vertical" className="h-6" />

          {/* Clear All */}
          <Button
            variant="outline"
            size="sm"
            onClick={onClear}
            title="Xóa tất cả"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}

