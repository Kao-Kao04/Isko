"use client"

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  useEffect(() => {
    // JS logic here
  }, []);

  return (
    <>

    {/*  Top Navigation Bar  */}
    <header className="top-navbar">
        <div className="top-navbar-container">
            <div className="navbar-left">
                <div className="navbar-logo">
                    <Link href="/student/dashboard" className="navbar-logo-link">
                        <img src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" alt="IskoMo" />
                    </Link>
                </div>
                
                {/*  Search Bar  */}
                <div className="navbar-search linkedin-search">
                    <svg className="navbar-search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="9" r="6"/>
                        <path d="m17 17-4-4"/>
                    </svg>
                    <input type="text" placeholder="Search" id="searchInput" autoComplete="off" />
                </div>
            </div>

            <nav className="navbar-center">
                <Link href="/student/dashboard" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span>Home</span>
                </Link>
                <Link href="/student/iskolarships" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        <path d="M9 7h6"/>
                        <path d="M9 11h6"/>
                        <path d="M9 15h4"/>
                    </svg>
                    <span>Iskolarships</span>
                </Link>
                <Link href="/student/kapwa" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>Kapwa</span>
                </Link>
                <Link href="/student/status" className="nav-link active">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18"/>
                        <path d="M7 12l4-4 4 4 6-6"/>
                    </svg>
                    <span className="nav-label">Status</span>
                </Link>
                <Link href="/student/profile" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="nav-label">Profile</span>
                </Link>
            </nav>

            {/*  Right: Notifications + Profile  */}
            
            {/*  Right: Search + Notifications + Profile (LinkedIn Style)  */}
            <div className="navbar-right">
                <div className="notification-dropdown">
                    <button className="notification-btn linkedin-notification" id="notificationTrigger" title="Notifications">
                        <svg className="notification-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                        </svg>
                        <span className="notification-label">Notifications</span>
                        <span className="notification-badge"></span>
                    </button>
                    {/*  Notification Dropdown Menu  */}
                    <div className="notification-menu" id="notificationMenu">
                        <div className="notification-header">
                            <div className="notification-logo-container">
                                <img src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" alt="IskoMo Logo" style={{"height":"32px","width":"auto","filter":"brightness(0) invert(1)"}} />
                            </div>
                            <div className="notification-welcome">
                                <div className="notification-welcome-title" style={{"fontSize":"1rem","fontWeight":"600","margin":"0 0 0.125rem 0","color":"white","lineHeight":"1.3"}}>Welcome Iskolar</div>
                                <div className="notification-welcome-subtitle" style={{"fontSize":"0.75rem","margin":"0","color":"rgba(255, 255, 255, 0.85)","fontWeight":"400","lineHeight":"1.4"}}>Stay updated with your scholarship journey</div>
                            </div>
                        </div>
                        <div className="notification-content">
                            <div className="notification-empty-state">
                                <svg className="notification-empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{"color":"#9ca3af","marginBottom":"0.75rem","opacity":"0.4"}}>
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                                <p className="notification-empty-text" style={{"fontSize":"0.875rem","fontWeight":"500","color":"#1f2937","margin":"0 0 0.25rem 0"}}>No new notifications</p>
                                <p className="notification-empty-subtext" style={{"fontSize":"0.75rem","color":"#6b7280","margin":"0"}}>You're all caught up!</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/*  Sign Out Button  */}
                <button className="notification-btn linkedin-notification" id="navLogoutBtn" title="Sign Out" onClick={(event) => { event.preventDefault(); if(typeof (window as any).handleLogout !== 'undefined'){(window as any).handleLogout();} }} style={{"marginLeft":"0.25rem"}}>
                    <svg className="notification-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{"color":"#dc2626"}}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span className="notification-label" style={{"color":"#dc2626"}}>Sign Out</span>
                </button>
            </div>
        </div>
    </header>

    {/*  Main Content  */}
    <div className="main-container">
        <div className="page-content">
            <div className="status-wrapper">
                {/*  Left Sidebar - Quick Stats  */}
                <aside className="status-sidebar-left">
                    <div className="sidebar-card">
                        <h3>Quick Stats</h3>
                        <div className="stat-item">
                            <span className="stat-label">Total Applications</span>
                            <span className="stat-value">5</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Approved</span>
                            <span className="stat-value">1</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Under Review</span>
                            <span className="stat-value">3</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Pending</span>
                            <span className="stat-value">1</span>
                        </div>
                    </div>
                </aside>

                {/*  Main Content Area  */}
                <main className="main-content">
                    {/*  Tab Navigation  */}
                    <div className="status-tabs">
                        <button className="status-tab active" data-tab="applications">Application Status</button>
                        <button className="status-tab" data-tab="progress">Overview</button>
                    </div>

                    {/*  Application Status Tab  */}
                    <div className="status-tab-content active" id="tab-applications">
                        <div className="application-status-list">
                            {/*  Application Status Card 1 - Under Review  */}
                            <div className="application-status-card">
                                <div className="application-status-header">
                                    <div className="application-status-title-section">
                                        <h3 className="application-status-title">PUP Scholarship Program</h3>
                                        <span className="application-status-badge status-review">Under Review</span>
                                    </div>
                                </div>
                                <div className="application-status-info">
                                    <div className="application-status-meta">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 6v6l4 2"/>
                                        </svg>
                                        <span>Submitted: February 15, 2025</span>
                                    </div>
                                    <div className="application-status-meta">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                        </svg>
                                        <span>Amount: ₱30,000/semester</span>
                                    </div>
                                </div>
                                <div className="application-status-flow">
                                    <div className="status-step completed">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Submitted</span>
                                    </div>
                                    <div className="status-step-connector active"></div>
                                    <div className="status-step active">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <path d="M12 6v6l4 2"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Under Review</span>
                                    </div>
                                    <div className="status-step-connector"></div>
                                    <div className="status-step">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                <circle cx="9" cy="7" r="4"/>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Interview</span>
                                    </div>
                                    <div className="status-step-connector"></div>
                                    <div className="status-step">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Document Validation</span>
                                    </div>
                                    <div className="status-step-connector"></div>
                                    <div className="status-step">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Approved</span>
                                    </div>
                                </div>
                                <div className="application-status-actions">
                                    <button className="btn-secondary">View Details</button>
                                </div>
                            </div>

                            {/*  Application Status Card 2 - Interview  */}
                            <div className="application-status-card">
                                <div className="application-status-header">
                                    <div className="application-status-title-section">
                                        <h3 className="application-status-title">CHED Merit Scholarship Program</h3>
                                        <span className="application-status-badge status-interview">Interview</span>
                                    </div>
                                </div>
                                <div className="application-status-info">
                                    <div className="application-status-meta">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 6v6l4 2"/>
                                        </svg>
                                        <span>Submitted: January 15, 2025</span>
                                    </div>
                                    <div className="application-status-meta">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                        </svg>
                                        <span>Amount: ₱25,000/semester</span>
                                    </div>
                                </div>
                                <div className="application-status-flow">
                                    <div className="status-step completed">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Submitted</span>
                                    </div>
                                    <div className="status-step-connector completed"></div>
                                    <div className="status-step completed">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <path d="M12 6v6l4 2"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Under Review</span>
                                    </div>
                                    <div className="status-step-connector active"></div>
                                    <div className="status-step active">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                <circle cx="9" cy="7" r="4"/>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Interview</span>
                                    </div>
                                    <div className="status-step-connector"></div>
                                    <div className="status-step">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Document Validation</span>
                                    </div>
                                    <div className="status-step-connector"></div>
                                    <div className="status-step">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Approved</span>
                                    </div>
                                </div>
                                <div className="application-status-actions">
                                    <button className="btn-secondary">View Details</button>
                                </div>
                            </div>

                            {/*  Application Status Card 3 - Approved  */}
                            <div className="application-status-card">
                                <div className="application-status-header">
                                    <div className="application-status-title-section">
                                        <h3 className="application-status-title">Academic Excellence Grant</h3>
                                        <span className="application-status-badge status-approved">Approved</span>
                                    </div>
                                </div>
                                <div className="application-status-info">
                                    <div className="application-status-meta">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 6v6l4 2"/>
                                        </svg>
                                        <span>Submitted: November 10, 2024</span>
                                    </div>
                                    <div className="application-status-meta">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                        </svg>
                                        <span>Amount: ₱20,000/semester</span>
                                    </div>
                                </div>
                                <div className="application-status-flow">
                                    <div className="status-step completed">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Submitted</span>
                                    </div>
                                    <div className="status-step-connector completed"></div>
                                    <div className="status-step completed">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <path d="M12 6v6l4 2"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Under Review</span>
                                    </div>
                                    <div className="status-step-connector completed"></div>
                                    <div className="status-step completed">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                                <circle cx="9" cy="7" r="4"/>
                                                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Interview</span>
                                    </div>
                                    <div className="status-step-connector completed"></div>
                                    <div className="status-step completed">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Document Validation</span>
                                    </div>
                                    <div className="status-step-connector completed"></div>
                                    <div className="status-step completed">
                                        <div className="status-step-icon">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="20 6 9 17 4 12"/>
                                            </svg>
                                        </div>
                                        <span className="status-step-label">Approved</span>
                                    </div>
                                </div>
                                <div className="application-status-actions">
                                    <button className="btn-secondary">View Details</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*  Progress Tab  */}
                    <div className="status-tab-content" id="tab-progress">
                        {/*  Overview Cards  */}
                        <div className="progress-overview">
                            <div className="progress-overview-card">
                                <div className="progress-overview-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                    </svg>
                                </div>
                                <div className="progress-overview-content">
                                    <div className="progress-overview-number">5</div>
                                    <div className="progress-overview-label">Total Applications</div>
                                </div>
                            </div>
                            <div className="progress-overview-card">
                                <div className="progress-overview-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="20 6 9 17 4 12"/>
                                    </svg>
                                </div>
                                <div className="progress-overview-content">
                                    <div className="progress-overview-number">1</div>
                                    <div className="progress-overview-label">Approved</div>
                                </div>
                            </div>
                            <div className="progress-overview-card">
                                <div className="progress-overview-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <path d="M12 6v6l4 2"/>
                                    </svg>
                                </div>
                                <div className="progress-overview-content">
                                    <div className="progress-overview-number">3</div>
                                    <div className="progress-overview-label">Under Review</div>
                                </div>
                            </div>
                            <div className="progress-overview-card">
                                <div className="progress-overview-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 3v18h18"/>
                                        <path d="M7 12l4-4 4 4 6-6"/>
                                    </svg>
                                </div>
                                <div className="progress-overview-content">
                                    <div className="progress-overview-number">92%</div>
                                    <div className="progress-overview-label">Average Match</div>
                                </div>
                            </div>
                        </div>

                        {/*  Progress Chart  */}
                        <div className="progress-chart">
                            <div className="chart-header">
                                <div className="chart-title">Application Status Overview</div>
                                <div className="chart-percentage">92%</div>
                            </div>
                            <div className="chart-bars">
                                <div className="chart-bar-item">
                                    <div className="chart-bar-label">Approved</div>
                                    <div className="chart-bar-container">
                                        <div className="chart-bar-fill" style={{"width":"20%"}}></div>
                                    </div>
                                    <div className="chart-bar-value">20%</div>
                                </div>
                                <div className="chart-bar-item">
                                    <div className="chart-bar-label">Under Review</div>
                                    <div className="chart-bar-container">
                                        <div className="chart-bar-fill" style={{"width":"60%"}}></div>
                                    </div>
                                    <div className="chart-bar-value">60%</div>
                                </div>
                                <div className="chart-bar-item">
                                    <div className="chart-bar-label">Pending</div>
                                    <div className="chart-bar-container">
                                        <div className="chart-bar-fill" style={{"width":"20%"}}></div>
                                    </div>
                                    <div className="chart-bar-value">20%</div>
                                </div>
                            </div>
                        </div>

                        {/*  List of Scholarships  */}
                        <div className="scholarships-list-section">
                            <h2 className="scholarships-list-title">List of Scholarships You Applied</h2>
                            <div className="scholarships-list">
                                <div className="scholarship-list-item">
                                    <div className="scholarship-list-header">
                                        <div className="scholarship-list-name">Academic Excellence Grant</div>
                                        <span className="scholarship-list-status status-approved">Approved</span>
                                    </div>
                                    <div className="scholarship-list-meta">
                                        <span>Submitted: November 10, 2024</span>
                                        <span>•</span>
                                        <span>Amount: ₱20,000/semester</span>
                                    </div>
                                    <div className="scholarship-list-actions">
                                        <button className="btn-secondary">View Details</button>
                                    </div>
                                </div>
                                <div className="scholarship-list-item">
                                    <div className="scholarship-list-header">
                                        <div className="scholarship-list-name">DOST-SEI Scholarship</div>
                                        <span className="scholarship-list-status status-review">Under Review</span>
                                    </div>
                                    <div className="scholarship-list-meta">
                                        <span>Submitted: December 20, 2024</span>
                                        <span>•</span>
                                        <span>Amount: ₱40,000/semester</span>
                                    </div>
                                    <div className="scholarship-list-actions">
                                        <button className="btn-secondary">View Details</button>
                                    </div>
                                </div>
                                <div className="scholarship-list-item">
                                    <div className="scholarship-list-header">
                                        <div className="scholarship-list-name">CHED Merit Scholarship Program</div>
                                        <span className="scholarship-list-status status-interview">Interview</span>
                                    </div>
                                    <div className="scholarship-list-meta">
                                        <span>Submitted: January 15, 2025</span>
                                        <span>•</span>
                                        <span>Amount: ₱25,000/semester</span>
                                    </div>
                                    <div className="scholarship-list-actions">
                                        <button className="btn-secondary">View Details</button>
                                    </div>
                                </div>
                                <div className="scholarship-list-item">
                                    <div className="scholarship-list-header">
                                        <div className="scholarship-list-name">PUP Scholarship Program</div>
                                        <span className="scholarship-list-status status-review">Under Review</span>
                                    </div>
                                    <div className="scholarship-list-meta">
                                        <span>Submitted: February 1, 2025</span>
                                        <span>•</span>
                                        <span>Amount: ₱30,000/semester</span>
                                    </div>
                                    <div className="scholarship-list-actions">
                                        <button className="btn-secondary">View Details</button>
                                    </div>
                                </div>
                                <div className="scholarship-list-item">
                                    <div className="scholarship-list-header">
                                        <div className="scholarship-list-name">STEM Innovation Award</div>
                                        <span className="scholarship-list-status status-pending">Pending</span>
                                    </div>
                                    <div className="scholarship-list-meta">
                                        <span>Submitted: February 5, 2025</span>
                                        <span>•</span>
                                        <span>Amount: ₱35,000/semester</span>
                                    </div>
                                    <div className="scholarship-list-actions">
                                        <button className="btn-secondary">View Details</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>

                {/*  Right Sidebar - Success Rate & Upcoming  */}
                <aside className="status-sidebar-right">
                    <div className="sidebar-card">
                        <h3>Success Rate</h3>
                        <div className="stat-item">
                            <span className="stat-label">Approval Rate</span>
                            <span className="stat-value">20%</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">Avg Match</span>
                            <span className="stat-value">92%</span>
                        </div>
                    </div>

                    <div className="sidebar-card">
                        <h3>Upcoming</h3>
                        <div className="stat-item">
                            <span className="stat-label">Deadlines</span>
                            <span className="stat-value">3</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-label">This Week</span>
                            <span className="stat-value">1</span>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    </div>

    

    </>
  );
}
