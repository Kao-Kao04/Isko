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
                        <a href="#" className="quick-action-item" onClick={(event) => { (window as any).generateReport() }}>
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 5v10m5-5H5"/>
                            </svg>
                            <span>Generate Report</span>
                        </a>
                        <a href="#" className="quick-action-item" onClick={(event) => { (window as any).exportData() }}>
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
                                <rect x="9" y="3" width="6" height="4" rx="2"/>
                            </svg>
                            <span>Export Data</span>
                        </a>
                        <a href="#" className="quick-action-item" onClick={(event) => { (window as any).scheduleReport() }}>
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="10" cy="10" r="8"/>
                                <path d="M10 6v4l3 2"/>
                            </svg>
                            <span>Schedule Report</span>
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
                        <a href="#" className="quick-action-item" onClick={(event) => { (window as any).generateApplicationReport() }}>
                            <svg className="quick-action-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 3v18h18"/>
                                <path d="M7 12l4-4 4 4 6-6"/>
                            </svg>
                            <span>Application Reports</span>
                        </a>
                    </div>
                </div>
            </aside>

            {/*  Main Content  */}
            <main className="main-content">
                <div className="content-wrapper">
                    {/*  Welcome Section  */}
                    <section className="welcome-section">
                        <h1 className="welcome-title">Reports & Analytics</h1>
                        <p className="welcome-subtitle">Track and analyze your scholarship program performance</p>
                    </section>

                    {/*  Report Type Tabs  */}
                    <div className="content-tabs">
                        <button className="tab-btn active" data-tab="overview">Overview</button>
                        <button className="tab-btn" data-tab="applications">Applications</button>
                        <button className="tab-btn" data-tab="scholarships">Scholarships</button>
                        <button className="tab-btn" data-tab="financial">Financial</button>
                    </div>

                    {/*  Overview Dashboard  */}
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
                                    <path d="M3 3v18h18"/>
                                    <path d="M7 12l4-4 4 4 6-6"/>
                                </svg>
                            </div>
                            <div className="stat-content">
                                <div className="stat-value">₱3.75M</div>
                                <div className="stat-label">Total Disbursed</div>
                                <div className="stat-change positive">+15% YTD</div>
                            </div>
                        </div>
                    </div>

                    {/*  Reports Table  */}
                    <div className="section-card">
                        <div className="section-card-header">
                            <h2 className="section-card-title">Generated Reports</h2>
                            <div className="section-card-actions">
                                <button className="btn-primary" onClick={(event) => { (window as any).generateReport() }}>
                                    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M10 5v10m5-5H5"/>
                                    </svg>
                                    Generate Report
                                </button>
                            </div>
                        </div>
                        
                        <div className="table-wrapper">
                            <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Report Name</th>
                                    <th>Type</th>
                                    <th>Generated</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>
                                        <div className="report-name">Q1 2025 Scholarship Summary</div>
                                    </td>
                                    <td>Summary</td>
                                    <td>Jan 20, 2025</td>
                                    <td><span className="badge success">Completed</span></td>
                                    <td>
                                        <div className="button-group">
                                            <button className="btn-secondary btn-sm" onClick={(event) => { (window as any).viewReport('1') }}>View</button>
                                            <button className="btn-secondary btn-sm" onClick={(event) => { (window as any).downloadReport('1') }}>Download</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="report-name">Academic Excellence Grant Applications</div>
                                    </td>
                                    <td>Applications</td>
                                    <td>Jan 18, 2025</td>
                                    <td><span className="badge success">Completed</span></td>
                                    <td>
                                        <div className="button-group">
                                            <button className="btn-secondary btn-sm" onClick={(event) => { (window as any).viewReport('2') }}>View</button>
                                            <button className="btn-secondary btn-sm" onClick={(event) => { (window as any).downloadReport('2') }}>Download</button>
                                        </div>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <div className="report-name">Monthly Financial Report</div>
                                    </td>
                                    <td>Financial</td>
                                    <td>Jan 15, 2025</td>
                                    <td><span className="badge info">Processing</span></td>
                                    <td>
                                        <div className="button-group">
                                            <button className="btn-secondary btn-sm" onClick={(event) => { (window as any).viewReport('3') }}>View</button>
                                            <button className="btn-secondary btn-sm" disabled>Download</button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
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
                                <path d="M3 3v18h18"/>
                                <path d="M7 12l4-4 4 4 6-6"/>
                            </svg>
                            Quick Stats
                        </h3>
                    </div>
                    <div className="announcements-list-modern">
                        <div className="announcement-item-modern">
                            <div className="announcement-icon">
                                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                                    <circle cx="9" cy="7" r="4"/>
                                </svg>
                            </div>
                            <div className="announcement-content">
                                <div className="announcement-text">Approval Rate</div>
                                <div className="announcement-time">31.7%</div>
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
                                <div className="announcement-text">Avg. Review Time</div>
                                <div className="announcement-time">3.2 days</div>
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
                                <div className="announcement-text">Active Programs</div>
                                <div className="announcement-time">3</div>
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
