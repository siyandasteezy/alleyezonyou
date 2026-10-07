"use client";

import { useState } from "react";
import { PlaceholderImage } from "@/components/placeholder-image";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = useState(0);
  return (
    <div>
      <div className="aspect-square overflow-hidden rounded-[var(--radius)] border border-line">
        <PlaceholderImage src={images[index]} alt={name} label="Product image" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show image ${i + 1}`}
              className={`aspect-square overflow-hidden rounded-lg border-2 ${i === index ? "border-accent" : "border-transparent"}`}
            >
              <PlaceholderImage src={src} alt="" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
