"use client"

import React, { useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  useEffect(() => {
    // Extracted JS logic here if needed
  }, []);

  return (
    <>
      
    <header className="legal-header">
        <div className="container">
            <div className="header-content">
                <Link href="/" className="logo-link">
                    <span className="logo-text">IskoMo</span>
                </Link>
                <h1 className="page-title">Terms & Conditions</h1>
                <p className="page-subtitle">Last updated: <span id="current-year">2025</span></p>
            </div>
        </div>
    </header>

    <main className="main-content">
        <div className="container">
            <div className="legal-content">
                {/*  Quick Navigation  */}
                <nav className="legal-nav">
                    <h3 className="nav-title">Quick Navigation</h3>
                    <ul className="nav-links">
                        <li><a href="#acceptance">Acceptance of Terms</a></li>
                        <li><a href="#eligibility">Eligibility</a></li>
                        <li><a href="#user-accounts">User Accounts</a></li>
                        <li><a href="#acceptable-use">Acceptable Use</a></li>
                        <li><a href="#intellectual-property">Intellectual Property</a></li>
                        <li><a href="#disclaimer">Disclaimer of Warranties</a></li>
                        <li><a href="#limitation-liability">Limitation of Liability</a></li>
                        <li><a href="#termination">Termination</a></li>
                        <li><a href="#governing-law">Governing Law</a></li>
                        <li><a href="#changes-terms">Changes to Terms</a></li>
                    </ul>
                </nav>

                {/*  Terms Content  */}
                <div className="policy-content">
                    {/*  Acceptance of Terms  */}
                    <section id="acceptance" className="policy-section">
                        <h2 className="section-title">1. Acceptance of Terms</h2>
                        <p>By accessing and using IskoMo, you agree to be bound by these Terms & Conditions and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this platform.</p>
                        <p>These terms constitute a legally binding agreement between you and IskoMo. Your use of the platform indicates your acceptance of these terms in their entirety.</p>
                    </section>

                    {/*  Eligibility  */}
                    <section id="eligibility" className="policy-section">
                        <h2 className="section-title">2. Eligibility</h2>
                        <p>IskoMo is designed for PUP students seeking scholarship opportunities. To use this platform, you must:</p>
                        
                        <div className="eligibility-list">
                            <div className="eligibility-item">
                                <div className="eligibility-content">
                                    <h3>Be a PUP Student</h3>
                                    <p>Currently enrolled or recently graduated from Polytechnic University of the Philippines</p>
                                </div>
                            </div>
                            
                            <div className="eligibility-item">
                                <div className="eligibility-content">
                                    <h3>Provide Accurate Information</h3>
                                    <p>Submit truthful and accurate information in your profile and applications</p>
                                </div>
                            </div>
                            
                            <div className="eligibility-item">
                                <div className="eligibility-content">
                                    <h3>Be of Legal Age</h3>
                                    <p>Be at least 18 years old or have parental consent if under 18</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/*  User Accounts  */}
                    <section id="user-accounts" className="policy-section">
                        <h2 className="section-title">3. User Accounts</h2>
                        <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account:</p>
                        
                        <div className="account-rules">
                            <div className="rule-item">
                                <h3>Account Security</h3>
                                <ul>
                                    <li>Keep your password secure and confidential</li>
                                    <li>Notify us immediately of any unauthorized access</li>
                                    <li>Do not share your account with others</li>
                                </ul>
                            </div>
                            
                            <div className="rule-item">
                                <h3>Account Responsibility</h3>
                                <ul>
                                    <li>You are responsible for all actions under your account</li>
                                    <li>Ensure all information provided is accurate and current</li>
                                    <li>Maintain one account per individual</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/*  Acceptable Use  */}
                    <section id="acceptable-use" className="policy-section">
                        <h2 className="section-title">4. Acceptable Use</h2>
                        <p>You agree to use IskoMo only for lawful purposes and in accordance with these Terms. The following activities are strictly prohibited:</p>
                        
                        <div className="prohibited-list">
                            <h3>Prohibited Activities:</h3>
                            <ul>
                                <li>Posting false, misleading, or fraudulent scholarship information</li>
                                <li>Attempting to hack, disrupt, or interfere with the platform&apos;s security</li>
                                <li>Violating other users&apos; privacy or rights</li>
                                <li>Using the platform for commercial purposes without permission</li>
                                <li>Spamming, phishing, or engaging in deceptive practices</li>
                                <li>Uploading malicious software or viruses</li>
                                <li>Impersonating other users or entities</li>
                                <li>Collecting user data without authorization</li>
                            </ul>
                        </div>
                        
                        <div className="disclaimer-box">
                            <p><strong>Consequences:</strong> Violation of these terms may result in immediate account suspension or termination, and may lead to legal action if applicable.</p>
                        </div>
                    </section>

                    {/*  Intellectual Property  */}
                    <section id="intellectual-property" className="policy-section">
                        <h2 className="section-title">5. Intellectual Property</h2>
                        <p>The IskoMo platform, including its design, logo, content, and functionality, is protected by copyright, trademark, and other intellectual property laws:</p>
                        
                        <div className="ip-grid">
                            <div className="ip-item">
                                <h3>Platform Ownership</h3>
                                <p>All content, features, and functionality of IskoMo are owned by IskoMo and are protected by international copyright laws.</p>
                            </div>
                            
                            <div className="ip-item">
                                <h3>User Content</h3>
                                <p>You retain ownership of content you submit, but grant IskoMo a license to use, display, and distribute it on the platform.</p>
                            </div>
                            
                            <div className="ip-item">
                                <h3>Restrictions</h3>
                                <p>You may not reproduce, modify, distribute, or create derivative works from IskoMo content without written permission.</p>
                            </div>
                        </div>
                    </section>

                    {/*  Disclaimer of Warranties  */}
                    <section id="disclaimer" className="policy-section">
                        <h2 className="section-title">6. Disclaimer of Warranties</h2>
                        <p>IskoMo is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied:</p>
                        
                        <div className="warranty-list">
                            <div className="warranty-item">
                                <h3>No Guarantees</h3>
                                <p>We do not guarantee that the platform will be uninterrupted, error-free, or completely secure. While we strive for excellence, technical issues may occur.</p>
                            </div>
                            
                            <div className="warranty-item">
                                <h3>Scholarship Information</h3>
                                <p>We do not guarantee the accuracy, completeness, or availability of scholarship listings. Users should verify all information independently.</p>
                            </div>
                            
                            <div className="warranty-item">
                                <h3>Application Outcomes</h3>
                                <p>IskoMo does not guarantee scholarship approval or funding. Application decisions are made by scholarship providers, not IskoMo.</p>
                            </div>
                        </div>
                    </section>

                    {/*  Limitation of Liability  */}
                    <section id="limitation-liability" className="policy-section">
                        <h2 className="section-title">7. Limitation of Liability</h2>
                        <p>To the fullest extent permitted by law, IskoMo shall not be liable for any indirect, incidental, special, consequential, or punitive damages:</p>
                        
                        <div className="liability-list">
                            <ul>
                                <li>Loss of data or information</li>
                                <li>Loss of profits or business opportunities</li>
                                <li>Damages resulting from platform downtime or errors</li>
                                <li>Damages from unauthorized access or data breaches</li>
                                <li>Damages from reliance on platform information</li>
                            </ul>
                        </div>
                        
                        <p>Our total liability for any claims arising from your use of IskoMo shall not exceed the amount you paid to use the platform (if any) in the 12 months preceding the claim.</p>
                    </section>

                    {/*  Termination  */}
                    <section id="termination" className="policy-section">
                        <h2 className="section-title">8. Termination</h2>
                        <p>We reserve the right to suspend or terminate your access to IskoMo at any time, with or without cause or notice:</p>
                        
                        <div className="termination-grid">
                            <div className="termination-item">
                                <h3>Termination by IskoMo</h3>
                                <ul>
                                    <li>Violation of these Terms & Conditions</li>
                                    <li>Fraudulent or illegal activity</li>
                                    <li>Abuse of platform features</li>
                                    <li>Extended period of inactivity</li>
                                </ul>
                            </div>
                            
                            <div className="termination-item">
                                <h3>Termination by User</h3>
                                <ul>
                                    <li>You may close your account at any time</li>
                                    <li>Contact us to request account deletion</li>
                                    <li>Data will be deleted per our Privacy Policy</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/*  Governing Law  */}
                    <section id="governing-law" className="policy-section">
                        <h2 className="section-title">9. Governing Law</h2>
                        <p>These Terms & Conditions are governed by and construed in accordance with the laws of the Republic of the Philippines:</p>
                        
                        <div className="law-info">
                            <div className="law-item">
                                <h3>Jurisdiction</h3>
                                <p>Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of the Philippines.</p>
                            </div>
                            
                            <div className="law-item">
                                <h3>Compliance</h3>
                                <p>IskoMo operates in compliance with Philippine data protection laws, including the Data Privacy Act of 2012.</p>
                            </div>
                        </div>
                    </section>

                    {/*  Changes to Terms  */}
                    <section id="changes-terms" className="policy-section">
                        <h2 className="section-title">10. Changes to Terms</h2>
                        <p>We may modify these Terms & Conditions at any time. We will notify users of significant changes:</p>
                        
                        <ul className="changes-list">
                            <li>Notification via email or platform announcement</li>
                            <li>Updated &quot;Last updated&quot; date at the top of this page</li>
                            <li>Continued use after changes constitutes acceptance</li>
                            <li>Previous versions will be archived for reference</li>
                        </ul>
                        
                        <p>We encourage you to review these terms periodically. If you do not agree with any changes, you should discontinue use of the platform.</p>
                    </section>

                    {/*  Contact Us  */}
                    <section id="contact-terms" className="policy-section">
                        <h2 className="section-title">11. Contact Us</h2>
                        <p>If you have questions about these Terms & Conditions:</p>
                        
                        <div className="contact-info">
                            <div className="contact-method">
                                <h3>Platform Contact</h3>
                                <p>Use the contact form within the IskoMo platform</p>
                            </div>
                            
                            <div className="contact-method">
                                <h3>Email</h3>
                                <p>legal@iskomo.ph (for terms-related inquiries)</p>
                            </div>
                            
                            <div className="contact-method">
                                <h3>Response Time</h3>
                                <p>We aim to respond to all inquiries within 3-5 business days</p>
                            </div>
                        </div>
                    </section>

                    {/*  Page Actions  */}
                    <div className="page-actions">
                        <button onClick={() => { /* window.print() */ }} className="action-btn">
                            <span className="btn-text">Print Page</span>
                        </button>
                        <button onClick={() => { /* generatePDF('terms') */ }} className="action-btn primary">
                            <span className="btn-text">Download as PDF</span>
                        </button>
                        <Link href="/privacy" className="action-btn secondary">
                            <span className="btn-text">View Privacy Policy</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    </main>

    <footer className="legal-footer">
        <div className="container">
            <div className="footer-content">
                <p>&copy; <span id="footer-year">2025</span> IskoMo. All rights reserved.</p>
                <div className="footer-links">
                    <Link href="/privacy">Privacy Policy</Link>
                    <Link href="/terms">Terms & Conditions</Link>
                    <Link href="/">Home</Link>
                </div>
            </div>
        </div>
    </footer>

    {/*  JavaScript  */}
    
    
    

    </>
  );
}
