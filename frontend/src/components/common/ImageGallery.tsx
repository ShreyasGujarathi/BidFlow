'use client';

import { useState, useEffect } from "react";
import Image from "next/image";

interface ImageWithError {
  src: string;
  hasError: boolean;
}

interface ImageGalleryProps {
  images: string[];
  title?: string;
}

export const ImageGallery = ({ images, title }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  
  const handleImageError = (imageSrc: string) => {
    setImageErrors((prev) => new Set(prev).add(imageSrc));
  };
  
  const handleImageLoad = (imageSrc: string) => {
    setLoadedImages((prev) => new Set(prev).add(imageSrc));
  };
  
  const validImages = images.filter((img) => img && !imageErrors.has(img));
  
  // Helper to check if image is from localhost (needs unoptimized)
  const isLocalhostImage = (src: string) => {
    if (!src) return false;
    try {
      const url = new URL(src, window.location.origin);
      return url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    } catch {
      return src.startsWith('http://localhost') || src.startsWith('http://127.0.0.1');
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;

      if (e.key === "Escape") {
        setSelectedIndex(null);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev !== null ? (prev > 0 ? prev - 1 : images.length - 1) : null
        );
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev !== null ? (prev < images.length - 1 ? prev + 1 : 0) : null
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedIndex, images.length]);

  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  if (!images || images.length === 0 || validImages.length === 0) {
    return (
      <div 
        className="flex aspect-video items-center justify-center rounded-lg border"
        style={{
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface)',
          color: 'var(--muted-foreground)'
        }}
      >
        No images available
      </div>
    );
  }

  return (
    <>
      {/* Thumbnail Grid */}
      <div className="space-y-4">
        {/* Main Image */}
        <div 
          className="relative aspect-video w-full overflow-hidden rounded-lg border"
          style={{
            borderColor: 'var(--border)',
            backgroundColor: 'var(--surface)'
          }}
        >
          {validImages.length > 0 ? (
            <>
              <div className="absolute inset-2">
                <Image
                  src={validImages[0]}
                  alt={title || "Auction image"}
                  fill
                  className="cursor-pointer object-contain transition-transform hover:scale-105"
                  onClick={() => {
                    const originalIndex = images.indexOf(validImages[0]);
                    setSelectedIndex(originalIndex >= 0 ? originalIndex : 0);
                  }}
                  sizes="(max-width: 768px) 100vw, 80vw"
                  onError={() => handleImageError(validImages[0])}
                  onLoad={() => handleImageLoad(validImages[0])}
                  unoptimized={isLocalhostImage(validImages[0])}
                />
              </div>
              {validImages.length > 1 && (
                <button
                  onClick={() => {
                    const originalIndex = images.indexOf(validImages[0]);
                    setSelectedIndex(originalIndex >= 0 ? originalIndex : 0);
                  }}
                  className="absolute bottom-4 right-4 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white transition hover:bg-black/90"
                >
                  View All ({validImages.length})
                </button>
              )}
            </>
          ) : (
            <div className="flex h-full items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
              Image failed to load
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {validImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
            {validImages.slice(0, 8).map((image, index) => {
              const originalIndex = images.indexOf(image);
              return (
                <div
                  key={image}
                  className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg border transition hover:opacity-80"
                  style={{ borderColor: 'var(--border)' }}
                  onClick={() => setSelectedIndex(originalIndex >= 0 ? originalIndex : index)}
                >
                  <Image
                    src={image}
                    alt={`${title || "Auction"} image ${index + 1}`}
                    fill
                    className="object-cover transition-transform group-hover:scale-110"
                    sizes="(max-width: 640px) 25vw, (max-width: 1024px) 16vw, 12vw"
                    onError={() => handleImageError(image)}
                    onLoad={() => handleImageLoad(image)}
                    unoptimized={isLocalhostImage(image)}
                  />
                  {index === 7 && validImages.length > 8 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs font-semibold text-white">
                      +{validImages.length - 8}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          onClick={() => setSelectedIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedIndex(null)}
            className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close gallery"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(
                    selectedIndex > 0 ? selectedIndex - 1 : images.length - 1
                  );
                }}
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                aria-label="Previous image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex(
                    selectedIndex < images.length - 1 ? selectedIndex + 1 : 0
                  );
                }}
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition hover:bg-white/20"
                aria-label="Next image"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </>
          )}

          {/* Main Image Container */}
          <div
            className="relative flex h-full w-full items-center justify-center px-4"
            onClick={(e) => e.stopPropagation()}
          >
            {selectedIndex !== null && images[selectedIndex] && !imageErrors.has(images[selectedIndex]) ? (
              <div className="relative flex items-center justify-center" style={{ maxHeight: '90vh', maxWidth: '90vw' }}>
                <img
                  src={images[selectedIndex]}
                  alt={`${title || "Auction"} image ${selectedIndex + 1}`}
                  className="max-h-[90vh] max-w-[90vw] object-contain"
                  style={{ width: 'auto', height: 'auto' }}
                  onError={() => handleImageError(images[selectedIndex])}
                  onLoad={() => handleImageLoad(images[selectedIndex])}
                />
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-white">
                Image not available
              </div>
            )}
          </div>

          {/* Image Counter */}
          {validImages.length > 1 && selectedIndex !== null && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white">
              {validImages.findIndex((img) => img === images[selectedIndex]) + 1} / {validImages.length}
            </div>
          )}

          {/* Thumbnail Strip at Bottom */}
          {validImages.length > 1 && (
            <div className="absolute bottom-16 left-1/2 flex max-w-[90vw] -translate-x-1/2 gap-2 overflow-x-auto pb-2">
              {validImages.map((image, index) => {
                const originalIndex = images.indexOf(image);
                const isSelected = selectedIndex !== null && images[selectedIndex] === image;
                return (
                  <button
                    key={image}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedIndex(originalIndex >= 0 ? originalIndex : index);
                    }}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded border-2 transition ${
                      isSelected
                        ? "border-primary"
                        : "border-white/30 hover:border-white/60"
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="64px"
                      onError={() => handleImageError(image)}
                      onLoad={() => handleImageLoad(image)}
                      unoptimized={isLocalhostImage(image)}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
};

