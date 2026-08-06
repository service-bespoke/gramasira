import withPWAInit from "next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",

  register: true,

  skipWaiting: true,

  disable: process.env.NODE_ENV === "development",

  cacheOnFrontEndNav: true,

  runtimeCaching: require("next-pwa/cache"),

  buildExcludes: [/middleware-manifest\.json$/],

  fallbacks: {
    document: "/offline.html",
  },
});

const nextConfig: NextConfig = {
  reactStrictMode: true,

  output: "standalone",

  images: {
    unoptimized: true,
  },

  experimental: {
    typedRoutes: true,
  },
};

export default withPWA(nextConfig);
