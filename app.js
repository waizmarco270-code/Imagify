// API Keys and Constants
const HF_KEY = "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";
const DEEPAI_KEY = "8e209e84-ed45-45df-a1b6-9a41b3add42d";
const UNLOCK_PASSWORD = "marcowaizextra";
const DEFAULT_CREDITS = 2;

// Template prompts for carousel and placeholder cycling
const templatePrompts = [
    "Anime Girl/Boy Portrait",
    "Futuristic City / Cyberpunk Scene", 
    "Realistic Portrait / Artwork",
    "Fantasy Creature / Animal",
    "Digital Painting / Concept Art"
];

// Theme configurations
const themes = {
    glass: {
        bg: "rgba(255,255,255,0.3)",
        card: "rgba(255,255,255,0.15)", 
        accent: "#00BFA6",
        glow: "rgba(255,255,255,0.6)",
        text: "#111"
    },
    neon: {
        bg: "#010409",
        card: "#0D0D0D",
        accent: "#39FF14", 
        glow: "#39FF1499",
        text: "#E0E0E0"
    },
    anime: {
        bg: "#F8F0FF",
        card: "#FFFFFF",
        accent: "#FF66CC",
        glow: "#FF66CC55", 
        text: "#222"
    }
};

// Global state
let currentThemeIndex = 0;
let currentCarouselIndex = 0;
let currentPromptIndex = 0;
let themeRotationInterval;
let carouselInterval;
let promptInterval;

// DOM Elements
let landingPage, mainTool, launchButton, creditPill, tipText, generateBtn;
let promptTextarea, modelSelect, imageGrid, loadingSpinner, toast, toastMessage;
let creditModal, creditLink, modalClose, unlockModal, unlockModalClose;
let unlockPassword, unlockBtn, hamburgerBtn, navOverlay, navClose;
let navLinks, pageContent, homeButton;

/**
 * Initialize the application on page load
 */
function initApp() {
    // Get DOM elements
    getDOMElements();
    
    // Initialize credits from localStorage or set default
    if (!localStorage.getItem('credit')) {
        localStorage.setItem('credit', DEFAULT_CREDITS);
    }
    updateCreditDisplay();
    
    // Start theme auto-rotation
    startThemeRotation();
    
    // Start carousel animation
    startCarousel();
    
    // Start prompt placeholder cycling
    startPromptCycling();
    
    // Set up event listeners
    setupEventListeners();
    
    console.log('IMAGIFY app initialized successfully');
}

/**
 * Get all DOM elements and store them in variables
 */
function getDOMElements() {
    landingPage = document.getElementById('landingPage');
    mainTool = document.getElementById('mainTool');
    launchButton = document.getElementById('launchButton');
    homeButton = document.getElementById('homeButton');
    creditPill = document.getElementById('creditPill');
    tipText = document.getElementById('tipText');
    generateBtn = document.getElementById('generateBtn');
    promptTextarea = document.getElementById('prompt');
    modelSelect = document.getElementById('modelSelect');
    imageGrid = document.getElementById('imageGrid');
    loadingSpinner = document.getElementById('loadingSpinner');
    toast = document.getElementById('toast');
    toastMessage = document.getElementById('toastMessage');
    
    // Modal elements
    creditModal = document.getElementById('creditModal');
    creditLink = document.getElementById('creditLink');
    modalClose = document.getElementById('modalClose');
    unlockModal = document.getElementById('unlockModal');
    unlockModalClose = document.getElementById('unlockModalClose');
    unlockPassword = document.getElementById('unlockPassword');
    unlockBtn = document.getElementById('unlockBtn');
    
    // Navigation elements
    hamburgerBtn = document.getElementById('hamburgerBtn');
    navOverlay = document.getElementById('navOverlay');
    navClose = document.getElementById('navClose');
    navLinks = document.querySelectorAll('.nav-link');
    pageContent = document.getElementById('pageContent');
}

/**
 * Set up all event listeners for the application
 */
