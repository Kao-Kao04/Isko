import OsfaSidebar from '@/components/shared/OsfaSidebar';
import Image from 'next/image';
import Link from 'next/link';

interface OsfaLayoutProps {
  children: React.ReactNode;
}

export default function OsfaLayout({ children }: OsfaLayoutProps) {
  return (
    <>
      {/* Top Navigation Bar */}
      <header className="top-navbar">
        <div className="top-navbar-container">
          {/* Left: Logo + Search */}
          <div className="navbar-left">
            <div className="navbar-logo">
              <Link href="/" className="navbar-logo-link">
                <Image
                  src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png"
                  alt="IskoMo"
                  width={32}
                  height={32}
                />
              </Link>
            </div>
            <div className="navbar-search linkedin-search">
              <svg className="navbar-search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="9" r="6"/>
                <path d="m17 17-4-4"/>
              </svg>
              <input type="text" placeholder="Search..." id="searchInput" autoComplete="off" />
            </div>
          </div>

          {/* Center: OSFA Nav Links */}
          <OsfaSidebar />

          {/* Right: Profile */}
          <div className="navbar-right">
            <Link href="/osfa/profile" className="profile-trigger" aria-label="My profile">
              <div className="profile-avatar" id="profileAvatar">SP</div>
              <span className="profile-label">Me</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Page Content */}
      {children}
    </>
  );
}
