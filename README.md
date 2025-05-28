# QR Code Maker

## Overview
The QR Code Maker is a modern web application that allows users to create highly customizable QR codes with a beautiful, responsive interface. Users can input URLs or text, upload center images, customize colors and sizes, and download professional-quality QR codes as PNG files.

## Features
- **URL/Text Input**: Generate QR codes from any URL or text input
- **Center Image Upload**: Add custom images to the center of QR codes with drag-and-drop support
- **Full Customization**: Choose QR code colors, background colors, and sizes (200px to 500px)
- **Real-time Preview**: See changes instantly as you customize
- **High-Quality Download**: Export QR codes as PNG files with embedded center images
- **Responsive Design**: Mobile-friendly interface that works on all devices
- **Modern UI**: Beautiful gradient backgrounds and smooth animations
- **Containerized Deployment**: Ready for production with Podman/Docker

## Project Structure
```
qr-code-maker/
├── src/
│   ├── app.js                    # Express server and main entry point
│   ├── components/               # Legacy React components (for reference)
│   │   ├── QRGenerator.js
│   │   ├── ImageUploader.js
│   │   └── CustomizationPanel.js
│   ├── styles/
│   │   └── main.css              # Server-side styles (legacy)
│   └── utils/
│       └── qrUtils.js            # QR utility functions
├── public/                       # Client-side assets served by Express
│   ├── index.html                # Main HTML page with modern UI
│   ├── favicon.png               # Website favicon
│   ├── src/
│   │   └── qr-frontend.js        # Main frontend JavaScript (vanilla JS)
│   └── styles/
│       └── main.css              # Modern CSS with responsive design
├── Containerfile                 # Podman/Docker container configuration
├── podman-compose.yml            # Docker Compose configuration for easy deployment
├── package.json                  # npm dependencies and scripts
└── README.md                     # Project documentation
```

## Quick Start

### Method 1: Using Podman Compose (Recommended)
```bash
# Build and run with one command
podman-compose build --no-cache && podman-compose up -d

# Or using npm scripts
npm run compose:build
npm run compose:up
```

### Method 2: Manual Container Build
```bash
# Clone the repository
git clone <repository-url>
cd qr-code-maker

# Install dependencies (optional, for development)
npm install

# Build the container
podman build -t qr-code-maker .
# or
npm run build:container

# Run the container
podman run -p 5610:5610 qr-code-maker
# or
npm run run:container
```

### Method 3: Development Mode
```bash
# Install dependencies
npm install

# Run in development mode
npm start
```

### Access the Application
Open your browser and navigate to `http://localhost:5610`

## Usage

### 1. Enter Content
- Type any URL or text in the input field
- Press Enter or click "Generate QR Code"

### 2. Customize Appearance
- **QR Code Color**: Choose the color of the QR pattern
- **Background Color**: Set the background color
- **Size**: Select from Small (200px) to Extra Large (500px)

### 3. Add Center Image (Optional)
- Click the upload area or drag and drop an image
- Supports PNG, JPG, GIF files up to 2MB
- Image will be automatically cropped to fit in a circle
- Preview your image before generating
- Remove image anytime with the "Remove Image" button

### 4. Download
- Click "Download as PNG" to save your QR code
- High-quality PNG file with embedded center image
- Perfect for printing or digital use

## Available npm Scripts
```bash
npm start                  # Run development server
npm run build:container    # Build Podman container
npm run run:container      # Run Podman container
npm run compose:build      # Build with podman-compose
npm run compose:up         # Start with podman-compose
npm run compose:down       # Stop podman-compose services
```

## Technical Stack
- **Backend**: Node.js, Express.js
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **QR Generation**: QRCode.js library
- **Styling**: Modern CSS with gradients, animations, and responsive design
- **Containerization**: Podman/Docker with multi-stage builds
- **File Upload**: HTML5 File API with drag-and-drop support

## Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Container Features
- Lightweight Node.js base image
- Persistent volume for uploaded files
- Health checks and restart policies
- Production-optimized configuration
- Port 5610 exposed by default

## Development
To modify the application:

1. **Frontend changes**: Edit files in `public/` directory
   - `public/index.html` - Main HTML structure
   - `public/styles/main.css` - Styling and responsive design
   - `public/src/qr-frontend.js` - QR generation logic

2. **Backend changes**: Edit files in `src/` directory
   - `src/app.js` - Express server configuration

3. **Container changes**: Edit `Containerfile` or `podman-compose.yml`

## Environment Variables
- `NODE_ENV`: Set to 'production' in container
- `PORT`: Server port (default: 5610)


## License
This project is licensed under the MIT License.