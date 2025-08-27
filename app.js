// IMAGIFY - Professional AI Image Generator
// Developed by WaizMarco🌹

class ImagifyApp {
    constructor() {
        // Configuration
        this.config = {
            templatePrompts: [
                "Anime Girl/Boy Portrait",
                "Futuristic City / Cyberpunk Scene", 
                "Realistic Portrait / Artwork",
                "Fantasy Creature / Animal",
                "Digital Painting / Concept Art",
                "Sci-fi Landscape / Space Art",
                "Character Concept Art",
                "Abstract Digital Art"
            ],
            themes: {
                glass: {
                    name: "Glassmorphism",
                    bg: "linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))",
                    cardBg: "rgba(255,255,255,0.1)",
                    accent: "#00BFA6",
                    accentGlow: "rgba(0, 191, 166, 0.4)",
                    text: "#2D3748",
                    textSecondary: "#4A5568",
                    border: "rgba(255,255,255,0.2)"
                },
                neon: {
                    name: "Neon Cyber",
                    bg: "linear-gradient(135deg, #0a0a0a, #1a1a2e)",
                    cardBg: "rgba(26, 26, 46, 0.8)",
                    accent: "#39FF14",
                    accentGlow: "rgba(57, 255, 20, 0.5)",
                    text: "#E2E8F0",
                    textSecondary: "#A0AEC0",
                    border: "rgba(57, 255, 20, 0.3)"
                },
                anime: {
                    name: "Anime Glow",
                    bg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    cardBg: "rgba(255,255,255,0.15)",
                    accent: "#FF6B9D",
                    accentGlow: "rgba(255, 107, 157, 0.4)",
                    text: "#2D3748",
                    textSecondary: "#4A5568",
                    border: "rgba(255,255,255,0.3)"
                }
            },
            apiKeys: {
                huggingface: "YOUR_HF_API_KEY_HERE",
                deepai: "YOUR_DEEPAI_API_KEY_HERE"
            },
            settings: {
                defaultCredits: 2,
                unlockPassword: "marcowaizextra",
                themeRotationInterval: 45000,
                carouselInterval: 4000
            }
        };

        // State management
        this.state = {
            currentTheme: 'glass',
            currentCarouselIndex: 0,
            credits: this.getCredits(),
            isGenerating: false,
            themeRotationTimer: null,
            carouselTimer: null,
            unlimitedCredits: this.checkUnlimitedCredits()
        };

        // DOM elements cache
        this.elements = {};

        // Initialize the application
        this.init();
    }

    // Initialize the application
    init() {
        console.log('🎨 Initializing IMAGIFY...');
        
        // Cache DOM elements first
        this.cacheElements();
        
        // Initialize components
        this.initializeTheme();
        this.initializeCarousel();
        this.initializeEventListeners();
        this.initializeTemplatePrompts();
        this.updateCreditsDisplay();
        this.startThemeRotation();
        
        // Show welcome message
        setTimeout(() => {
            this.showToast('Welcome to IMAGIFY! 🎨', 'success');
        }, 1000);
        
        console.log('✅ IMAGIFY initialized successfully');
    }

    // Cache DOM elements for better performance
    cacheElements() {
        this.elements = {
            landingPage: document.getElementById('landingPage'),
            toolPage: document.getElementById('toolPage'),
            launchBtn: document.getElementById('launchBtn'),
            generateBtn: document.getElementById('generateBtn'),
            promptInput: document.getElementById('promptInput'),
            modelSelect: document.getElementById('modelSelect'),
            creditsCount: document.getElementById('creditsCount'),
            carouselTrack: document.getElementById('carouselTrack'),
            carouselDots: document.getElementById('carouselDots'),
            suggestionTags: document.getElementById('suggestionTags'),
            imageGrid: document.getElementById('imageGrid'),
            navOverlay: document.getElementById('navOverlay'),
            toastContainer: document.getElementById('toastContainer')
        };
        
        console.log('📋 DOM elements cached');
    }

    // Theme Management
    initializeTheme() {
        const savedTheme = localStorage.getItem('imagify-theme') || 'glass';
        this.setTheme(savedTheme);
        console.log(`🎨 Theme initialized: ${savedTheme}`);
    }

