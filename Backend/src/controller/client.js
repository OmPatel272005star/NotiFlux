import Client from "../model/client.js";
import { generateApiKey } from "../utils/generateApiKey.js";

export const registerClient = async (req, res) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: "Client name and email are required"
      });
    }

    // Check if email already exists
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(409).json({
        success: false,
        message: "Client with this email already exists"
      });
    }

    // Generate API key and hash
    const { apiKey, hashedKey } = await generateApiKey();

    // Create client with hashed key
    const client = await Client.create({
      name,
      email,
      apiKey: hashedKey // Store hashed version
    });

    console.log(`✅ [Client] Registered: ${client.name} (${client.email})`);

    res.status(201).json({
      success: true,
      message: "Client registered successfully",
      data: {
        clientId: client._id,
        name: client.name,
        email: client.email,
        apiKey: apiKey, // Send plain API key ONLY ONCE!
        createdAt: client.createdAt
      },
      warning: "⚠️ Save this API key securely. It will not be shown again!"
    });

  } catch (err) {
    console.error('❌ [Client] Registration error:', err.message);
    res.status(500).json({
      success: false,
      message: "Failed to register client",
      error: err.message
    });
  }
};



export const getClientInfo = async (req, res) => {
  try {
    const client = req.client;

    res.status(200).json({
      success: true,
      data: {
        clientId: client._id,
        name: client.name,
        email: client.email,
        isActive: client.isActive,
        usageStats: client.usageStats,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt
      }
    });

  } catch (err) {
    console.error('❌ [Client] Info error:', err.message);
    res.status(500).json({
      success: false,
      message: "Failed to get client info",
      error: err.message
    });
  }
};

export default { registerClient, getClientInfo };
