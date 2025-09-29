/** @type {import('next').NextConfig} */
const nextConfig = {
  devIndicators: false,
  async rewrites() {
    const envBase = process.env.NEXT_PUBLIC_MAIN_API_URL || "";
    const normalizedBase = envBase
      ? envBase.replace(/\/+$/, "").replace(/\/api$/i, "")
      : "";

    // If env base provided, proxy to deployed backend; else fallback to localhost for dev
    const destination = normalizedBase
      ? `${normalizedBase}/api/:path*`
      : "http://localhost:5001/api/:path*";

    console.log('Next.js proxy config:', {
      envBase,
      normalizedBase,
      destination,
      hasEnv: !!envBase
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