function setupEventListeners() {
    // Launch button
    if (launchButton) launchButton.addEventListener('click', showMainTool);
    
    // Home button (return to landing page)
    if (homeButton) homeButton.addEventListener('click', showLandingPage);
    
    // Generate button
    if (generateBtn) generateBtn.addEventListener('click', handleGenerate);
    
    // Modal controls
    if (creditLink) creditLink.addEventListener('click', (e) => {
        e.preventDefault();
        showModal(creditModal);
    });
    if (modalClose) modalClose.addEventListener('click', () => hideModal(creditModal));
    if (unlockModalClose) unlockModalClose.addEventListener('click', () => hideModal(unlockModal));
    if (unlockBtn) unlockBtn.addEventListener('click', handleUnlock);
    
    // Navigation
    if (hamburgerBtn) hamburgerBtn.addEventListener('click', () => showOverlay(navOverlay));
    if (navClose) navClose.addEventListener('click', () => hideOverlay(navOverlay));
    if (navOverlay) {
        navOverlay.addEventListener('click', (e) => {
            if (e.target === navOverlay) hideOverlay(navOverlay);
        });
    }
    
    // Navigation links
    if (navLinks) {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.target.dataset.page;
                navigateToPage(page);
                hideOverlay(navOverlay);
            });
        });
    }
    
    // Modal backdrop clicks
    if (creditModal) {
        creditModal.addEventListener('click', (e) => {
            if (e.target === creditModal) hideModal(creditModal);
        });
    }
    if (unlockModal) {
        unlockModal.addEventListener('click', (e) => {
            if (e.target === unlockModal) hideModal(unlockModal);
        });
    }
    
    // Enter key for unlock password
    if (unlockPassword) {
        unlockPassword.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleUnlock();
        });
    }
}

/**
 * Change theme and apply CSS custom properties
 * @param {string} themeName - Name of the theme to apply
 */
function changeTheme(themeName) {
    const theme = themes[themeName];
    if (!theme) return;
    
    const root = document.documentElement;
    const body = document.body;
    
    // Apply theme custom properties
    root.style.setProperty('--bg', theme.bg);
    root.style.setProperty('--card', theme.card);
    root.style.setProperty('--accent', theme.accent);
    root.style.setProperty('--glow', theme.glow);
    root.style.setProperty('--text', theme.text);
    
    // Update data-theme attribute
    body.setAttribute('data-theme', themeName);
    
    console.log(`Theme changed to: ${themeName}`);
}

/**
 * Start automatic theme rotation every 30 seconds
 */
function startThemeRotation() {
    const themeNames = Object.keys(themes);
    
    // Set initial theme
    changeTheme(themeNames[currentThemeIndex]);
    
    themeRotationInterval = setInterval(() => {
        currentThemeIndex = (currentThemeIndex + 1) % themeNames.length;
        changeTheme(themeNames[currentThemeIndex]);
    }, 30000); // 30 seconds
}

/**
 * Start carousel animation - fade items every 4 seconds
 */
function startCarousel() {
    const carouselItems = document.querySelectorAll('.carousel-item');
    if (!carouselItems.length) return;
    
    carouselInterval = setInterval(() => {
        // Remove active class from current item
        carouselItems[currentCarouselIndex].classList.remove('active');
        
        // Move to next item
        currentCarouselIndex = (currentCarouselIndex + 1) % carouselItems.length;
        
        // Add active class to new item
        carouselItems[currentCarouselIndex].classList.add('active');
    }, 4000); // 4 seconds
}

/**
 * Start cycling through prompts in textarea placeholder
 */
function startPromptCycling() {
    if (!promptTextarea) return;
    
    promptInterval = setInterval(() => {
        currentPromptIndex = (currentPromptIndex + 1) % templatePrompts.length;
        promptTextarea.placeholder = templatePrompts[currentPromptIndex];
    }, 4000); // 4 seconds
}

/**
 * Show the main tool interface and hide landing page
 */
function showMainTool() {
    if (landingPage) landingPage.classList.add('hidden');
    if (mainTool) mainTool.classList.remove('hidden');
    
    // Rotate theme on page switch
    const themeNames = Object.keys(themes);
    currentThemeIndex = (currentThemeIndex + 1) % themeNames.length;
    changeTheme(themeNames[currentThemeIndex]);
}

/**
 * Show the landing page and hide main tool
 */
function showLandingPage() {
    if (mainTool) mainTool.classList.add('hidden');
    if (landingPage) landingPage.classList.remove('hidden');
    
    // Rotate theme on page switch
    const themeNames = Object.keys(themes);
    currentThemeIndex = (currentThemeIndex + 1) % themeNames.length;
    changeTheme(themeNames[currentThemeIndex]);
}

