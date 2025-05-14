/** @type {import('next').NextConfig} */
const nextConfig = {
    productionBrowserSourceMaps: false,
    // Disable source maps in development
    webpack: (config, { dev }) => {
      config.resolve.alias = {
        ...config.resolve.alias,
        sharp$: false,
        'onnxruntime-node$': false,
      };
      if (dev) {
        config.devtool = false;
      }
      return config;
    }
};

module.exports = nextConfig;