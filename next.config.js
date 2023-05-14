/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "picsum.photos",
      "lh3.googleusercontent.com",
      "xsgames.co",
    ],
  },
};

module.exports = nextConfig;
