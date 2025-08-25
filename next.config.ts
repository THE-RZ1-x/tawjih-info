import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  // إعادة تفعيل HMR في وضع التطوير، مع الحفاظ على الخادم المخصص
  reactStrictMode: true,
  webpack: (config) => {
    // لا تقم بتعطيل مراقبة الملفات في التطوير
    return config;
  },
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
