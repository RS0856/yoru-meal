import type { NextConfig } from "next";
import { validateEnvVars } from "./src/lib/env";

// ビルド時に環境変数を検証
try {
  validateEnvVars(true);
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
