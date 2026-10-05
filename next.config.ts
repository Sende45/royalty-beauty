import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  // Autorise l'accès depuis ton téléphone en développement (adresse IP de ton PC)
  allowedDevOrigins: ["192.168.1.91"],
};

export default nextConfig;