import type { NextConfig } from "next";
import path from "path";

const repoName = "all_the_books_i_have_ever_read";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  basePath: isProd ? `/${repoName}` : "",
  assetPrefix: isProd ? `/${repoName}/` : "",
  images: { unoptimized: true },
  trailingSlash: true,
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
