'use client';

import Link from 'next/link';
import { useLandingPageEffects } from '@/hooks/useLandingPageEffects';

export default function LandingNavbar() {
  useLandingPageEffects();

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-container">
        <a href="#hero" className="navbar-logo" id="logoLink" aria-label="Scroll to top">
          <img
            src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png"
            alt="IskoMo Logo"
            className="navbar-logo-img"
          />
          <span className="navbar-logo-text">IskoMo</span>
        </a>
        <ul className="navbar-nav" id="navbarNav">
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#how-it-works">How It Works</a>
          </li>
          <li>
            <Link href="/login" className="btn btn-primary">
              Get Started
            </Link>
          </li>
        </ul>
        <button
          className="mobile-menu-toggle"
          id="mobileMenuToggle"
          aria-label="Toggle mobile menu"
          aria-expanded="false"
        >
          ☰
        </button>
      </div>
    </nav>
  );
}
