import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Επιτρέπει αρκετά μεγάλο payload ώστε να χωράει η εικόνα άρθρου (base64).
      bodySizeLimit: "5mb",
    },
  },
};

export default nextConfig;
