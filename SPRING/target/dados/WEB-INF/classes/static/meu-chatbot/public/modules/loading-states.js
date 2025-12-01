// Loading states and skeleton screens module
class LoadingStates {
    constructor() {
        this.skeletonStyles = `
            .skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
                border-radius: 4px;
                color: transparent;
            }

            .dark-mode .skeleton {
                background: linear-gradient(90deg, #2c3e50 25%, #34495e 50%, #2c3e50 75%);
            }

            @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }

            .loader {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 12px;
                font-weight: 500;
            }

            .loader::after {
                content: "";
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid var(--primary);
                border-top: 3px solid transparent;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;

        this.init();
    }

    init() {
        this.injectStyles();
    }

    injectStyles() {
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = this.skeletonStyles;
            document.head.appendChild(style);
        }
    }

    // Show loading state for a specific element
    showLoading(element, message = 'Carregando...') {
        if (!element) return;

        const originalContent = element.innerHTML;
        element.setAttribute('data-original-content', originalContent);
        
        element.innerHTML = `
            <div class="loader">
                ${message}
            </div>
        `;
        
        return () => {
            element.innerHTML = originalContent;
            element.removeAttribute('data-original-content');
        };
    }

    // Show skeleton screen for multiple elements
    showSkeleton(elements, type = 'text') {
        const originalContents = [];
        
        elements.forEach((element, index) => {
            if (!element) return;
            
            originalContents[index] = element.innerHTML;
            element.setAttribute('data-original-content', originalContents[index]);
            
            switch (type) {
                case 'text':
                    element.innerHTML = '<div class="skeleton" style="height: 1em; width: 80%;"></div>';
                    break;
                case 'card':
                    element.innerHTML = `
                        <div class="skeleton" style="height: 100px; width: 100%; border-radius: 8px;"></div>
                    `;
                    break;
                case 'button':
                    element.innerHTML = '<div class="skeleton" style="height: 40px; width: 120px; border-radius: 20px;"></div>';
                    break;
                default:
                    element.innerHTML = '<div class="skeleton" style="height: 1em; width: 80%;"></div>';
            }
        });

        return () => {
            elements.forEach((element, index) => {
                if (element && originalContents[index]) {
                    element.innerHTML = originalContents[index];
                    element.removeAttribute('data-original-content');
                }
            });
        };
    }

    // Create a loading overlay
    createOverlay(message = 'Processando...') {
        const overlay = document.createElement('div');
        overlay.className = 'loading-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 9999;
            backdrop-filter: blur(5px);
        `;

        const spinner = document.createElement('div');
        spinner.className = 'loading-spinner';
        spinner.style.cssText = `
            background: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        `;

        spinner.innerHTML = `
            <div style="font-size: 2rem; margin-bottom: 15px; color: var(--primary);">
                <i class="fas fa-spinner loading"></i>
            </div>
            <div style="color: var(--dark); font-weight: 500;">${message}</div>
        `;

        overlay.appendChild(spinner);
        document.body.appendChild(overlay);

        return () => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
        };
    }

    // Show loading for API calls
    async withLoading(promise, options = {}) {
        const {
            element = null,
            message = 'Carregando...',
            type = 'overlay'
        } = options;

        let hideLoading = null;

        try {
            if (type === 'overlay') {
                hideLoading = this.createOverlay(message);
            } else if (element && type === 'skeleton') {
                hideLoading = this.showSkeleton([element]);
            } else if (element) {
                hideLoading = this.showLoading(element, message);
            }

            const result = await promise;
            return result;
        } catch (error) {
            console.error('Error in withLoading:', error);
            throw error;
        } finally {
            if (hideLoading) {
                hideLoading();
            }
        }
    }
}

// Initialize loading states
const loadingStates = new LoadingStates();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = loadingStates;
}
