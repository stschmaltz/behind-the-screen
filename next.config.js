/* eslint-disable @typescript-eslint/no-var-requires */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  publicExcludes: [
    '!**/*.exe',
    '!**/*.wav',
    '!sitemap*.xml',
    '!robots.txt',
    '!privacy-policy.html',
    '!terms-of-service.html',
  ],
});

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    // Adjust this policy based on your specific needs
    value: `default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' storage.ko-fi.com va.vercel-scripts.com js.stripe.com us-assets.i.posthog.com; style-src 'self' 'unsafe-inline' storage.ko-fi.com; font-src 'self'; img-src 'self' d205bpvrqc9yn1.cloudfront.net media-waterdeep.cursecdn.com data: storage.ko-fi.com; frame-src ko-fi.com js.stripe.com; object-src 'none'; frame-ancestors 'none'; connect-src 'self' https://api.sendgrid.com us.i.posthog.com us-assets.i.posthog.com;`,
  },
];

module.exports = withPWA({
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      '@heroicons/react',
      'react-icons',
      'lodash',
      '@floating-ui/react',
    ],
  },
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  async rewrites() {
    return [
      {
        source: '/ingest/static/:path*',
        destination: 'https://us-assets.i.posthog.com/static/:path*',
      },
      {
        source: '/ingest/:path*',
        destination: 'https://us.i.posthog.com/:path*',
      },
    ];
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application.
        source: '/:path*',
        headers: securityHeaders,
      },
      {
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=2592000',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=2592000',
          },
        ],
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'd205bpvrqc9yn1.cloudfront.net',
        pathname: '/**.gif',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/a/**',
      },
      {
        protocol: 'https',
        hostname: 's.gravatar.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.auth0.com',
        pathname: '/avatars/**',
      },
    ],
  },

  webpack(config, { dev, isServer }) {
    if (dev && !isServer) {
      config.watchOptions = {
        poll: 500,
        aggregateTimeout: 200,
      };
    }

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
});