    setTheme(themeName) {
        if (!this.config.themes[themeName]) return;
        
        this.state.currentTheme = themeName;
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('imagify-theme', themeName);
        
        // Apply theme variables to CSS
        const theme = this.config.themes[themeName];
        const root = document.documentElement;
        
        root.style.setProperty('--theme-bg', theme.bg);
        root.style.setProperty('--theme-card-bg', theme.cardBg);
        root.style.setProperty('--theme-accent', theme.accent);
        root.style.setProperty('--theme-accent-glow', theme.accentGlow);
        root.style.setProperty('--theme-text', theme.text);
        root.style.setProperty('--theme-text-secondary', theme.textSecondary);
        root.style.setProperty('--theme-border', theme.border);
        
        console.log(`🎨 Theme set to: ${themeName}`);
    }

    startThemeRotation() {
        if (this.state.themeRotationTimer) {
            clearInterval(this.state.themeRotationTimer);
        }

        this.state.themeRotationTimer = setInterval(() => {
            const themeNames = Object.keys(this.config.themes);
            const currentIndex = themeNames.indexOf(this.state.currentTheme);
            const nextIndex = (currentIndex + 1) % themeNames.length;
            
            this.setTheme(themeNames[nextIndex]);
            this.showToast(`Theme switched to ${this.config.themes[themeNames[nextIndex]].name} 🎨`, 'success');
        }, this.config.settings.themeRotationInterval);
        
        console.log('🔄 Theme rotation started');
    }

    // Carousel Management
    initializeCarousel() {
        if (!this.elements.carouselTrack || !this.elements.carouselDots) {
            console.warn('Carousel elements not found');
            return;
        }

        // Create carousel items
        this.elements.carouselTrack.innerHTML = this.config.templatePrompts.map((prompt, index) => 
            `<div class="carousel-item">${prompt}</div>`
        ).join('');

        // Create dots
        this.elements.carouselDots.innerHTML = this.config.templatePrompts.map((_, index) => 
            `<div class="carousel-dot ${index === 0 ? 'active' : ''}" data-index="${index}"></div>`
        ).join('');

        // Add dot click listeners
        this.elements.carouselDots.addEventListener('click', (e) => {
            if (e.target.classList.contains('carousel-dot')) {
                const index = parseInt(e.target.dataset.index);
                this.goToCarouselSlide(index);
            }
        });

        this.startCarousel();
        console.log('🎠 Carousel initialized');
    }

    goToCarouselSlide(index) {
        if (!this.elements.carouselTrack) return;

        this.state.currentCarouselIndex = index;
        this.elements.carouselTrack.style.transform = `translateX(-${index * 100}%)`;

        // Update active dot
        const dots = this.elements.carouselDots?.querySelectorAll('.carousel-dot');
        dots?.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    }

    startCarousel() {
        if (this.state.carouselTimer) {
            clearInterval(this.state.carouselTimer);
        }

        this.state.carouselTimer = setInterval(() => {
            const nextIndex = (this.state.currentCarouselIndex + 1) % this.config.templatePrompts.length;
            this.goToCarouselSlide(nextIndex);
        }, this.config.settings.carouselInterval);
    }

    // Template Prompts
    initializeTemplatePrompts() {
        if (!this.elements.suggestionTags) return;

        this.elements.suggestionTags.innerHTML = this.config.templatePrompts.map(prompt => 
            `<span class="suggestion-tag" data-prompt="${prompt}">${prompt}</span>`
        ).join('');

        this.elements.suggestionTags.addEventListener('click', (e) => {
            if (e.target.classList.contains('suggestion-tag')) {
                if (this.elements.promptInput) {
                    this.elements.promptInput.value = e.target.dataset.prompt;
                    this.elements.promptInput.focus();
                    this.showToast('Template selected! 📝', 'success');
                }
            }
        });
        
        console.log('🏷️ Template prompts initialized');
    }

