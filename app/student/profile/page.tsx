"use client"

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  useEffect(() => {
    // JS logic here
  }, []);

  const handleBannerUpload = (event: any) => { console.log('Banner upload', event); };
  const handleProfilePictureUpload = (event: any) => { console.log('Profile upload', event); };
  const openBannerUpload = () => { document.getElementById('bannerUpload')?.click(); };
  const toggleEditMode = () => { console.log('Toggle Edit'); };
  const savePersonalInfo = () => { console.log('Save Personal'); };
  const saveAcademicInfo = () => { console.log('Save Academic'); };

  return (
    <>
    <header className="top-navbar">
        <div className="top-navbar-container">
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

            <nav className="navbar-center">
                <Link href="/student/dashboard" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                        <polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                    <span className="nav-label">Home</span>
                </Link>
                <Link href="/student/iskolarships" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                        <path d="M9 7h6"/>
                        <path d="M9 11h6"/>
                        <path d="M9 15h4"/>
                    </svg>
                    <span className="nav-label">Iskolarships</span>
                </Link>
                <Link href="/student/kapwa" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span className="nav-label">Kapwa</span>
                </Link>
                <Link href="/student/status" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 3v18h18"/>
                        <path d="M7 12l4-4 4 4 6-6"/>
                    </svg>
                    <span className="nav-label">Status</span>
                </Link>
                <Link href="/student/profile" className="nav-link active">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <span className="nav-label">Profile</span>
                </Link>
            </nav>

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
                    <div className="notification-menu" id="notificationMenu">
                        <div className="notification-header">
                            <div className="notification-logo-container">
                                <img src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" alt="IskoMo Logo" style={{height:"32px",width:"auto",filter:"brightness(0) invert(1)"}} />
                            </div>
                            <div className="notification-welcome">
                                <div className="notification-welcome-title" style={{fontSize:"1rem",fontWeight:"600",margin:"0 0 0.125rem 0",color:"white",lineHeight:"1.3"}}>Welcome Iskolar</div>
                                <div className="notification-welcome-subtitle" style={{fontSize:"0.75rem",margin:"0",color:"rgba(255, 255, 255, 0.85)",fontWeight:"400",lineHeight:"1.4"}}>Stay updated with your scholarship journey</div>
                            </div>
                        </div>
                        <div className="notification-content">
                            <div className="notification-empty-state">
                                <svg className="notification-empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{color:"#9ca3af",marginBottom:"0.75rem",opacity:"0.4"}}>
                                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                                </svg>
                                <p className="notification-empty-text" style={{fontSize:"0.875rem",fontWeight:"500",color:"#1f2937",margin:"0 0 0.25rem 0"}}>No new notifications</p>
                                <p className="notification-empty-subtext" style={{fontSize:"0.75rem",color:"#6b7280",margin:"0"}}>You're all caught up!</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button className="notification-btn linkedin-notification" id="navLogoutBtn" title="Sign Out" onClick={(event) => { event.preventDefault(); console.log('Logout'); }} style={{marginLeft:"0.25rem"}}>
                    <svg className="notification-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{color:"#dc2626"}}>
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    <span className="notification-label" style={{color:"#dc2626"}}>Sign Out</span>
                </button>
            </div>
        </div>
    </header>

    <div className="unified-profile-container dashboard-mode">
        <div className="compact-profile-header">
            <div className="cover-banner-compact">
                <input type="file" id="bannerUpload" accept="image/*" className="hidden-input" onChange={(event) => { (window as any).handleBannerUpload(event) }} />
            </div>
            <div className="compact-header-content">
                <div className="compact-header-left">
                    <div className="compact-avatar-wrapper">
                        <div className="compact-avatar" id="profilePicture">S</div>
                        <button className="compact-avatar-edit" onClick={(event) => { (document.getElementById('profilePictureUpload') as HTMLInputElement).click() }} title="Change Profile Picture">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                        </button>
                        <input type="file" id="profilePictureUpload" accept="image/*" className="hidden-input" onChange={(event) => { (window as any).handleProfilePictureUpload(event) }} />
                    </div>
                    <div className="compact-name-info">
                        <div className="compact-name-row">
                            <h1 className="compact-name" id="profileName">Student Name</h1>
                            <span className="status-badge status-iskolar" id="profileStatusBadge" title="Active scholarship status">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                Iskolar
                            </span>
                        </div>
                        <div className="compact-course" id="profileTagline">BS in Information Technology • 3rd Year</div>
                    </div>
                </div>
                <div className="compact-header-right">
                    <button className="btn-secondary btn-sm" onClick={(event) => { (window as any).openBannerUpload() }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        Cover
                    </button>
                    <button className="btn-primary btn-sm" id="editProfileBtn" onClick={(event) => { (window as any).toggleEditMode() }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        <span id="editBtnText">Edit Profile</span>
                    </button>
                </div>
            </div>
        </div>

        <div className="dashboard-grid-layout">
            <aside className="dashboard-sidebar">
                <div className="compact-card">
                    <div className="compact-card-header">
                        <h3 className="compact-card-title">Contact Info</h3>
                    </div>
                    <div className="compact-card-body">
                        <div className="detail-item-compact">
                            <span className="lbl">Email Address</span>
                            <span className="val"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg> student@iskomo.com</span>
                        </div>
                        <div className="detail-item-compact">
                            <span className="lbl">Phone Number</span>
                            <span className="val"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg> +63 912 345 6789</span>
                        </div>
                        <div className="detail-item-compact mb-0 border-n">
                            <span className="lbl">Home Address</span>
                            <span className="val"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> Sta. Mesa, Manila</span>
                        </div>
                    </div>
                </div>

                <div className="compact-card">
                    <div className="compact-card-header">
                        <h3 className="compact-card-title">Scholarship</h3>
                    </div>
                    <div className="compact-card-body p-16">
                        <div className="stats-badges-container">
                            <div className="stat-badge iskomo-bg-green">
                                <span className="stat-num">Batch 2021</span>
                                <span className="stat-text">IskoMO Cohort</span>
                            </div>
                            <div className="stat-badge iskomo-bg-blue">
                                <span className="stat-num">Eligible</span>
                                <span className="stat-text">Renewal Status</span>
                            </div>
                            <div className="stat-badge iskomo-bg-amber">
                                <span className="stat-num">Processing</span>
                                <span className="stat-text">Next Allowance</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="compact-card">
                    <div className="compact-card-header">
                        <h3 className="compact-card-title">Account</h3>
                    </div>
                    <div className="compact-card-body">
                        <div className="detail-item-compact">
                            <span className="lbl">Student Type</span>
                            <span className="val">Regular Student</span>
                        </div>
                        <div className="detail-item-compact mb-0 border-n">
                            <span className="lbl">Account Verification</span>
                            <span className="val text-success">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                                Verified Account
                            </span>
                        </div>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <div className="compact-tabs">
                    <button className="compact-tab active" data-tab="personal">Personal Details</button>
                    <button className="compact-tab" data-tab="academic">Academic Records</button>
                </div>

                <div className="compact-card tab-content active" id="personal-tab">
                    <div className="compact-card-header border-bottom">
                        <h2 className="compact-card-title">Personal Details</h2>
                    </div>
                    <div className="compact-card-body">
                        <form className="profile-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">First Name</label>
                                    <input type="text" className="compact-input" value="Student" id="firstName" readOnly />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Last Name</label>
                                    <input type="text" className="compact-input" value="Name" id="lastName" readOnly />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Email Address (Editable)</label>
                                    <input type="email" className="compact-input" value="student@iskomo.com" id="email" readOnly />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone Number (Editable)</label>
                                    <input type="tel" className="compact-input" value="+63 912 345 6789" id="phone" readOnly />
                                </div>
                            </div>
                            <div className="form-group mb-0">
                                <label className="form-label">Home Address (Editable)</label>
                                <input type="text" className="compact-input" value="Sta. Mesa, Manila" id="address" readOnly />
                            </div>
                            
                            <div className="form-actions-sticky hidden" id="personal-actions" style={{display:"none"}}>
                                <button type="button" className="btn-secondary btn-sm" onClick={(event) => { (window as any).toggleEditMode() }}>Cancel</button>
                                <button type="button" className="btn-primary btn-sm" onClick={(event) => { (window as any).savePersonalInfo() }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>

                <div className="compact-card tab-content" id="academic-tab" style={{display:"none"}}>
                    <div className="compact-card-header border-bottom">
                        <h2 className="compact-card-title">Academic Records</h2>
                    </div>
                    <div className="compact-card-body">
                        <form className="profile-form">
                            <div className="form-group">
                                <label className="form-label">University</label>
                                <input type="text" className="compact-input" value="Polytechnic University of the Philippines" id="university" readOnly />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Degree Program</label>
                                    <select className="compact-input" id="degree" disabled value="bsit">
                                        <option value="bsit">BS Information Technology</option>
                                        <option value="bscs">BS Computer Science</option>
                                        <option value="bsis">BS Information Systems</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Year Level</label>
                                    <select className="compact-input" id="yearLevel" disabled value="3">
                                        <option value="1">1st Year</option>
                                        <option value="2">2nd Year</option>
                                        <option value="3">3rd Year</option>
                                        <option value="4">4th Year</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group mb-0">
                                <label className="form-label">Student ID</label>
                                <input type="text" className="compact-input" value="2021-12345" id="studentId" readOnly />
                            </div>
                            
                            <div className="form-actions-sticky hidden" id="academic-actions" style={{display:"none"}}>
                                <button type="button" className="btn-secondary btn-sm" onClick={(event) => { (window as any).toggleEditMode() }}>Cancel</button>
                                <button type="button" className="btn-primary btn-sm" onClick={(event) => { saveAcademicInfo() }}>Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    </div>

    <div className="toast" id="toast">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
        </svg>
        <span id="toastMessage">Profile Updated Successfully</span>
    </div>
    </>
  );
}
