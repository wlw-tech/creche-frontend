import type { NextConfig } from "next";
import path from "path";

process.env.TURBOPACK = "0";
process.env.EXPERIMENTAL_TURBOPACK = "0";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  webpack: (config) => {
    if (config.resolve?.alias) {
      config.resolve.alias["@"] = path.join(__dirname, "src");
    }
    return config;
  },

  typescript: { ignoreBuildErrors: false },

  experimental: {
    serverActions: { bodySizeLimit: "2mb" },
  },
};

export default withPWA(nextConfig);
