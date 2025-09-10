"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveWaLink = exports.changeGroupStatus = exports.deleteGroup = exports.updateGroup = exports.createGroup = exports.getGroups = exports.authMiddleware = exports.login = void 0;
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cheerio = __importStar(require("cheerio"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "secret";
/** ================== USER ================== */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ error: "Username & password wajib diisi" });
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user)
            return res.status(401).json({ error: "User tidak ditemukan" });
        const valid = await bcrypt_1.default.compare(password, user.password);
        if (!valid)
            return res.status(401).json({ error: "Password salah" });
        const token = jsonwebtoken_1.default.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });
        res.json({ token });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.login = login;
/** Middleware untuk cek JWT */
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader)
        return res.status(401).json({ error: "Unauthorized" });
    try {
        const token = authHeader.split(" ")[1];
        req.user = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        next();
    }
    catch {
        res.status(401).json({ error: "Invalid token" });
    }
};
exports.authMiddleware = authMiddleware;
/** ================== GROUP ================== */
const getGroups = async (req, res) => {
    try {
        const { search, jenis, status } = req.query;
        const where = {
            ...(search ? { nama: { contains: String(search) } } : {}),
            ...(jenis ? { jenis: String(jenis) } : {}),
            ...(status ? { status: status } : {}),
        };
        const groups = await prisma.group.findMany({
            where,
            orderBy: { createdAt: "desc" },
        });
        res.json(groups);
    }
    catch (err) {
        console.error("❌ getGroups error:", err);
        res.status(500).json({ error: err.message });
    }
};
exports.getGroups = getGroups;
const createGroup = async (req, res) => {
    try {
        const { nama, link, jenis } = req.body;
        if (!nama || !link || !jenis)
            return res.status(400).json({ error: "Nama, link, jenis wajib diisi" });
        const group = await prisma.group.create({ data: { nama, link, jenis } });
        res.status(201).json(group);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.createGroup = createGroup;
const updateGroup = async (req, res) => {
    try {
        const { id } = req.params;
        const { nama, link, jenis, status } = req.body;
        const data = {};
        if (nama)
            data.nama = nama;
        if (link)
            data.link = link;
        if (jenis)
            data.jenis = jenis;
        if (status && ["AKTIF", "NONAKTIF"].includes(status)) {
            data.status = status;
        }
        const group = await prisma.group.update({
            where: { id: Number(id) },
            data,
        });
        res.json(group);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.updateGroup = updateGroup;
const deleteGroup = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.group.delete({ where: { id: Number(id) } });
        res.status(204).send();
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.deleteGroup = deleteGroup;
const changeGroupStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        if (!["AKTIF", "NONAKTIF"].includes(status))
            return res.status(400).json({ error: "Status harus AKTIF atau NONAKTIF" });
        const group = await prisma.group.update({
            where: { id: Number(id) },
            data: { status },
        });
        res.json(group);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.changeGroupStatus = changeGroupStatus;
const resolveWaLink = async (req, res) => {
    try {
        const { url } = req.query;
        if (!url)
            return res.status(400).json({ error: "URL wajib diisi" });
        const response = await fetch(String(url));
        const html = await response.text();
        const $ = cheerio.load(html);
        const title = $('meta[property="og:title"]').attr("content") ||
            $("title").text() ||
            "Unknown Group";
        return res.json({ title });
    }
    catch (err) {
        console.error("resolveWaLink error:", err); // ⬅️ lihat detail error di console server
        return res.status(500).json({ error: "Gagal mengambil data link WA" });
    }
};
exports.resolveWaLink = resolveWaLink;
