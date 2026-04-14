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
                <Link href="/student/kapwa" className="nav-link active">
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
            <div className="kapwa-wrapper">
                {/*  Left Sidebar - Important Contacts & Guidelines  */}
                <aside className="kapwa-sidebar-left">
                    <div className="help-card">
                        <div className="help-card-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                            </svg>
                            PUP OSFA Hotlines
                        </div>
                        <div className="contact-list">
                            <div className="contact-item">
                                <div className="contact-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                        <polyline points="22,6 12,13 2,6"/>
                                    </svg>
                                </div>
                                <div className="contact-details">
                                    <h4>Email Address</h4>
                                    <p>scholarship@pup.edu.ph</p>
                                    <p>osfa@pup.edu.ph</p>
                                </div>
                            </div>
                            <div className="contact-item">
                                <div className="contact-icon">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                                        <polyline points="9 22 9 12 15 12 15 22"/>
                                    </svg>
                                </div>
                                <div className="contact-details">
                                    <h4>OSFA Window</h4>
                                    <p>South Wing, Ground Floor</p>
                                    <p>PUP Main Campus, Sta. Mesa</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="help-card">
                        <div className="help-card-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            Document Upload Guide
                        </div>
                        <p style={{"fontSize":"0.875rem","color":"#4b5563","marginBottom":"1rem"}}>
                            Ensure a smooth application process by preparing your documents correctly:
                        </p>
                        <ul style={{"fontSize":"0.875rem","color":"#4b5563","paddingLeft":"1.25rem","display":"flex","flexDirection":"column","gap":"0.5rem","marginBottom":"0"}}>
                            <li>Accepted formats: <strong>PDF, JPG, PNG</strong></li>
                            <li>Maximum file size: <strong>5 MB</strong> per file</li>
                            <li>Ensure text is clear and readable.</li>
                            <li>Check document requirements for your specific scholarship carefully.</li>
                        </ul>
                    </div>
                </aside>

                {/*  Main Content - FAQ & Help Desk  */}
                <main className="main-content">
                    {/*  FAQ Accordion  */}
                    <div className="help-card">
                        <div className="help-card-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                                <line x1="12" y1="17" x2="12.01" y2="17"/>
                            </svg>
                            Frequently Asked Questions (FAQs)
                        </div>
                        <div className="faq-list">
                            <div className="faq-item">
                                <button className="faq-question">
                                    When is the deadline for scholarship applications?
                                    <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9"/>
                                    </svg>
                                </button>
                                <div className="faq-answer">
                                    <p>The deadline varies depending on the scholarship program. Please check the &quot;Iskolarships&quot; page and look at the specific deadline for the grant you are applying for. The university typically announces university-wide scholarship openings 2 weeks prior to the start of the semester.</p>
                                </div>
                            </div>
                            <div className="faq-item">
                                <button className="faq-question">
                                    Can I apply for multiple scholarships at once?
                                    <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9"/>
                                    </svg>
                                </button>
                                <div className="faq-answer">
                                    <p>Generally, PUP only allows students to enjoy ONE major scholarship/financial assistance program at a time to give opportunities to other students. However, some minor grants or college-specific stipends might allow stackability. We recommend checking with the specific sponsor or the OSFA office.</p>
                                </div>
                            </div>
                            <div className="faq-item">
                                <button className="faq-question">
                                    How will I track the status of my application?
                                    <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9"/>
                                    </svg>
                                </button>
                                <div className="faq-answer">
                                    <p>You can track the progress of your application on the &quot;Status&quot; page of this platform. It will update as your application moves through Submission, Review, Interview (if applicable), Validation, and Final Approval.</p>
                                </div>
                            </div>
                            <div className="faq-item">
                                <button className="faq-question">
                                    What should I do if my document upload fails?
                                    <svg className="faq-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="6 9 12 15 18 9"/>
                                    </svg>
                                </button>
                                <div className="faq-answer">
                                    <p>Make sure your file is in PDF, JPG, or PNG format and does not exceed the 5MB size limit. You can use free online compression tools to decrease file size. If issues persist, try switching browsers or contacting the Help Desk below.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*  Contact Form  */}
                    <div className="help-card">
                        <div className="help-card-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            OSFA Help Desk
                        </div>
                        <p style={{"fontSize":"0.875rem","color":"#6b7280","marginBottom":"1.5rem"}}>Can't find the answer you're looking for? Send a message directly to the Office of Scholarship and Financial Assistance.</p>
                        
                        <form className="contact-form" onSubmit={(event) => { event.preventDefault(); alert('Message sent successfully! Please wait 1-2 business days for a response.'); (event.currentTarget as HTMLFormElement).reset(); }}>
                            <div className="form-group">
                                <label className="form-label">Subject Category</label>
                                <select className="form-select" required defaultValue="">
                                    <option value="" disabled>Select a category</option>
                                    <option value="application">Application Status Inquiry</option>
                                    <option value="documents">Document Submission Issues</option>
                                    <option value="eligibility">Scholarship Eligibility</option>
                                    <option value="technical">Technical Support / System Error</option>
                                    <option value="other">Other Inquiry</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Student Number (Optional)</label>
                                <input type="text" className="form-input" placeholder="e.g. 2023-12345-MN-0" />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Your Message</label>
                                <textarea className="form-textarea" placeholder="Detail your concern here..." required></textarea>
                            </div>
                            <button type="submit" className="btn-submit">Submit Ticket</button>
                        </form>
                    </div>
                </main>

            </div>
        </div>
    </div>

    </>
  );
}
