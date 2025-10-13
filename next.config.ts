/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async rewrites() {
    const isDev = process.env.NODE_ENV !== "production";
    const envBase = process.env.NEXT_PUBLIC_MAIN_API_URL || "";
    const normalizedBase = envBase
      ? envBase.replace(/\/+$/, "").replace(/\/api$/i, "")
      : "";

    // Allow overriding backend-auth port in dev (default 5001)
    const devPort = process.env.BACKEND_AUTH_PORT || "5001";

    const destination = isDev
      ? `http://localhost:${devPort}/api/:path*`
      : (normalizedBase ? `${normalizedBase}/api/:path*` : "/api/:path*");

    console.log('Next.js proxy config:', {
      NODE_ENV: process.env.NODE_ENV,
      envBase,
      normalizedBase,
      destination,
      hasEnv: !!envBase,
      devPort,
    });

    return [
      {
        source: "/api/:path*",
        destination,
      },
    ];
  },
};

export default nextConfig;


