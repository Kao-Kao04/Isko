/**
 * PDF Generator for Legal Pages
 * Uses html2pdf.js library
 */

function generatePDF(pageType) {
    const element = document.querySelector('.legal-content');
    if (!element) {
        showErrorMessage('Content not found. Please refresh the page and try again.');
        return;
    }
    
    const filename = pageType === 'privacy' 
        ? 'IskoMo-Privacy-Policy.pdf' 
        : 'IskoMo-Terms-Conditions.pdf';
    
    // Show loading
    showLoading();
    
    // PDF options
    const options = {
        margin: [15, 15, 15, 15],
        filename: filename,
        image: { 
            type: 'jpeg', 
            quality: 0.98 
        },
        html2canvas: { 
            scale: 2,
            useCORS: true,
            logging: false,
            letterRendering: true,
            windowWidth: 1200
        },
        jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait' 
        }
    };
    
    // Generate PDF
    html2pdf()
        .set(options)
        .from(element)
        .save()
        .then(() => {
            hideLoading();
            showSuccessMessage('PDF downloaded successfully!');
        })
        .catch(error => {
            hideLoading();
            console.error('PDF generation error:', error);
            showErrorMessage('Failed to generate PDF. Please try using the Print option instead.');
        });
}

function showLoading() {
    // Remove existing loading if any
    const existing = document.getElementById('pdf-loading');
    if (existing) {
        existing.remove();
    }
    
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'pdf-loading';
    loadingDiv.innerHTML = `
        <div class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Generating PDF...</p>
        </div>
    `;
    document.body.appendChild(loadingDiv);
}

function hideLoading() {
    const loadingDiv = document.getElementById('pdf-loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

function showSuccessMessage(message) {
    showNotification(message, 'success');
}

function showErrorMessage(message) {
    showNotification(message, 'error');
}

function showNotification(message, type) {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) {
        existing.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span class="notification-icon">${type === 'success' ? '✓' : '×'}</span>
        <span class="notification-text">${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    }, 3000);
}

