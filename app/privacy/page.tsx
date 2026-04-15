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
                <h1 className="page-title">Privacy Policy</h1>
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
                        <li><a href="#introduction">Introduction</a></li>
                        <li><a href="#information-collected">Information We Collect</a></li>
                        <li><a href="#how-we-use">How We Use Information</a></li>
                        <li><a href="#data-protection">Data Protection</a></li>
                        <li><a href="#third-party">Third-Party Services</a></li>
                        <li><a href="#your-rights">Your Rights</a></li>
                        <li><a href="#changes">Changes to Policy</a></li>
                        <li><a href="#contact">Contact Us</a></li>
                    </ul>
                </nav>

                {/*  Policy Content  */}
                <div className="policy-content">
                    {/*  Introduction  */}
                    <section id="introduction" className="policy-section">
                        <h2 className="section-title">1. Introduction</h2>
                        <p>Welcome to IskoMo. We value your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our scholarship platform.</p>
                        <p>By using IskoMo, you agree to the collection and use of information in accordance with this policy. We are dedicated to ensuring transparency and protecting the privacy of all PUP students using our platform.</p>
                    </section>

                    {/*  Information Collected  */}
                    <section id="information-collected" className="policy-section">
                        <h2 className="section-title">2. Information We Collect</h2>
                        <p>We collect information to provide and improve our services. The types of information we may collect include:</p>
                        
                        <div className="info-grid">
                            <div className="info-card">
                                <h3 className="info-title">Personal Information</h3>
                                <ul className="info-list">
                                    <li>Name and contact details (if provided)</li>
                                    <li>Email address</li>
                                    <li>PUP student information</li>
                                    <li>Academic background</li>
                                </ul>
                            </div>
                            
                            <div className="info-card">
                                <h3 className="info-title">Platform Usage Data</h3>
                                <ul className="info-list">
                                    <li>Scholarship applications submitted</li>
                                    <li>Saved scholarships</li>
                                    <li>Application status tracking</li>
                                    <li>Messages or inquiries submitted</li>
                                </ul>
                            </div>
                            
                            <div className="info-card">
                                <h3 className="info-title">Technical Information</h3>
                                <ul className="info-list">
                                    <li>IP address and browser type</li>
                                    <li>Device information</li>
                                    <li>Usage patterns and preferences</li>
                                    <li>Cookies and session data</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/*  How We Use Information  */}
                    <section id="how-we-use" className="policy-section">
                        <h2 className="section-title">3. How We Use Your Information</h2>
                        <p>Your information is used exclusively to enhance your scholarship experience:</p>
                        
                        <div className="usage-list">
                            <div className="usage-item">
                                <div className="usage-content">
                                    <h3>Service Provision</h3>
                                    <p>To provide, maintain, and improve IskoMo&apos;s scholarship platform and features</p>
                                </div>
                            </div>
                            
                            <div className="usage-item">
                                <div className="usage-content">
                                    <h3>Security & Protection</h3>
                                    <p>To ensure platform security, prevent fraud, and protect against unauthorized access</p>
                                </div>
                            </div>
                            
                            <div className="usage-item">
                                <div className="usage-content">
                                    <h3>Platform Improvement</h3>
                                    <p>To analyze usage patterns and enhance user experience and system performance</p>
                                </div>
                            </div>
                            
                            <div className="usage-item">
                                <div className="usage-content">
                                    <h3>Communication</h3>
                                    <p>To send important updates about scholarships, deadlines, and platform changes</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/*  Data Protection  */}
                    <section id="data-protection" className="policy-section">
                        <h2 className="section-title">4. Data Protection</h2>
                        <p>We implement reasonable security measures to protect your personal information:</p>
                        
                        <div className="protection-grid">
                            <div className="protection-item">
                                <h3>Security Measures</h3>
                                <ul>
                                    <li>Secure data encryption in transit and at rest</li>
                                    <li>Regular security assessments</li>
                                    <li>Access controls and authentication</li>
                                </ul>
                            </div>
                            
                            <div className="protection-item">
                                <h3>Data Retention</h3>
                                <ul>
                                    <li>We retain data only as long as necessary</li>
                                    <li>You can request data deletion at any time</li>
                                    <li>Automatic deletion after account closure</li>
                                </ul>
                            </div>
                        </div>
                        
                        <div className="disclaimer-box">
                            <p><strong>Disclaimer:</strong> While we implement industry-standard security measures, no online platform can guarantee 100% security. We encourage users to protect their login credentials and report any suspicious activity.</p>
                        </div>
                    </section>

                    {/*  Third-Party Services  */}
                    <section id="third-party" className="policy-section">
                        <h2 className="section-title">5. Third-Party Services</h2>
                        <p>IskoMo may use third-party services to enhance platform functionality:</p>
                        
                        <table className="third-party-table">
                            <thead>
                                <tr>
                                    <th>Service Type</th>
                                    <th>Purpose</th>
                                    <th>Data Shared</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Hosting Services</td>
                                    <td>Platform infrastructure</td>
                                    <td>Technical data only</td>
                                </tr>
                                <tr>
                                    <td>Analytics Tools</td>
                                    <td>Usage analysis</td>
                                    <td>Anonymous usage data</td>
                                </tr>
                                <tr>
                                    <td>Email Services</td>
                                    <td>Communication</td>
                                    <td>Contact information</td>
                                </tr>
                            </tbody>
                        </table>
                        
                        <p className="note">Note: Third-party services have their own privacy policies. We only work with reputable providers who comply with data protection standards.</p>
                    </section>

                    {/*  Your Rights  */}
                    <section id="your-rights" className="policy-section">
                        <h2 className="section-title">6. Your Rights</h2>
                        <p>As a user of IskoMo, you have the following rights regarding your personal data:</p>
                        
                        <div className="rights-grid">
                            <div className="right-card">
                                <h3>Right to Access</h3>
                                <p>Request a copy of your personal data stored in our system</p>
                            </div>
                            
                            <div className="right-card">
                                <h3>Right to Correction</h3>
                                <p>Request updates or corrections to inaccurate information</p>
                            </div>
                            
                            <div className="right-card">
                                <h3>Right to Deletion</h3>
                                <p>Request deletion of your personal data from our systems</p>
                            </div>
                            
                            <div className="right-card">
                                <h3>Right to Withdraw</h3>
                                <p>Stop using the service or withdraw consent at any time</p>
                            </div>
                        </div>
                        
                        <div className="rights-process">
                            <h4>How to Exercise Your Rights</h4>
                            <p>To exercise any of these rights, please contact us through the platform&apos;s contact form. We will respond to all legitimate requests within 30 days.</p>
                        </div>
                    </section>

                    {/*  Changes to Policy  */}
                    <section id="changes" className="policy-section">
                        <h2 className="section-title">7. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy periodically to reflect changes in our practices or legal requirements:</p>
                        
                        <ul className="changes-list">
                            <li>We will notify users of significant changes via email or platform notification</li>
                            <li>The &quot;Last updated&quot; date at the top of this page will be revised</li>
                            <li>Continued use of IskoMo after changes constitutes acceptance</li>
                            <li>Previous versions of the policy will be archived</li>
                        </ul>
                        
                        <p>We encourage you to review this policy periodically to stay informed about how we protect your information.</p>
                    </section>

                    {/*  Contact Us  */}
                    <section id="contact" className="policy-section">
                        <h2 className="section-title">8. Contact Us</h2>
                        <p>If you have questions, concerns, or requests regarding this Privacy Policy or your personal data:</p>
                        
                        <div className="contact-info">
                            <div className="contact-method">
                                <h3>Platform Contact</h3>
                                <p>Use the contact form within the IskoMo platform</p>
                            </div>
                            
                            <div className="contact-method">
                                <h3>Email</h3>
                                <p>privacy@iskomo.ph (for privacy-specific inquiries)</p>
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
                        <button onClick={() => { /* generatePDF('privacy') */ }} className="action-btn primary">
                            <span className="btn-text">Download as PDF</span>
                        </button>
                        <Link href="/terms" className="action-btn secondary">
                            <span className="btn-text">View Terms & Conditions</span>
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
