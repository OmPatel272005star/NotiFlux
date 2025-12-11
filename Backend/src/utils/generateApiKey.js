import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const generateApiKey = async () => {
    // Generate a unique API key
    const apiKey = crypto.randomBytes(24).toString("hex");

    // Hash the API key for storage
    const salt = await bcrypt.genSalt(10);
    const hashedKey = await bcrypt.hash(apiKey, salt);

    return {
        apiKey,      // Send this to the client (only shown once!)
        hashedKey    // Store this in the database
    };
};

export const verifyApiKey = async (apiKey, hashedKey) => {
    return await bcrypt.compare(apiKey, hashedKey);
};

export default { generateApiKey, verifyApiKey };


