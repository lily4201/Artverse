/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config: any, { isServer }: { isServer: boolean }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        stream: false,
        os: false,
      };
    }
    return config;
  },
  transpilePackages: ['@toast-ui/react-image-editor'],
};

module.exports = nextConfig; 