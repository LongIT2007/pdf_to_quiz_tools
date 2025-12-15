import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ZoomIn, ZoomOut, X } from "lucide-react";

interface ZoomableImageProps {
  src: string;
  alt: string;
  questionId: string;
  zoomLevel: number;
  position: { x: number; y: number };
  onZoomChange: (questionId: string, zoom: number) => void;
  onPositionChange: (questionId: string, position: { x: number; y: number }) => void;
  onReset: (questionId: string) => void;
}

export function ZoomableImage({
  src,
  alt,
  questionId,
  zoomLevel,
  position,
  onZoomChange,
  onPositionChange,
  onReset,
}: ZoomableImageProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -10 : 10;
    const newZoom = Math.max(50, Math.min(300, zoomLevel + delta));
    onZoomChange(questionId, newZoom);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 100) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 100) {
      onPositionChange(questionId, {
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div className="mb-4 relative">
      <div
        ref={imageRef}
        className="relative overflow-hidden rounded-md border bg-gray-50"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          minHeight: "250px",
          maxHeight: isMobile ? "80vh" : "600px", // To hơn trên mobile
          cursor: zoomLevel > 100 ? (isDragging ? "grabbing" : "grab") : "default",
        }}
      >
        <div
          className="flex items-center justify-center"
          style={{
            transform: `scale(${zoomLevel / 100}) translate(${position.x / (zoomLevel / 100)}px, ${position.y / (zoomLevel / 100)}px)`,
            transformOrigin: "center",
            transition: isDragging ? "none" : "transform 0.2s",
            minHeight: "250px",
          }}
        >
          <img
            src={src}
            alt={alt}
            className="max-w-full w-full sm:w-auto max-h-[70vh] sm:max-h-96 object-contain select-none"
            draggable={false}
            style={{
              width: isMobile ? "100%" : "auto",
              height: "auto",
            }}
          />
        </div>
        {/* Zoom Controls - Always visible */}
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg p-1 shadow-lg">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onZoomChange(questionId, Math.max(50, zoomLevel - 25));
            }}
            disabled={zoomLevel <= 50}
            title="Thu nhỏ"
          >
            <ZoomOut className="w-3 h-3" />
          </Button>
          <span className="text-xs font-medium min-w-[45px] text-center px-1">
            {zoomLevel}%
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onZoomChange(questionId, Math.min(300, zoomLevel + 25));
            }}
            disabled={zoomLevel >= 300}
            title="Phóng to"
          >
            <ZoomIn className="w-3 h-3" />
          </Button>
          <Separator orientation="vertical" className="h-4 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={(e) => {
              e.stopPropagation();
              onReset(questionId);
            }}
            title="Đặt lại"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

