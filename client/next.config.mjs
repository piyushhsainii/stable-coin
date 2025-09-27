/** @type {import('next').NextConfig} */
export const nextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        url: require.resolve("url"),
        zlib: require.resolve("browserify-zlib"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        assert: require.resolve("assert"),
        os: false,
        path: false,
        "pino-pretty": false, // ← Add this line
      };
    }
    return config;
  },
  experimental: {
    esmExternals: "loose",
  },
  transpilePackages: ["@solana/wallet-adapter-base"],
};
