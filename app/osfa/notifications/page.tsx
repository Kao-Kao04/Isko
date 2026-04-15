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

                {/*  Quick Actions  */}
                <div className="quick-actions-card">
                    <h3 className="quick-actions-title">Quick Actions</h3>
                    <div className="quick-actions-list">
                        <a href="#" className="quick-action-item" onClick={(event) => { (window as any).markAllAsRead() }}>
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 11l3 3L22 4"/>
                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                            </svg>
                            <span>Mark All as Read</span>
                        </a>
                        <a href="#" className="quick-action-item" onClick={(event) => { (window as any).createNotification() }}>
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 5v10m5-5H5"/>
                            </svg>
                            <span>Create Notification</span>
                        </a>
                        <a href="#" className="quick-action-item" onClick={(event) => { (window as any).notificationSettings() }}>
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="10" cy="10" r="8"/>
                                <path d="M10 6v4l3 2"/>
                            </svg>
                            <span>Notification Settings</span>
                        </a>
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
                        <h1 className="welcome-title">Notifications</h1>
                        <p className="welcome-subtitle">Stay updated with important announcements and activities</p>
                    </section>

                    {/*  Filter Tabs  */}
                    <div className="content-tabs">
                        <button className="tab-btn active" data-tab="all">All Notifications</button>
                        <button className="tab-btn" data-tab="unread">Unread</button>
                        <button className="tab-btn" data-tab="applications">Applications</button>
                        <button className="tab-btn" data-tab="system">System</button>
                    </div>

                    {/*  Notifications List  */}
                    <div className="notifications-container">
                        <div className="notification-item unread" onClick={(event) => { (window as any).viewNotification('1') }}>
                            <div className="notification-icon">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div className="notification-content">
                                <div className="notification-header">
                                    <h4 className="notification-title">New Application Received</h4>
                                    <span className="notification-time">2 hours ago</span>
                                </div>
                                <p className="notification-message">Juan Dela Cruz has applied for the Academic Excellence Grant scholarship.</p>
                                <div className="notification-actions">
                                    <button className="btn-primary btn-sm" onClick={(event) => { event.stopPropagation(); (window as any).viewApplication('1') }}>View Application</button>
                                    <button className="btn-secondary btn-sm" onClick={(event) => { event.stopPropagation(); (window as any).markAsRead('1') }}>Mark as Read</button>
                                </div>
                            </div>
                        </div>

                        <div className="notification-item unread" onClick={(event) => { (window as any).viewNotification('2') }}>
                            <div className="notification-icon">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M9 11l3 3L22 4"/>
                                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                                </svg>
                            </div>
                            <div className="notification-content">
                                <div className="notification-header">
                                    <h4 className="notification-title">Evaluation Completed</h4>
                                    <span className="notification-time">5 hours ago</span>
                                </div>
                                <p className="notification-message">Maria Santos&apos;s application for STEM Innovation Award has been evaluated.</p>
                                <div className="notification-actions">
                                    <button className="btn-primary btn-sm" onClick={(event) => { event.stopPropagation(); (window as any).viewEvaluation('2') }}>View Evaluation</button>
                                    <button className="btn-secondary btn-sm" onClick={(event) => { event.stopPropagation(); (window as any).markAsRead('2') }}>Mark as Read</button>
                                </div>
                            </div>
                        </div>

                        <div className="notification-item" onClick={(event) => { (window as any).viewNotification('3') }}>
                            <div className="notification-icon">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="10" cy="10" r="8"/>
                                    <path d="M10 6v4l3 2"/>
                                </svg>
                            </div>
                            <div className="notification-content">
                                <div className="notification-header">
                                    <h4 className="notification-title">Deadline Reminder</h4>
                                    <span className="notification-time">1 day ago</span>
                                </div>
                                <p className="notification-message">Academic Excellence Grant application deadline is approaching in 2 weeks.</p>
                                <div className="notification-actions">
                                    <button className="btn-primary btn-sm" onClick={(event) => { event.stopPropagation(); (window as any).manageDeadline('1') }}>Manage Deadline</button>
                                </div>
                            </div>
                        </div>

                        <div className="notification-item" onClick={(event) => { (window as any).viewNotification('4') }}>
                            <div className="notification-icon">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                                </svg>
                            </div>
                            <div className="notification-content">
                                <div className="notification-header">
                                    <h4 className="notification-title">Scholarship Published</h4>
                                    <span className="notification-time">2 days ago</span>
                                </div>
                                <p className="notification-message">Your Community Service Scholarship has been successfully published.</p>
                                <div className="notification-actions">
                                    <button className="btn-primary btn-sm" onClick={(event) => { event.stopPropagation(); (window as any).viewScholarship('3') }}>View Scholarship</button>
                                </div>
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
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                            </svg>
                            Notification Summary
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
                                <div className="announcement-text">Unread</div>
                                <div className="announcement-time">2</div>
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
                                <div className="announcement-text">Applications</div>
                                <div className="announcement-time">1</div>
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
                                <div className="announcement-text">Evaluations</div>
                                <div className="announcement-time">1</div>
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
