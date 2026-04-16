"use client";

import { useState, useRef, type ChangeEvent } from "react";
import { Camera, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { saveImage, getImage } from "@/lib/image-storage";

interface ImageUploadProps {
  storageKey: string;
  currentImage?: string | null;
  onImageChange?: (url: string | null) => void;
  shape?: "circle" | "rounded";
  size?: "sm" | "md" | "lg";
  fallback?: React.ReactNode;
  className?: string;
}

const sizeClasses = {
  sm: "h-16 w-16",
  md: "h-20 w-20",
  lg: "h-24 w-24",
};

export function ImageUpload({
  storageKey,
  currentImage,
  onImageChange,
  shape = "circle",
  size = "md",
  fallback,
  className,
}: ImageUploadProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(() => currentImage ?? getImage(storageKey));
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const url = await saveImage(storageKey, file);
      setImageUrl(url);
      onImageChange?.(url);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setImageUrl(null);
    onImageChange?.(null);
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          sizeClasses[size],
          "overflow-hidden border-4 border-white/20 bg-white/10 flex items-center justify-center",
          shape === "circle" ? "rounded-full" : "rounded-xl",
        )}
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin text-white/60" />
        ) : imageUrl ? (
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          fallback
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full shadow-lg transition-colors",
          "bg-brand-600 text-white hover:bg-brand-700",
        )}
      >
        <Camera className="h-4 w-4" />
      </button>
      {imageUrl && (
        <button
          type="button"
          onClick={handleRemove}
          className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm hover:bg-red-600"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
