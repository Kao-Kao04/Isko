"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';

type ActivePage = 'dashboard' | 'scholarships' | 'applicants' | 'evaluation' | 'reports' | 'notifications' | 'profile';

interface OsfaNavbarProps {
  activePage: ActivePage;
}

export default function OsfaNavbar({ activePage }: OsfaNavbarProps) {
  const router = useRouter();

  const handleSignOut = () => {
    router.push('/login');
  };

  const navLinks: { href: string; page: ActivePage; label: string; icon: React.ReactNode }[] = [
    {
      href: '/osfa/dashboard',
      page: 'dashboard',
      label: 'Home',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      href: '/osfa/scholarships',
      page: 'scholarships',
      label: 'Scholarships',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
        </svg>
      ),
    },
    {
      href: '/osfa/applicants',
      page: 'applicants',
      label: 'Applicants',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
        </svg>
      ),
    },
    {
      href: '/osfa/evaluation',
      page: 'evaluation',
      label: 'Evaluation',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4"/>
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
        </svg>
      ),
    },
    {
      href: '/osfa/reports',
      page: 'reports',
      label: 'Reports',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3v18h18"/>
          <path d="M7 12l4-4 4 4 6-6"/>
        </svg>
      ),
    },
    {
      href: '/osfa/notifications',
      page: 'notifications',
      label: 'Notifications',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
        </svg>
      ),
    },
    {
      href: '/osfa/profile',
      page: 'profile',
      label: 'Profile',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      ),
    },
  ];

  return (
    <header className="top-navbar">
      <div className="top-navbar-container">
        {/* Left: Logo + Search */}
        <div className="navbar-left">
          <div className="navbar-logo">
            <Link href="/osfa/dashboard" className="navbar-logo-link">
              <img src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" alt="IskoMo" />
            </Link>
          </div>
          <div className="navbar-search linkedin-search">
            <svg className="navbar-search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="9" r="6"/>
              <path d="m17 17-4-4"/>
            </svg>
            <input type="text" placeholder="Search" id="searchInput" autoComplete="off" />
          </div>
        </div>

        {/* Center: Nav Links */}
        <nav className="navbar-center">
          {navLinks.map((link) => (
            <Link
              key={link.page}
              href={link.href}
              className={`nav-link${activePage === link.page ? ' active' : ''}`}
            >
              {link.icon}
              <span className="nav-label">{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Right: Sign Out */}
        <div className="navbar-right">
          <button
            className="notification-btn linkedin-notification"
            id="navLogoutBtn"
            title="Sign Out"
            onClick={handleSignOut}
          >
            <svg className="notification-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:'#dc2626'}}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            <span className="notification-label" style={{color:'#dc2626'}}>Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
