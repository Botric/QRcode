// QR Code Generator Frontend JavaScript
class QRCodeGenerator {
    constructor() {
        this.centerImage = null;
        this.qrCanvas = null;
        this.qrPreviewStyler = null;
        this.qrStyler = null;
        this.currentSize = 300;
        this.currentStyle = 'square';
        this.init();
    }

    init() {        // Get DOM elements
        this.urlInput = document.getElementById('url-input');
        this.generateBtn = document.getElementById('generate-btn');
        this.qrColorInput = document.getElementById('qr-color');
        this.qrColorHexInput = document.getElementById('qr-color-hex');
        this.qrColorDisplay = document.getElementById('qr-color-display');
        this.bgColorInput = document.getElementById('bg-color');
        this.bgColorHexInput = document.getElementById('bg-color-hex');
        this.bgColorDisplay = document.getElementById('bg-color-display');
        this.clearQrColorBtn = document.getElementById('clear-qr-color');
        this.clearBgColorBtn = document.getElementById('clear-bg-color');
        this.fileInput = document.getElementById('file-input');
        this.uploadArea = document.getElementById('upload-area');
        this.imagePreview = document.getElementById('image-preview');
        this.qrResult = document.getElementById('qr-result');
        this.qrCanvas = document.getElementById('qr-canvas');
        this.downloadBtn = document.getElementById('download-btn');
        
        // Size buttons
        this.sizeButtons = document.querySelectorAll('.size-btn');
        this.styleButtons = document.querySelectorAll('.style-btn');
        
        // Preview elements
        this.qrPreviewSection = document.getElementById('qr-preview-section');
        this.qrPreviewCanvas = document.getElementById('qr-preview-canvas');
        this.qrPreviewStyler = null;
        this.qrStyler = null;
        this.currentSize = 300;
        this.currentStyle = 'square';
        
        // Bind events
        this.bindEvents();
        // Attach clear color button events after DOM is ready
        const clearQrBtn = document.getElementById('clear-qr-color');
        if (clearQrBtn) {
            clearQrBtn.addEventListener('click', () => {
                this.qrColorInput.value = '#000000';
                this.qrColorHexInput.value = '#000000';
                this.qrColorDisplay.style.backgroundColor = '#000000';
                this.setColor('qr', '#000000');
            });
        }
        const clearBgBtn = document.getElementById('clear-bg-color');
        if (clearBgBtn) {
            clearBgBtn.addEventListener('click', () => {
                this.bgColorInput.value = '#ffffff';
                this.bgColorHexInput.value = '#ffffff';
                this.bgColorDisplay.style.backgroundColor = '#ffffff';
                this.setColor('bg', '#ffffff');
            });
        }
        // Fancy logo animation on hover
        const logo = document.getElementById('logo-container');
        const h1 = logo ? logo.querySelector('h1') : null;

        if (logo && h1) {
            logo.addEventListener('mouseenter', () => {
                logo.classList.add('logo-animate');
                h1.classList.add('text-animate'); // Add class to h1 for text animation
            });
            logo.addEventListener('mouseleave', () => {
                logo.classList.remove('logo-animate');
                h1.classList.remove('text-animate'); // Remove class from h1
            });
        } else {
            console.warn("Logo container or h1 element not found for animation.");
        }
        this.updatePreview(); // Show preview on load
        this.initDarkMode(); // Initialize dark mode
    }

    initDarkMode() {
        const toggleButton = document.getElementById('dark-mode-toggle');
        const body = document.body;

        // Function to apply dark mode
        const enableDarkMode = () => {
            body.classList.add('dark-mode');
            toggleButton.textContent = '☀️'; // Sun icon for light mode
            localStorage.setItem('darkMode', 'enabled');
        };

        // Function to disable dark mode
        const disableDarkMode = () => {
            body.classList.remove('dark-mode');
            toggleButton.textContent = '🌙'; // Moon icon for dark mode
            localStorage.setItem('darkMode', 'disabled');
        };

        // Check local storage for saved preference
        const storedPreference = localStorage.getItem('darkMode');
        if (storedPreference === 'disabled') { // Check if light mode was explicitly chosen
            disableDarkMode();
        } else {
            // Default to dark mode if no preference or preference is 'enabled'
            enableDarkMode(); 
        }

        // Toggle dark mode on button click
        toggleButton.addEventListener('click', () => {
            if (body.classList.contains('dark-mode')) {
                disableDarkMode();
            } else {
                enableDarkMode();
            }
        });
    }

