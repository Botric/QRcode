const express = require('express');
const path = require('path');
const http = require('http');

const app = express();
const PORT = 5610;

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../public')));
app.use('/src', express.static(path.join(__dirname, '../public/src')));
app.use(express.json());

// Main route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.sendStatus(200);
});

// Self-ping to keep container alive (every 5 minutes)
setInterval(() => {
  const req = http.get(`http://localhost:${PORT}/health`, res => {
    // no-op
  });
  req.on('error', () => {
    // ignore errors
  });
}, 300000);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});