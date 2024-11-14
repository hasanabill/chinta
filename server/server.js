// Import the Express module
const express = require('express');

// Initialize the app
const app = express();

// Define a port to listen to
const PORT = process.env.PORT || 5000;

// Define a basic route
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
