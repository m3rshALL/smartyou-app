import type { NextConfig } from "next";
import webpack from 'webpack';

const nextConfig: NextConfig = {
  /* config options here */
  webpack: (config: webpack.Configuration, { isServer }: { isServer: boolean }) => {
    // Handle WebAssembly for Remix/Solidity compiler
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    
    // Add fallbacks for Node.js modules in browser
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve("crypto-browserify"),
        stream: require.resolve("stream-browserify"),
        util: require.resolve("util/"),
        buffer: require.resolve("buffer"),
        process: require.resolve("process/browser"),
        path: require.resolve("path-browserify"),
        os: require.resolve("os-browserify/browser"),
        assert: require.resolve("assert"),
        http: require.resolve("stream-http"),
        https: require.resolve("https-browserify"),
        url: require.resolve("url"),
        zlib: require.resolve("browserify-zlib"),
        vm: require.resolve("vm-browserify"),
      };
    }
    
    // Add plugins for polyfills
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.ProvidePlugin({
        Buffer: ['buffer', 'Buffer'],
        process: 'process/browser',
      })
    );
    
    return config;
  },
  
  // Enable experimental features
  experimental: {
    serverComponentsExternalPackages: ['@remix-project/remix-solidity'],
  },
};

export default nextConfig;
