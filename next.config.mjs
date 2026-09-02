/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    // Left on Next.js's default /_next/image optimizer for now, unlike
    // EarbudsTimeline which ended up needing a custom loader after hitting
    // Vercel's free Image Optimization quota (1,000 source images/month on
    // Hobby) once real traffic + real images arrived. Worth watching the
    // same usage metric here once this site has real images — see
    // lib/imageLoader.js and lib/imageVariants.js on the EarbudsTimeline
    // repo for the fix if/when it's needed, rather than building that
    // pipeline preemptively against zero real images.
  },
};

export default nextConfig;
