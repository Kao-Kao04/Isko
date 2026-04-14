/**
 * IskoMo Sponsor Dashboard - Main JavaScript
 * Handles common interactivity across all sponsor pages
 */

(function() {
    'use strict';

    /**
     * Initialize all dashboard functionality
     */
    function initDashboard() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupDashboard);
        } else {
            setupDashboard();
        }
    }

    /**
     * Setup dashboard components
     */
    function setupDashboard() {
        setupProfileDropdown();
        setupNotificationDropdown();
        setupSearch();
        setupLogout();
    }

    /**
     * Profile dropdown toggle
     */
    function setupProfileDropdown() {
        const profileTrigger = document.getElementById('profileTrigger');
        const profileDropdown = document.getElementById('profileDropdown');

        if (!profileTrigger || !profileDropdown) return;

        profileTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            const isOpen = profileDropdown.classList.contains('show');
            
            // Close all dropdowns
            closeAllDropdowns();
            
            if (!isOpen) {
                profileDropdown.classList.add('show');
            }
        });

        // Close on outside click
        document.addEventListener('click', function(e) {
            if (!profileTrigger.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.remove('show');
            }
        });
    }

    /**
     * Notification dropdown toggle
     */
    function setupNotificationDropdown() {
        const notificationTrigger = document.getElementById('notificationTrigger');
        const notificationMenu = document.getElementById('notificationMenu');

        if (!notificationTrigger) return;

        notificationTrigger.addEventListener('click', function(e) {
            e.stopPropagation();
            if (notificationMenu) {
                const isOpen = notificationMenu.classList.contains('open');
                closeAllDropdowns();
                if (!isOpen) {
                    notificationMenu.classList.add('open');
                }
            }
        });

        // Close on outside click
        if (notificationMenu) {
            document.addEventListener('click', function(e) {
                if (!notificationTrigger.contains(e.target) && !notificationMenu.contains(e.target)) {
                    notificationMenu.classList.remove('open');
                }
            });
        }
    }

    /**
     * Close all dropdowns
     */
    function closeAllDropdowns() {
        document.querySelectorAll('.dropdown-menu.show, .notification-menu.open').forEach(dropdown => {
            dropdown.classList.remove('show', 'open');
        });
    }

    /**
     * Search functionality (placeholder)
     */
    function setupSearch() {
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;

        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.trim();
                if (query) {
                    // Search functionality would go here
                    console.log('Searching for:', query);
                }
            }
        });
    }

    /**
     * Logout functionality
     */
    function setupLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (!logoutBtn) return;

        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('Are you sure you want to sign out?')) {
                // Logout logic would go here
                window.location.href = '../../auth.html';
            }
        });
    }

    /**
     * Filter buttons functionality
     */
    function setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                const filter = this.dataset.filter;
                // Filter logic would go here (static for now)
                console.log('Filter:', filter);
            });
        });
    }

    /**
     * Initialize filters if they exist
     */
    function initFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        if (filterButtons.length > 0) {
            setupFilters();
        }
    }

    // Initialize dashboard
    initDashboard();
    
    // Initialize filters after a short delay to ensure DOM is ready
    setTimeout(initFilters, 100);
})();

