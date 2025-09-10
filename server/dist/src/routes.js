"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const api_1 = require("./api");
const router = (0, express_1.Router)();
// USER
router.post("/user/login", api_1.login);
// GROUPS (harus login)
router.get("/groups", api_1.getGroups);
router.post("/groups", api_1.authMiddleware, api_1.createGroup);
router.put("/groups/:id", api_1.authMiddleware, api_1.updateGroup);
router.delete("/groups/:id", api_1.authMiddleware, api_1.deleteGroup);
router.patch("/groups/:id/status", api_1.authMiddleware, api_1.changeGroupStatus);
router.get("/resolve-wa-link", api_1.resolveWaLink);
exports.default = router;
