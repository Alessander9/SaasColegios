const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@cole/ui-components', '@cole/domain-types'],
  outputFileTracingRoot: path.join(__dirname, '../../'),
};

module.exports = nextConfig;

