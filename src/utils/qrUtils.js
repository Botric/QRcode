export function generateQRCode(data, options) {
    const qrCode = new QRCode(options);
    qrCode.makeCode(data);
    return qrCode;
}

export function convertToPNG(qrCodeElement) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const qrCodeSize = qrCodeElement.offsetWidth;

    canvas.width = qrCodeSize;
    canvas.height = qrCodeSize;
    context.drawImage(qrCodeElement, 0, 0, qrCodeSize, qrCodeSize);

    return canvas.toDataURL('image/png');
}

export function applyCustomShape(qrCodeElement, shape) {
    // Logic to apply custom shape to the QR code
    // This can involve manipulating the canvas or SVG representation of the QR code
}