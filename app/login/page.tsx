"use client"

import Link from 'next/link';

export default function Page() {
  return (
    <>



    {/*  Global Toast / Notification Container  */}
    <div className="toast-container" id="toastContainer"></div>

    {/*  Navigation Bar  */}
    <nav className="navbar auth-navbar" role="navigation" aria-label="Main navigation">
        <div className="navbar-container">
            <div className="navbar-logo">
                <img src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" 
                     alt="IskoMo Logo" 
                     className="navbar-logo-img" />
                <span className="navbar-logo-text">IskoMo</span>
            </div>
            <ul className="navbar-nav" id="navbarNav">
                <li><Link href="/">Home</Link></li>
                <li><Link href="/#about">About</Link></li>
            </ul>
            <button className="mobile-menu-toggle" id="mobileMenuToggle" aria-label="Toggle mobile menu" aria-expanded="false">
                ☰
            </button>
        </div>
    </nav>

    {/*  Shape-Shifting Auth Container  */}
    <div className="auth-wrapper-smart">
        <div className="auth-container-smart">
            {/*  Static Left Side  */}
            <div className="auth-static-side">
                <div className="auth-logo-container">
                    <img src="/assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" 
                         alt="IskoMo Logo" 
                         className="auth-main-logo" />
                </div>
                <h1 className="auth-main-title">Welcome to IskoMo</h1>
                <p className="auth-subtitle">Sign in or create your account</p>
            </div>

            {/*  Transformable Right Side  */}
            <div className="auth-transform-side square-state" id="authTransformSide">
                {/*  Login Form (Square)  */}
                <form id="loginFormSquare" className="form-square active" aria-label="Login form">
                    <div className="form-square-content">
                        <div className="form-group">
                            <label htmlFor="loginEmailSquare">Email or Username</label>
                            <input 
                                type="text" 
                                id="loginEmailSquare" 
                                name="email" 
                                placeholder="Enter your email or username" 
                                required
                                aria-required="true"
                                autoComplete="username" />
                            <div className="error-message" id="loginEmailError"></div>
                        </div>
                        <div className="form-group">
                            <label htmlFor="loginPasswordSquare">Password</label>
                            <div className="password-input-wrapper">
                                <input 
                                    type="password" 
                                    id="loginPasswordSquare" 
                                    name="password" 
                                    placeholder="Enter your password" 
                                    required
                                    aria-required="true"
                                    autoComplete="current-password" />
                                <button type="button" className="password-toggle" aria-label="Show password">
                                    <span className="eye-icon">Show</span>
                                </button>
                            </div>
                            <div className="error-message" id="loginPasswordError"></div>
                        </div>
                        <div className="error-message" id="loginError"></div>
                        <div className="form-group-row">
                            <label className="checkbox-label">
                                <input type="checkbox" name="remember" />
                                <span>Remember me</span>
                            </label>
                            <a href="#" className="forgot-link">Forgot password?</a>
                        </div>
                        <button type="submit" className="btn btn-primary btn-submit-square" id="loginSubmitBtn" disabled>Login</button>
                        <button type="button" className="btn-toggle-expand" data-action="expand" aria-label="Switch to sign up">
                            Sign Up <span className="arrow">→</span>
                        </button>
                    </div>
                </form>

                {/*  Signup Form (Rectangle)  */}
                <form id="signupFormRectangle" className="form-rectangle" aria-label="Sign up form">
                    <div className="form-rectangle-content">
                        <div className="form-grid-2col">
                            <div className="form-group">
                                <label htmlFor="signupEmailRect">Email</label>
                                {/*  Fake hidden field to trick browser autofill  */}
                                <input type="text" name="fake-email" autoComplete="off" style={{"position":"absolute","left":"-9999px","opacity":"0","pointerEvents":"none"}} tabIndex={-1} aria-hidden="true" />
                                <input 
                                    type="email" 
                                    id="signupEmailRect" 
                                    name="signup-email" 
                                    placeholder="Enter your email address" 
                                    required
                                    aria-required="true"
                                    autoComplete="email" />
                                <div className="error-message" id="signupEmailError"></div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="signupUsernameRect">Username</label>
                                <input 
                                    type="text" 
                                    id="signupUsernameRect" 
                                    name="username" 
                                    placeholder="Choose a username" 
                                    required
                                    aria-required="true"
                                    autoComplete="username" />
                                <div className="error-message" id="signupUsernameError"></div>
                            </div>
                            <div className="form-group password-form-group">
                                <label htmlFor="signupPasswordRect">
                                    Password
                                    <span className="password-help" data-tooltip="Password must contain: • At least 8 characters • One uppercase letter • One lowercase letter • One number • One special character • No spaces • Must not be the same as email or username">?</span>
                                </label>
                                <div className="password-input-wrapper">
                                    <input 
                                        type="password" 
                                        id="signupPasswordRect" 
                                        name="password" 
                                        placeholder="Create a password (min. 8)" 
                                        required
                                        minLength={8}
                                        aria-required="true"
                                        autoComplete="new-password" />
                                    <button type="button" className="password-toggle" aria-label="Show password">
                                        <span className="eye-icon">Show</span>
                                    </button>
                                </div>
                                {/*  Floating Password Strength Indicator  */}
                                <div className="password-strength-indicator" id="passwordStrengthIndicator">
                                    <div className="strength-indicator-header">
                                        <span className="strength-title">Password Requirements</span>
                                    </div>
                                    <ul className="strength-requirements-list">
                                        <li className="requirement-item" data-requirement="length">
                                            <span className="check-icon">○</span>
                                            <span className="requirement-text">At least 8 characters</span>
                                        </li>
                                        <li className="requirement-item" data-requirement="uppercase">
                                            <span className="check-icon">○</span>
                                            <span className="requirement-text">One uppercase letter</span>
                                        </li>
                                        <li className="requirement-item" data-requirement="number">
                                            <span className="check-icon">○</span>
                                            <span className="requirement-text">One number</span>
                                        </li>
                                        <li className="requirement-item" data-requirement="special">
                                            <span className="check-icon">○</span>
                                            <span className="requirement-text">One special character</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="error-message" id="signupPasswordError"></div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="signupConfirmRect">Confirm Password</label>
                                <div className="password-input-wrapper">
                                    <input 
                                        type="password" 
                                        id="signupConfirmRect" 
                                        name="confirmPassword" 
                                        placeholder="Confirm your password" 
                                        required
                                        aria-required="true"
                                        autoComplete="new-password" />
                                    <button type="button" className="password-toggle" aria-label="Show password">
                                        <span className="eye-icon">Show</span>
                                    </button>
                                </div>
                                <div className="error-message" id="signupConfirmError"></div>
                            </div>
                            <div className="form-group">
                                <label className="checkbox-label checkbox-full">
                                    <input type="checkbox" id="termsCheckbox" required aria-required="true" />
                                    <span>I agree to the 
                                        <span className="terms-link" data-tooltip="By using IskoMo, you agree to our terms including eligibility requirements, acceptable use policies, and platform guidelines. You are responsible for maintaining account security and using the platform lawfully.">Terms</span> 
                                        and 
                                        <span className="privacy-link" data-tooltip="IskoMo collects information to provide scholarship services, send updates, and improve the platform. We protect your data with industry-standard security. You have rights to access, correct, or delete your information at any time.">Privacy Policy</span>
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className="form-actions-rectangle">
                            <button type="button" className="btn-toggle-collapse" data-action="collapse" aria-label="Switch to login">
                                <span className="arrow">←</span> Login
                            </button>
                            <button type="submit" className="btn btn-primary btn-submit-rectangle" id="signupSubmitBtn" disabled>Create Account</button>
                        </div>
                    </div>
                </form>

                {/*  Role Selection Step (Hidden by default)  */}
                <div id="roleSelectionStep" className="form-rectangle" style={{"display":"none"}}>
                    <div className="form-rectangle-content">
                        <h2 style={{"textAlign":"center","marginBottom":"1.5rem","color":"#1f2937","fontSize":"1.5rem"}}>Choose Your Role</h2>
                        <p style={{"textAlign":"center","color":"#6b7280","marginBottom":"2rem"}}>Select the role that best describes you</p>
                        
                        <div className="role-selection-grid">
                            <div className="role-card" data-role="student">
                                <div className="role-icon">🎓</div>
                                <h3 className="role-title">PUP Student (iScholar)</h3>
                                <p className="role-description">Regular PUP student seeking scholarships</p>
                                <ul className="role-features">
                                    <li>Apply for scholarships</li>
                                    <li>Track applications</li>
                                    <li>Access PUP opportunities</li>
                                </ul>
                            </div>
                            
                            <div className="role-card" data-role="leader">
                                <div className="role-icon">👥</div>
                                <h3 className="role-title">Student Leader (iSkoMo)</h3>
                                <p className="role-description">Org officer, class rep, or campus leader</p>
                                <ul className="role-features">
                                    <li>Post opportunities</li>
                                    <li>Verify applications</li>
                                    <li>Manage referrals</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="form-actions-rectangle" style={{"marginTop":"2rem"}}>
                            <button type="button" className="btn btn-secondary" id="backToSignupBtn">← Back</button>
                            <button type="button" className="btn btn-primary" id="continueToProfileBtn" disabled>Continue →</button>
                        </div>
                    </div>
                </div>

                {/*  Profile Completion Step - Student (Hidden by default)  */}
                <div id="studentProfileStep" className="form-rectangle" style={{"display":"none"}}>
                    <div className="form-rectangle-content">
                        <h2 style={{"textAlign":"center","marginBottom":"1rem","color":"#1f2937","fontSize":"1.5rem"}}>Complete Your Profile</h2>
                        <p style={{"textAlign":"center","color":"#6b7280","marginBottom":"2rem"}}>Tell us more about yourself as a PUP student</p>
                        
                        <div className="form-grid-2col">
                            <div className="form-group">
                                <label htmlFor="studentId">PUP Student ID *</label>
                                <input type="text" id="studentId" name="studentId" placeholder="e.g., 2021-12345" required />
                                <div className="error-message" id="studentIdError"></div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="collegeDept">College/Department *</label>
                                <input type="text" id="collegeDept" name="collegeDept" placeholder="e.g., College of Engineering" required />
                                <div className="error-message" id="collegeDeptError"></div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="yearLevel">Year Level *</label>
                                <select id="yearLevel" name="yearLevel" required>
                                    <option value="">Select year level</option>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                    <option value="5th Year">5th Year</option>
                                    <option value="Graduate">Graduate</option>
                                </select>
                                <div className="error-message" id="yearLevelError"></div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="courseProgram">Course/Program *</label>
                                <input type="text" id="courseProgram" name="courseProgram" placeholder="e.g., BS Computer Engineering" required />
                                <div className="error-message" id="courseProgramError"></div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="currentGPA">Current GPA</label>
                                <input type="number" id="currentGPA" name="currentGPA" step="0.01" min="0" max="4" placeholder="e.g., 3.50" />
                                <div className="error-message" id="currentGPAError"></div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="contactNumber">Contact Number *</label>
                                <input type="tel" id="contactNumber" name="contactNumber" placeholder="e.g., 09123456789" required />
                                <div className="error-message" id="contactNumberError"></div>
                            </div>
                        </div>
                        
                        <div className="form-actions-rectangle" style={{"marginTop":"1.5rem"}}>
                            <button type="button" className="btn btn-secondary" id="backToRoleBtn">← Back</button>
                            <button type="submit" className="btn btn-primary" id="completeStudentProfileBtn">Complete Profile</button>
                        </div>
                    </div>
                </div>

                {/*  Profile Completion Step - Leader (Hidden by default)  */}
                <div id="leaderProfileStep" className="form-rectangle" style={{"display":"none"}}>
                    <div className="form-rectangle-content">
                        <h2 style={{"textAlign":"center","marginBottom":"1rem","color":"#1f2937","fontSize":"1.5rem"}}>Complete Your Leader Profile</h2>
                        <p style={{"textAlign":"center","color":"#6b7280","marginBottom":"2rem"}}>Tell us about your leadership role</p>
                        
                        <div className="form-grid-2col">
                            <div className="form-group">
                                <label htmlFor="leadershipPosition">Leadership Position *</label>
                                <select id="leadershipPosition" name="leadershipPosition" required>
                                    <option value="">Select position</option>
                                    <option value="class_president">Class President</option>
                                    <option value="org_officer">Student Org Officer</option>
                                    <option value="dept_representative">Department Representative</option>
                                    <option value="campus_leader">Campus Organization Leader</option>
                                </select>
                                <div className="error-message" id="leadershipPositionError"></div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="organizationName">Organization Name *</label>
                                <input type="text" id="organizationName" name="organizationName" placeholder="e.g., PUP Computer Engineering Society" required />
                                <div className="error-message" id="organizationNameError"></div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="leaderContactNumber">Contact Number *</label>
                                <input type="tel" id="leaderContactNumber" name="leaderContactNumber" placeholder="e.g., 09123456789" required />
                                <div className="error-message" id="leaderContactNumberError"></div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="proofOfPosition">Proof of Position (URL)</label>
                                <input type="url" id="proofOfPosition" name="proofOfPosition" placeholder="Link to proof (optional)" />
                                <div className="error-message" id="proofOfPositionError"></div>
                            </div>
                        </div>
                        
                        <div className="form-actions-rectangle" style={{"marginTop":"1.5rem"}}>
                            <button type="button" className="btn btn-secondary" id="backToRoleBtnLeader">← Back</button>
                            <button type="submit" className="btn btn-primary" id="completeLeaderProfileBtn">Complete Profile</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    

    </>
  );
}
