"use client"

import Link from 'next/link';

export default function Page() {
  return (
    <>
            <h1 style={{"fontSize":"2rem","color":"var(--text-dark)","marginBottom":"1.5rem","fontWeight":"700"}}>Welcome back, <span id="welcomeName" style={{"color":"var(--primary-teal)"}}>Iskolar</span>!</h1>
            <div style={{"display":"grid","gridTemplateColumns":"repeat(auto-fit, minmax(200px, 1fr))","gap":"1.5rem","color":"var(--text-dark)"}}>
                <div style={{"background":"#f8fafc","padding":"1rem","borderRadius":"8px"}}>
                    <div style={{"fontSize":"0.75rem","color":"var(--text-medium)","textTransform":"uppercase","letterSpacing":"0.5px","fontWeight":"600","marginBottom":"0.25rem"}}>Student Number</div>
                    <div style={{"fontSize":"1.125rem","fontWeight":"600"}} id="displayStudentNo">----</div>
                </div>
                <div style={{"background":"#f8fafc","padding":"1rem","borderRadius":"8px"}}>
                    <div style={{"fontSize":"0.75rem","color":"var(--text-medium)","textTransform":"uppercase","letterSpacing":"0.5px","fontWeight":"600","marginBottom":"0.25rem"}}>Program / Course</div>
                    <div style={{"fontSize":"1.125rem","fontWeight":"600"}} id="displayProgram">----</div>
                </div>
                <div style={{"background":"#f8fafc","padding":"1rem","borderRadius":"8px"}}>
                    <div style={{"fontSize":"0.75rem","color":"var(--text-medium)","textTransform":"uppercase","letterSpacing":"0.5px","fontWeight":"600","marginBottom":"0.25rem"}}>Year Level</div>
                    <div style={{"fontSize":"1.125rem","fontWeight":"600"}} id="displayYearLevel">----</div>
                </div>
            </div>

        <div style={{"display":"grid","gridTemplateColumns":"1fr 350px","gap":"2rem","alignItems":"start"}}>
            {/*  Left Column: Scholarships  */}
            <div className="dashboard-main-column" style={{"display":"flex","flexDirection":"column","gap":"2rem"}}>
                
                {/*  Scholarships Preview  */}
                <div className="scholarships-preview">
                    <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center","marginBottom":"1.5rem"}}>
                        <h2 style={{"fontSize":"1.5rem","color":"var(--text-dark)","fontWeight":"700"}}>Available Scholarships</h2>
                        <Link href="/student/iskolarships" style={{"color":"var(--primary-teal)","fontWeight":"600","textDecoration":"none","padding":"0.5rem 1rem","borderRadius":"20px","background":"rgba(13, 148, 136, 0.05)","transition":"all 0.2s ease"}} onMouseOver={(event) => { (event.currentTarget as any).style.background='rgba(13, 148, 136, 0.1)' }} onMouseOut={(event) => { (event.currentTarget as any).style.background='rgba(13, 148, 136, 0.05)' }}>View All</Link>
                    </div>
                    
                    <div style={{"display":"flex","flexDirection":"column","gap":"1rem"}}>
                        {/*  Card 1  */}
                        <div className="scholarship-card" style={{"background":"var(--bg-white)","border":"1px solid var(--border-light)","borderRadius":"12px","padding":"1.5rem","display":"flex","justifyContent":"space-between","alignItems":"center","boxShadow":"var(--shadow-sm)","transition":"transform 0.2s, box-shadow 0.2s"}} onMouseOver={(event) => { (event.currentTarget as any).style.transform='translateY(-2px)'; (event.currentTarget as any).style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'; }} onMouseOut={(event) => { (event.currentTarget as any).style.transform='translateY(0)'; (event.currentTarget as any).style.boxShadow='var(--shadow-sm)'; }}>
                            <div style={{"display":"flex","gap":"1rem","alignItems":"center"}}>
                                <div style={{"width":"48px","height":"48px","borderRadius":"8px","background":"var(--primary-teal)","color":"white","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"bold","fontSize":"1.25rem"}}>C</div>
                                <div>
                                    <h3 style={{"margin":"0 0 0.25rem 0","color":"var(--text-dark)","fontSize":"1.125rem"}}>CHED Merit Scholarship</h3>
                                    <div style={{"color":"var(--text-medium)","fontSize":"0.875rem"}}>₱25,000/semester • <span style={{"color":"var(--primary-teal)","fontWeight":"500"}}>Merit-Based</span></div>
                                </div>
                            </div>
                            <Link href="/student/iskolarships" style={{"background":"var(--primary-teal)","color":"white","padding":"0.625rem 1.25rem","borderRadius":"8px","textDecoration":"none","fontWeight":"600","transition":"background 0.2s"}} onMouseOver={(event) => { (event.currentTarget as any).style.background='var(--primary-teal-dark)' }} onMouseOut={(event) => { (event.currentTarget as any).style.background='var(--primary-teal)' }}>Apply</Link>
                        </div>
                        
                        {/*  Card 2  */}
                        <div className="scholarship-card" style={{"background":"var(--bg-white)","border":"1px solid var(--border-light)","borderRadius":"12px","padding":"1.5rem","display":"flex","justifyContent":"space-between","alignItems":"center","boxShadow":"var(--shadow-sm)","transition":"transform 0.2s, box-shadow 0.2s"}} onMouseOver={(event) => { (event.currentTarget as any).style.transform='translateY(-2px)'; (event.currentTarget as any).style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'; }} onMouseOut={(event) => { (event.currentTarget as any).style.transform='translateY(0)'; (event.currentTarget as any).style.boxShadow='var(--shadow-sm)'; }}>
                            <div style={{"display":"flex","gap":"1rem","alignItems":"center"}}>
                                <div style={{"width":"48px","height":"48px","borderRadius":"8px","background":"var(--primary-teal)","color":"white","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"bold","fontSize":"1.25rem"}}>D</div>
                                <div>
                                    <h3 style={{"margin":"0 0 0.25rem 0","color":"var(--text-dark)","fontSize":"1.125rem"}}>DOST-SEI Scholarship</h3>
                                    <div style={{"color":"var(--text-medium)","fontSize":"0.875rem"}}>₱40,000/semester • <span style={{"color":"var(--primary-teal)","fontWeight":"500"}}>STEM Only</span></div>
                                </div>
                            </div>
                            <Link href="/student/iskolarships" style={{"background":"var(--primary-teal)","color":"white","padding":"0.625rem 1.25rem","borderRadius":"8px","textDecoration":"none","fontWeight":"600","transition":"background 0.2s"}} onMouseOver={(event) => { (event.currentTarget as any).style.background='var(--primary-teal-dark)' }} onMouseOut={(event) => { (event.currentTarget as any).style.background='var(--primary-teal)' }}>Apply</Link>
                        </div>
                        
                        {/*  Card 3  */}
                        <div className="scholarship-card" style={{"background":"var(--bg-white)","border":"1px solid var(--border-light)","borderRadius":"12px","padding":"1.5rem","display":"flex","justifyContent":"space-between","alignItems":"center","boxShadow":"var(--shadow-sm)","transition":"transform 0.2s, box-shadow 0.2s"}} onMouseOver={(event) => { (event.currentTarget as any).style.transform='translateY(-2px)'; (event.currentTarget as any).style.boxShadow='0 4px 12px rgba(0,0,0,0.08)'; }} onMouseOut={(event) => { (event.currentTarget as any).style.transform='translateY(0)'; (event.currentTarget as any).style.boxShadow='var(--shadow-sm)'; }}>
                            <div style={{"display":"flex","gap":"1rem","alignItems":"center"}}>
                                <div style={{"width":"48px","height":"48px","borderRadius":"8px","background":"var(--primary-teal)","color":"white","display":"flex","alignItems":"center","justifyContent":"center","fontWeight":"bold","fontSize":"1.25rem"}}>S</div>
                                <div>
                                    <h3 style={{"margin":"0 0 0.25rem 0","color":"var(--text-dark)","fontSize":"1.125rem"}}>SM Foundation Scholarship</h3>
                                    <div style={{"color":"var(--text-medium)","fontSize":"0.875rem"}}>₱35,000/semester • <span style={{"color":"var(--primary-teal)","fontWeight":"500"}}>Need-Based</span></div>
                                </div>
                            </div>
                            <Link href="/student/iskolarships" style={{"background":"var(--primary-teal)","color":"white","padding":"0.625rem 1.25rem","borderRadius":"8px","textDecoration":"none","fontWeight":"600","transition":"background 0.2s"}} onMouseOver={(event) => { (event.currentTarget as any).style.background='var(--primary-teal-dark)' }} onMouseOut={(event) => { (event.currentTarget as any).style.background='var(--primary-teal)' }}>Apply</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/*  Right Column: Status & Announcements  */}
            <div className="dashboard-side-column" style={{"display":"flex","flexDirection":"column","gap":"2rem"}}>
                
                {/*  Quick Status Card  */}
                <div className="quick-status-card" style={{"background":"var(--bg-white)","border":"1px solid var(--border-light)","borderRadius":"16px","padding":"1.5rem","boxShadow":"0 4px 6px -1px rgba(0, 0, 0, 0.1)"}}>
                    <h3 style={{"fontSize":"1.25rem","color":"var(--text-dark)","margin":"0 0 1.25rem 0","fontWeight":"700"}}>Application Status</h3>
                    
                    <div style={{"display":"flex","flexDirection":"column","alignItems":"center","gap":"1rem","padding":"1.5rem","background":"#f8fafc","borderRadius":"12px","border":"1px dashed var(--border-medium)"}}>
                        <div id="statusIcon" style={{"width":"48px","height":"48px","borderRadius":"50%","background":"#e2e8f0","display":"flex","alignItems":"center","justifyContent":"center"}}>
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" id="statusSvg">
                                <circle cx="12" cy="12" r="10"></circle>
                                <line x1="12" y1="8" x2="12" y2="12"></line>
                                <line x1="12" y1="16" x2="12.01" y2="16"></line>
                            </svg>
                        </div>
                        <div style={{"textAlign":"center"}}>
                            <div style={{"fontWeight":"700","color":"var(--text-dark)","fontSize":"1.125rem","marginBottom":"0.25rem"}} id="appStatus">No Application Yet</div>
                            <div style={{"fontSize":"0.8125rem","color":"var(--text-medium)"}} id="appStatusDetail">Explore available scholarships to apply.</div>
                        </div>
                    </div>
                    
                    <Link href="/student/status" style={{"display":"flex","alignItems":"center","justifyContent":"center","gap":"0.5rem","width":"100%","marginTop":"1.25rem","padding":"0.75rem","background":"var(--bg-white)","border":"1px solid var(--primary-teal)","color":"var(--primary-teal)","borderRadius":"8px","textDecoration":"none","fontWeight":"600","boxSizing":"border-box","transition":"all 0.2s ease"}} onMouseOver={(event) => { (event.currentTarget as any).style.background='var(--primary-teal)'; (event.currentTarget as any).style.color='white'; }} onMouseOut={(event) => { (event.currentTarget as any).style.background='var(--bg-white)'; (event.currentTarget as any).style.color='var(--primary-teal)'; }}>
                        View Full Status Tracking
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                            <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                    </Link>
                </div>

                {/*  Announcements  */}
                <div className="announcements-section" style={{"background":"var(--bg-white)","border":"1px solid var(--border-light)","borderRadius":"16px","padding":"1.5rem","boxShadow":"0 4px 6px -1px rgba(0, 0, 0, 0.1)"}}>
                    <div style={{"display":"flex","alignItems":"center","gap":"0.5rem","marginBottom":"1.25rem"}}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--primary-teal)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                        </svg>
                        <h3 style={{"fontSize":"1.25rem","color":"var(--text-dark)","margin":"0","fontWeight":"700"}}>Announcements</h3>
                    </div>
                    
                    <div style={{"display":"flex","flexDirection":"column","gap":"1rem"}}>
                        <div style={{"padding":"1.25rem","background":"#f8fafc","borderRadius":"12px","borderLeft":"4px solid var(--primary-teal)","transition":"transform 0.2s","boxShadow":"0 2px 4px rgba(0,0,0,0.05)"}} onMouseOver={(event) => { (event.currentTarget as any).style.transform='translateX(4px)' }} onMouseOut={(event) => { (event.currentTarget as any).style.transform='translateX(0)' }}>
                            <h4 style={{"margin":"0 0 0.5rem 0","fontSize":"1rem","color":"var(--text-dark)","fontWeight":"700"}}>OSFA Scholarship Announcement</h4>
                            <p style={{"margin":"0 0 1rem 0","fontSize":"0.875rem","color":"var(--text-medium)","lineHeight":"1.5"}}>The Office of Scholarship and Financial Assistance is now accepting applications for the City Scholarship Program.</p>
                            
                            {/*  Scholarship Image Placeholder  */}
                            <div style={{"width":"100%","height":"160px","borderRadius":"8px","overflow":"hidden","marginBottom":"1rem","background":"var(--bg-gray-light)","display":"flex","alignItems":"center","justifyContent":"center","border":"1px solid var(--border-light)","position":"relative"}}>
                                <span style={{"color":"var(--text-medium)","fontSize":"0.875rem","position":"absolute","zIndex":"1"}}>Scholarship Image</span>
                                <img src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" alt="Scholarship Announcement" style={{"width":"100%","height":"100%","objectFit":"cover","position":"relative","zIndex":"2"}} onError={(event) => { event.currentTarget.style.display='none'; }} />
                            </div>

                            <div style={{"display":"flex","justifyContent":"space-between","alignItems":"center"}}>
                                <div style={{"fontSize":"0.75rem","color":"var(--primary-teal)","fontWeight":"600","padding":"0.25rem 0.5rem","background":"rgba(13, 148, 136, 0.1)","borderRadius":"4px"}}>Featured</div>
                                <div style={{"fontSize":"0.75rem","color":"var(--text-medium)","fontWeight":"500"}}>Today</div>
                            </div>
                        </div>
                        <div style={{"padding":"1rem","background":"#f8fafc","borderRadius":"10px","borderLeft":"4px solid var(--accent-amber)","transition":"transform 0.2s"}} onMouseOver={(event) => { (event.currentTarget as any).style.transform='translateX(4px)' }} onMouseOut={(event) => { (event.currentTarget as any).style.transform='translateX(0)' }}>
                            <h4 style={{"margin":"0 0 0.25rem 0","fontSize":"0.9375rem","color":"var(--text-dark)","fontWeight":"600"}}>Deadline Extension</h4>
                            <p style={{"margin":"0 0 0.5rem 0","fontSize":"0.8125rem","color":"var(--text-medium)","lineHeight":"1.4"}}>Submissions for CHED Merit extended until the end of the month.</p>
                            <div style={{"fontSize":"0.75rem","color":"var(--text-medium)","fontWeight":"500"}}>2 days ago</div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

    {/*  Post Creation Modal  */}
    <div id="createPostModal" className="modal">
        <div className="modal-overlay"></div>
        <div className="modal-content">
            <div className="modal-header">
                <h2>Create a post</h2>
                <button className="modal-close-btn" id="closeModalBtn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>
            </div>
            <div className="modal-body">
                <div className="modal-user-section">
                    <div className="modal-avatar" id="modalAvatar">EVM</div>
                    <div className="modal-user-info">
                        <div className="modal-user-name">Emmanuel Mutas</div>
                        <div className="modal-post-settings">
                            <div className="setting-dropdown">
                                <button className="setting-btn" id="audienceBtn">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    <span id="audienceText">Anyone</span>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>
                                <div className="dropdown-menu" id="audienceDropdown">
                                    <div className="dropdown-item" data-value="anyone">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                        <span>Anyone</span>
                                    </div>
                                    <div className="dropdown-item" data-value="kapwa-only">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="9" cy="7" r="4"></circle>
                                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                        </svg>
                                        <span>Kapwa Only</span>
                                    </div>
                                    <div className="dropdown-item" data-value="private">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                                        </svg>
                                        <span>Only me</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="modal-post-section">
                    <textarea id="modalPostInput" className="modal-textarea" placeholder="What do you want to talk about?" rows={6}></textarea>
                </div>
                <div className="modal-attachments" id="modalAttachments">
                    <div className="attachment-preview" id="attachmentPreview" style={{"display":"none"}}>
                        {/*  Attachments will be dynamically added here  */}
                    </div>
                </div>
            </div>
            <div className="modal-footer">
                <div className="modal-action-buttons">
                    <button className="modal-action-btn" id="modalPhotoBtn" title="Add photo">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                    </button>
                    <button className="modal-action-btn" id="modalVideoBtn" title="Add video">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="23 7 16 12 23 17 23 7"></polygon>
                            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                        </svg>
                    </button>
                    <button className="modal-action-btn" id="modalDocumentBtn" title="Add document">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                            <polyline points="14 2 14 8 20 8"></polyline>
                            <line x1="16" y1="13" x2="8" y2="13"></line>
                            <line x1="16" y1="17" x2="8" y2="17"></line>
                            <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                    </button>
                </div>
                <div className="modal-post-section">
                    <button className="modal-post-btn" id="modalPostBtn" disabled>
                        Post
                    </button>
                </div>
            </div>
        </div>
    </div>

    </>
  );
}
