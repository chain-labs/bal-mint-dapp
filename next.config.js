/** @type {import('next').NextConfig} */

const path = require("path");
const nextConfig = {
  images: { domains: ["ik.imagekit.io"]},
  sassOptions: {
    includePaths: [path.join(__dirname, "styles")],
  },
  reactStrictMode: true,
}

module.exports = nextConfig
