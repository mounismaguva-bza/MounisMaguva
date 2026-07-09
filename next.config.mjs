function r2PublicHostname() {
  const value = process.env.R2_PUBLIC_URL?.trim();
  if (!value) return null;
  try {
    return new URL(value).hostname;
  } catch {
    return null;
  }
}

const r2Host = r2PublicHostname();

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "mounismaguva.com" }],
        destination: "https://www.mounismaguva.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "maguvaethnics.com" }],
        destination: "https://www.mounismaguva.com/:path*",
        permanent: true,
      },
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.maguvaethnics.com" }],
        destination: "https://www.mounismaguva.com/:path*",
        permanent: true,
      },
    ];
  },
  images: {
    qualities: [100, 95, 75],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "storage.googleapis.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "pub-821ee3ea887e4f29842aa128333ad07d.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.r2.dev",
      },
      ...(r2Host
        ? [
            {
              protocol: "https",
              hostname: r2Host,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
