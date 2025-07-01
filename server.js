const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies. Pluggy webhooks are sent as JSON.
app.use(express.json());

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

// Webhook endpoint to receive events from Pluggy and forward them to Make.com
app.post('/webhook', async (req, res) => {
  console.log('🔌 Webhook event received!', JSON.stringify(req.body, null, 2));

  // This is your Make.com webhook URL.
  // For production, it's highly recommended to move this to an environment variable.
  const makeWebhookUrl = 'https://hook.us1.make.com/f7c1cohwpmais6ytfqg2cx7wj9offvfp';

  if (makeWebhookUrl) {
    try {
      console.log('Forwarding to Make.com...');
      const response = await fetch(makeWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

      if (!response.ok) {
        console.error('Make.com webhook forward failed:', response.statusText);
      } else {
        console.log('Successfully forwarded to Make.com');
      }
    } catch (error) {
      console.error('Error forwarding webhook to Make.com:', error);
    }
  }

  // Respond to Pluggy immediately to acknowledge receipt
  res.status(200).send('Webhook received');
});

// Serve connect.html for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'connect.html'));
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
}); 