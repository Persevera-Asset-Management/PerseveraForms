// This is a serverless function that will run in a Node.js environment.
// It acts as a secure backend to fetch the connect token from Pluggy.

export default async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        res.setHeader('Allow', 'GET');
        return res.status(405).end('Method Not Allowed');
    }

    // Securely get credentials from environment variables on the server
    const clientId = process.env.PLUGGY_CLIENT_ID;
    const clientSecret = process.env.PLUGGY_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("Server-side environment variables are not set.");
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
            console.error("Pluggy authentication failed:", await authResponse.text());
            return res.status(authResponse.status).json({ error: "Failed to authenticate with service provider." });
        }
        const { apiKey } = await authResponse.json();

        // 2. Create a connect_token using the API Key
        const tokenResponse = await fetch("https://api.pluggy.ai/connect_token", {
            method: 'POST',
            headers: { "X-API-KEY": apiKey }
        });

        if (!tokenResponse.ok) {
            console.error("Failed to create connect token:", await tokenResponse.text());
            return res.status(tokenResponse.status).json({ error: "Failed to create connect token." });
        }
        const { accessToken } = await tokenResponse.json();

        // 3. Send the secure token to the frontend
        res.status(200).json({ connectToken: accessToken });

    } catch (error) {
        console.error("An unexpected error occurred:", error);
        res.status(500).json({ error: "An internal server error occurred." });
    }
} 