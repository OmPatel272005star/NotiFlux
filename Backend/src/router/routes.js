import express from "express";
import { registerClient, getClientInfo } from "../controller/client.js";
import { sendNotification, getNotificationById, getNotifications } from "../controller/notification.js";
import authenticateApiKey from "../middleware/auth.js";

const router = express.Router();

// ========================================
// PUBLIC ROUTES (No authentication required)
// ========================================

router.post("/client/register", registerClient);

// ========================================
// PROTECTED ROUTES (Authentication required)
// ========================================


router.get("/client/me", authenticateApiKey, getClientInfo);

router.post("/notifications", authenticateApiKey, sendNotification);


router.get("/notifications", authenticateApiKey, getNotifications);


router.get("/notifications/:id", authenticateApiKey, getNotificationById);

export default router;

