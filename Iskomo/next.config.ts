import type { NextConfig } from "next";

const devOrigins = process.env.ALLOWED_DEV_ORIGINS
  ? process.env.ALLOWED_DEV_ORIGINS.split(',').map(s => s.trim())
  : [];

const nextConfig: NextConfig = {
  ...(devOrigins.length > 0 ? { allowedDevOrigins: devOrigins } : {}),
  async redirects() {
    return [
      // Auth redirects
      { source: '/Authentication/auth', destination: '/login', permanent: true },
      { source: '/Authentication/Registration', destination: '/register', permanent: true },
      { source: '/student/login', destination: '/login', permanent: true },
      { source: '/osfa/login', destination: '/login', permanent: true },
      { source: '/student/osfa', destination: '/osfa/home', permanent: true },

      // Student page redirects
      { source: '/Authentication/Student', destination: '/student/dashboard', permanent: true },
      { source: '/Authentication/Student/dashboard', destination: '/student/dashboard', permanent: true },
      { source: '/Authentication/Student/apply-scholarship', destination: '/student/apply-scholarship', permanent: true },
      { source: '/Authentication/Student/iskolarships', destination: '/student/iskolarships', permanent: true },
      { source: '/Authentication/Student/kapwa', destination: '/student/kapwa', permanent: true },
      { source: '/Authentication/Student/profile', destination: '/student/profile', permanent: true },
      { source: '/Authentication/Student/status', destination: '/student/status', permanent: true },

      // OSFA page redirects
      { source: '/Authentication/OSFA', destination: '/osfa/home', permanent: true },
      { source: '/Authentication/OSFA/home', destination: '/osfa/home', permanent: true },
      { source: '/Authentication/OSFA/applicants', destination: '/osfa/applicants', permanent: true },
      { source: '/Authentication/OSFA/evaluation', destination: '/osfa/evaluation', permanent: true },
      { source: '/Authentication/OSFA/notifications', destination: '/osfa/notifications', permanent: true },
      { source: '/Authentication/OSFA/profile', destination: '/osfa/profile', permanent: true },
      { source: '/Authentication/OSFA/reports', destination: '/osfa/reports', permanent: true },
      { source: '/Authentication/OSFA/scholarships', destination: '/osfa/scholarships', permanent: true },
    ];
  },
};

export default nextConfig;
