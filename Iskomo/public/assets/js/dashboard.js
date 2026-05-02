/**
 * Dashboard Navigation Interactivity
 * Adds functionality to navigation buttons without modifying dashboard.html structure
 */

(function() {
    'use strict';

    // Section IDs mapping
    const sectionMap = {
        'Home': 'section-home',
        'Scholarships': 'section-scholarships',
        'Applications': 'section-applications',
        'Kapwa': 'section-kapwa',
        'Deadlines': 'section-deadlines',
        'Progress': 'section-progress'
    };

    /**
     * Initialize dashboard navigation
     */
    function initDashboardNavigation() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupNavigation);
        } else {
            setupNavigation();
        }
    }

    /**
     * Setup navigation structure and event handlers
     */
    function setupNavigation() {
        const contentWrapper = document.querySelector('.main-content .content-wrapper');
        if (!contentWrapper) {
            console.warn('Content wrapper not found');
            return;
        }

        // Wrap existing content in Home section
        wrapExistingContent(contentWrapper);
        
        // Create new sections
        createNewSections(contentWrapper);
        
        // Setup navigation button handlers
        setupNavButtons();
        
        // Set default view (Home - original dashboard)
        showSection('Home');
    }

    /**
     * Wrap existing content in a Home section (original dashboard)
     */
    function wrapExistingContent(contentWrapper) {
        // Check if already wrapped
        if (contentWrapper.querySelector('#section-home')) {
            return;
        }

        // Get all existing content
        const existingContent = Array.from(contentWrapper.children);
        
        // Create wrapper div for Home section
        const homeSection = document.createElement('div');
        homeSection.id = 'section-home';
        homeSection.className = 'dashboard-section';
        
        // Move all existing content into the section
        existingContent.forEach(child => {
            homeSection.appendChild(child);
        });
        
        // Add the section to content wrapper
        contentWrapper.appendChild(homeSection);
    }

    /**
     * Create new sections for Scholarships, Applications, Kapwa, Deadlines, Progress
     */
    function createNewSections(contentWrapper) {
        // Scholarships Section (Browse/List View)
        if (!contentWrapper.querySelector('#section-scholarships')) {
            const scholarshipsSection = createScholarshipsSection();
            contentWrapper.appendChild(scholarshipsSection);
        }

        // Applications Section
        if (!contentWrapper.querySelector('#section-applications')) {
            const applicationsSection = createApplicationsSection();
            contentWrapper.appendChild(applicationsSection);
        }

        // Kapwa Section
        if (!contentWrapper.querySelector('#section-kapwa')) {
            const kapwaSection = createKapwaSection();
            contentWrapper.appendChild(kapwaSection);
        }

        // Deadlines Section
        if (!contentWrapper.querySelector('#section-deadlines')) {
            const deadlinesSection = createDeadlinesSection();
            contentWrapper.appendChild(deadlinesSection);
        }

        // Progress Section
        if (!contentWrapper.querySelector('#section-progress')) {
            const progressSection = createProgressSection();
            contentWrapper.appendChild(progressSection);
        }
    }

    /**
     * Create Scholarships section content (Browse/List View)
     */
    function createScholarshipsSection() {
        const section = document.createElement('div');
        section.id = 'section-scholarships';
        section.className = 'dashboard-section';
        section.innerHTML = `
            <section class="welcome-section">
                <h1 class="welcome-title">Available Scholarships</h1>
                <p class="welcome-subtitle">Browse and discover scholarship opportunities</p>
            </section>

            <div class="scholarships-browse-container">
                <div class="scholarships-filters">
                    <div class="filter-group">
                        <label>Filter by Type:</label>
                        <div class="filter-buttons">
                            <button class="filter-btn active" data-filter="all">All</button>
                            <button class="filter-btn" data-filter="merit">Merit-Based</button>
                            <button class="filter-btn" data-filter="need">Need-Based</button>
                            <button class="filter-btn" data-filter="stem">STEM</button>
                            <button class="filter-btn" data-filter="government">Government</button>
                            <button class="filter-btn" data-filter="private">Private</button>
                        </div>
                    </div>
                    <div class="search-box">
                        <svg class="search-icon" width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="9" cy="9" r="6"/>
                            <path d="M15 15l-3-3"/>
                        </svg>
                        <input type="text" placeholder="Search scholarships..." class="search-input">
                    </div>
                </div>

                <div class="scholarships-grid">
                    <div class="scholarship-card">
                        <div class="scholarship-card-header">
                            <div class="scholarship-provider">
                                <div class="provider-avatar">C</div>
                                <div class="provider-info">
                                    <div class="provider-name">Commission on Higher Education</div>
                                    <div class="provider-type">Government Agency</div>
                                </div>
                            </div>
                            <span class="scholarship-badge merit">Merit-Based</span>
                        </div>
                        <h3 class="scholarship-title">CHED Merit Scholarship Program</h3>
                        <p class="scholarship-description">Full tuition coverage plus monthly allowance for deserving students with outstanding academic records.</p>
                        <div class="scholarship-details">
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 2L2 7v11h6v-6h4v6h6V7l-8-5z"/>
                                </svg>
                                <span>₱25,000/semester</span>
                            </div>
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="10" cy="10" r="8"/>
                                    <path d="M10 6v4l3 2"/>
                                </svg>
                                <span>Feb 20, 2025</span>
                            </div>
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"/>
                                </svg>
                                <span>95% Match</span>
                            </div>
                        </div>
                        <div class="scholarship-actions">
                            <button class="btn-apply-scholarship">Apply Now</button>
                            <button class="btn-save-scholarship">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14l-5-2.5L5 19V5z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="scholarship-card">
                        <div class="scholarship-card-header">
                            <div class="scholarship-provider">
                                <div class="provider-avatar">D</div>
                                <div class="provider-info">
                                    <div class="provider-name">Department of Science and Technology</div>
                                    <div class="provider-type">Government Agency</div>
                                </div>
                            </div>
                            <span class="scholarship-badge stem">STEM</span>
                        </div>
                        <h3 class="scholarship-title">DOST-SEI Scholarship</h3>
                        <p class="scholarship-description">Perfect for STEM students pursuing excellence in science and technology. Full tuition + monthly allowance + book allowance.</p>
                        <div class="scholarship-details">
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 2L2 7v11h6v-6h4v6h6V7l-8-5z"/>
                                </svg>
                                <span>₱40,000/semester</span>
                            </div>
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="10" cy="10" r="8"/>
                                    <path d="M10 6v4l3 2"/>
                                </svg>
                                <span class="urgent-text">2 days left</span>
                            </div>
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"/>
                                </svg>
                                <span>98% Match</span>
                            </div>
                        </div>
                        <div class="scholarship-actions">
                            <button class="btn-apply-scholarship urgent">Apply Now</button>
                            <button class="btn-save-scholarship">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14l-5-2.5L5 19V5z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="scholarship-card">
                        <div class="scholarship-card-header">
                            <div class="scholarship-provider">
                                <div class="provider-avatar">P</div>
                                <div class="provider-info">
                                    <div class="provider-name">PUP Scholarship Office</div>
                                    <div class="provider-type">University Office</div>
                                </div>
                            </div>
                            <span class="scholarship-badge merit">Merit-Based</span>
                        </div>
                        <h3 class="scholarship-title">Academic Excellence Grant</h3>
                        <p class="scholarship-description">Renewable scholarship with full support for PUP students with outstanding academic records.</p>
                        <div class="scholarship-details">
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 2L2 7v11h6v-6h4v6h6V7l-8-5z"/>
                                </svg>
                                <span>₱20,000/semester</span>
                            </div>
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="10" cy="10" r="8"/>
                                    <path d="M10 6v4l3 2"/>
                                </svg>
                                <span>Mar 8, 2025</span>
                            </div>
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"/>
                                </svg>
                                <span>92% Match</span>
                            </div>
                        </div>
                        <div class="scholarship-actions">
                            <button class="btn-apply-scholarship">Apply Now</button>
                            <button class="btn-save-scholarship">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14l-5-2.5L5 19V5z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="scholarship-card">
                        <div class="scholarship-card-header">
                            <div class="scholarship-provider">
                                <div class="provider-avatar">S</div>
                                <div class="provider-info">
                                    <div class="provider-name">SM Foundation Inc.</div>
                                    <div class="provider-type">Corporate Foundation</div>
                                </div>
                            </div>
                            <span class="scholarship-badge need">Need-Based</span>
                        </div>
                        <h3 class="scholarship-title">SM Foundation College Scholarship</h3>
                        <p class="scholarship-description">Financial assistance to deserving students from low-income families. Full tuition coverage plus monthly allowance.</p>
                        <div class="scholarship-details">
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 2L2 7v11h6v-6h4v6h6V7l-8-5z"/>
                                </svg>
                                <span>₱35,000/semester</span>
                            </div>
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="10" cy="10" r="8"/>
                                    <path d="M10 6v4l3 2"/>
                                </svg>
                                <span>Mar 15, 2025</span>
                            </div>
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"/>
                                </svg>
                                <span>88% Match</span>
                            </div>
                        </div>
                        <div class="scholarship-actions">
                            <button class="btn-apply-scholarship">Apply Now</button>
                            <button class="btn-save-scholarship">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14l-5-2.5L5 19V5z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="scholarship-card">
                        <div class="scholarship-card-header">
                            <div class="scholarship-provider">
                                <div class="provider-avatar">G</div>
                                <div class="provider-info">
                                    <div class="provider-name">GMA Kapuso Foundation</div>
                                    <div class="provider-type">Corporate Foundation</div>
                                </div>
                            </div>
                            <span class="scholarship-badge need">Need-Based</span>
                        </div>
                        <h3 class="scholarship-title">Kapuso Foundation Scholarship</h3>
                        <p class="scholarship-description">Supporting underprivileged students with full scholarship benefits including tuition, books, and monthly stipend.</p>
                        <div class="scholarship-details">
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 2L2 7v11h6v-6h4v6h6V7l-8-5z"/>
                                </svg>
                                <span>₱30,000/semester</span>
                            </div>
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="10" cy="10" r="8"/>
                                    <path d="M10 6v4l3 2"/>
                                </svg>
                                <span>Apr 1, 2025</span>
                            </div>
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"/>
                                </svg>
                                <span>85% Match</span>
                            </div>
                        </div>
                        <div class="scholarship-actions">
                            <button class="btn-apply-scholarship">Apply Now</button>
                            <button class="btn-save-scholarship">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14l-5-2.5L5 19V5z"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div class="scholarship-card">
                        <div class="scholarship-card-header">
                            <div class="scholarship-provider">
                                <div class="provider-avatar">A</div>
                                <div class="provider-info">
                                    <div class="provider-name">Ayala Foundation</div>
                                    <div class="provider-type">Corporate Foundation</div>
                                </div>
                            </div>
                            <span class="scholarship-badge merit">Merit-Based</span>
                        </div>
                        <h3 class="scholarship-title">Ayala Foundation Scholarship</h3>
                        <p class="scholarship-description">Comprehensive scholarship program for high-achieving students with leadership potential and community involvement.</p>
                        <div class="scholarship-details">
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 2L2 7v11h6v-6h4v6h6V7l-8-5z"/>
                                </svg>
                                <span>₱45,000/semester</span>
                            </div>
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="10" cy="10" r="8"/>
                                    <path d="M10 6v4l3 2"/>
                                </svg>
                                <span>Apr 10, 2025</span>
                            </div>
                            <div class="scholarship-detail-item">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"/>
                                </svg>
                                <span>90% Match</span>
                            </div>
                        </div>
                        <div class="scholarship-actions">
                            <button class="btn-apply-scholarship">Apply Now</button>
                            <button class="btn-save-scholarship">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M5 5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v14l-5-2.5L5 19V5z"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return section;
    }

    /**
     * Create Applications section content
     */
    function createApplicationsSection() {
        const section = document.createElement('div');
        section.id = 'section-applications';
        section.className = 'dashboard-section';
        section.innerHTML = `
            <section class="welcome-section">
                <h1 class="welcome-title">Your Applications</h1>
                <p class="welcome-subtitle">Track and manage your scholarship applications</p>
            </section>

            <div class="applications-container">
                <div class="application-filters">
                    <button class="filter-btn active" data-filter="all">All</button>
                    <button class="filter-btn" data-filter="active">Active</button>
                    <button class="filter-btn" data-filter="review">Under Review</button>
                    <button class="filter-btn" data-filter="approved">Approved</button>
                    <button class="filter-btn" data-filter="pending">Pending</button>
                </div>

                <div class="applications-list">
                    <div class="application-card status-active">
                        <div class="application-header">
                            <div class="application-title-group">
                                <h3 class="application-name">CHED Merit Scholarship Program</h3>
                                <span class="application-status-badge status-active">Active</span>
                            </div>
                            <div class="application-date">Applied: Jan 15, 2025</div>
                        </div>
                        <div class="application-details">
                            <div class="application-detail-item">
                                <span class="detail-label">Amount:</span>
                                <span class="detail-value">₱25,000/semester</span>
                            </div>
                            <div class="application-detail-item">
                                <span class="detail-label">Deadline:</span>
                                <span class="detail-value">Feb 20, 2025</span>
                            </div>
                            <div class="application-detail-item">
                                <span class="detail-label">Match:</span>
                                <span class="detail-value match-high">95% Match</span>
                            </div>
                        </div>
                        <div class="application-progress">
                            <div class="progress-label">
                                <span>Application Progress</span>
                                <span>75%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 75%"></div>
                            </div>
                        </div>
                        <div class="application-actions">
                            <button class="btn-secondary">View Details</button>
                            <button class="btn-primary">Continue Application</button>
                        </div>
                    </div>

                    <div class="application-card status-review">
                        <div class="application-header">
                            <div class="application-title-group">
                                <h3 class="application-name">DOST-SEI Scholarship</h3>
                                <span class="application-status-badge status-review">Under Review</span>
                            </div>
                            <div class="application-date">Applied: Dec 20, 2024</div>
                        </div>
                        <div class="application-details">
                            <div class="application-detail-item">
                                <span class="detail-label">Amount:</span>
                                <span class="detail-value">₱40,000/semester</span>
                            </div>
                            <div class="application-detail-item">
                                <span class="detail-label">Status:</span>
                                <span class="detail-value">Documents under review</span>
                            </div>
                            <div class="application-detail-item">
                                <span class="detail-label">Match:</span>
                                <span class="detail-value match-high">98% Match</span>
                            </div>
                        </div>
                        <div class="application-progress">
                            <div class="progress-label">
                                <span>Application Progress</span>
                                <span>100%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 100%"></div>
                            </div>
                        </div>
                        <div class="application-actions">
                            <button class="btn-secondary">View Details</button>
                            <button class="btn-secondary">Check Status</button>
                        </div>
                    </div>

                    <div class="application-card status-approved">
                        <div class="application-header">
                            <div class="application-title-group">
                                <h3 class="application-name">Academic Excellence Grant</h3>
                                <span class="application-status-badge status-approved">Approved</span>
                            </div>
                            <div class="application-date">Applied: Nov 10, 2024</div>
                        </div>
                        <div class="application-details">
                            <div class="application-detail-item">
                                <span class="detail-label">Amount:</span>
                                <span class="detail-value">₱20,000/semester</span>
                            </div>
                            <div class="application-detail-item">
                                <span class="detail-label">Approved:</span>
                                <span class="detail-value">Dec 15, 2024</span>
                            </div>
                            <div class="application-detail-item">
                                <span class="detail-label">Next Payment:</span>
                                <span class="detail-value">Feb 1, 2025</span>
                            </div>
                        </div>
                        <div class="application-actions">
                            <button class="btn-secondary">View Details</button>
                            <button class="btn-success">Download Certificate</button>
                        </div>
                    </div>

                    <div class="application-card status-pending">
                        <div class="application-header">
                            <div class="application-title-group">
                                <h3 class="application-name">SM Foundation College Scholarship</h3>
                                <span class="application-status-badge status-pending">Pending</span>
                            </div>
                            <div class="application-date">Applied: Jan 5, 2025</div>
                        </div>
                        <div class="application-details">
                            <div class="application-detail-item">
                                <span class="detail-label">Amount:</span>
                                <span class="detail-value">₱35,000/semester</span>
                            </div>
                            <div class="application-detail-item">
                                <span class="detail-label">Status:</span>
                                <span class="detail-value">Awaiting document verification</span>
                            </div>
                            <div class="application-detail-item">
                                <span class="detail-label">Match:</span>
                                <span class="detail-value match-medium">88% Match</span>
                            </div>
                        </div>
                        <div class="application-progress">
                            <div class="progress-label">
                                <span>Application Progress</span>
                                <span>60%</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: 60%"></div>
                            </div>
                        </div>
                        <div class="application-actions">
                            <button class="btn-secondary">View Details</button>
                            <button class="btn-primary">Complete Application</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return section;
    }

    /**
     * Create Kapwa section content
     */
    function createKapwaSection() {
        const section = document.createElement('div');
        section.id = 'section-kapwa';
        section.className = 'dashboard-section';
        section.innerHTML = `
            <section class="welcome-section">
                <h1 class="welcome-title">Kapwa Community</h1>
                <p class="welcome-subtitle">Connect with fellow scholars and share experiences</p>
            </section>

            <div class="kapwa-container">
                <div class="kapwa-stats">
                    <div class="kapwa-stat-card">
                        <div class="kapwa-stat-icon">👥</div>
                        <div class="kapwa-stat-content">
                            <div class="kapwa-stat-number">1,245</div>
                            <div class="kapwa-stat-label">Active Members</div>
                        </div>
                    </div>
                    <div class="kapwa-stat-card">
                        <div class="kapwa-stat-icon">💬</div>
                        <div class="kapwa-stat-content">
                            <div class="kapwa-stat-number">342</div>
                            <div class="kapwa-stat-label">Discussions Today</div>
                        </div>
                    </div>
                    <div class="kapwa-stat-card">
                        <div class="kapwa-stat-icon">🤝</div>
                        <div class="kapwa-stat-content">
                            <div class="kapwa-stat-number">89</div>
                            <div class="kapwa-stat-label">Study Groups</div>
                        </div>
                    </div>
                </div>

                <div class="kapwa-feed">
                    <div class="kapwa-post">
                        <div class="kapwa-post-header">
                            <div class="kapwa-post-avatar">MJ</div>
                            <div class="kapwa-post-info">
                                <div class="kapwa-post-name">Maria Jose</div>
                                <div class="kapwa-post-meta">BS Computer Science • 2 hours ago</div>
                            </div>
                        </div>
                        <div class="kapwa-post-content">
                            <p>Just got approved for the DOST-SEI Scholarship! 🎉 Anyone else here who got in? Let's form a study group!</p>
                        </div>
                        <div class="kapwa-post-actions">
                            <button class="kapwa-action-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"/>
                                    <path d="M10 6V10L13 13"/>
                                </svg>
                                <span>Like</span>
                            </button>
                            <button class="kapwa-action-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 3h14l-1 7H4l-1-7z"/>
                                    <path d="M8 13h4"/>
                                </svg>
                                <span>Comment</span>
                            </button>
                            <button class="kapwa-action-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M15 7l-5-5-5 5"/>
                                    <path d="M10 2v13"/>
                                    <path d="M3 15h14"/>
                                </svg>
                                <span>Share</span>
                            </button>
                        </div>
                    </div>

                    <div class="kapwa-post">
                        <div class="kapwa-post-header">
                            <div class="kapwa-post-avatar">JC</div>
                            <div class="kapwa-post-info">
                                <div class="kapwa-post-name">Juan Carlos</div>
                                <div class="kapwa-post-meta">BS Information Technology • 5 hours ago</div>
                            </div>
                        </div>
                        <div class="kapwa-post-content">
                            <p>Looking for study buddies for the upcoming scholarship exam. Anyone interested in forming a review group? 📚</p>
                        </div>
                        <div class="kapwa-post-actions">
                            <button class="kapwa-action-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"/>
                                    <path d="M10 6V10L13 13"/>
                                </svg>
                                <span>Like</span>
                            </button>
                            <button class="kapwa-action-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 3h14l-1 7H4l-1-7z"/>
                                    <path d="M8 13h4"/>
                                </svg>
                                <span>Comment</span>
                            </button>
                            <button class="kapwa-action-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M15 7l-5-5-5 5"/>
                                    <path d="M10 2v13"/>
                                    <path d="M3 15h14"/>
                                </svg>
                                <span>Share</span>
                            </button>
                        </div>
                    </div>

                    <div class="kapwa-post">
                        <div class="kapwa-post-header">
                            <div class="kapwa-post-avatar">AS</div>
                            <div class="kapwa-post-info">
                                <div class="kapwa-post-name">Ana Santos</div>
                                <div class="kapwa-post-meta">BS Engineering • 1 day ago</div>
                            </div>
                        </div>
                        <div class="kapwa-post-content">
                            <p>Tips for scholarship interviews: Be confident, know your goals, and show genuine passion for your field. Good luck to everyone! 💪</p>
                        </div>
                        <div class="kapwa-post-actions">
                            <button class="kapwa-action-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z"/>
                                    <path d="M10 6V10L13 13"/>
                                </svg>
                                <span>Like</span>
                            </button>
                            <button class="kapwa-action-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M3 3h14l-1 7H4l-1-7z"/>
                                    <path d="M8 13h4"/>
                                </svg>
                                <span>Comment</span>
                            </button>
                            <button class="kapwa-action-btn">
                                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M15 7l-5-5-5 5"/>
                                    <path d="M10 2v13"/>
                                    <path d="M3 15h14"/>
                                </svg>
                                <span>Share</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return section;
    }

    /**
     * Create Deadlines section content
     */
    function createDeadlinesSection() {
        const section = document.createElement('div');
        section.id = 'section-deadlines';
        section.className = 'dashboard-section';
        section.innerHTML = `
            <section class="welcome-section">
                <h1 class="welcome-title">Upcoming Deadlines</h1>
                <p class="welcome-subtitle">Stay on top of important scholarship deadlines</p>
            </section>

            <div class="deadlines-container">
                <div class="deadline-calendar-view">
                    <div class="calendar-header">
                        <button class="calendar-nav-btn">←</button>
                        <h2 class="calendar-month">February 2025</h2>
                        <button class="calendar-nav-btn">→</button>
                    </div>
                    <div class="calendar-grid">
                        <div class="calendar-day-header">Sun</div>
                        <div class="calendar-day-header">Mon</div>
                        <div class="calendar-day-header">Tue</div>
                        <div class="calendar-day-header">Wed</div>
                        <div class="calendar-day-header">Thu</div>
                        <div class="calendar-day-header">Fri</div>
                        <div class="calendar-day-header">Sat</div>
                        <!-- Calendar days will be populated dynamically -->
                    </div>
                </div>

                <div class="deadlines-list">
                    <div class="deadline-card urgent">
                        <div class="deadline-card-header">
                            <div class="deadline-card-title">PUP Scholarship Program</div>
                            <span class="deadline-badge urgent">Urgent</span>
                        </div>
                        <div class="deadline-card-date">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="10" cy="10" r="8"/>
                                <path d="M10 6v4l3 2"/>
                            </svg>
                            <span>5 days remaining</span>
                        </div>
                        <div class="deadline-card-details">
                            <p>Application deadline: February 20, 2025</p>
                            <p class="deadline-card-amount">Amount: ₱30,000/semester</p>
                        </div>
                        <button class="btn-primary">Apply Now</button>
                    </div>

                    <div class="deadline-card">
                        <div class="deadline-card-header">
                            <div class="deadline-card-title">Academic Excellence Grant</div>
                            <span class="deadline-badge">Upcoming</span>
                        </div>
                        <div class="deadline-card-date">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="10" cy="10" r="8"/>
                                <path d="M10 6v4l3 2"/>
                            </svg>
                            <span>21 days remaining</span>
                        </div>
                        <div class="deadline-card-details">
                            <p>Application deadline: March 8, 2025</p>
                            <p class="deadline-card-amount">Amount: ₱20,000/semester</p>
                        </div>
                        <button class="btn-primary">Apply Now</button>
                    </div>

                    <div class="deadline-card">
                        <div class="deadline-card-header">
                            <div class="deadline-card-title">STEM Innovation Award</div>
                            <span class="deadline-badge">Upcoming</span>
                        </div>
                        <div class="deadline-card-date">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="10" cy="10" r="8"/>
                                <path d="M10 6v4l3 2"/>
                            </svg>
                            <span>35 days remaining</span>
                        </div>
                        <div class="deadline-card-details">
                            <p>Application deadline: March 22, 2025</p>
                            <p class="deadline-card-amount">Amount: ₱35,000/semester</p>
                        </div>
                        <button class="btn-primary">Apply Now</button>
                    </div>

                    <div class="deadline-card">
                        <div class="deadline-card-header">
                            <div class="deadline-card-title">CHED Merit Scholarship Program</div>
                            <span class="deadline-badge">Upcoming</span>
                        </div>
                        <div class="deadline-card-date">
                            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="10" cy="10" r="8"/>
                                <path d="M10 6v4l3 2"/>
                            </svg>
                            <span>42 days remaining</span>
                        </div>
                        <div class="deadline-card-details">
                            <p>Application deadline: March 29, 2025</p>
                            <p class="deadline-card-amount">Amount: ₱25,000/semester</p>
                        </div>
                        <button class="btn-primary">Apply Now</button>
                    </div>
                </div>
            </div>
        `;
        return section;
    }

    /**
     * Create Progress section content
     */
    function createProgressSection() {
        const section = document.createElement('div');
        section.id = 'section-progress';
        section.className = 'dashboard-section';
        section.innerHTML = `
            <section class="welcome-section">
                <h1 class="welcome-title">Your Progress</h1>
                <p class="welcome-subtitle">Track your scholarship journey and achievements</p>
            </section>

            <div class="progress-container">
                <div class="progress-overview">
                    <div class="progress-overview-card">
                        <div class="progress-overview-icon">📊</div>
                        <div class="progress-overview-content">
                            <div class="progress-overview-number">5</div>
                            <div class="progress-overview-label">Total Applications</div>
                        </div>
                    </div>
                    <div class="progress-overview-card">
                        <div class="progress-overview-icon">✅</div>
                        <div class="progress-overview-content">
                            <div class="progress-overview-number">1</div>
                            <div class="progress-overview-label">Approved</div>
                        </div>
                    </div>
                    <div class="progress-overview-card">
                        <div class="progress-overview-icon">⏳</div>
                        <div class="progress-overview-content">
                            <div class="progress-overview-number">3</div>
                            <div class="progress-overview-label">Under Review</div>
                        </div>
                    </div>
                    <div class="progress-overview-card">
                        <div class="progress-overview-icon">📈</div>
                        <div class="progress-overview-content">
                            <div class="progress-overview-number">92%</div>
                            <div class="progress-overview-label">Average Match</div>
                        </div>
                    </div>
                </div>

                <div class="progress-timeline">
                    <h2 class="progress-timeline-title">Application Timeline</h2>
                    <div class="timeline">
                        <div class="timeline-item completed">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <div class="timeline-date">Nov 10, 2024</div>
                                <div class="timeline-title">Academic Excellence Grant</div>
                                <div class="timeline-status status-approved">Approved</div>
                            </div>
                        </div>
                        <div class="timeline-item completed">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <div class="timeline-date">Dec 20, 2024</div>
                                <div class="timeline-title">DOST-SEI Scholarship</div>
                                <div class="timeline-status status-review">Under Review</div>
                            </div>
                        </div>
                        <div class="timeline-item active">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <div class="timeline-date">Jan 5, 2025</div>
                                <div class="timeline-title">SM Foundation College Scholarship</div>
                                <div class="timeline-status status-pending">Pending</div>
                            </div>
                        </div>
                        <div class="timeline-item active">
                            <div class="timeline-marker"></div>
                            <div class="timeline-content">
                                <div class="timeline-date">Jan 15, 2025</div>
                                <div class="timeline-title">CHED Merit Scholarship Program</div>
                                <div class="timeline-status status-active">In Progress</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="progress-achievements">
                    <h2 class="progress-achievements-title">Achievements</h2>
                    <div class="achievements-grid">
                        <div class="achievement-card unlocked">
                            <div class="achievement-icon">🏆</div>
                            <div class="achievement-title">First Application</div>
                            <div class="achievement-description">Submitted your first scholarship application</div>
                        </div>
                        <div class="achievement-card unlocked">
                            <div class="achievement-icon">⭐</div>
                            <div class="achievement-title">Scholar Approved</div>
                            <div class="achievement-description">Got your first scholarship approved</div>
                        </div>
                        <div class="achievement-card locked">
                            <div class="achievement-icon">💎</div>
                            <div class="achievement-title">Perfect Match</div>
                            <div class="achievement-description">Achieve 100% match on an application</div>
                        </div>
                        <div class="achievement-card locked">
                            <div class="achievement-icon">🎯</div>
                            <div class="achievement-title">Five Star Scholar</div>
                            <div class="achievement-description">Get 5 scholarships approved</div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        return section;
    }

    /**
     * Setup navigation button event handlers
     */
    function setupNavButtons() {
        const navLinks = document.querySelectorAll('.navbar-center .nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const sectionName = this.textContent.trim();
                showSection(sectionName);
            });
        });
    }

    /**
     * Show a specific section and hide others
     */
    function showSection(sectionName) {
        const sectionId = sectionMap[sectionName];
        if (!sectionId) {
            console.warn(`Section not found: ${sectionName}`);
            return;
        }

        // Hide all sections
        document.querySelectorAll('.dashboard-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation active states
        updateNavActiveState(sectionName);
    }

    /**
     * Update navigation button active states
     */
    function updateNavActiveState(activeSectionName) {
        const navLinks = document.querySelectorAll('.navbar-center .nav-link');
        
        navLinks.forEach(link => {
            const linkText = link.textContent.trim();
            
            // Remove active class from all links
            link.classList.remove('active');
            
            // Add active class to matching link
            if (linkText === activeSectionName) {
                link.classList.add('active');
            }
        });
    }

    // Initialize when script loads
    initDashboardNavigation();
})();

