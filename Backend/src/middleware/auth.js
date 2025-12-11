import Client from '../model/client.js';
import { verifyApiKey } from '../utils/generateApiKey.js';

/**
 * Middleware to verify API key from request headers
 * Expects: Authorization: Bearer <api-key>
 * OR: x-api-key: <api-key>
 */
const authenticateApiKey = async (req, res, next) => {
    try {
        // Get API key from headers (support both formats)
        let apiKey = req.headers['x-api-key'];

        if (!apiKey) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                apiKey = authHeader.substring(7);
            }
        }

        if (!apiKey) {
            return res.status(401).json({
                success: false,
                message: "API key missing. Provide via 'x-api-key' header or 'Authorization: Bearer' header"
            });
        }

        // Find all active clients
        const clients = await Client.find({ isActive: true });

        if (clients.length === 0) {
            return res.status(401).json({
                success: false,
                message: "No active clients found"
            });
        }

        // Verify API key against all clients' hashed keys
        let authenticatedClient = null;

        for (const client of clients) {
            const isValid = await verifyApiKey(apiKey, client.apiKey);
            if (isValid) {
                authenticatedClient = client;
                break;
            }
        }

        if (!authenticatedClient) {
            return res.status(401).json({
                success: false,
                message: "Invalid or inactive API key"
            });
        }

        // Attach client to request object
        req.client = authenticatedClient;
        next();

    } catch (err) {
        console.error('❌ [Auth Middleware] Error:', err.message);
        return res.status(500).json({
            success: false,
            message: "Authentication error",
            error: err.message
        });
    }
};

export default authenticateApiKey;