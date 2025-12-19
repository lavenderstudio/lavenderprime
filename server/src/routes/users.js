// server/src/routes/users.js
// ----------------------------------------------------
// User profile routes
// ----------------------------------------------------

import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { getMeProfile, updateMeProfile } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", requireAuth, getMeProfile);
router.patch("/me", requireAuth, updateMeProfile);

export default router;
