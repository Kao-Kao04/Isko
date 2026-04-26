'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        <Link href="/#hero" className="navbar-logo" id="logoLink" aria-label="Scroll to top">
          <Image
            src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png"
            alt="IskoMo Logo"
            width={40}
            height={40}
            className="navbar-logo-img"
          />
          <span className="navbar-logo-text">IskoMo</span>
        </Link>

        <ul className={`navbar-nav${menuOpen ? ' active' : ''}`} id="navbarNav">
          <li><Link href="/#about" onClick={() => setMenuOpen(false)}>About</Link></li>
          <li><Link href="/#how-it-works" onClick={() => setMenuOpen(false)}>How It Works</Link></li>
          <li>
            <Link
              href="/login"
              className="btn btn-primary"
              onClick={() => setMenuOpen(false)}
            >
              Get Started
            </Link>
          </li>
        </ul>

        <button
          className="mobile-menu-toggle"
          id="mobileMenuToggle"
          aria-label="Toggle mobile menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>
    </nav>
  );
}
