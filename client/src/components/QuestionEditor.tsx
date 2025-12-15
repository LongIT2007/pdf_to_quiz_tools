import { useRef, useEffect, useState } from "react";
import { Loader2, Image as ImageIcon } from "lucide-react";
import { imageAPI } from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Helper to ensure image URLs in HTML are absolute
function ensureAbsoluteImageUrls(html: string): string {
  if (!html) return html;
  
  // Replace relative image URLs with absolute ones
  return html.replace(/src="(\/api\/images\/[^"]+)"/g, (match, path) => {
    const absoluteUrl = imageAPI.ensureAbsoluteUrl(path);
    return `src="${absoluteUrl}"`;
  });
}

interface QuestionEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  onImageUpload?: (imageUrl: string) => void;
}

export function QuestionEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung câu hỏi...",
  className,
  onImageUpload,
}: QuestionEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      const processedValue = ensureAbsoluteImageUrls(value);
      if (editorRef.current.innerHTML !== processedValue) {
        editorRef.current.innerHTML = processedValue;
      }
    }
  }, [value]);

  const handlePaste = async (e: React.ClipboardEvent<HTMLDivElement>) => {
    const clipboardData = e.clipboardData;
    const items = clipboardData.items;

    // Check if there's an image in clipboard
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          await uploadImage(file);
        }
        return;
      }
    }

    // Handle text paste normally
    // Let default paste behavior happen for text
  };

  const uploadImage = async (file: File) => {
    setIsUploading(true);
    try {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB");
        setIsUploading(false);
        return;
      }

      const result = await imageAPI.upload(file);
      
      // Insert image into editor
      if (editorRef.current) {
        const selection = window.getSelection();
        let range: Range | null = null;
        
        if (selection && selection.rangeCount > 0) {
          range = selection.getRangeAt(0);
        } else {
          // Create a new range at the end
          range = document.createRange();
          range.selectNodeContents(editorRef.current);
          range.collapse(false);
        }
        
        // Create image element
        const img = document.createElement("img");
        img.src = result.url;
        const isMobile = window.innerWidth < 640;
        img.style.maxWidth = "100%";
        img.style.width = isMobile ? "100%" : "auto";
        img.style.height = "auto";
        img.style.maxHeight = isMobile ? "70vh" : "none";
        img.style.display = "block";
        img.style.margin = "10px 0";
        img.style.objectFit = "contain";
        img.className = "question-image";
        
        // Insert image at cursor position or end
        if (range) {
          // Check if range is collapsed (cursor position)
          if (range.collapsed) {
            range.insertNode(img);
            // Move cursor after image
            range.setStartAfter(img);
            range.collapse(true);
          } else {
            // Replace selected content with image
            range.deleteContents();
            range.insertNode(img);
            range.setStartAfter(img);
            range.collapse(true);
          }
          
          // Update selection
          selection?.removeAllRanges();
          selection?.addRange(range);
        }

        // Update value (ensure image URLs are absolute)
        if (editorRef.current) {
          const htmlContent = ensureAbsoluteImageUrls(editorRef.current.innerHTML);
          onChange(htmlContent);
        }

        // Call onImageUpload callback if provided
        if (onImageUpload) {
          onImageUpload(result.url);
        }
      }

      toast.success("Đã thêm ảnh vào câu hỏi");
    } catch (error: any) {
      toast.error("Lỗi tải ảnh: " + (error.message || "Lỗi không xác định"));
    } finally {
      setIsUploading(false);
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    
    if (files.length > 0 && files[0].type.startsWith("image/")) {
      await uploadImage(files[0]);
    }
  };

  return (
    <div className="relative">
      <div
        ref={editorRef}
        contentEditable
        onPaste={handlePaste}
        onInput={handleInput}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className={cn(
          "min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          "prose prose-sm max-w-none",
          "[&_img]:max-w-full [&_img]:w-full sm:[&_img]:w-auto [&_img]:max-h-[70vh] sm:[&_img]:max-h-none [&_img]:h-auto [&_img]:block [&_img]:my-2 [&_img]:object-contain",
          "[&_p]:m-0 [&_p]:mb-2 [&_br]:mb-2",
          isUploading && "opacity-50",
          className
        )}
        style={{
          whiteSpace: "pre-wrap",
        }}
        data-placeholder={placeholder}
        suppressContentEditableWarning
      />
      
      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      <style>{`
        [contenteditable][data-placeholder]:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          pointer-events: none;
        }
        [contenteditable] img.question-image {
          cursor: pointer;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 4px;
          background: #f9fafb;
        }
        [contenteditable] img.question-image:hover {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}

