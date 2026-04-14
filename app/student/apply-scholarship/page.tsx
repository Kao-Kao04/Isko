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
                <Link href="/student/dashboard" className="navbar-logo-link">
                    <img src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" alt="IskoMo" />
                </Link>
                <div className="navbar-search">
                    <svg className="navbar-search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="9" r="6"/>
                        <path d="m17 17-4-4"/>
                    </svg>
                    <input type="text" placeholder="Search" autoComplete="off" />
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
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                    <span>Iskolarships</span>
                </Link>
                <Link href="/student/kapwa" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                        <circle cx="9" cy="7" r="4"/>
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    <span>Kapwa</span>
                </Link>
                <Link href="/student/status" className="nav-link">
                    <svg className="nav-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3v18h18"/>
                        <path d="M7 12l4-4 4 4 6-6"/>
                    </svg>
                    <span>Status</span>
                </Link>
            </nav>

            
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
        <div className="page-header">
            <h1>Scholarship Application</h1>
            <p>Complete the form below to apply for the scholarship</p>
        </div>

        <div className="application-form-container">
            <form id="scholarshipApplicationForm">
                {/*  Scholarship Information (Auto-filled)  */}
                <div className="form-section">
                    <h2 className="form-section-title">Scholarship Information</h2>
                    <div className="scholarship-info-box" id="scholarshipInfoBox">
                        <h3 id="scholarshipName">Loading scholarship information...</h3>
                        <p id="scholarshipDescription">Please wait while we load the scholarship details.</p>
                    </div>
                </div>

                {/*  Student Information  */}
                <div className="form-section">
                    <h2 className="form-section-title">Student Information</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="fullName">Full Name <span className="required">*</span></label>
                            <input type="text" id="fullName" name="fullName" required placeholder="Enter your full name" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="email">Email Address <span className="required">*</span></label>
                            <input type="email" id="email" name="email" required placeholder="your.email@email.com" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="contactNumber">Contact Number <span className="required">*</span></label>
                            <input type="tel" id="contactNumber" name="contactNumber" required placeholder="09XX-XXX-XXXX" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="studentId">Student ID <span className="required">*</span></label>
                            <input type="text" id="studentId" name="studentId" required placeholder="e.g., 2021-12345" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="school">School <span className="required">*</span></label>
                            <input type="text" id="school" name="school" required placeholder="e.g., Polytechnic University of the Philippines" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="course">Course / Program <span className="required">*</span></label>
                            <input type="text" id="course" name="course" required placeholder="e.g., BS Information Technology" />
                        </div>
                        <div className="form-group">
                            <label htmlFor="yearLevel">Year Level <span className="required">*</span></label>
                            <select id="yearLevel" name="yearLevel" required>
                                <option value="">Select year level</option>
                                <option value="1st">1st Year</option>
                                <option value="2nd">2nd Year</option>
                                <option value="3rd">3rd Year</option>
                                <option value="4th">4th Year</option>
                                <option value="5th">5th Year</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/*  Requirements Upload  */}
                <div className="form-section">
                    <h2 className="form-section-title">Required Documents</h2>
                    <div className="form-grid">
                        <div className="form-group">
                            <label htmlFor="proofOfEnrollment">Proof of Enrollment <span className="required">*</span></label>
                            <div className="file-upload-container">
                                <input type="file" id="proofOfEnrollment" name="proofOfEnrollment" accept=".pdf,.jpg,.jpeg,.png" required />
                                <label htmlFor="proofOfEnrollment" className="file-upload-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    <span>Click to upload</span>
                                    <span className="file-hint">PDF, JPG, or PNG (Max 5MB)</span>
                                </label>
                                <div className="file-name-display" id="proofOfEnrollmentName"></div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="transcript">Transcript of Records / Grades <span className="required">*</span></label>
                            <div className="file-upload-container">
                                <input type="file" id="transcript" name="transcript" accept=".pdf,.jpg,.jpeg,.png" required />
                                <label htmlFor="transcript" className="file-upload-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    <span>Click to upload</span>
                                    <span className="file-hint">PDF, JPG, or PNG (Max 5MB)</span>
                                </label>
                                <div className="file-name-display" id="transcriptName"></div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="validId">Valid ID <span className="required">*</span></label>
                            <div className="file-upload-container">
                                <input type="file" id="validId" name="validId" accept=".pdf,.jpg,.jpeg,.png" required />
                                <label htmlFor="validId" className="file-upload-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    <span>Click to upload</span>
                                    <span className="file-hint">PDF, JPG, or PNG (Max 5MB)</span>
                                </label>
                                <div className="file-name-display" id="validIdName"></div>
                            </div>
                        </div>

                        <div className="form-group">
                            <label htmlFor="resume">Resume (Optional)</label>
                            <div className="file-upload-container">
                                <input type="file" id="resume" name="resume" accept=".pdf,.doc,.docx" />
                                <label htmlFor="resume" className="file-upload-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    <span>Click to upload</span>
                                    <span className="file-hint">PDF or DOC (Max 5MB)</span>
                                </label>
                                <div className="file-name-display" id="resumeName"></div>
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="essay">Essay / Motivation Letter <span className="required">*</span></label>
                            <textarea id="essay" name="essay" rows={6} required placeholder="Write your motivation letter or essay explaining why you deserve this scholarship..."></textarea>
                        </div>

                        <div className="form-group">
                            <label htmlFor="otherDocuments">Other Documents (Optional)</label>
                            <div className="file-upload-container">
                                <input type="file" id="otherDocuments" name="otherDocuments" accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" multiple />
                                <label htmlFor="otherDocuments" className="file-upload-label">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                        <polyline points="17 8 12 3 7 8"/>
                                        <line x1="12" y1="3" x2="12" y2="15"/>
                                    </svg>
                                    <span>Click to upload</span>
                                    <span className="file-hint">Multiple files allowed</span>
                                </label>
                                <div className="file-name-display" id="otherDocumentsName"></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*  Declaration & Submission  */}
                <div className="form-section">
                    <h2 className="form-section-title">Declaration & Submission</h2>
                    <div className="checkbox-group">
                        <input type="checkbox" id="declaration" name="declaration" required />
                        <label htmlFor="declaration">
                            I certify that all information provided in this application is true and accurate. I understand that providing false information may result in disqualification from this scholarship program. <span className="required">*</span>
                        </label>
                    </div>
                    <div className="checkbox-group">
                        <input type="checkbox" id="terms" name="terms" required />
                        <label htmlFor="terms">
                            I have read and agree to the terms and conditions of this scholarship program. <span className="required">*</span>
                        </label>
                    </div>
                </div>

                {/*  Form Actions  */}
                <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={(event) => { window.location.href='iskolarships.html' }}>Cancel</button>
                    <button type="submit" className="btn-primary">Submit Application</button>
                </div>
            </form>
        </div>
    </div>

    

    </>
  );
}
