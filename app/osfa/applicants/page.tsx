"use client"

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
                        <h1 className="welcome-title">Applicant Management</h1>
                        <p className="welcome-subtitle">Review and manage scholarship applications from talented students</p>
                    </section>

                    {/*  Filter Tabs  */}
                    <div className="content-tabs">
                        <button className="tab-btn active" data-tab="all">All Applicants</button>
                        <button className="tab-btn" data-tab="pending">Pending Review</button>
                        <button className="tab-btn" data-tab="approved">Approved</button>
                        <button className="tab-btn" data-tab="rejected">Rejected</button>
                    </div>

                    {/*  Applicants Table  */}
                    <div className="section-card">
                        <div className="section-card-header">
                            <h2 className="section-card-title">Recent Applications</h2>
                            <div className="section-card-actions">
                                <select className="form-select" id="scholarshipFilter">
                                    <option value="all">All Scholarships</option>
                                    <option value="academic">Academic Excellence Grant</option>
                                    <option value="stem">STEM Innovation Award</option>
                                    <option value="community">Community Service Scholarship</option>
                                </select>
                                <input type="text" className="form-input" placeholder="Search applicants..." id="applicantSearch" />
                            </div>
                        </div>
                        
                        <div className="table-wrapper">
                            <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Applicant</th>
                                    <th>School</th>
                                    <th>Program</th>
                                    <th>Scholarship</th>
                                    <th>Status</th>
                                    <th>Applied</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr onClick={(event) => { (window as any).viewApplicant('1') }}>
                                    <td>
                                        <div className="applicant-name">Juan Dela Cruz</div>
                                    </td>
                                    <td>PUP Main</td>
                                    <td>BS Computer Science</td>
                                    <td>Academic Excellence Grant</td>
                                    <td><span className="badge info">Under Review</span></td>
                                    <td>Jan 17, 2025</td>
                                    <td>
                                        <button className="btn-secondary" onClick={(event) => { event.stopPropagation(); (window as any).viewApplicant('1') }}>View</button>
                                    </td>
                                </tr>
                                <tr onClick={(event) => { (window as any).viewApplicant('2') }}>
                                    <td>
                                        <div className="applicant-name">Maria Santos</div>
                                    </td>
                                    <td>PUP Main</td>
                                    <td>BS Engineering</td>
                                    <td>STEM Innovation Award</td>
                                    <td><span className="badge info">Under Review</span></td>
                                    <td>Jan 18, 2025</td>
                                    <td>
                                        <button className="btn-secondary" onClick={(event) => { event.stopPropagation(); (window as any).viewApplicant('2') }}>View</button>
                                    </td>
                                </tr>
                                <tr onClick={(event) => { (window as any).viewApplicant('3') }}>
                                    <td>
                                        <div className="applicant-name">Ana Santos</div>
                                    </td>
                                    <td>PUP Main</td>
                                    <td>BS Engineering</td>
                                    <td>STEM Innovation Award</td>
                                    <td><span className="badge success">Approved</span></td>
                                    <td>Jan 15, 2025</td>
                                    <td>
                                        <button className="btn-secondary" onClick={(event) => { event.stopPropagation(); (window as any).viewApplicant('3') }}>View</button>
                                    </td>
                                </tr>
                                <tr onClick={(event) => { (window as any).viewApplicant('4') }}>
                                    <td>
                                        <div className="applicant-name">Carlos Reyes</div>
                                    </td>
                                    <td>PUP Main</td>
                                    <td>BS Computer Science</td>
                                    <td>Academic Excellence Grant</td>
                                    <td><span className="badge info">Under Review</span></td>
                                    <td>Jan 19, 2025</td>
                                    <td>
                                        <button className="btn-secondary" onClick={(event) => { event.stopPropagation(); (window as any).viewApplicant('4') }}>View</button>
                                    </td>
                                </tr>
                                <tr onClick={(event) => { (window as any).viewApplicant('5') }}>
                                    <td>
                                        <div className="applicant-name">Liza Garcia</div>
                                    </td>
                                    <td>PUP Main</td>
                                    <td>BS Information Technology</td>
                                    <td>Academic Excellence Grant</td>
                                    <td><span className="badge warning">Pending</span></td>
                                    <td>Jan 21, 2025</td>
                                    <td>
                                        <button className="btn-secondary" onClick={(event) => { event.stopPropagation(); (window as any).viewApplicant('5') }}>View</button>
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
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                            </svg>
                            Quick Stats
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
                                <div className="announcement-text">Total Applicants</div>
                                <div className="announcement-time">142</div>
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
                                <div className="announcement-text">Approved</div>
                                <div className="announcement-time">45</div>
                            </div>
                        </div>
                        <div className="announcement-item-modern">
                            <div className="announcement-icon extension">
                                <svg width="12" height="12" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="10" cy="10" r="8"/>
                                    <path d="M10 6v4l3 2"/>
                                </svg>
                            </div>
                            <div className="announcement-content">
                                <div className="announcement-text">Pending Review</div>
                                <div className="announcement-time">23</div>
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
