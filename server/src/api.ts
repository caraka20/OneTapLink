import { PrismaClient, GroupStatus, Prisma } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Request, Response } from "express";
import * as cheerio from "cheerio";
import axios from "axios";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "secret";

/** ================== USER ================== */
export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ error: "Username & password wajib diisi" });

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "User tidak ditemukan" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: "Password salah" });

    const token = jwt.sign(
      { id: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ token });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

/** Middleware untuk cek JWT */
export const authMiddleware = async (req: any, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized" });

  try {
    const token = authHeader.split(" ")[1];
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
};

/** ================== GROUP ================== */
export const getGroups = async (req: Request, res: Response) => {
  try {
    const { search, jenis, status } = req.query;

    const where: Prisma.GroupWhereInput = {
      ...(search ? { nama: { contains: String(search) } } : {}),
      ...(jenis ? { jenis: String(jenis) } : {}),
      ...(status ? { status: status as GroupStatus } : {}),
    };

    const groups = await prisma.group.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json(groups);
  } catch (err: any) {
    console.error("❌ getGroups error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const createGroup = async (req: Request, res: Response) => {
  try {
    const { nama, link, jenis } = req.body;
    if (!nama || !link || !jenis)
      return res.status(400).json({ error: "Nama, link, jenis wajib diisi" });

    const group = await prisma.group.create({ data: { nama, link, jenis } });
    res.status(201).json(group);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nama, link, jenis, status } = req.body;

    const data: any = {};
    if (nama) data.nama = nama;
    if (link) data.link = link;
    if (jenis) data.jenis = jenis;
    if (status && ["AKTIF", "NONAKTIF"].includes(status)) {
      data.status = status;
    }

    const group = await prisma.group.update({
      where: { id: Number(id) },
      data,
    });

    res.json(group);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};


export const deleteGroup = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.group.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const changeGroupStatus = async (req: Request, res: Response) => {
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
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const resolveWaLink = async (req: Request, res: Response) => {
  try {
    const { url } = req.query;
    if (!url) return res.status(400).json({ error: "URL wajib diisi" });

    const response = await fetch(String(url));
    const html = await response.text();
    const $ = cheerio.load(html);

    const title =
      $('meta[property="og:title"]').attr("content") ||
      $("title").text() ||
      "Unknown Group";

    return res.json({ title });
  } catch (err: any) {
    console.error("resolveWaLink error:", err); // ⬅️ lihat detail error di console server
    return res.status(500).json({ error: "Gagal mengambil data link WA" });
  }
};