    bindEvents() {
        // Generate QR code button
        this.generateBtn.addEventListener('click', () => this.generateQRCode());
        
        // Enter key in URL input
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.generateQRCode();
            }
        });

        // File upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));        // Download button
        this.downloadBtn.addEventListener('click', () => this.downloadQRCode());

        // Color display click opens color picker
        this.qrColorDisplay.addEventListener('click', () => this.qrColorInput.click());
        this.qrColorInput.addEventListener('input', () => this.setColor('qr', this.qrColorInput.value));
        this.qrColorHexInput.addEventListener('input', () => this.setColor('qr', this.qrColorHexInput.value));
        this.clearQrColorBtn.addEventListener('click', () => this.setColor('qr', '#000000'));

        this.bgColorDisplay.addEventListener('click', () => this.bgColorInput.click());
        this.bgColorInput.addEventListener('input', () => this.setColor('bg', this.bgColorInput.value));
        this.bgColorHexInput.addEventListener('input', () => this.setColor('bg', this.bgColorHexInput.value));
        this.clearBgColorBtn.addEventListener('click', () => this.setColor('bg', '#FFFFFF'));

        // Size buttons
        this.sizeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.sizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSize = parseInt(btn.dataset.size);
                this.updatePreview();
                this.updateQRCode();
            });
        });

        // Style button events
        this.styleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.styleButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentStyle = btn.dataset.style;
                this.updatePreview();
                this.updateQRCode();
            });
        });

        // Real-time updates when customization changes
        this.qrColorInput.addEventListener('change', () => this.updateQRCode());
        this.bgColorInput.addEventListener('change', () => this.updateQRCode());
        
        // Real-time preview when URL changes
        this.urlInput.addEventListener('input', () => {
            this.updatePreview();
            this.updateQRCode();
        });
        
        // Initialize color displays
        this.updateColorDisplay('qr', '#000000');
        this.updateColorDisplay('bg', '#ffffff');
    }

    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileUpload(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    processFile(file) {
        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showMessage('Please select an image file.', 'error');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            this.showMessage('Image size should be less than 2MB.', 'error');
            return;
        }        // Read file
        const reader = new FileReader();
        reader.onload = (e) => {
            this.centerImage = new Image();
            this.centerImage.onload = () => {
                this.showImagePreview(e.target.result);
                this.updateQRCode();
                this.updatePreview();
            };
            this.centerImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(file) {
        if (file) {
            this.imageFile = file;
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewContainer = document.getElementById('image-preview');
                previewContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Image Preview" class="preview-image">
                    <button type="button" id="remove-image-btn" class="remove-image-btn" title="Remove image">&times;</button>
                `;
                document.getElementById('remove-image-btn').addEventListener('click', () => this.removeImage());
                this.updateQRCode(); // Update QR code when image is added
            };
            reader.readAsDataURL(file);
        }
    }

    removeImage() {
        this.centerImage = null;
        this.imagePreview.innerHTML = '';
        this.fileInput.value = '';
        this.updateQRCode();
        this.updatePreview();
    }

    generateQRCode() {
        const text = this.urlInput.value.trim();
        
        if (!text) {
            this.showMessage('Please enter some text or URL.', 'error');
            return;
        }        this.showMessage('Generating QR Code...', 'loading');
        
        this.renderQRCode(text);
    }

    updateQRCode() {
        const text = this.urlInput.value.trim();
        if (text) this.renderQRCode(text);
    }

    // --- Fix for style button logic ---
    // Map UI style to qr-code-styling type
    getStyleType(style) {
        if (style === 'rounded') return 'extra-rounded';
        return style;
    }

    renderQRCode(text) {
        // Use qr-code-styling for style customization
        if (!window.QRCodeStyling) {
            this.showMessage('QR code styling library not loaded.', 'error');
            return;
        }
        if (this.qrStyler) this.qrStyler.update({});
        this.qrStyler = new QRCodeStyling({
            width: this.currentSize,
            height: this.currentSize,
            data: text,
            image: this.centerImage ? this.centerImage.src : undefined,
            dotsOptions: {
                color: this.qrColorInput.value,
                type: this.getStyleType(this.currentStyle)
            },
            backgroundOptions: {
                color: this.bgColorInput.value
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 0,
                imageSize: 0.35 // Make center image bigger in main QR
            }
        });
        // Remove previous QR canvas if present
        const parent = document.querySelector('.qr-code-container');
        parent.querySelectorAll('canvas').forEach(c => c.remove());
        this.qrStyler.append(parent);
        this.qrCanvas = parent.querySelector('canvas');
        document.getElementById('qr-result').style.display = 'block';
    }

    updatePreview() {
        const text = this.urlInput.value.trim();
        if (!window.QRCodeStyling || !this.qrPreviewCanvas) return;
        const parent = this.qrPreviewCanvas.parentNode;
        // Remove previous preview canvas if present
        parent.querySelectorAll('canvas').forEach(c => c.remove());
        if (!text) {
            // If no text, just clear preview
            return;
        }
        // Always create a new preview QR code for the full input
        this.qrPreviewStyler = new QRCodeStyling({
            width: 120,
            height: 120,
            data: text,
            dotsOptions: {
                color: this.qrColorInput.value,
                type: this.getStyleType(this.currentStyle) || 'square'
            },
            backgroundOptions: {
                color: this.bgColorInput.value
            },
            image: this.centerImage ? this.centerImage.src : undefined,
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 0,
                imageSize: 0.35
            }
        });
        this.qrPreviewStyler.append(parent);
        this.qrPreviewCanvas = parent.querySelector('canvas');
    }

    downloadQRCode() {
        if (this.qrStyler) {
            this.qrStyler.download({ name: 'qrcode', extension: 'png' });
        }
    }

    setColor(type, value) {
        // Validate hex
        let hex = value;
        if (!hex.startsWith('#')) hex = '#' + hex;
        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;
        if (type === 'qr') {
            this.qrColorInput.value = hex;
            this.qrColorHexInput.value = hex.toUpperCase();
            this.qrColorDisplay.style.backgroundColor = hex;
        } else {
            this.bgColorInput.value = hex;
            this.bgColorHexInput.value = hex.toUpperCase();
            this.bgColorDisplay.style.backgroundColor = hex;
        }
        this.updateQRCode();
        this.updatePreview();
    }

    selectSize(button) {
        // Remove active class from all buttons
        this.sizeButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Update current size
        this.currentSize = parseInt(button.dataset.size);
        
        // Update QR code
        this.updateQRCode();
        this.updatePreview();
    }

    selectStyle(button) {
        // Remove active class from all buttons
        this.styleButtons.forEach(btn => btn.classList.remove('active'));
        
        // Add active class to clicked button
        button.classList.add('active');
        
        // Update current style
        this.currentStyle = button.dataset.style;
        
        // Update QR code
        this.updateQRCode();
        this.updatePreview();
    }

    processFile(file) {
        // Validate file
        if (!file.type.startsWith('image/')) {
            this.showMessage('Please select an image file.', 'error');
            return;
        }

        if (file.size > 2 * 1024 * 1024) { // 2MB limit
            this.showMessage('Image size should be less than 2MB.', 'error');
            return;
        }        // Read file
        const reader = new FileReader();
        reader.onload = (e) => {
            this.centerImage = new Image();
            this.centerImage.onload = () => {
                this.showImagePreview(e.target.result);
                this.updateQRCode();
                this.updatePreview();
            };
            this.centerImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    removeImage() {
        this.centerImage = null;
        this.imagePreview.innerHTML = '';
        this.fileInput.value = '';
        this.updateQRCode();
        this.updatePreview();
    }

    showMessage(message, type) {
        // Remove existing messages
        const existingMessages = document.querySelectorAll('.error-message, .success-message, .loading-message');
        existingMessages.forEach(msg => msg.remove());

        // Create new message
        const messageDiv = document.createElement('div');
        
        if (type === 'loading') {
            messageDiv.innerHTML = `<span class="loading"></span>${message}`;
            messageDiv.className = 'success-message';
        } else {
            messageDiv.textContent = message;
            messageDiv.className = type === 'error' ? 'error-message' : 'success-message';
        }

        // Insert message after the input section
        const inputSection = document.querySelector('.input-section');
        inputSection.parentNode.insertBefore(messageDiv, inputSection.nextSibling);

        // Auto-remove success/loading messages after 3 seconds
        if (type !== 'error') {
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.remove();
                }
            }, 3000);
        }
    }

    clearMessage() {
        const messages = document.querySelectorAll('.error-message, .success-message, .loading-message');
        messages.forEach(msg => msg.remove());
    }

    updateColorDisplay(type, color) {
        if (type === 'qr') {
            this.qrColorDisplay.style.backgroundColor = color;
            this.qrColorValue.textContent = color.toUpperCase();
        } else if (type === 'bg') {
            this.bgColorDisplay.style.backgroundColor = color;
            this.bgColorValue.textContent = color.toUpperCase();
        }
        this.updateQRCode();
    }
}

// Load qr-code-styling library
const script = document.createElement('script');
script.src = 'https://cdn.jsdelivr.net/npm/qr-code-styling@1.5.0/lib/qr-code-styling.js';
document.head.appendChild(script);

function waitForQRCodeStyling(callback, retries = 20) {
    if (window.QRCodeStyling) {
        callback();
    } else if (retries > 0) {
        setTimeout(() => waitForQRCodeStyling(callback, retries - 1), 150);
    } else {
        document.body.insertAdjacentHTML('afterbegin', '<div class="error-message">QR code styling library failed to load. Please check your internet connection or CDN access.</div>');
    }
}

waitForQRCodeStyling(() => {
    window.qrGenerator = new QRCodeGenerator();
});

// Global dark mode init to ensure toggle works immediately
document.addEventListener('DOMContentLoaded', () => {
    const toggleButton = document.getElementById('dark-mode-toggle');
    const body = document.body;
    if (!toggleButton) return;
    const enableDark = () => {
        body.classList.add('dark-mode');
        toggleButton.textContent = '☀️';
        localStorage.setItem('darkMode', 'enabled');
    };
    const disableDark = () => {
        body.classList.remove('dark-mode');
        toggleButton.textContent = '🌙';
        localStorage.setItem('darkMode', 'disabled');
    };
    const pref = localStorage.getItem('darkMode');
    if (pref === 'disabled') disableDark(); else enableDark();
    toggleButton.addEventListener('click', () => {
        if (body.classList.contains('dark-mode')) disableDark(); else enableDark();
    });
});
