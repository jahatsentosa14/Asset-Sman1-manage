/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Diisi otomatis dari NEXT_PUBLIC_SUPABASE_URL saat deploy.
    // Contoh hasil akhir: ['xxxxx.supabase.co']
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

module.exports = nextConfig;
