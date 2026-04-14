// Loading Screen Utility for IskoMo
// Provides smooth loading transitions and page load management

class LoadingScreen {
    constructor() {
        this.overlay = null;
        this.isVisible = false;
        this.init();
    }

    init() {
        // Create overlay element if it doesn't exist
        this.overlay = document.getElementById('pageLoadOverlay') || this.createOverlay();
    }

    createOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'pageLoadOverlay';
        overlay.className = 'page-load-overlay';
        overlay.innerHTML = `
            <div class="transition-content">
                <div class="transition-logo">
                    <img src="../assets/Gemini_Generated_Image_b3g7t6b3g7t6b3g7-removebg-preview.png" alt="IskoMo Logo">
                </div>
                <div class="transition-text">IskoMo</div>
                <div class="transition-loader">
                    <div class="loader-spinner"></div>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        return overlay;
    }

    show() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        this.overlay.classList.add('active');
        document.body.classList.add('loading');
    }

    hide() {
        if (!this.isVisible) return;
        
        this.isVisible = false;
        this.overlay.classList.remove('active');
        this.overlay.classList.add('fade-out');
        document.body.classList.remove('loading');
        
        // Remove fade-out class after animation
        setTimeout(() => {
            this.overlay.classList.remove('fade-out');
        }, 300);
    }

    // Auto-hide after specified duration
    autoHide(duration = 2000) {
        setTimeout(() => {
            this.hide();
        }, duration);
    }
}

// Initialize loading screen
const loadingScreen = new LoadingScreen();

// Auto-initialize on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
    // Show loading screen briefly then hide
    loadingScreen.show();
    loadingScreen.autoHide(1500);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingScreen;
}
