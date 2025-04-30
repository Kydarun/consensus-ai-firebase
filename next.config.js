const nextConfig = {
  allowedDevOrigins: [
    'http://localhost:9002', 'https://9000-idx-studio-1745946610476.cluster-htdgsbmflbdmov5xrjithceibm.cloudworkstations.dev'
  ],
  webpack: (config) => {
    config.experiments = {
      asyncWebAssembly: true
    };
    config.resolve.fallback = {      
      ...config.resolve.fallback,
      process: require.resolve('process/browser')
    }

    return config;
  },

    images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
