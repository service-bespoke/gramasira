import withPWA from "next-pwa";

const nextConfig = {
  reactStrictMode: true,

  images: {
    unoptimized: true,
  },

  experimental: {
    typedRoutes: true,
  },
};

export default withPWA({
  dest: "public",
  register: true,
  skipWaiting: true,

  // Disable PWA only during development
  disable: process.env.NODE_ENV === "development",

  // Cache Google Fonts
  cacheOnFrontEndNav: true,
})(nextConfig);
