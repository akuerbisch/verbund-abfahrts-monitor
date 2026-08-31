import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Lets the client cheaply detect a new deploy (see useAutoReloadOnDeploy) by
  // polling this static route's headers instead of a billed API route.
  async headers() {
    return [
      {
        source: "/",
        headers: [{ key: "X-Build-Id", value: process.env.VERCEL_GIT_COMMIT_SHA ?? "dev" }],
      },
    ];
  },
};

export default nextConfig;
