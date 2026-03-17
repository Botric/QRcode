import QRCodeStyling from 'qr-code-styling';

// QR Code Generator Frontend JavaScript
const debounce = (fn, waitMs) => {
    let timeoutId;
    return (...args) => {
        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => fn(...args), waitMs);
    };
};

class QRCodeGenerator {
    constructor() {
        this.centerImage = null;
        this.qrCanvas = null;
        this.qrStyler = null;
        this.currentSize = 300;
        this.currentStyle = 'square';
        this.currentColorMode = 'solid';

        this.scheduleUpdate = debounce(() => {
            const text = this.urlInput?.value?.trim();
            if (text) {
                this.renderQRCode(text);
            }
        }, 150);

        this.init();
    }

    init() {
        this.urlInput = document.getElementById('url-input');
        this.qrColorInput = document.getElementById('qr-color');
        this.qrColorHexInput = document.getElementById('qr-color-hex');
        this.qrColorDisplay = document.getElementById('qr-color-display');
        this.qrColorSecondaryInput = document.getElementById('qr-color-2');
        this.qrColorSecondaryHexInput = document.getElementById('qr-color-2-hex');
        this.qrColorSecondaryDisplay = document.getElementById('qr-color-2-display');
        this.qrColorMode = document.getElementById('qr-color-mode');
        this.bgColorInput = document.getElementById('bg-color');
        this.bgColorHexInput = document.getElementById('bg-color-hex');
        this.bgColorDisplay = document.getElementById('bg-color-display');
        this.clearQrColorBtn = document.getElementById('clear-qr-color');
        this.clearBgColorBtn = document.getElementById('clear-bg-color');
        this.fileInput = document.getElementById('file-input');
        this.uploadArea = document.getElementById('upload-area');
        this.imagePreview = document.getElementById('image-preview');

        this.sizeButtons = document.querySelectorAll('.size-btn');
        this.styleButtons = document.querySelectorAll('.style-btn');

        this.bindEvents();
        this.initLogoAnimation();
        this.initDarkMode();

        this.updateColorDisplay('qr', '#000000');
        this.updateColorDisplay('qr2', '#FF6B35');
        this.updateColorDisplay('bg', '#ffffff');
        this.updateSecondaryColorVisibility();
        this.updateQRCode();
    }

