/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
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
   experimental: {
    serverActions: true, // Enable Server Actions if needed for future backend logic
    // If using body parsing with server actions:
    // serverActions: {
    //   bodySizeLimit: '2mb', // Adjust size limit if needed
    // },
  },
};

module.exports = nextConfig;
