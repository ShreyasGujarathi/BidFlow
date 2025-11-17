'use client';

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { uploadImages } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import Image from "next/image";

interface ImageUploaderProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  onError?: (error: string) => void;
}

export const ImageUploader = ({
  images,
  onImagesChange,
  onError,
}: ImageUploaderProps) => {
  const { token } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    if (!token) {
      onError?.("You must be signed in to upload images.");
      return;
    }

    setUploading(true);
    try {
      const fileArray = Array.from(files);
      // Validate file types
      const invalidFiles = fileArray.filter(
        (file) => !file.type.startsWith("image/")
      );
      if (invalidFiles.length > 0) {
        throw new Error("Only image files are allowed.");
      }

      // Validate file sizes (10MB max)
      const largeFiles = fileArray.filter((file) => file.size > 10 * 1024 * 1024);
      if (largeFiles.length > 0) {
        throw new Error("File size must be less than 10MB.");
      }

      const uploadedUrls = await uploadImages(fileArray, token);
      onImagesChange([...images, ...uploadedUrls]);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFileUpload(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const moveImage = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === images.length - 1)
    ) {
      return;
    }

    const newImages = [...images];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    [newImages[index], newImages[newIndex]] = [newImages[newIndex], newImages[index]];
    onImagesChange(newImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-xl border-2 border-dashed p-6 transition ${
          dragActive
            ? ""
            : "hover:opacity-80"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        style={{
          borderColor: dragActive ? 'var(--primary)' : 'var(--border)',
          backgroundColor: dragActive ? 'rgba(59, 130, 246, 0.1)' : 'var(--background)'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            style={{ color: 'var(--muted-foreground)' }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mt-2 text-sm" style={{ color: 'var(--foreground)' }}>
            {uploading ? "Uploading..." : "Drag and drop images here"}
          </p>
          <p className="mt-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            or click to select files
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="mt-4 rounded-xl px-4 py-2 text-sm font-semibold transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              backgroundColor: 'var(--primary)',
              color: 'var(--primary-foreground)'
            }}
          >
            {uploading ? "Uploading..." : "Select Images"}
          </button>
          <p className="mt-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Max 10 images, 10MB per file. JPEG, PNG, GIF, WebP supported.
          </p>
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium" style={{ color: 'var(--foreground)' }}>
            Images ({images.length}/10)
          </p>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="group relative aspect-square overflow-hidden rounded-xl border"
                style={{
                  borderColor: 'var(--border)',
                  backgroundColor: 'var(--card)'
                }}
              >
                <div className="absolute inset-2">
                  <Image
                    src={url}
                    alt={`Upload ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                </div>

                {/* Overlay with controls */}
                <div className="absolute inset-0 bg-black/60 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    {/* Reorder buttons */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => moveImage(index, "up")}
                        disabled={index === 0}
                        className="rounded-md bg-white/20 p-1.5 text-white transition hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 15l7-7 7 7"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => moveImage(index, "down")}
                        disabled={index === images.length - 1}
                        className="rounded-md bg-white/20 p-1.5 text-white transition hover:bg-white/30 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Remove button */}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="rounded-md px-3 py-1.5 text-xs font-medium transition hover:opacity-90"
                      style={{ backgroundColor: 'var(--error)', color: 'var(--error-foreground)' }}
                      title="Remove"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Image number badge */}
                <div className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-1 text-xs font-semibold text-white">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

