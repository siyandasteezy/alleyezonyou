import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    // Unsplash resizes on its own CDN; other URLs are served as-is.
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    qualities: [75, 85],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
