"use client"

export default function Page() {
  return (
    <>

    {/*  Toast Container  */}
    <div className="toast-container" id="toastContainer"></div>
    
    <div className="container" id="mainContainer">
        {/*  LEFT PANEL: Branding  */}
        <div className="left-panel">
            <i className="fas fa-graduation-cap floating-icon"></i>
            <i className="fas fa-book floating-icon"></i>
            <i className="fas fa-trophy floating-icon"></i>
            <i className="fas fa-lightbulb floating-icon"></i>
            
            <div className="left-panel-content">
                <div className="logo-section">
                    <div className="logo-circle">
                        <img src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" alt="IskoMo Logo" />
                    </div>
                    <div className="logo-text">IskoMo</div>
                    <div className="platform-label">Scholarship Platform</div>
                    <div className="tagline">Empowering students with accessible, transparent, and efficient scholarship opportunities.</div>
                </div>

                <div className="quote-section">
                    <div className="quote-box">
                        <div className="quote-text">
                            &quot;Education is the bridge between dreams and reality.&quot;
                        </div>
                        <div className="quote-author">
                            — Start your journey today
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/*  MIDDLE PANEL: Removed - Role indicator moved to header  */}

        {/*  RIGHT PANEL: Content Area  */}
        <div className="right-panel">
            {/*  STEP 1: Role Selection  */}
            <div className="step-1-content">
                <div className="progress-container">
                    <div className="progress-header">
                        <span className="progress-text">Step 1 of 2</span>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill" style={{"width":"50%"}}></div>
                    </div>
                    <div className="progress-steps">
                        <div className="progress-step">
                            <div className="step-circle active">1</div>
                            <span className="step-label">Choose Role</span>
                        </div>
                        <div className="progress-step">
                            <div className="step-circle">2</div>
                            <span className="step-label">Complete Profile</span>
                        </div>
                    </div>
                </div>

                <div className="content-header">
                    <h1>Choose Your Role</h1>
                    <p>How will you use IskoMo?</p>
                </div>

                <div className="role-cards" style={{"gridTemplateColumns":"1fr"}}>
                    <div className="role-card selected" data-role="iskolar" style={{"cursor":"default","maxWidth":"600px","margin":"0 auto","width":"100%"}}>
                        <div className="role-header" style={{"justifyContent":"center"}}>
                            <div className="role-icon iskolar-icon">
                                <i className="fas fa-user-graduate"></i>
                            </div>
                            <div className="role-title-group" style={{"flex":"none","textAlign":"center"}}>
                                <div className="role-title">iSKOLAR</div>
                                <div className="role-subtitle">Scholarship Seeker</div>
                            </div>
                        </div>
                        <div className="role-description" style={{"textAlign":"center"}}>
                            Student looking for financial assistance and scholarship opportunities.
                        </div>
                        <ul className="role-features" style={{"display":"flex","justifyContent":"center","gap":"var(--spacing-md)","flexWrap":"wrap"}}>
                            <li><i className="fas fa-check"></i> Find & apply for scholarships</li>
                            <li><i className="fas fa-check"></i> Track your applications</li>
                            <li><i className="fas fa-check"></i> Get financial support</li>
                        </ul>
                    </div>
                </div>

                <button id="continueBtn" className="continue-btn" style={{"maxWidth":"600px","margin":"0 auto","display":"flex"}}>
                    <span>Continue to Profile Setup</span>
                    <i className="fas fa-arrow-right"></i>
                </button>
            </div>

            {/*  STEP 2: Profile Form  */}
            <div className="step-2-content">
                <div className="progress-container">
                    <div className="progress-header">
                        <span className="progress-text">Step 2 of 2</span>
                        <div className="progress-header-right">
                            <div className="role-indicator" id="roleIndicator">
                                <i className="fas fa-user-graduate" id="roleIndicatorIcon"></i>
                                <span id="roleIndicatorName">iSKOLAR</span>
                                <span className="role-separator">·</span>
                                <span id="roleIndicatorType">Student</span>
                            </div>
                        </div>
                    </div>
                    <div className="progress-bar-container">
                        <div className="progress-bar-fill"></div>
                    </div>
                    <div className="progress-steps">
                        <div className="progress-step">
                            <div className="step-circle completed">1</div>
                            <span className="step-label">Choose Role</span>
                        </div>
                        <div className="progress-step">
                            <div className="step-circle active">2</div>
                            <span className="step-label">Complete Profile</span>
                        </div>
                    </div>
                </div>

                <div className="content-header">
                    <h1 id="formTitle">Complete Your Profile</h1>
                    <p id="formSubtitle">Fill in your details to get started</p>
                </div>

                <form id="studentForm">
                    {/*  SECTION A: Personal Identity  */}
                    <div className="form-section">
                        <div className="section-title">
                            <span className="section-icon">👤</span>
                            Personal Identity
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">
                                    First Name <span className="required">*</span>
                                </label>
                                <input type="text" className="form-input" id="firstName" placeholder="First Name" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Middle Name <span className="required">*</span>
                                </label>
                                <input type="text" className="form-input" id="middleName" placeholder="Middle Name" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Last Name <span className="required">*</span>
                                </label>
                                <input type="text" className="form-input" id="lastName" placeholder="Last Name" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Date of Birth <span className="required">*</span>
                                </label>
                                <input type="date" className="form-input" id="birthDate" required />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">
                                    Sex <span className="required">*</span>
                                </label>
                                <div className="gender-group">
                                    <label className="gender-btn">
                                        <input type="radio" name="gender" value="male" required />
                                        <span>Male</span>
                                    </label>
                                    <label className="gender-btn">
                                        <input type="radio" name="gender" value="female" />
                                        <span>Female</span>
                                    </label>
                                    <label className="gender-btn">
                                        <input type="radio" name="gender" value="prefer_not_to_say" />
                                        <span>Prefer not to say</span>
                                    </label>
                                </div>
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">
                                    Mobile Number <span className="required">*</span>
                                </label>
                                <div className="phone-input-group">
                                    <select className="country-code-select" id="countryCode">
                                        <option value="+63">🇵🇭 +63</option>
                                    </select>
                                    <input type="tel" className="form-input phone-input" id="contactNumber" placeholder="9xxxxxxxxx" pattern="9\d{9}" maxLength={10} title="Must start with 9 and be exactly 10 digits" required />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*  SECTION B: PUP Academic Information  */}
                    <div className="form-section">
                        <div className="section-title">
                            <span className="section-icon">🎓</span>
                            PUP Academic Information
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">
                                    Student Number <span className="required">*</span>
                                </label>
                                <input type="text" className="form-input" id="studentId" placeholder="2023-12345-MN-0" pattern="\d{4}-\d{5}-[A-Za-z]{2}-\d" title="Format: 2023-12345-MN-0" maxLength={15} required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Campus <span className="required">*</span>
                                </label>
                                <input type="text" className="form-input" id="campus" value="PUP Sta. Mesa" readOnly style={{"background":"#f5f5f5","cursor":"not-allowed"}} required />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">
                                    College / Institute <span className="required">*</span>
                                </label>
                                <select className="form-select" id="college" required>
                                    <option value="">Select College / Institute</option>
                                    <option value="CAF">College of Accountancy and Finance (CAF)</option>
                                    <option value="CADBE">College of Architecture, Design and the Built Environment (CADBE)</option>
                                    <option value="CAL">College of Arts and Letters (CAL)</option>
                                    <option value="CBA">College of Business Administration (CBA)</option>
                                    <option value="COC">College of Communication (COC)</option>
                                    <option value="CCIS">College of Computer and Information Sciences (CCIS)</option>
                                    <option value="COED">College of Education (COED)</option>
                                    <option value="CE">College of Engineering (CE)</option>
                                    <option value="CHK">College of Human Kinetics (CHK)</option>
                                    <option value="CL">College of Law (CL)</option>
                                    <option value="CPSPA">College of Political Science and Public Administration (CPSPA)</option>
                                    <option value="CSSD">College of Social Sciences and Development (CSSD)</option>
                                    <option value="CS">College of Science (CS)</option>
                                    <option value="CTHTM">College of Tourism, Hospitality and Transportation Management (CTHTM)</option>
                                    <option value="ITECH">Institute of Technology (ITECH)</option>
                                </select>
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">
                                    Program / Course <span className="required">*</span>
                                </label>
                                <select className="form-select" id="program" required disabled>
                                    <option value="">Select College / Institute First</option>
                                </select>
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">
                                    Year Level <span className="required">*</span>
                                </label>
                                <div className="year-level-group">
                                    <label className="year-level-btn">
                                        <input type="radio" name="yearLevel" value="1st Year" required />
                                        <span>1st Year</span>
                                    </label>
                                    <label className="year-level-btn">
                                        <input type="radio" name="yearLevel" value="2nd Year" />
                                        <span>2nd Year</span>
                                    </label>
                                    <label className="year-level-btn">
                                        <input type="radio" name="yearLevel" value="3rd Year" />
                                        <span>3rd Year</span>
                                    </label>
                                    <label className="year-level-btn">
                                        <input type="radio" name="yearLevel" value="4th Year" />
                                        <span>4th Year</span>
                                    </label>
                                    <label className="year-level-btn">
                                        <input type="radio" name="yearLevel" value="5th Year" />
                                        <span>5th Year</span>
                                    </label>
                                    <label className="year-level-btn">
                                        <input type="radio" name="yearLevel" value="Irregular" />
                                        <span>Irregular</span>
                                    </label>
                                </div>
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Section / Block <span className="required">*</span>
                                </label>
                                <input type="text" className="form-input" id="section" placeholder="e.g., 3-1" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label">
                                    Academic Year <span className="required">*</span>
                                </label>
                                <input type="text" className="form-input" id="academicYear" placeholder="e.g., 2025–2026" required />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label">
                                    Semester <span className="required">*</span>
                                </label>
                                <div className="year-level-group">
                                    <label className="year-level-btn">
                                        <input type="radio" name="semester" value="1st Semester" required />
                                        <span>1st Semester</span>
                                    </label>
                                    <label className="year-level-btn">
                                        <input type="radio" name="semester" value="2nd Semester" />
                                        <span>2nd Semester</span>
                                    </label>
                                    <label className="year-level-btn">
                                        <input type="radio" name="semester" value="Summer" />
                                        <span>Summer</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*  SECTION C: Family Details  */}
                    <div className="form-section">
                        <div className="section-title">
                            <span className="section-icon">👨‍👩‍👧‍👦</span>
                            Family Details
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label"> Father&apos;s Name <span className="required">*</span> </label>
                                <input type="text" className="form-input" id="fatherName" placeholder="Father's Full Name" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label"> Father&apos;s Occupation <span className="required">*</span> </label>
                                <input type="text" className="form-input" id="fatherOccupation" placeholder="Father&apos;s Occupation" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label"> Mother&apos;s Name <span className="required">*</span> </label>
                                <input type="text" className="form-input" id="motherName" placeholder="Mother's Full Name" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label"> Mother&apos;s Occupation <span className="required">*</span> </label>
                                <input type="text" className="form-input" id="motherOccupation" placeholder="Mother&apos;s Occupation" required />
                            </div>
                            <div className="form-group">
                                <label className="form-label"> Annual Gross Income <span className="required">*</span> </label>
                                <select className="form-select" id="householdIncome" required>
                                    <option value="">Select Income Bracket</option>
                                    <option value="Below 120,000">Below ₱120,000</option>
                                    <option value="120,000 - 240,000">₱120,000 - ₱240,000</option>
                                    <option value="240,001 - 480,000">₱240,001 - ₱480,000</option>
                                    <option value="480,001 - 720,000">₱480,001 - ₱720,000</option>
                                    <option value="Above 720,000">Above ₱720,000</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="form-label"> Number of Siblings <span className="required">*</span> </label>
                                <input type="number" className="form-input" id="numberOfSiblings" min="0" placeholder="0" required />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label"> Guardian&apos;s Name <span className="required">*</span> </label>
                                <input type="text" className="form-input" id="guardianName" placeholder="Guardian's Full Name" required />
                            </div>
                            <div className="form-group full-width">
                                <label className="form-label"> Guardian&apos;s Contact Number <span className="required">*</span> </label>
                                <div className="phone-input-group">
                                    <select className="country-code-select" id="guardianCountryCode">
                                        <option value="+63">🇵🇭 +63</option>
                                    </select>
                                    <input type="tel" className="form-input phone-input" id="guardianContact" placeholder="9xxxxxxxxx" pattern="9\d{9}" maxLength={10} title="Must start with 9 and be exactly 10 digits" required />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/*  SECTION D: Required Document Uploads  */}
                    <div className="form-section">
                        <div className="section-title">
                            <span className="section-icon">📄</span>
                            Required Document Uploads
                        </div>
                        <div style={{"marginBottom":"var(--spacing-md)","padding":"var(--spacing-sm) var(--spacing-md)","background":"var(--gray-bg)","borderRadius":"var(--radius-sm)","border":"1px solid var(--gray-border)"}}>
                            <ul style={{"listStyle":"none","padding":"0","margin":"0","display":"flex","flexDirection":"column","gap":"4px"}}>
                                <li style={{"display":"flex","alignItems":"flex-start","gap":"var(--spacing-xs)","padding":"4px 0"}}>
                                    <span style={{"color":"var(--teal-primary)","fontWeight":"600","marginRight":"4px","fontSize":"0.875rem"}}>•</span>
                                    <span style={{"fontSize":"0.8125rem","color":"var(--gray-dark)","lineHeight":"1.4"}}>Upload PUP ID (Front)</span>
                                </li>
                                <li style={{"display":"flex","alignItems":"flex-start","gap":"var(--spacing-xs)","padding":"4px 0"}}>
                                    <span style={{"color":"var(--teal-primary)","fontWeight":"600","marginRight":"4px","fontSize":"0.875rem"}}>•</span>
                                    <span style={{"fontSize":"0.8125rem","color":"var(--gray-dark)","lineHeight":"1.4"}}>Upload Certificate of Registration (Latest Semester)</span>
                                </li>
                                <li style={{"display":"flex","alignItems":"flex-start","gap":"var(--spacing-xs)","padding":"4px 0"}}>
                                    <span style={{"color":"var(--teal-primary)","fontWeight":"600","marginRight":"4px","fontSize":"0.875rem"}}>•</span>
                                    <span style={{"fontSize":"0.8125rem","color":"var(--gray-dark)","lineHeight":"1.4"}}>Upload Grade Slip (Latest Term)</span>
                                </li>
                            </ul>
                        </div>
                        <div className="file-upload" id="studentFileUpload">
                            <i className="fas fa-cloud-upload-alt"></i>
                            <p>Drag and drop files here or click to upload</p>
                            <small>Allowed formats: PDF, JPG, PNG (Max 10MB each)</small>
                        </div>
                        <div className="uploaded-files" id="studentFiles"></div>
                        <input type="hidden" id="studentFilesCount" required />
                    </div>

                    <div className="action-buttons">
                        <button type="submit" className="btn-submit" id="submitBtn" style={{"width":"100%"}} disabled>
                            <span>Complete Profile</span>
                            <i className="fas fa-check"></i>
                        </button>
                    </div>
                </form>

                {/*  Sponsor Form Removed  */}
            </div>
        </div>
    </div>

    

    </>
  );
}
