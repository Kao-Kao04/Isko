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
                    <input type="text" placeholder="Search profile..." id="searchInput" autoComplete="off" />
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
                <Link href="/osfa/scholarships" className="nav-link">
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
                <Link href="/student/profile" className="nav-link active">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span>Profile</span>
                </Link>
            </nav>
        </div>
    </header>

    {/*  Unified Profile Container  */}
    <div className="unified-profile-container">
        {/*  Modern Profile Header - Flexbox Layout  */}
        <div className="modern-profile-header">
            {/*  Cover Banner Area  */}
            <div className="cover-banner-area">
                <div className="cover-background" id="profileBanner">
                    <div className="cover-overlay"></div>
                    <button className="cover-upload-btn" onClick={(event) => { (window as any).openBannerUpload() }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Add cover photo
                    </button>
                    <input type="file" id="bannerUpload" accept="image/*" className="hidden-input" onChange={(event) => { (window as any).handleBannerUpload(event) }} />
                </div>
            </div>

            {/*  Profile Content Area  */}
            <div className="profile-content-area">
                <div className="profile-content-wrapper">
                    {/*  Sponsor Avatar Section  */}
                    <div className="profile-picture-section">
                        <div className="profile-avatar-large" id="profilePicture">SP</div>
                        <button className="avatar-edit-btn" onClick={(event) => { document.getElementById('profilePictureUpload')?.click() }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 20h9"/>
                                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <input type="file" id="profilePictureUpload" accept="image/*" className="hidden-input" onChange={(event) => { (window as any).handleProfilePictureUpload(event) }} />
                    </div>

                    {/*  Text Content Section  */}
                    <div className="profile-text-section">
                        <div className="profile-text-wrapper">
                            {/*  Name and Title  */}
                            <div className="name-title-container">
                                <h1 className="profile-name" id="profileName">Scholarship Provider</h1>
                                <p className="profile-tagline" id="profileTagline">Education Foundation Inc. • Empowering students through quality education</p>
                            </div>

                            {/*  Meta Information  */}
                            <div className="meta-info-container">
                                <div className="meta-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 21v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4"/>
                                        <rect x="7" y="3" width="10" height="8" rx="1"/>
                                    </svg>
                                    <span id="profileIndustry">Education</span>
                                </div>
                                <div className="meta-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                        <circle cx="12" cy="10" r="3"/>
                                    </svg>
                                    <span id="profileLocation">Manila, Philippines</span>
                                </div>
                                <div className="meta-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <path d="M2 12h20"/>
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                                    </svg>
                                    <a href="#" id="profileWebsite" target="_blank">educationfoundation.com</a>
                                </div>
                            </div>

                            {/*  Statistics Row  */}
                            <div className="profile-stats-container">
                                <div className="stat-item">
                                    <span className="stat-number">1.2k</span>
                                    <span className="stat-label">Followers</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">847</span>
                                    <span className="stat-label">Following</span>
                                </div>
                            </div>

                            {/*  Action Buttons  */}
                            <div className="action-buttons-container">
                                <button className="btn-primary" id="editProfileBtn" onClick={(event) => { (window as any).toggleEditMode() }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                    <span id="editBtnText">Edit Profile</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/*  Two-Column Layout  */}
        <div className="profile-layout">
            {/*  Main Content Column  */}
            <div className="profile-main">
                {/*  Profile Tabs  */}
                <div className="content-tabs">
                    <button className="tab-btn active" data-tab="personal" style={{"flex":"1"}}>Personal Information</button>
                    <button className="tab-btn" data-tab="company" style={{"flex":"1"}}>Company Details</button>
                </div>

                    {/*  Personal Information Form  */}
                <div className="profile-card" id="personal-tab">
                    <div className="card-header">
                        <h2 className="card-title">Personal Information</h2>
                        <button className="btn-primary save-btn" onClick={(event) => { (window as any).savePersonalInfo() }}>Save Changes</button>
                    </div>
                    <div className="card-content">
                        <form className="profile-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input type="text" className="form-input" value="Scholarship" id="firstName" readOnly />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input type="text" className="form-input" value="Provider" id="lastName" readOnly />
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input type="email" className="form-input" value="sponsor@iskomo.com" id="email" readOnly />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input type="tel" className="form-input" value="+63 912 345 6789" id="phone" readOnly />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Bio</label>
                                <textarea className="form-textarea" rows={4} id="bio" readOnly>Passionate about supporting education and empowering students through scholarship programs.</textarea>
                            </div>
                        </form>
                    </div>
                </div>

                {/*  Company Details Form  */}
                <div className="profile-card" id="company-tab" style={{"display":"none"}}>
                    <div className="card-header">
                        <h2 className="card-title">Company Details</h2>
                        <button className="btn-primary save-btn" onClick={(event) => { (window as any).saveCompanyInfo() }}>Save Changes</button>
                    </div>
                    <div className="card-content">
                        <form className="profile-form">
                            <div className="form-group">
                                <label className="form-label">Company Name</label>
                                <input type="text" className="form-input" value="Education Foundation Inc." id="companyName" readOnly />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Industry</label>
                                <select className="form-select" id="industry" disabled>
                                    <option value="education" selected>Education</option>
                                    <option value="technology">Technology</option>
                                    <option value="healthcare">Healthcare</option>
                                    <option value="finance">Finance</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Company Website</label>
                                <input type="url" className="form-input" value="https://educationfoundation.com" id="website" readOnly />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Company Address</label>
                                <textarea className="form-textarea" rows={3} id="address" readOnly>123 Education Street, Manila, Philippines</textarea>
                            </div>
                        </form>
                    </div>
                </div>

                {/*  Security Settings  */}
                {/*  REMOVED  */}

                {/*  Preferences  */}
                {/*  REMOVED  */}
            </div>

            {/*  Sidebar Column  */}
            <div className="profile-sidebar">
                {/*  Sponsor Details Card  */}
                <div className="sidebar-card">
                    <div className="card-header">
                        <h3 className="card-title">Sponsor Details</h3>
                    </div>
                    <div className="card-content">
                        <div className="detail-item">
                            <div className="detail-label">Organization Type</div>
                            <div className="detail-value" id="orgType">Non-Profit Foundation</div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-label">Founded</div>
                            <div className="detail-value" id="foundedYear">2020</div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-label">Email</div>
                            <div className="detail-value" id="contactEmail">sponsor@iskomo.com</div>
                        </div>
                        <div className="detail-item">
                            <div className="detail-label">Phone</div>
                            <div className="detail-value" id="contactPhone">+63 912 345 6789</div>
                        </div>
                    </div>
                </div>

                {/*  Quick Stats  */}
                <div className="sidebar-card">
                    <div className="card-header">
                        <h3 className="card-title">Impact Statistics</h3>
                    </div>
                    <div className="card-content">
                        <div className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <div className="stat-number">150</div>
                                    <div className="stat-label">Scholars Supported</div>
                                </div>
                            </div>
                            <div className="stat-card">
                                <div className="stat-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                    </svg>
                                </div>
                                <div className="stat-info">
                                    <div className="stat-number">12</div>
                                    <div className="stat-label">Active Programs</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*  Account Status  */}
                <div className="sidebar-card">
                    <div className="card-header">
                        <h3 className="card-title">Account Status</h3>
                    </div>
                    <div className="card-content">
                        <div className="account-status-info">
                            <div className="member-since">
                                <strong>Member since:</strong> January 2023
                            </div>
                            <div className="member-since">
                                <strong>Account Type:</strong> Verified Sponsor
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    {/*  Toast Notification  */}
    <div className="toast" id="toast">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
        <span id="toastMessage">Profile Updated Successfully</span>
    </div>

    
    

    </>
  );
}
