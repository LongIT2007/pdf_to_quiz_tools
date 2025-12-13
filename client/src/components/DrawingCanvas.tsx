import { useRef, useEffect, useState } from "react";
import { ReactSketchCanvas, ReactSketchCanvasRef } from "react-sketch-canvas";

interface DrawingCanvasProps {
  color: string;
  tool: "pen" | "eraser" | "underline";
  onClear: () => void;
  clearTrigger: number;
  containerRef?: React.RefObject<HTMLDivElement | null>;
}

export function DrawingCanvas({
  color,
  tool,
  onClear,
  clearTrigger,
  containerRef: parentContainerRef,
}: DrawingCanvasProps) {
  const canvasRef = useRef<ReactSketchCanvasRef>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [strokeColor, setStrokeColor] = useState(color);
  const [strokeWidth, setStrokeWidth] = useState(3);

  // Update dimensions when container size changes
  useEffect(() => {
    const updateDimensions = () => {
      // Use parent container if provided, otherwise use canvas container
      const container = parentContainerRef?.current || canvasContainerRef.current;
      if (container) {
        const rect = container.getBoundingClientRect();
        // Get the full height of the document
        const documentHeight = Math.max(
          document.body.scrollHeight,
          document.body.offsetHeight,
          document.documentElement.clientHeight,
          document.documentElement.scrollHeight,
          document.documentElement.offsetHeight
        );
        
        setDimensions({
          width: rect.width,
          height: documentHeight,
        });
      }
    };

    updateDimensions();
    
    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(updateDimensions);
    const container = parentContainerRef?.current || canvasContainerRef.current;
    if (container) {
      resizeObserver.observe(container);
    }
    
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", updateDimensions, { passive: true });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", updateDimensions);
    };
  }, [parentContainerRef]);

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
        ref={canvasContainerRef}
        className="absolute inset-0 pointer-events-none z-40"
      />
    );
  }

  return (
    <div
      ref={canvasContainerRef}
      className="absolute inset-0 pointer-events-none z-40"
      style={{ 
        width: "100%", 
        height: `${dimensions.height}px`,
        top: 0,
        left: 0,
      }}
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
          position: "absolute",
          top: 0,
          left: 0,
          width: `${dimensions.width}px`,
          height: `${dimensions.height}px`,
          pointerEvents: "auto",
        }}
      />
    </div>
  );
}

