"use client";

import Link from 'next/link';
import LandingNavbar from '@/components/shared/LandingNavbar';

export default function Home() {
  return (
    <>
      <div className="page-transition-overlay" id="pageTransitionOverlay" aria-hidden="true">
        <div className="transition-content">
          <div className="transition-logo">
            <img
              src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png"
              alt="IskoMo Logo"
            />
          </div>
          <div className="transition-text">IskoMo</div>
          <div className="transition-loader">
            <div className="loader-spinner"></div>
          </div>
        </div>
      </div>

      <div className="bg-icons" aria-hidden="true">
        <div className="bg-icon bg-icon-1">⭐️</div>
        <div className="bg-icon bg-icon-2">💡</div>
        <div className="bg-icon bg-icon-3">⚙️</div>
        <div className="bg-icon bg-icon-4">🎓</div>
        <div className="bg-icon bg-icon-5">📚</div>
        <div className="bg-icon bg-icon-6">💼</div>
      </div>

      <LandingNavbar />

      <section className="hero" id="hero">
        <div className="hero-container">
          <div className="hero-content">
            <h1>Discover Scholarships & Opportunities</h1>
            <p>
              IskoMo is your gateway to finding the best scholarships and
              opportunities specifically designed for PUP students. Connect with
              funding sources, track your applications, and unlock your academic
              potential.
            </p>
            <div className="hero-cta">
              <Link href="/login" className="btn btn-primary btn-large">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section challenge-section" id="challenges">
        <div className="section-container">
          <div className="section-title reveal-up">
            <h2>What are the challenges of finding scholarships? </h2>
            <p>Finding the right scholarship shouldn&apos;t be difficult</p>
          </div>
          <div className="feature-grid">
            <div className="feature-card reveal-left">
              <div className="feature-card-icon">📋</div>
              <h3>Scattered Information</h3>
              <p>
                Scholarship opportunities are spread across multiple platforms,
                making it hard to find and track relevant opportunities.
              </p>
            </div>
            <div className="feature-card reveal-up">
              <div className="feature-card-icon">⏰</div>
              <h3>Missed Deadlines</h3>
              <p>
                Without a centralized system, students often miss important
                application deadlines and miss out on opportunities.
              </p>
            </div>
            <div className="feature-card reveal-right">
              <div className="feature-card-icon">📝</div>
              <h3>Complex Applications</h3>
              <p>
                Each scholarship has different requirements and processes, making
                the application journey overwhelming.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section solution-section" id="how-it-works">
        <div className="section-container">
          <div className="solution-center">
            <h2 className="solution-main-title">How Does IskoMo Help You?</h2>
            <p className="solution-subtitle">Everything you need in one place</p>
          </div>

          <div className="solution-story">
            <article className="solution-step solution-step-left reveal-left">
              <div className="solution-step-icon">🔍</div>
              <div className="solution-step-content">
                <p className="solution-step-label">#01</p>
                <h3>Comprehensive Listings</h3>
                <p>
                  Browse curated scholarship opportunities built for PUP
                  students, so you can discover the right programs without
                  digging through dozens of sites.
                </p>
              </div>
            </article>

            <article className="solution-step solution-step-right reveal-right">
              <div className="solution-step-icon">📝</div>
              <div className="solution-step-content">
                <p className="solution-step-label">#02</p>
                <h3>Easy Application</h3>
                <p>
                  Apply with confidence using a guided, student-friendly flow
                  that keeps requirements clear and reduces repetitive forms.
                </p>
              </div>
            </article>

            <article className="solution-step solution-step-left reveal-left">
              <div className="solution-step-icon">📊</div>
              <div className="solution-step-content">
                <p className="solution-step-label">#03</p>
                <h3>Application Tracking</h3>
                <p>
                  Follow every application in one dashboard&mdash;from submission
                  to results&mdash;with status updates that keep you in
                  control.
                </p>
              </div>
            </article>

            <article className="solution-step solution-step-right reveal-right">
              <div className="solution-step-icon">🔔</div>
              <div className="solution-step-content">
                <p className="solution-step-label">#04</p>
                <h3>Smart Notifications</h3>
                <p>
                  Never miss a deadline again. Get timely reminders for new
                  scholarships and important updates that match your profile.
                </p>
              </div>
            </article>

            <article className="solution-step solution-step-center reveal-up">
              <div className="solution-step-icon">👤</div>
              <div className="solution-step-content">
                <p className="solution-step-label">#05</p>
                <h3>Built Around You</h3>
                <p>
                  IskoMo grows with you&mdash;from your first application to
                  graduation&mdash; helping you find funding, stay organized, and
                  focus on what matters most: your journey as a PUP student.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section about-section" id="about">
        <div className="section-container">
          <div className="about-overview reveal-up">
            <h2 className="about-section-title">About IskoMo</h2>
            <p className="about-overview-text">
              IskoMo is a dedicated scholarship platform designed specifically for
              PUP students. We simplify the scholarship discovery and application
              process, helping you find the right opportunities and manage your
              applications all in one place. Our mission is to make financial aid
              accessible, transparent, and stress-free for every PUPian.
            </p>
          </div>

          <div className="mission-vision-container reveal-up">
            <div className="mission-vision-grid">
              <div className="mission-card">
                <div className="mission-vision-icon">🎯</div>
                <h3>Our Mission</h3>
                <p>
                  To empower PUP students by providing a centralized,
                  user-friendly platform that simplifies scholarship discovery,
                  application management, and deadline tracking. We aim to reduce
                  barriers and help every student access the financial support
                  they need to succeed.
                </p>
              </div>
              <div className="vision-card">
                <div className="mission-vision-icon">🌟</div>
                <h3>Our Vision</h3>
                <p>
                  To become the leading scholarship platform for Filipino
                  students, starting with PUP. We envision a future where every
                  student has equal access to educational opportunities, where
                  financial constraints no longer limit academic dreams, and where
                  the scholarship application process is seamless and empowering.
                </p>
              </div>
            </div>
          </div>

          <div className="project-members reveal-up">
            <h3 className="members-title">Project Members</h3>
            <div className="members-grid">
              <div className="member-card">
                <div className="member-avatar">
                  <img
                    src="/assets/photo_2025-12-27_02-41-42.jpg"
                    alt="Emmanuel Mutas"
                    className="member-photo"
                  />
                </div>
                <h4 className="member-name">Emmanuel Mutas</h4>
                <p className="member-role">Leader</p>
              </div>
              <div className="member-card">
                <div className="member-avatar">
                  <img
                    src="/assets/Itang_Marlo.jpg"
                    alt="Marlo Itang"
                    className="member-photo"
                  />
                </div>
                <h4 className="member-name">Marlo Itang</h4>
                <p className="member-role">Developer</p>
              </div>
              <div className="member-card">
                <div className="member-avatar">
                  <img
                    src="/assets/Kit Jasper Palacio.jpg"
                    alt="Kit Jasper Palacio"
                    className="member-photo"
                  />
                </div>
                <h4 className="member-name">Kit Jasper Palcio</h4>
                <p className="member-role">Developer</p>
              </div>
              <div className="member-card">
                <div className="member-avatar">
                  <img
                    src="/assets/Abellera_Princess Pauline.jpg"
                    alt="Princess Pauline Abellera"
                    className="member-photo"
                  />
                </div>
                <h4 className="member-name">
                  Princess Pauline<br />Abellera
                </h4>
                <p className="member-role">Researcher</p>
              </div>
              <div className="member-card">
                <div className="member-avatar">
                  <img
                    src="/assets/Abreu_Mariel I..jpg"
                    alt="Mariel Abreu"
                    className="member-photo"
                  />
                </div>
                <h4 className="member-name">Mariel Abreu</h4>
                <p className="member-role">Researcher</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-section reveal-up" aria-label="Call to action">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Get Started?</h2>
          <p className="cta-subtitle">
            Join thousands of PUP students who are already discovering their next
            opportunity.
          </p>
          <Link href="/login" className="btn btn-cta" aria-label="Create your account">
            Create Your Account
          </Link>
        </div>
      </section>

      <footer className="main-footer reveal">
        <div className="footer-container">
          <div className="footer-column footer-company">
            <div className="footer-logo">
              <img
                src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png"
                alt="IskoMo Logo"
                style={{ height: "40px", width: "auto", marginRight: "0.5rem" }}
              />
              <span className="footer-logo-text">IskoMo</span>
            </div>
            <p className="footer-description">
              Empowering students with accessible, transparent, and efficient
              scholarship opportunities.
            </p>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Quick Links</h4>
            <ul className="footer-links">
              <li>
                <a href="#hero" id="footerHomeLink">
                  Home
                </a>
              </li>
              <li>
                <a href="#about">About</a>
              </li>
              <li>
                <a href="#how-it-works">How It Works</a>
              </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Legal</h4>
            <ul className="footer-links">
                <li>
                  <Link href="/Authentication/Student/dashboard">Dashboard</Link>
                </li>
                <li>
                  <Link href="/Authentication/Student/iskolarships">Scholarships</Link>
                </li>
            </ul>
          </div>

          <div className="footer-column">
            <h4 className="footer-heading">Contact Us</h4>
            <div className="footer-contact">
              <a href="mailto:contact@iskomo.ph">contact@iskomo.ph</a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <p className="footer-copyright">
              &copy; 2025 IskoMo Scholarships & Opportunities. All rights reserved.
            </p>
            <p className="footer-tagline">Made For Students, Made By Students.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
