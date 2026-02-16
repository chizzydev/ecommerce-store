import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // optional, but recommended
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
       {
        protocol: 'https',
        hostname: 'utfs.io', // ADD THIS FOR UPLOADTHING
      },
    ],
  },
  // Add other Next.js config options here if needed
};

export default withSentryConfig(nextConfig, {
  org: "chizzy-dev",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});
