"use client"

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ActivePage = 'dashboard' | 'iskolarships' | 'kapwa' | 'status' | 'profile';

interface StudentNavbarProps {
  activePage: ActivePage;
}

export default function StudentNavbar({ activePage }: StudentNavbarProps) {
  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);

  const handleSignOut = () => {
    router.push('/login');
  };

  const navLinks: { href: string; page: ActivePage; label: string; icon: React.ReactNode }[] = [
    {
      href: '/student/dashboard',
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
      href: '/student/iskolarships',
      page: 'iskolarships',
      label: 'Iskolarships',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          <path d="M9 7h6"/><path d="M9 11h6"/><path d="M9 15h4"/>
        </svg>
      ),
    },
    {
      href: '/student/kapwa',
      page: 'kapwa',
      label: 'Kapwa',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
          <circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      ),
    },
    {
      href: '/student/status',
      page: 'status',
      label: 'Status',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 3v18h18"/>
          <path d="M7 12l4-4 4 4 6-6"/>
        </svg>
      ),
    },
    {
      href: '/student/profile',
      page: 'profile',
      label: 'Profile',
      icon: (
        <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <Link href="/student/dashboard" className="navbar-logo-link">
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

        {/* Right: Notifications + Sign Out */}
        <div className="navbar-right">
          <div className="notification-dropdown">
            <button
              className="notification-btn linkedin-notification"
              id="notificationTrigger"
              title="Notifications"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <svg className="notification-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="notification-label">Notifications</span>
              <span className="notification-badge"></span>
            </button>

            {notifOpen && (
              <div className="notification-menu" id="notificationMenu">
                <div className="notification-header">
                  <div className="notification-logo-container">
                    <img src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" alt="IskoMo Logo" style={{height:'32px',width:'auto',filter:'brightness(0) invert(1)'}} />
                  </div>
                  <div className="notification-welcome">
                    <div className="notification-welcome-title" style={{fontSize:'1rem',fontWeight:'600',margin:'0 0 0.125rem 0',color:'white',lineHeight:'1.3'}}>Welcome Iskolar</div>
                    <div className="notification-welcome-subtitle" style={{fontSize:'0.75rem',margin:'0',color:'rgba(255,255,255,0.85)',fontWeight:'400',lineHeight:'1.4'}}>Stay updated with your scholarship journey</div>
                  </div>
                </div>
                <div className="notification-content">
                  <div className="notification-empty-state">
                    <svg className="notification-empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:'#9ca3af',marginBottom:'0.75rem',opacity:0.4}}>
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                    <p className="notification-empty-text" style={{fontSize:'0.875rem',fontWeight:'500',color:'#1f2937',margin:'0 0 0.25rem 0'}}>No new notifications</p>
                    <p className="notification-empty-subtext" style={{fontSize:'0.75rem',color:'#6b7280',margin:'0'}}>You&apos;re all caught up!</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sign Out */}
          <button
            className="notification-btn linkedin-notification"
            id="navLogoutBtn"
            title="Sign Out"
            onClick={handleSignOut}
            style={{marginLeft:'0.25rem'}}
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
