import { Router } from "express";
import {
  login,
  authMiddleware,
  getGroups,
  createGroup,
  updateGroup,
  deleteGroup,
  changeGroupStatus,
  resolveWaLink,
} from "./api";

const router = Router();

// USER
router.post("/user/login", login);

// GROUPS (harus login)
router.get("/groups", getGroups);
router.post("/groups", authMiddleware, createGroup);
router.put("/groups/:id", authMiddleware, updateGroup);
router.delete("/groups/:id", authMiddleware, deleteGroup);
router.patch("/groups/:id/status", authMiddleware, changeGroupStatus);

router.get("/resolve-wa-link", resolveWaLink);

export default router;
