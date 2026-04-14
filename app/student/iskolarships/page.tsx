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
                <Link href="/student/iskolarships" className="nav-link active">
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
                <Link href="/student/status" className="nav-link">
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
            <div className="iskolarships-wrapper">
                {/*  Left Sidebar - Filters  */}
                <aside className="iskolarships-sidebar-left">
                    <div className="sidebar-card filters-card" style={{"boxShadow":"0 4px 6px -1px rgba(0, 0, 0, 0.1)","borderRadius":"12px","border":"1px solid #e5e7eb"}}>
                        <div className="filters-header" style={{"borderBottom":"2px solid #0d9488","paddingBottom":"0.75rem","marginBottom":"1.5rem"}}>
                            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="#0d9488" strokeWidth="2">
                                <path d="M3 4h14M3 8h14M3 12h14M3 16h14"/>
                            </svg>
                            <h3 style={{"color":"#0d9488","fontWeight":"700"}}>Filters</h3>
                        </div>

                        {/*  Search  */}
                        <div className="filter-section">
                            <label className="filter-label">Search</label>
                            <div style={{"position":"relative"}}>
                                <input type="text" id="filterSearchInput" className="filter-select" placeholder="Search name..." style={{"paddingLeft":"2rem"}} />
                                <svg style={{"position":"absolute","left":"0.5rem","top":"0.625rem","color":"#6b7280"}} width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="9" cy="9" r="6"/>
                                    <path d="M15 15l-3-3"/>
                                </svg>
                            </div>
                        </div>

                        {/*  College  */}
                        <div className="filter-section">
                            <label className="filter-label">College / Institute</label>
                            <select className="filter-select" id="filterCollege">
                                <option value="all">All Colleges</option>
                                <option value="CCIS">CCIS</option>
                                <option value="CBA">CBA</option>
                                <option value="CAFA">CAFA</option>
                                <option value="CE">CE</option>
                            </select>
                        </div>

                        {/*  Year Level  */}
                        <div className="filter-section">
                            <label className="filter-label">Year Level</label>
                            <select className="filter-select" id="filterYear">
                                <option value="all">All Year Levels</option>
                                <option value="1st Year">1st Year</option>
                                <option value="2nd Year">2nd Year</option>
                                <option value="3rd Year">3rd Year</option>
                                <option value="4th Year">4th Year</option>
                            </select>
                        </div>

                        {/*  Scholarship Type  */}
                        <div className="filter-section">
                            <label className="filter-label">Scholarship Type</label>
                            <select className="filter-select" id="filterType">
                                <option value="all">All Types</option>
                                <option value="merit">Merit-Based</option>
                                <option value="need">Need-Based</option>
                            </select>
                        </div>
                    </div>
                </aside>
                                {/*  Main Content Area  */}
                <main className="main-content">
            {/*  Search Bar  */}
            <div className="search-container">
                <div className="search-box">
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="9" r="6"/>
                        <path d="M15 15l-3-3"/>
                    </svg>
                            <input type="text" id="scholarshipSearchInput" placeholder="Search scholarships by name, provider, or keyword..." autoComplete="off" />
                </div>
            </div>

            {/*  Scholarships Grid  */}
            <div className="scholarships-grid">
                {/*  Scholarship Card 1  */}
                        <div className="scholarship-card-new" 
                             data-type="merit" 
                             data-purpose="tuition" 
                             data-sponsor="government" 
                             data-amount="25000" 
                             data-slots="400"
                             data-deadline="2025-09-21"
                             data-scholarship-id="ched-merit">
                            {/*  Card Header with Icon and Title  */}
                            <div className="card-header-new">
                                <div className="scholarship-icon-large">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                    </svg>
                            </div>
                                <div className="card-header-content">
                                    <h3 className="card-title-new">CHED Merit Scholarship Program</h3>
                                    <div className="card-tags">
                                        <span className="card-tag merit-tag">Merit-Based</span>
                                        <span className="card-tag purpose-tag">Tuition</span>
                        </div>
                                    <div className="card-meta-info">
                                        <div className="meta-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                                            <span>Sponsor name</span>
                        </div>
                                        <div className="meta-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <path d="M12 6v6l4 2"/>
                            </svg>
                                            <span>September 21, 2025</span>
                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/*  Card Body  */}
                            <div className="card-body-new">
                                <div className="card-stats">
                                    <div className="stat-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 6v6l4 2"/>
                            </svg>
                                        <div className="stat-content">
                                            <span className="stat-label">Amount</span>
                                            <span className="stat-value">P25,000.00</span>
                                            <span className="stat-suffix">per scholar</span>
                        </div>
                    </div>
                                    <div className="stat-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                            <circle cx="9" cy="7" r="4"/>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                            </svg>
                                        <div className="stat-content">
                                            <span className="stat-label">Slots</span>
                                            <span className="stat-value">400</span>
                                            <span className="stat-suffix">scholars</span>
                                        </div>
                    </div>
                </div>

                                <div className="card-criteria">
                                    <div className="criteria-section">
                                        <h4 className="criteria-title">Criteria</h4>
                                        <div className="criteria-tags-list">
                                            <span className="criteria-tag">3rd Year</span>
                                            <span className="criteria-tag">Male</span>
                                            <span className="criteria-tag">CCIS</span>
                                            
                                            
                                            <span className="criteria-tag">1st Year</span>
                            </div>
                        </div>
                                    
                                    <div className="criteria-section">
                                        <h4 className="criteria-title">Required Documents</h4>
                                        <div className="criteria-tags-list">
                                            <span className="criteria-tag">Certificate of Enrollment</span>
                                            <span className="criteria-tag">Latest Report of Grades</span>
                                            <span className="criteria-tag-more">+ 4 more</span>
                    </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/*  Card Actions  */}
                            <div className="card-actions-new">
                                <button className="btn-view-details" data-scholarship-id="ched-merit">View Details</button>
                                <button className="btn-apply-scholarship-new" data-scholarship-name="CHED Merit Scholarship Program" data-scholarship-id="ched-merit">Apply Now</button>
                            </div>
                        </div>

                        {/*  Scholarship Card 2  */}
                        <div className="scholarship-card-new" 
                             data-type="merit" 
                             data-purpose="comprehensive" 
                             data-sponsor="government" 
                             data-amount="40000" 
                             data-slots="500"
                             data-deadline="2025-03-15"
                             data-scholarship-id="dost-sei">
                            <div className="card-header-new">
                                <div className="scholarship-icon-large">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                        </div>
                                <div className="card-header-content">
                                    <h3 className="card-title-new">DOST-SEI Undergraduate Scholarship</h3>
                                    <div className="card-tags">
                                        <span className="card-tag merit-tag">Merit-Based</span>
                                        <span className="card-tag purpose-tag">Comprehensive</span>
                                    </div>
                                    <div className="card-meta-info">
                                        <div className="meta-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                                            <span>Department of Science and Technology</span>
                        </div>
                                        <div className="meta-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <path d="M12 6v6l4 2"/>
                            </svg>
                                            <span>March 15, 2025</span>
                        </div>
                    </div>
                                </div>
                            </div>
                            
                            <div className="card-body-new">
                                <div className="card-stats">
                                    <div className="stat-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 6v6l4 2"/>
                            </svg>
                                        <div className="stat-content">
                                            <span className="stat-label">Amount</span>
                                            <span className="stat-value">P40,000.00</span>
                                            <span className="stat-suffix">per scholar</span>
                                        </div>
                                    </div>
                                    <div className="stat-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                            <circle cx="9" cy="7" r="4"/>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                        </svg>
                                        <div className="stat-content">
                                            <span className="stat-label">Slots</span>
                                            <span className="stat-value">500</span>
                                            <span className="stat-suffix">scholars</span>
                                        </div>
                    </div>
                </div>

                                <div className="card-criteria">
                                    <div className="criteria-section">
                                        <h4 className="criteria-title">Criteria</h4>
                                        <div className="criteria-tags-list">
                                            <span className="criteria-tag">STEM Programs</span>
                                            <span className="criteria-tag">1st Year</span>
                                            <span className="criteria-tag">2nd Year</span>
                                            <span className="criteria-tag">3rd Year</span>
                            </div>
                        </div>
                                    
                                    <div className="criteria-section">
                                        <h4 className="criteria-title">Required Documents</h4>
                                        <div className="criteria-tags-list">
                                            <span className="criteria-tag">Transcript of Records</span>
                                            <span className="criteria-tag">Certificate of Enrollment</span>
                                            <span className="criteria-tag-more">+ 2 more</span>
                    </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card-actions-new">
                                <button className="btn-view-details" data-scholarship-id="dost-sei">View Details</button>
                                <button className="btn-apply-scholarship-new" data-scholarship-name="DOST-SEI Undergraduate Scholarship" data-scholarship-id="dost-sei">Apply Now</button>
                            </div>
                        </div>

                        {/*  Scholarship Card 3  */}
                        <div className="scholarship-card-new" 
                             data-type="need" 
                             data-purpose="tuition" 
                             data-sponsor="university" 
                             data-amount="30000" 
                             data-slots="200"
                             data-deadline="2025-02-20"
                             data-scholarship-id="pup-excellence">
                            <div className="card-header-new">
                                <div className="scholarship-icon-large">
                                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                            </svg>
                        </div>
                                <div className="card-header-content">
                                    <h3 className="card-title-new">PUP Academic Excellence Grant</h3>
                                    <div className="card-tags">
                                        <span className="card-tag need-tag">Need-Based</span>
                                        <span className="card-tag purpose-tag">Tuition</span>
                                    </div>
                                    <div className="card-meta-info">
                                        <div className="meta-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                                            <span>PUP Scholarship Program</span>
                        </div>
                                        <div className="meta-item">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <circle cx="12" cy="12" r="10"/>
                                                <path d="M12 6v6l4 2"/>
                            </svg>
                                            <span>February 20, 2025</span>
                        </div>
                    </div>
                                </div>
                            </div>
                            
                            <div className="card-body-new">
                                <div className="card-stats">
                                    <div className="stat-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"/>
                                            <path d="M12 6v6l4 2"/>
                            </svg>
                                        <div className="stat-content">
                                            <span className="stat-label">Amount</span>
                                            <span className="stat-value">P30,000.00</span>
                                            <span className="stat-suffix">per scholar</span>
                    </div>
                                    </div>
                                    <div className="stat-item">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                            <circle cx="9" cy="7" r="4"/>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                                        </svg>
                                        <div className="stat-content">
                                            <span className="stat-label">Slots</span>
                                            <span className="stat-value">200</span>
                                            <span className="stat-suffix">scholars</span>
                </div>
            </div>
        </div>

                                <div className="card-criteria">
                                    <div className="criteria-section">
                                        <h4 className="criteria-title">Criteria</h4>
                                        <div className="criteria-tags-list">
                                            <span className="criteria-tag">PUP Students</span>
                                            <span className="criteria-tag">2nd Year</span>
                                            <span className="criteria-tag">3rd Year</span>
                                            <span className="criteria-tag">4th Year</span>
                        </div>
                    </div>
                                    
                                    <div className="criteria-section">
                                        <h4 className="criteria-title">Required Documents</h4>
                                        <div className="criteria-tags-list">
                                            <span className="criteria-tag">Certificate of Enrollment</span>
                                            <span className="criteria-tag">Transcript of Records</span>
                                            <span className="criteria-tag">Income Certificate</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card-actions-new">
                                <button className="btn-view-details" data-scholarship-id="pup-excellence">View Details</button>
                                <button className="btn-apply-scholarship-new" data-scholarship-name="PUP Academic Excellence Grant" data-scholarship-id="pup-excellence">Apply Now</button>
                            </div>
                        </div>
                    </div>
                {/* Removed duplicate </main> */}

    {/*  Scholarship Details Modal  */}
    <div className="scholarship-details-modal" id="scholarshipDetailsModal">
        <div className="modal-overlay"></div>
        <div className="modal-content">
            <button className="modal-close" id="closeDetailsModal">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
            </button>
            <div className="details-content" id="detailsContent">
                {/*  Content will be dynamically loaded  */}
            </div>
        </div>
    </div>

                </main>

            </div>
        </div>
    </div>

    </>
  );
}