    // Event Listeners
    initializeEventListeners() {
        console.log('🔗 Setting up event listeners...');
        
        // Launch button - FIXED: Direct element reference
        if (this.elements.launchBtn) {
            this.elements.launchBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🚀 Launch button clicked');
                this.showToolPage();
            });
            console.log('✅ Launch button listener attached');
        } else {
            console.error('❌ Launch button not found');
        }

        // Generate button
        if (this.elements.generateBtn) {
            this.elements.generateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('🎨 Generate button clicked');
                this.generateImage();
            });
        }

        // Hamburger menus - FIXED: Better selector and delegation
        document.addEventListener('click', (e) => {
            if (e.target.closest('.hamburger')) {
                e.preventDefault();
                console.log('🍔 Hamburger menu clicked');
                this.toggleNavigation();
            }
        });

        // Navigation overlay
        if (this.elements.navOverlay) {
            this.elements.navOverlay.addEventListener('click', (e) => {
                if (e.target === this.elements.navOverlay || e.target.id === 'navCloseBtn') {
                    this.closeNavigation();
                }
            });
        }

        // Navigation links
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const page = e.target.dataset.page;
                this.navigateToPage(page);
            }
        });

        // Developer credit button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'devCreditBtn') {
                e.preventDefault();
                this.showModal('devModal');
            }
        });

        // Credits display (unlock modal)
        document.addEventListener('click', (e) => {
            if (e.target.closest('.credits-display')) {
                if (this.state.credits <= 0 && !this.state.unlimitedCredits) {
                    this.showModal('creditsModal');
                }
            }
        });

        // Unlock button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'unlockBtn') {
                e.preventDefault();
                this.unlockCredits();
            }
        });

        // Modal close buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-overlay')) {
                const modal = e.target.closest('.modal');
                if (modal) {
                    this.closeModal(modal.id);
                }
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
                this.closeNavigation();
            }
            
            // Theme switching shortcuts for development
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case '1':
                        e.preventDefault();
                        this.setTheme('glass');
                        this.showToast('Glass theme activated! ✨', 'success');
                        break;
                    case '2':
                        e.preventDefault();
                        this.setTheme('neon');
                        this.showToast('Neon theme activated! ⚡', 'success');
                        break;
                    case '3':
                        e.preventDefault();
                        this.setTheme('anime');
                        this.showToast('Anime theme activated! 🌸', 'success');
                        break;
                }
            }
        });
        
        console.log('✅ All event listeners attached');
    }

    // Navigation Management
    toggleNavigation() {
        if (!this.elements.navOverlay) {
            console.error('❌ Navigation overlay not found');
            return;
        }
        
        this.elements.navOverlay.classList.toggle('hidden');
        console.log('🔄 Navigation toggled');
    }

    closeNavigation() {
        if (this.elements.navOverlay) {
            this.elements.navOverlay.classList.add('hidden');
        }
    }

    navigateToPage(page) {
        this.closeNavigation();
        
        if (page === 'landing') {
            this.showLandingPage();
        } else {
            // For now, show toast for other pages
            const pageNames = {
                about: 'About',
                faq: 'FAQ', 
                contact: 'Contact'
            };
            this.showToast(`${pageNames[page]} page - Coming soon! 🚀`, 'info');
        }
    }

    showLandingPage() {
        console.log('🏠 Showing landing page');
        
        if (this.elements.landingPage && this.elements.toolPage) {
            this.elements.landingPage.classList.add('active');
            this.elements.toolPage.classList.remove('active');
            this.startCarousel();
            console.log('✅ Switched to landing page');
        } else {
            console.error('❌ Page elements not found');
        }
    }

    showToolPage() {
        console.log('🛠️ Showing tool page');
        
        if (this.elements.landingPage && this.elements.toolPage) {
            this.elements.landingPage.classList.remove('active');
            this.elements.toolPage.classList.add('active');
            
            // Stop carousel when on tool page
            if (this.state.carouselTimer) {
                clearInterval(this.state.carouselTimer);
            }
            
            this.showToast('Welcome to the Image Generator! 🎨', 'success');
            console.log('✅ Switched to tool page');
        } else {
            console.error('❌ Page elements not found for navigation');
        }
    }

    // Modal Management
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            console.log(`📋 Modal opened: ${modalId}`);
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            console.log(`📋 Modal closed: ${modalId}`);
        }
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    // Credits Management
    getCredits() {
        const saved = localStorage.getItem('imagify-credits');
        return saved ? parseInt(saved) : this.config.settings.defaultCredits;
    }

    updateCredits(amount) {
        if (this.state.unlimitedCredits) return;
        
        this.state.credits = Math.max(0, this.state.credits + amount);
        localStorage.setItem('imagify-credits', this.state.credits.toString());
        this.updateCreditsDisplay();
        
        console.log(`💰 Credits updated: ${this.state.credits}`);
    }

    updateCreditsDisplay() {
        if (this.elements.creditsCount) {
            this.elements.creditsCount.textContent = this.state.unlimitedCredits ? '∞' : this.state.credits;
        }
    }

    checkUnlimitedCredits() {
        return localStorage.getItem('imagify-unlimited') === 'true';
    }

    unlockCredits() {
        const passwordInput = document.getElementById('unlockPassword');
        if (!passwordInput) return;

        const password = passwordInput.value.trim();
        
        if (password === this.config.settings.unlockPassword) {
            this.state.unlimitedCredits = true;
            localStorage.setItem('imagify-unlimited', 'true');
            this.updateCreditsDisplay();
            this.closeModal('creditsModal');
            this.showToast('Unlimited credits unlocked! 🎉', 'success');
            passwordInput.value = '';
        } else {
            this.showToast('Invalid password. Contact WaizMarco🌹', 'error');
            passwordInput.value = '';
        }
    }

    // Image Generation
    async generateImage() {
        console.log('🎨 Starting image generation...');
        
        if (!this.elements.promptInput || !this.elements.modelSelect) {
            console.error('❌ Form elements not found');
            return;
        }

        const prompt = this.elements.promptInput.value.trim();
        if (!prompt) {
            this.showToast('Please enter a prompt first! 📝', 'error');
            return;
        }

        // Check credits
        if (this.state.credits <= 0 && !this.state.unlimitedCredits) {
            this.showModal('creditsModal');
            return;
        }

        if (this.state.isGenerating) return;

        // Start loading state
        this.state.isGenerating = true;
        this.setGeneratingState(true);

        try {
            const model = this.elements.modelSelect.value;
            console.log(`🤖 Using model: ${model}`);
            
            const imageBlob = await this.callImageAPI(model, prompt);
            
            if (imageBlob) {
                this.displayGeneratedImage(imageBlob, prompt);
                this.updateCredits(-1);
                this.showToast('Image generated successfully! 🎨', 'success');
            } else {
                throw new Error('Failed to generate image');
            }
        } catch (error) {
            console.error('Image generation error:', error);
            this.showToast('Server Error Contact WaizMarco🌹', 'error');
        } finally {
            this.state.isGenerating = false;
            this.setGeneratingState(false);
        }
    }

    setGeneratingState(isGenerating) {
        if (!this.elements.generateBtn) return;

        const btnText = this.elements.generateBtn.querySelector('.btn-text');
        const btnSpinner = this.elements.generateBtn.querySelector('.btn-spinner');
        
        if (btnText && btnSpinner) {
            if (isGenerating) {
                btnText.classList.add('hidden');
                btnSpinner.classList.remove('hidden');
                this.elements.generateBtn.disabled = true;
            } else {
                btnText.classList.remove('hidden');
                btnSpinner.classList.add('hidden');
                this.elements.generateBtn.disabled = false;
            }
        }
    }

    async callImageAPI(model, prompt) {
        // Check if API keys are still placeholders
        const apiKey = this.config.apiKeys[model === 'huggingface' ? 'huggingface' : 'deepai'];
        
        if (apiKey.includes('YOUR_') && apiKey.includes('_API_KEY_HERE')) {
            console.warn('⚠️ API key not configured, will show error');
            throw new Error('API key not configured');
        }

        try {
            if (model === 'huggingface') {
                return await this.callHuggingFaceAPI(prompt);
            } else {
                return await this.callDeepAIAPI(prompt);
            }
        } catch (error) {
            console.error('API call failed:', error);
            return null;
        }
    }

    async callHuggingFaceAPI(prompt) {
        const response = await fetch('https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.config.apiKeys.huggingface}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: prompt,
                parameters: {
                    num_inference_steps: 30,
                    guidance_scale: 7.5,
                    width: 512,
                    height: 512
                }
            }),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.blob();
    }

    async callDeepAIAPI(prompt) {
        const formData = new FormData();
        formData.append('text', prompt);

        const response = await fetch('https://api.deepai.org/api/text2img', {
            method: 'POST',
            headers: {
                'Api-Key': this.config.apiKeys.deepai,
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.output_url) {
            const imageResponse = await fetch(result.output_url);
            return await imageResponse.blob();
        }
        
        throw new Error('No image URL in response');
    }

    displayGeneratedImage(imageBlob, prompt) {
        if (!this.elements.imageGrid) return;

        // Remove placeholder if it exists
        const placeholder = this.elements.imageGrid.querySelector('.placeholder-message');
        if (placeholder) {
            placeholder.remove();
        }

        // Create image element
        const imageUrl = URL.createObjectURL(imageBlob);
        const imageItem = document.createElement('div');
        imageItem.className = 'image-item';
        imageItem.style.opacity = '0';
        imageItem.style.transform = 'translateY(20px)';
        
        imageItem.innerHTML = `
            <img src="${imageUrl}" alt="${prompt}" loading="lazy">
            <div class="image-actions">
                <button class="download-btn" data-url="${imageUrl}" data-prompt="${prompt}">
                    Download
                </button>
            </div>
        `;

        // Add download functionality
        const downloadBtn = imageItem.querySelector('.download-btn');
        downloadBtn.addEventListener('click', () => {
            this.downloadImage(imageUrl, prompt);
        });

        // Add to grid (prepend to show latest first)
        this.elements.imageGrid.insertBefore(imageItem, this.elements.imageGrid.firstChild);

        // Animate in
        setTimeout(() => {
            imageItem.style.opacity = '1';
            imageItem.style.transform = 'translateY(0)';
        }, 100);
    }

    downloadImage(imageUrl, prompt) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `imagify-${prompt.replace(/[^a-z0-9]/gi, '-').toLowerCase()}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        this.showToast('Image downloaded! 📥', 'success');
    }

    // Toast Notifications
    showToast(message, type = 'info', duration = 3000) {
        if (!this.elements.toastContainer) {
            console.warn('Toast container not found');
            return;
        }

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;

        this.elements.toastContainer.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    }

    // Cleanup
    destroy() {
        if (this.state.themeRotationTimer) {
            clearInterval(this.state.themeRotationTimer);
        }
        if (this.state.carouselTimer) {
            clearInterval(this.state.carouselTimer);
        }
        console.log('🧹 IMAGIFY cleaned up');
    }
}

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 DOM Content Loaded - Initializing IMAGIFY...');
    
    // Initialize the app
    window.imagifyApp = new ImagifyApp();
    
    // Development helpers
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
        console.log('🎨 IMAGIFY Development Mode');
        console.log('Available commands:');
        console.log('- imagifyApp.setTheme("glass|neon|anime")');
        console.log('- imagifyApp.updateCredits(amount)');
        console.log('- imagifyApp.showToast(message, type)');
        console.log('- Ctrl/Cmd + 1,2,3 for theme switching');
    }
});

// Error Handling
window.addEventListener('error', (e) => {
    console.error('❌ Global error:', e.error);
    if (window.imagifyApp) {
        window.imagifyApp.showToast('An error occurred. Please refresh the page.', 'error');
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('❌ Unhandled promise rejection:', e.reason);
    if (window.imagifyApp) {
        window.imagifyApp.showToast('A network error occurred.', 'error');
    }
});

// Service Worker Registration (optional - for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment below if you want to add service worker
        // navigator.serviceWorker.register('/sw.js')
        //     .then((registration) => {
        //         console.log('SW registered: ', registration);
        //     })
        //     .catch((registrationError) => {
        //         console.log('SW registration failed: ', registrationError);
        //     });
    });
}

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log(`⚡ Page loaded in ${perfData.loadEventEnd - perfData.fetchStart}ms`);
        }, 0);
    });
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ImagifyApp;
}