    initLogoAnimation() {
        const logo = document.getElementById('logo-container');
        const h1 = logo ? logo.querySelector('h1') : null;

        if (!logo || !h1) {
            return;
        }

        logo.addEventListener('mouseenter', () => {
            logo.classList.add('logo-animate');
            h1.classList.add('text-animate');
        });

        logo.addEventListener('mouseleave', () => {
            logo.classList.remove('logo-animate');
            h1.classList.remove('text-animate');
        });
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
        this.urlInput.addEventListener('input', () => this.updateQRCode());
        this.urlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.updateQRCode();
            }
        });

        // File upload events
        this.uploadArea.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        
        // Drag and drop events
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Color display click opens color picker
        this.qrColorDisplay.addEventListener('click', () => this.qrColorInput.click());
        this.qrColorInput.addEventListener('input', () => this.setColor('qr', this.qrColorInput.value));
        this.qrColorHexInput.addEventListener('input', () => this.setColor('qr', this.qrColorHexInput.value));
        this.clearQrColorBtn.addEventListener('click', () => this.setColor('qr', '#000000'));

        this.qrColorSecondaryDisplay.addEventListener('click', () => this.qrColorSecondaryInput.click());
        this.qrColorSecondaryInput.addEventListener('input', () => this.setColor('qr2', this.qrColorSecondaryInput.value));
        this.qrColorSecondaryHexInput.addEventListener('input', () => this.setColor('qr2', this.qrColorSecondaryHexInput.value));

        this.qrColorMode.addEventListener('change', () => {
            this.currentColorMode = this.qrColorMode.value;
            this.updateSecondaryColorVisibility();
            this.updateQRCode();
        });

        this.bgColorDisplay.addEventListener('click', () => this.bgColorInput.click());
        this.bgColorInput.addEventListener('input', () => this.setColor('bg', this.bgColorInput.value));
        this.bgColorHexInput.addEventListener('input', () => this.setColor('bg', this.bgColorHexInput.value));
        this.clearBgColorBtn.addEventListener('click', () => this.setColor('bg', '#ffffff'));

        // Size buttons
        this.sizeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.sizeButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentSize = parseInt(btn.dataset.size);
                this.updateQRCode();
            });
        });

        // Style button events
        this.styleButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.styleButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentStyle = btn.dataset.style;
                this.updateQRCode();
            });
        });

        this.qrColorInput.addEventListener('change', () => this.updateQRCode());
        this.qrColorSecondaryInput.addEventListener('change', () => this.updateQRCode());
        this.bgColorInput.addEventListener('change', () => this.updateQRCode());
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
        if (!file.type.startsWith('image/')) {
            this.showMessage('Please select an image file.', 'error');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            this.showMessage('Image size should be less than 2MB.', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result;
            if (typeof dataUrl !== 'string') {
                return;
            }

            this.centerImage = new Image();
            this.centerImage.onload = () => {
                this.showImagePreview(dataUrl);
                this.updateQRCode();
            };
            this.centerImage.src = dataUrl;
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(dataUrl) {
        if (!dataUrl) {
            return;
        }

        this.imagePreview.innerHTML = `
            <img src="${dataUrl}" alt="Image Preview" class="preview-image">
            <button type="button" id="remove-image-btn" class="remove-image-btn" title="Remove image">&times;</button>
        `;

        const removeBtn = document.getElementById('remove-image-btn');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => this.removeImage());
        }
    }

    removeImage() {
        this.centerImage = null;
        this.imagePreview.innerHTML = '';
        this.fileInput.value = '';
        this.updateQRCode();
    }

    updateQRCode() {
        const text = this.urlInput.value.trim();
        if (text) {
            this.scheduleUpdate();
        }
    }

    // --- Fix for style button logic ---
    // Map UI style to qr-code-styling type
    getStyleType(style) {
        if (style === 'dot' || style === 'dots') return 'dots';
        if (style === 'rounded') return 'extra-rounded';
        return style;
    }

    renderQRCode(text) {
        const dotOptions = {
            type: this.getStyleType(this.currentStyle)
        };

        if (this.currentColorMode === 'solid') {
            dotOptions.color = this.qrColorInput.value;
        } else {
            dotOptions.gradient = {
                type: this.currentColorMode === 'radial' ? 'radial' : 'linear',
                rotation: this.getGradientRotation(this.currentColorMode),
                colorStops: [
                    { offset: 0, color: this.qrColorInput.value },
                    { offset: 1, color: this.qrColorSecondaryInput.value }
                ]
            };
        }

        const options = {
            width: this.currentSize,
            height: this.currentSize,
            data: text,
            image: this.centerImage ? this.centerImage.src : undefined,
            dotsOptions: dotOptions,
            backgroundOptions: {
                color: this.bgColorInput.value
            },
            imageOptions: {
                crossOrigin: 'anonymous',
                margin: 0,
                imageSize: 0.35
            }
        };

        const parent = document.querySelector('.qr-code-container');
        if (!parent) return;

        if (!this.qrStyler) {
            this.qrStyler = new QRCodeStyling(options);
            parent.innerHTML = '';
            this.qrStyler.append(parent);
        } else {
            this.qrStyler.update(options);
        }

        this.qrCanvas = parent.querySelector('canvas') || null;
    }

    setColor(type, value) {
        let hex = value;
        if (!hex.startsWith('#')) hex = '#' + hex;
        if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) return;

        if (type === 'qr') {
            this.qrColorInput.value = hex;
            this.qrColorHexInput.value = hex.toUpperCase();
            this.qrColorDisplay.style.backgroundColor = hex;
        } else if (type === 'qr2') {
            this.qrColorSecondaryInput.value = hex;
            this.qrColorSecondaryHexInput.value = hex.toUpperCase();
            this.qrColorSecondaryDisplay.style.backgroundColor = hex;
        } else {
            this.bgColorInput.value = hex;
            this.bgColorHexInput.value = hex.toUpperCase();
            this.bgColorDisplay.style.backgroundColor = hex;
        }
        this.updateQRCode();
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
            this.qrColorHexInput.value = color.toUpperCase();
        } else if (type === 'qr2') {
            this.qrColorSecondaryDisplay.style.backgroundColor = color;
            this.qrColorSecondaryHexInput.value = color.toUpperCase();
        } else if (type === 'bg') {
            this.bgColorDisplay.style.backgroundColor = color;
            this.bgColorHexInput.value = color.toUpperCase();
        }
        this.updateQRCode();
    }

    updateSecondaryColorVisibility() {
        const secondaryGroup = document.getElementById('qr-secondary-color-group');
        if (!secondaryGroup) {
            return;
        }

        secondaryGroup.style.display = this.currentColorMode === 'solid' ? 'none' : 'flex';
    }

    getGradientRotation(mode) {
        if (mode === 'gradient-horizontal') {
            return 0;
        }
        if (mode === 'gradient-vertical') {
            return Math.PI / 2;
        }
        return 0;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.qrGenerator = new QRCodeGenerator();
});
