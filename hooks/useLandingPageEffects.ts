'use client';

import { useEffect } from 'react';

export function useLandingPageEffects() {
  useEffect(() => {
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navbarNav = document.getElementById('navbarNav');

    const toggleMenu = () => {
      if (navbarNav && mobileMenuToggle) {
        navbarNav.classList.toggle('active');
        const isExpanded = navbarNav.classList.contains('active');
        mobileMenuToggle.setAttribute('aria-expanded', String(isExpanded));
      }
    };

    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', toggleMenu);
    }

    // Close mobile menu when clicking on a link
    const navLinks = document.querySelectorAll('.navbar-nav a');
    const closeMenu = () => {
      if (navbarNav && mobileMenuToggle) {
        navbarNav.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
      }
    };
    navLinks.forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    // Scroll reveal effect
    const revealElements = document.querySelectorAll(
      '.reveal, .reveal-left, .reveal-right, .reveal-up'
    );
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    revealElements.forEach((el) => {
      const rect = el.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      if (isInView) {
        el.classList.add('in-view');
      } else {
        revealObserver.observe(el);
      }
    });

    // Navbar scroll reveal
    const navbar = document.querySelector('.navbar') as HTMLElement;
    let lastScrollTop = 0;
    const scrollThreshold = 150;
    const fadeStartThreshold = 100;
    const hideThreshold = 30;
    let isNavbarVisible = false;

    function handleScroll() {
      if (!navbar) return;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      if (scrollTop > scrollThreshold && !isNavbarVisible) {
        navbar.classList.remove('fade-out');
        navbar.classList.add('scrolled');
        isNavbarVisible = true;
      } else if (scrollTop <= fadeStartThreshold && scrollTop > hideThreshold && isNavbarVisible) {
        const fadeProgress =
          (scrollTop - hideThreshold) / (fadeStartThreshold - hideThreshold);
        navbar.style.opacity = String(fadeProgress);
        navbar.classList.add('scrolled');
      } else if (scrollTop <= hideThreshold && isNavbarVisible) {
        navbar.classList.add('fade-out');
        navbar.classList.remove('scrolled');
        navbar.style.opacity = '0';
        isNavbarVisible = false;
      } else if (scrollTop > fadeStartThreshold && isNavbarVisible) {
        navbar.classList.remove('fade-out');
        navbar.classList.add('scrolled');
        navbar.style.opacity = '1';
      }

      lastScrollTop = scrollTop;
    }

    let ticking = false;
    const scrollListener = function () {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', scrollListener);

    // Smooth scroll for logo and footer home link
    const smoothScroll = function (e: Event) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const logoLink = document.getElementById('logoLink');
    if (logoLink) logoLink.addEventListener('click', smoothScroll);

    const footerHomeLink = document.getElementById('footerHomeLink');
    if (footerHomeLink) footerHomeLink.addEventListener('click', smoothScroll);

    // Page transition on "Get Started" click
    const transitionOverlay = document.getElementById('pageTransitionOverlay');
    const handleGetStartedClick = (e: Event) => {
      e.preventDefault();
      const targetUrl = (e.currentTarget as HTMLAnchorElement).getAttribute('href');
      document.body.classList.add('transitioning');
      setTimeout(() => {
        if (transitionOverlay) transitionOverlay.classList.add('active');
      }, 100);
      setTimeout(() => {
        if (targetUrl) window.location.href = targetUrl;
      }, 1800);
    };

    const getStartedLinks = document.querySelectorAll('a[href="/login"]');
    getStartedLinks.forEach((link) => {
      link.addEventListener('click', handleGetStartedClick);
    });

    return () => {
      if (mobileMenuToggle) mobileMenuToggle.removeEventListener('click', toggleMenu);
      navLinks.forEach((link) => link.removeEventListener('click', closeMenu));
      window.removeEventListener('scroll', scrollListener);
      if (logoLink) logoLink.removeEventListener('click', smoothScroll);
      if (footerHomeLink) footerHomeLink.removeEventListener('click', smoothScroll);
      getStartedLinks.forEach((link) => link.removeEventListener('click', handleGetStartedClick));
    };
  }, []);
}
