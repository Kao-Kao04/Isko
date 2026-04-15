"use client"

import Link from 'next/link';

export default function Page() {
  return (
    <>
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
            </aside>

            {/*  Main Content  */}
            <main className="main-content">
                <div className="content-wrapper">
                    {/*  Welcome Section  */}
                    <section className="welcome-section">
                        <h1 className="welcome-title">Welcome back, Scholarship Provider!</h1>
                        <p className="welcome-subtitle">Here&apos;s what&apos;s happening with your scholarship programs today.</p>
                    </section>

                    {/*  Dashboard Stats  */}
                    <div className="dashboard-stats">
                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">142</div>
                                <div className="stat-label">Total Applicants</div>
                                <div className="stat-change positive">+12% from last month</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">3</div>
                                <div className="stat-label">Active Scholarships</div>
                                <div className="stat-change positive">+1 this quarter</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11l3 3L22 4"/>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">45</div>
                                <div className="stat-label">Approved Applications</div>
                                <div className="stat-change positive">+8% approval rate</div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <div className="stat-icon">
                                <svg width="24" height="24" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="10" cy="10" r="8"/>
                                    <path d="M10 6v4l3 2"/>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">3.2</div>
                                <div className="stat-label">Avg. Review Days</div>
                                <div className="stat-change positive">-1.5 days improvement</div>
                            </div>
                        </div>
                    </div>

                    {/*  Recent Activity  */}
                    <div className="card">
                        <div className="card-header">
                            <h2 className="section-title">Recent Activity</h2>
                            <Link href="/osfa/applicants" className="btn-link">View All</Link>
                        </div>
                        <div className="activity-list">
                            <div className="activity-item">
                                <div className="activity-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                        <circle cx="9" cy="7" r="4"/>
                                    </svg>
                                </div>
                                <div className="activity-content">
                                    <h4 className="activity-title">New Application Received</h4>
                                    <p className="activity-description">Juan Dela Cruz applied for Academic Excellence Grant</p>
                                    <span className="activity-time">2 hours ago</span>
                                </div>
                                <button className="btn-primary btn-sm" onClick={(event) => { (window as any).viewApplication('1') }}>View</button>
                            </div>

                            <div className="activity-item">
                                <div className="activity-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 11l3 3L22 4"/>
                                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                    </svg>
                                </div>
                                <div className="activity-content">
                                    <h4 className="activity-title">Evaluation Completed</h4>
                                    <p className="activity-description">Maria Santos&apos;s application has been evaluated and approved</p>
                                    <span className="activity-time">5 hours ago</span>
                                </div>
                                <button className="btn-primary btn-sm" onClick={(event) => { (window as any).viewEvaluation('2') }}>View</button>
                            </div>

                            <div className="activity-item">
                                <div className="activity-icon">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                    </svg>
                                </div>
                                <div className="activity-content">
                                    <h4 className="activity-title">Scholarship Published</h4>
                                    <p className="activity-description">Community Service Scholarship is now live</p>
                                    <span className="activity-time">1 day ago</span>
                                </div>
                                <button className="btn-primary btn-sm" onClick={(event) => { (window as any).viewScholarship('3') }}>View</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/*  Right Sidebar  */}
            <aside className="right-sidebar">
                {/*  Announcements  */}
                <div className="sidebar-card">
                    <div className="sidebar-card-header">
                        <h3 className="sidebar-card-title">
                            <svg className="sidebar-icon" width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            </svg>
                            Announcements
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
                                <div className="announcement-text">System Maintenance Scheduled</div>
                                <div className="announcement-time">Tomorrow 2:00 AM</div>
                            </div>
                        </div>
                        <div className="announcement-item-modern">
                            <div className="announcement-icon">
                                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11l3 3L22 4"/>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                            </div>
                            <div className="announcement-content">
                                <div className="announcement-text">New Features Available</div>
                                <div className="announcement-time">2 days ago</div>
                            </div>
                        </div>
                        <div className="announcement-item-modern">
                            <div className="announcement-icon extension">
                                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                            </div>
                            <div className="announcement-content">
                                <div className="announcement-text">Application Deadline Reminder</div>
                                <div className="announcement-time">3 days ago</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/*  Upcoming Deadlines  */}
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
            </aside>
        </div>
    </div>

    
    

    </>
  );
}
