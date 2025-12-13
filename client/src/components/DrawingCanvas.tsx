import { useRef, useEffect, useState } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";

interface DrawingCanvasProps {
  color: string;
  tool: "pen" | "eraser" | "underline";
  onClear: () => void;
  clearTrigger: number;
}

export function DrawingCanvas({
  color,
  tool,
  onClear,
  clearTrigger,
}: DrawingCanvasProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [strokeColor, setStrokeColor] = useState(color);
  const [strokeWidth, setStrokeWidth] = useState(3);

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: rect.width,
          height: Math.max(rect.height, window.innerHeight),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", updateDimensions);
    };
  }, []);

  useEffect(() => {
    setStrokeColor(color);
  }, [color]);

  useEffect(() => {
    if (tool === "underline") {
      setStrokeWidth(5);
      // Màu vàng mặc định cho gạch chân
      setStrokeColor("#eab308");
    } else if (tool === "eraser") {
      setStrokeWidth(15);
      setStrokeColor("#ffffff"); // Màu trắng để "xóa"
    } else {
      setStrokeWidth(3);
      setStrokeColor(color);
    }
  }, [tool, color]);

  useEffect(() => {
    if (clearTrigger > 0 && canvasRef.current) {
      canvasRef.current.clearCanvas();
    }
  }, [clearTrigger]);

  if (dimensions.width === 0 || dimensions.height === 0) {
    return (
      <div
        ref={containerRef}
        className="fixed inset-0 pointer-events-none z-40"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ width: "100%", height: "100%" }}
    >
      <ReactSketchCanvas
        ref={canvasRef}
        width={dimensions.width.toString()}
        height={dimensions.height.toString()}
        strokeColor={strokeColor}
        strokeWidth={strokeWidth}
        canvasColor="transparent"
        className="pointer-events-auto"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
        }}
      />
    </div>
  );
}