/**
 * Update credit display in pill and tip text
 */
function updateCreditDisplay() {
    const credits = parseInt(localStorage.getItem('credit'));
    if (creditPill) creditPill.textContent = `Credits: ${credits}`;
    if (tipText) {
        tipText.textContent = `Write your idea in detail. You have ${credits === 9999 ? 'unlimited' : credits} free credits.`;
    }
}

/**
 * Handle image generation button click
 */
async function handleGenerate() {
    const credits = parseInt(localStorage.getItem('credit'));
    const prompt = promptTextarea ? promptTextarea.value.trim() : '';
    const model = modelSelect ? modelSelect.value : 'Hugging Face';
    
    // Check if prompt is provided
    if (!prompt) {
        showToast('Please enter a prompt to generate an image');
        return;
    }
    
    // Check credits
    if (credits <= 0) {
        showModal(unlockModal);
        return;
    }
    
    // Disable button during generation
    if (generateBtn) {
        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';
    }
    
    try {
        // Show loading spinner
        showOverlay(loadingSpinner);
        
        // Generate image
        const imageUrl = await generateImage(prompt, model);
        
        // Create image card
        createImageCard(imageUrl, prompt);
        
        // Decrement credits (unless unlimited)
        if (credits !== 9999) {
            localStorage.setItem('credit', credits - 1);
            updateCreditDisplay();
        }
        
        showToast('Image generated successfully!');
        
    } catch (error) {
        console.error('Generation failed:', error);
        
        // Create a fallback demo image
        const fallbackUrl = createFallbackImage(prompt);
        createImageCard(fallbackUrl, prompt);
        
        // Still decrement credits for demo
        if (credits !== 9999) {
            localStorage.setItem('credit', credits - 1);
            updateCreditDisplay();
        }
        
        showToast('Demo image created (API unavailable)');
    } finally {
        // Hide loading and re-enable button
        hideOverlay(loadingSpinner);
        if (generateBtn) {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Image';
        }
    }
}

/**
 * Generate image using selected API
 * @param {string} prompt - Text prompt for image generation
 * @param {string} model - Selected model ('Hugging Face' or 'DeepAI')
 * @returns {Promise<string>} - Image URL
 */
async function generateImage(prompt, model) {
    console.log(`Generating image with ${model}: "${prompt}"`);
    
    if (model === 'Hugging Face') {
        return await generateWithHuggingFace(prompt);
    } else if (model === 'DeepAI') {
        return await generateWithDeepAI(prompt);
    } else {
        throw new Error('Invalid model selected');
    }
}

/**
 * Generate image using Hugging Face API
 * @param {string} prompt - Text prompt
 * @returns {Promise<string>} - Image blob URL
 */
async function generateWithHuggingFace(prompt) {
    const response = await fetch('https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-2', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_KEY}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            inputs: prompt
        })
    });
    
    if (!response.ok) {
        throw new Error('Hugging Face API request failed');
    }
    
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}

/**
 * Generate image using DeepAI API
 * @param {string} prompt - Text prompt
 * @returns {Promise<string>} - Image URL
 */
async function generateWithDeepAI(prompt) {
    const formData = new FormData();
    formData.append('text', prompt);
    
    const response = await fetch('https://api.deepai.org/api/text2img', {
        method: 'POST',
        headers: {
            'api-key': DEEPAI_KEY
        },
        body: formData
    });
    
    if (!response.ok) {
        throw new Error('DeepAI API request failed');
    }
    
    const data = await response.json();
    return data.output_url;
}

/**
 * Create fallback demo image when APIs are unavailable
 * @param {string} prompt - Original prompt
 * @returns {string} - Data URL of generated placeholder
 */
function createFallbackImage(prompt) {
    // Create a simple canvas-based placeholder image
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 400, 400);
    gradient.addColorStop(0, '#4F46E5');
    gradient.addColorStop(0.5, '#7C3AED');
    gradient.addColorStop(1, '#EC4899');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 400);
    
    // Add text
    ctx.fillStyle = 'white';
    ctx.font = '24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('DEMO IMAGE', 200, 180);
    
    ctx.font = '16px Arial';
    ctx.fillText('Generated for:', 200, 220);
    
    // Wrap prompt text
    const words = prompt.split(' ');
    const maxWordsPerLine = 4;
    let y = 250;
    for (let i = 0; i < words.length; i += maxWordsPerLine) {
        const line = words.slice(i, i + maxWordsPerLine).join(' ');
        ctx.fillText(line, 200, y);
        y += 25;
        if (y > 350) break; // Don't overflow
    }
    
    return canvas.toDataURL();
}

