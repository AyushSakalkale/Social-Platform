import express from "express";

import {
  deleteNotifications,
  getNotifications,
} from "../controllers/notificationController.js";
import isAuthenticated from "../config/auth.js";

const router = express.Router();

router.get("/", isAuthenticated, getNotifications);
router.delete("/", isAuthenticated, deleteNotifications);

export default router;
