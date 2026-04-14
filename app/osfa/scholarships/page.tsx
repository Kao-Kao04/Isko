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
            {/*  Left: Logo + Search Bar  */}
            <div className="navbar-left">
                <div className="navbar-logo">
                    <Link href="/" className="navbar-logo-link">
                        <img src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" alt="IskoMo" />
                    </Link>
                </div>
                <div className="navbar-search linkedin-search">
                    <svg className="navbar-search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="9" r="6"/>
                        <path d="m17 17-4-4"/>
                    </svg>
                    <input type="text" placeholder="Search scholarships..." id="searchInput" autoComplete="off" />
                </div>
            </div>

            {/*  Center: Main Navigation Links  */}
            <nav className="navbar-center">
                <Link href="/osfa/home" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span className="nav-label">Home</span>
                </Link>
                <Link href="/osfa/scholarships" className="nav-link active">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <span className="nav-label">Scholarships</span>
                </Link>
                <Link href="/osfa/applicants" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                    </svg>
                    <span className="nav-label">Applicants</span>
                </Link>
                <Link href="/osfa/evaluation" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 11l3 3L22 4"/>
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                    <span className="nav-label">Evaluation</span>
                </Link>
                <Link href="/osfa/reports" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3v18h18"/>
                        <path d="M7 12l4-4 4 4 6-6"/>
                    </svg>
                    <span className="nav-label">Reports</span>
                </Link>
                <Link href="/osfa/notifications" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                    </svg>
                    <span className="nav-label">Notifications</span>
                </Link>
                <Link href="/student/profile" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>Profile</span>
                </Link>
            </nav>
        </div>
    </header>

    {/*  Main Dashboard Container  */}
    <div className="dashboard-container">
        <div className="dashboard-layout">
            {/*  Left Sidebar  */}
            <aside className="left-sidebar">
                {/*  Profile Card  */}
                <div className="profile-card">
                    <div className="profile-card-avatar" id="leftProfileAvatar">SP</div>
                    <div className="profile-card-name" id="leftProfileName">Scholarship Provider</div>
                    <div className="profile-card-course" id="leftProfileCourse">Sponsor Account</div>
                    <div className="profile-completion">
                        <div className="profile-completion-label">
                            <span>Profile Complete</span>
                            <span>100%</span>
                        </div>
                        <div className="profile-completion-bar">
                            <div className="profile-completion-fill" style={{"width":"100%"}}></div>
                        </div>
                    </div>
                </div>

                {/*  Quick Actions  */}
                <div className="quick-actions-card">
                    <h3 className="quick-actions-title">Quick Actions</h3>
                    <div className="quick-actions-list">
                        <a href="#" className="quick-action-item" onClick={(event) => { (window as any).createScholarship() }}>
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 5v10m5-5H5"/>
                            </svg>
                            <span>Create Scholarship</span>
                        </a>
                        <a href="#" className="quick-action-item" onClick={(event) => { (window as any).viewApplications() }}>
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                                <rect x="9" y="3" width="6" height="4" rx="2"/>
                            </svg>
                            <span>View Applications</span>
                        </a>
                        <a href="#" className="quick-action-item" onClick={(event) => { (window as any).manageDeadlines() }}>
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="10" cy="10" r="8"/>
                                <path d="M10 6v4l3 2"/>
                            </svg>
                            <span>Manage Deadlines</span>
                        </a>
                    </div>
                </div>

                {/*  Application Status  */}
                <div className="application-status-card">
                    <h3 className="application-status-title">Application Summary</h3>
                    <div className="status-item">
                        <span className="status-label">Total Applicants</span>
                        <span className="status-value highlight">142</span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Pending Review</span>
                        <span className="status-value">23</span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Under Review</span>
                        <span className="status-value">45</span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Approved</span>
                        <span className="status-value">45</span>
                    </div>
                    <div className="status-item">
                        <span className="status-label">Rejected</span>
                        <span className="status-value">29</span>
                    </div>
                </div>

                {/*  Scholarship Applications Management  */}
                <div className="quick-actions-card">
                    <h3 className="quick-actions-title">Applications</h3>
                    <div className="quick-actions-list">
                        <Link href="/osfa/applicants" className="quick-action-item">
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                                <rect x="9" y="3" width="6" height="4" rx="2"/>
                            </svg>
                            <span>View All Applications</span>
                        </Link>
                        <Link href="/osfa/evaluation" className="quick-action-item">
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                            <span>Evaluation Queue</span>
                        </Link>
                        <Link href="/osfa/reports" className="quick-action-item">
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 3v18h18"/>
                                <path d="M7 12l4-4 4 4 6-6"/>
                            </svg>
                            <span>Application Reports</span>
                        </Link>
                    </div>
                </div>
            </aside>

            {/*  Main Content  */}
            <main className="main-content">
                <div className="content-wrapper">
                    {/*  Welcome Section  */}
                    <section className="welcome-section">
                        <h1 className="welcome-title">Scholarship Management</h1>
                        <p className="welcome-subtitle">Create and manage your scholarship programs</p>
                    </section>

                    {/*  Action Buttons  */}
                    <div className="action-buttons">
                        <button className="btn-primary" onClick={(event) => { (window as any).createScholarship() }}>
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 5v10m5-5H5"/>
                            </svg>
                            Create New Scholarship
                        </button>
                        <button className="btn-secondary" onClick={(event) => { (window as any).viewApplications() }}>
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                                <rect x="9" y="3" width="6" height="4" rx="2"/>
                            </svg>
                            View Applications
                        </button>
                    </div>

                    {/*  Scholarships Grid  */}
                    <div className="scholarships-grid">
                        <div className="card scholarship-card">
                            <div className="card-header">
                                <h3 className="card-title">Academic Excellence Grant</h3>
                                <div className="scholarship-status active">Active</div>
                            </div>
                            <div className="card-body">
                                <p className="scholarship-description">Merit-based scholarship for outstanding academic performance</p>
                                <div className="scholarship-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Amount:</span>
                                        <span className="detail-value">₱50,000</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Deadline:</span>
                                        <span className="detail-value">March 15, 2025</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Applicants:</span>
                                        <span className="detail-value">45</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="btn-primary" onClick={(event) => { (window as any).editScholarship('1') }}>Edit</button>
                                <button className="btn-secondary" onClick={(event) => { (window as any).viewApplications('1') }}>Applications</button>
                            </div>
                        </div>

                        <div className="card scholarship-card">
                            <div className="card-header">
                                <h3 className="card-title">STEM Innovation Award</h3>
                                <div className="scholarship-status active">Active</div>
                            </div>
                            <div className="card-body">
                                <p className="scholarship-description">Supporting students pursuing STEM fields with innovative projects</p>
                                <div className="scholarship-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Amount:</span>
                                        <span className="detail-value">₱75,000</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Deadline:</span>
                                        <span className="detail-value">April 1, 2025</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Applicants:</span>
                                        <span className="detail-value">32</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="btn-primary" onClick={(event) => { (window as any).editScholarship('2') }}>Edit</button>
                                <button className="btn-secondary" onClick={(event) => { (window as any).viewApplications('2') }}>Applications</button>
                            </div>
                        </div>

                        <div className="card scholarship-card">
                            <div className="card-header">
                                <h3 className="card-title">Community Service Scholarship</h3>
                                <div className="scholarship-status draft">Draft</div>
                            </div>
                            <div className="card-body">
                                <p className="scholarship-description">Recognizing students with exceptional community service records</p>
                                <div className="scholarship-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Amount:</span>
                                        <span className="detail-value">₱30,000</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Deadline:</span>
                                        <span className="detail-value">Not set</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Applicants:</span>
                                        <span className="detail-value">0</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-footer">
                                <button className="btn-primary" onClick={(event) => { (window as any).editScholarship('3') }}>Edit</button>
                                <button className="btn-secondary" onClick={(event) => { (window as any).publishScholarship('3') }}>Publish</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/*  Right Sidebar  */}
            <aside className="right-sidebar">
                <div className="sidebar-card">
                    <div className="sidebar-card-header">
                        <h3 className="sidebar-card-title">
                            <svg className="sidebar-icon" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="10" cy="10" r="8"/>
                                <path d="M10 6v4l3 2"/>
                            </svg>
                            Upcoming Deadlines
                        </h3>
                    </div>
                    <div className="announcements-list-modern">
                        <div className="announcement-item-modern">
                            <div className="announcement-icon">
                                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="10" cy="10" r="8"/>
                                    <path d="M10 6v4l3 2"/>
                                </svg>
                            </div>
                            <div className="announcement-content">
                                <div className="announcement-text">Academic Excellence Grant</div>
                                <div className="announcement-time">March 15, 2025</div>
                            </div>
                        </div>
                        <div className="announcement-item-modern">
                            <div className="announcement-icon">
                                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="10" cy="10" r="8"/>
                                    <path d="M10 6v4l3 2"/>
                                </svg>
                            </div>
                            <div className="announcement-content">
                                <div className="announcement-text">STEM Innovation Award</div>
                                <div className="announcement-time">April 1, 2025</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="sidebar-card">
                    <div className="sidebar-card-header">
                        <h3 className="sidebar-card-title">
                            <svg className="sidebar-icon" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                            Quick Stats
                        </h3>
                    </div>
                    <div className="announcements-list-modern">
                        <div className="announcement-item-modern">
                            <div className="announcement-icon">
                                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                            </div>
                            <div className="announcement-content">
                                <div className="announcement-text">Total Scholarships</div>
                                <div className="announcement-time">3</div>
                            </div>
                        </div>
                        <div className="announcement-item-modern">
                            <div className="announcement-icon">
                                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div className="announcement-content">
                                <div className="announcement-text">Total Applicants</div>
                                <div className="announcement-time">77</div>
                            </div>
                        </div>
                        <div className="announcement-item-modern">
                            <div className="announcement-icon extension">
                                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11l3 3L22 4"/>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                            </div>
                            <div className="announcement-content">
                                <div className="announcement-text">Active Scholarships</div>
                                <div className="announcement-time">2</div>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    </div>

    
    

    </>
  );
}
