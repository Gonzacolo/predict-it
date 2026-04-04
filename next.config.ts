import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@dynamic-labs/sdk-react-core",
    "@dynamic-labs/ethereum",
    "@dynamic-labs/sdk-api-core",
  ],
};

export default nextConfig;
