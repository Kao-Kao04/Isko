/**
 * IskoMo Sponsor Dashboard - Database Connection
 * Shared Supabase connection and common database operations for sponsor pages
 */

// Initialize Supabase
const supabaseUrl = 'https://ksmdqexfwpbnuidlldcd.supabase.co';
const supabaseKey = 'sb_publishable_VRsdXgk-HaskGn7VzHt4rw_NVUQeFpS';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// Global variables
let currentUser = null;

/**
 * Initialize sponsor page with authentication and profile loading
 */
async function initSponsorPage() {
    try {
        // Check if user is authenticated
        const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
        
        if (sessionError || !session) {
            window.location.href = '../../auth.html';
            return false;
        }

        currentUser = session.user;

        // Load user profile
        const { data: profile, error: profileError } = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();

        if (profileError) {
            console.error('Error loading profile:', profileError);
        } else {
            updateProfileInfo(profile);
        }

        return true;
    } catch (error) {
        console.error('Error initializing sponsor page:', error);
        return false;
    }
}

/**
 * Update profile information in the UI
 */
function updateProfileInfo(profile) {
    // Update profile avatars
    const avatars = document.querySelectorAll('[id*="profileAvatar"], [id*="leftProfileAvatar"]');
    avatars.forEach(avatar => {
        avatar.textContent = profile.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'SP';
    });

    // Update profile names
    const names = document.querySelectorAll('[id*="profileName"], [id*="leftProfileName"]');
    names.forEach(name => {
        name.textContent = profile.full_name || 'Scholarship Provider';
    });

    // Update profile course/headline
    const courses = document.querySelectorAll('[id*="profileCourse"], [id*="leftProfileCourse"]');
    courses.forEach(course => {
        course.textContent = profile.headline || 'Sponsor Account';
    });
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    try {
        // Get total applicants
        const { data: applicants, error: applicantsError } = await supabaseClient
            .from('applications')
            .select('count', { count: 'exact' });

        // Get active scholarships
        const { data: scholarships, error: scholarshipsError } = await supabaseClient
            .from('scholarships')
            .select('count', { count: 'exact' })
            .eq('status', 'active');

        // Get approved applications
        const { data: approved, error: approvedError } = await supabaseClient
            .from('applications')
            .select('count', { count: 'exact' })
            .eq('status', 'approved');

        // Get pending applications
        const { data: pending, error: pendingError } = await supabaseClient
            .from('applications')
            .select('count', { count: 'exact' })
            .eq('status', 'pending');

        // Update stats
        const statCards = document.querySelectorAll('.stat-card');
        if (statCards.length > 0 && !applicantsError) {
            statCards[0].querySelector('.stat-value').textContent = applicants.length || 0;
        }
        if (statCards.length > 1 && !scholarshipsError) {
            statCards[1].querySelector('.stat-value').textContent = scholarships.length || 0;
        }
        if (statCards.length > 2 && !approvedError) {
            statCards[2].querySelector('.stat-value').textContent = approved.length || 0;
        }
        if (statCards.length > 3 && !pendingError) {
            statCards[3].querySelector('.stat-value').textContent = pending.length || 0;
        }

        return {
            total: applicants.length || 0,
            scholarships: scholarships.length || 0,
            approved: approved.length || 0,
            pending: pending.length || 0
        };

    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        return null;
    }
}

/**
 * Load recent activity
 */
async function loadRecentActivity() {
    try {
        const { data: activities, error } = await supabaseClient
            .from('applications')
            .select(`
                *,
                scholarships(title),
                profiles(full_name)
            `)
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) {
            console.error('Error loading recent activity:', error);
            return [];
        }

        return activities;

    } catch (error) {
        console.error('Error loading recent activity:', error);
        return [];
    }
}

/**
 * Load announcements
 */
async function loadAnnouncements() {
    try {
        const { data: announcements, error } = await supabaseClient
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(3);

        if (error) {
            console.error('Error loading announcements:', error);
            return [];
        }

        return announcements;

    } catch (error) {
        console.error('Error loading announcements:', error);
        return [];
    }
}

/**
 * Load upcoming deadlines
 */
async function loadDeadlines() {
    try {
        const { data: scholarships, error } = await supabaseClient
            .from('scholarships')
            .select('*')
            .eq('status', 'active')
            .order('deadline', { ascending: true })
            .limit(2);

        if (error) {
            console.error('Error loading deadlines:', error);
            return [];
        }

        return scholarships;

    } catch (error) {
        console.error('Error loading deadlines:', error);
        return [];
    }
}

/**
 * Load applicants with filtering options
 */
async function loadApplicants(filters = {}) {
    try {
        let query = supabaseClient
            .from('applications')
            .select(`
                *,
                scholarships(title),
                profiles(full_name, school, program)
            `);

        // Apply filters
        if (filters.status && filters.status !== 'all') {
            query = query.eq('status', filters.status);
        }
        if (filters.scholarship && filters.scholarship !== 'all') {
            query = query.eq('scholarship_id', filters.scholarship);
        }
        if (filters.search) {
            query = query.or(`profiles.full_name.ilike.%${filters.search}%,scholarships.title.ilike.%${filters.search}%,profiles.school.ilike.%${filters.search}%`);
        }

        const { data: applicants, error } = await query.order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading applicants:', error);
            return [];
        }

        return applicants;

    } catch (error) {
        console.error('Error loading applicants:', error);
        return [];
    }
}

/**
 * Format date helper
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined 
    });
}

/**
 * Get status class for badge
 */
function getStatusClass(status) {
    const statusMap = {
        'pending': 'warning',
        'under_review': 'info',
        'approved': 'success',
        'rejected': 'danger'
    };
    return statusMap[status] || 'info';
}

/**
 * Logout functionality
 */
async function handleLogout() {
    try {
        await supabaseClient.auth.signOut();
        window.location.href = '../../auth.html';
    } catch (error) {
        console.error('Error signing out:', error);
    }
}

// Export functions for use in individual pages
window.SponsorDB = {
    initSponsorPage,
    loadDashboardStats,
    loadRecentActivity,
    loadAnnouncements,
    loadDeadlines,
    loadApplicants,
    formatDate,
    getStatusClass,
    handleLogout,
    supabaseClient,
    currentUser: () => currentUser
};
