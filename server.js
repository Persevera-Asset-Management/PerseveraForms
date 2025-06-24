const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

app.get('/api/get-connect-token', async (req, res) => {
    // Securely get credentials from environment variables on the server
    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("Server-side environment variables PLUGGY_CLIENT_ID and PLUGGY_CLIENT_SECRET are not set.");
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        // 1. Authenticate with Pluggy to get an API Key
        const authResponse = await fetch("https://api.pluggy.ai/auth", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clientId, clientSecret })
        });

        if (!authResponse.ok) {
            const errorText = await authResponse.text();
            console.error("Pluggy authentication failed:", errorText);
            return res.status(authResponse.status).json({ error: "Failed to authenticate with service provider." });
        }
        const { apiKey } = await authResponse.json();

        // 2. Create a connect_token using the API Key
        const tokenResponse = await fetch("https://api.pluggy.ai/connect_token", {
            method: 'POST',
            headers: { "X-API-KEY": apiKey }
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error("Failed to create connect token:", errorText);
            return res.status(tokenResponse.status).json({ error: "Failed to create connect token." });
        }
        const { accessToken } = await tokenResponse.json();

        // 3. Send the secure token to the frontend
        res.status(200).json({ connectToken: accessToken });

    } catch (error) {
        console.error("An unexpected error occurred:", error);
        res.status(500).json({ error: "An internal server error occurred." });
    }
});

// Serve connect.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'connect.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
}); 