/**
 * Create and display an image card in the output section
 * @param {string} imageUrl - URL of the generated image
 * @param {string} prompt - Original prompt used
 */
function createImageCard(imageUrl, prompt) {
    if (!imageGrid) return;
    
    const card = document.createElement('div');
    card.className = 'card';
    
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = `Generated image: ${prompt}`;
    img.loading = 'lazy';
    
    const downloadBtn = document.createElement('button');
    downloadBtn.className = 'download-btn';
    downloadBtn.textContent = 'Download';
    downloadBtn.addEventListener('click', () => downloadImage(imageUrl));
    
    card.appendChild(img);
    card.appendChild(downloadBtn);
    
    // Insert at the beginning of the grid
    imageGrid.insertBefore(card, imageGrid.firstChild);
}

/**
 * Download image with timestamped filename
 * @param {string} imageUrl - URL of the image to download
 */
async function downloadImage(imageUrl) {
    try {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `waizmarco_image_${Date.now()}.png`;
        
        // Programmatically click the link
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the blob URL
        URL.revokeObjectURL(link.href);
        
        showToast('Image downloaded successfully!');
    } catch (error) {
        console.error('Download failed:', error);
        showToast('Failed to download image');
    }
}

/**
 * Handle unlock button click
 */
function handleUnlock() {
    const password = unlockPassword ? unlockPassword.value.trim() : '';
    
    if (password === UNLOCK_PASSWORD) {
        localStorage.setItem('credit', '9999');
        updateCreditDisplay();
        hideModal(unlockModal);
        if (unlockPassword) unlockPassword.value = '';
        showToast('Unlimited credits unlocked! 🎉');
    } else {
        showToast('Invalid unlock code');
        if (unlockPassword) unlockPassword.value = '';
    }
}

/**
 * Navigate to different pages within the app
 * @param {string} page - Page name to navigate to
 */
function navigateToPage(page) {
    if (!pageContent) return;
    
    let content = '';
    
    switch (page) {
        case 'home':
            content = `
                <div class="generator-section">
                    <div class="form-group">
                        <label for="modelSelect" class="form-label">Select Model:</label>
                        <select id="modelSelect" class="form-control">
                            <option value="Hugging Face">Hugging Face</option>
                            <option value="DeepAI">DeepAI</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="prompt" class="form-label">Enter your prompt:</label>
                        <textarea id="prompt" class="form-control prompt-textarea" rows="4" placeholder="${templatePrompts[currentPromptIndex]}"></textarea>
                    </div>
                    
                    <button id="generateBtn" class="btn btn--primary generate-btn">Generate Image</button>
                    
                    <p class="tip-text" id="tipText">Write your idea in detail. You have ${parseInt(localStorage.getItem('credit')) === 9999 ? 'unlimited' : localStorage.getItem('credit')} free credits.</p>
                </div>

                <div id="output" class="output-section">
                    <h3>Generated Images</h3>
                    <div id="imageGrid" class="image-grid"></div>
                </div>
            `;
            break;
            
        case 'about':
            content = `
                <div class="generator-section">
                    <h2>About IMAGIFY</h2>
                    <p>IMAGIFY is a powerful AI-powered image generation tool that brings your imagination to life. Using state-of-the-art machine learning models, we transform your text descriptions into stunning visual artwork.</p>
                    
                    <h3>Features</h3>
                    <ul style="margin: 16px 0; padding-left: 24px;">
                        <li>Multiple AI models (Hugging Face, DeepAI)</li>
                        <li>High-quality image generation</li>
                        <li>Instant download capability</li>
                        <li>Beautiful, responsive interface</li>
                        <li>Multiple visual themes</li>
                        <li>Demo mode with fallback images</li>
                    </ul>
                    
                    <h3>How It Works</h3>
                    <p>Simply describe what you want to see in the text prompt, choose your preferred AI model, and click generate. Our AI will create a unique image based on your description in seconds.</p>
                    
                    <h3>Developer</h3>
                    <p>Created by <strong>WaizMarco</strong> - Full-Stack Developer & AI Enthusiast</p>
                </div>
            `;
            break;
            
        case 'faq':
            content = `
                <div class="generator-section">
                    <h2>Frequently Asked Questions</h2>
                    
                    <h3>How many free credits do I get?</h3>
                    <p>You start with 2 free image generations. Each successful generation uses 1 credit.</p>
                    
                    <h3>How can I get more credits?</h3>
                    <p>You can unlock unlimited credits using the special unlock code: <strong>${UNLOCK_PASSWORD}</strong></p>
                    
                    <h3>What's the difference between the AI models?</h3>
                    <p><strong>Hugging Face:</strong> Uses Stable Diffusion 2.0 for high-quality, artistic images.<br>
                    <strong>DeepAI:</strong> Provides alternative styling and interpretation of prompts.</p>
                    
                    <h3>Can I download the generated images?</h3>
                    <p>Yes! Every generated image comes with a download button. Images are saved with timestamped filenames.</p>
                    
                    <h3>What makes a good prompt?</h3>
                    <p>Be descriptive and specific. Include details about style, lighting, composition, and mood. For example: "A futuristic city at sunset with neon lights, cyberpunk style, detailed architecture"</p>
                    
                    <h3>Why do I see demo images?</h3>
                    <p>If the AI APIs are unavailable, IMAGIFY shows demo placeholder images so you can still test the interface and functionality.</p>
                </div>
            `;
            break;
            
        case 'contact':
            content = `
                <div class="generator-section">
                    <h2>Contact Information</h2>
                    <p>Get in touch with the developer of IMAGIFY:</p>
                    
                    <h3>WaizMarco</h3>
                    <p><strong>Email:</strong> waizmarco@example.com</p>
                    <p><strong>Role:</strong> Full-Stack Developer & AI Enthusiast</p>
                    
                    <h3>Support</h3>
                    <p>For technical support, feature requests, or bug reports, please reach out via email. We typically respond within 24 hours.</p>
                    
                    <h3>Feedback</h3>
                    <p>We love hearing from our users! Share your thoughts, suggestions, or showcase the amazing images you've created with IMAGIFY.</p>
                    
                    <h3>Unlock Code</h3>
                    <p>Need unlimited credits? Use code: <strong>${UNLOCK_PASSWORD}</strong></p>
                </div>
            `;
            break;
            
        default:
            return;
    }
    
    pageContent.innerHTML = content;
    
    // Re-bind event listeners and update global references if we're back on home page
    if (page === 'home') {
        // Update DOM element references
        generateBtn = document.getElementById('generateBtn');
        promptTextarea = document.getElementById('prompt');
        modelSelect = document.getElementById('modelSelect');
        tipText = document.getElementById('tipText');
        imageGrid = document.getElementById('imageGrid');
        
        // Re-bind event listeners
        if (generateBtn) {
            generateBtn.addEventListener('click', handleGenerate);
        }
    }
}

/**
 * Show modal with fade-in animation
 * @param {HTMLElement} modal - Modal element to show
 */
function showModal(modal) {
    if (modal) modal.classList.remove('hidden');
}

/**
 * Hide modal
 * @param {HTMLElement} modal - Modal element to hide
 */
function hideModal(modal) {
    if (modal) modal.classList.add('hidden');
}

/**
 * Show overlay (navigation, loading, etc.)
 * @param {HTMLElement} overlay - Overlay element to show
 */
function showOverlay(overlay) {
    if (overlay) overlay.classList.remove('hidden');
}

/**
 * Hide overlay
 * @param {HTMLElement} overlay - Overlay element to hide
 */
function hideOverlay(overlay) {
    if (overlay) overlay.classList.add('hidden');
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 */
function showToast(message) {
    if (toastMessage) toastMessage.textContent = message;
    if (toast) toast.classList.remove('hidden');
    
    // Hide after 3 seconds
    setTimeout(() => {
        if (toast) toast.classList.add('hidden');
    }, 3000);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Clean up intervals when page unloads
window.addEventListener('beforeunload', () => {
    if (themeRotationInterval) clearInterval(themeRotationInterval);
    if (carouselInterval) clearInterval(carouselInterval);
    if (promptInterval) clearInterval(promptInterval);
});