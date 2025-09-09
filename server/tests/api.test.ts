import request from "supertest";
import { PrismaClient } from "@prisma/client";
import app from "../src/index";

const prisma = new PrismaClient();
let token: string;

beforeAll(async () => {
  // login pakai user seed
  const res = await request(app)
    .post("/api/user/login")
    .send({ username: "raka20", password: "raka20" });

  token = res.body.token;
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("Auth API", () => {
  it("login sukses", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({ username: "raka20", password: "raka20" });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
  });

  it("login gagal - username kosong", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({ password: "1234" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Username & password wajib diisi");
  });

  it("login gagal - user tidak ditemukan", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({ username: "notexist", password: "1234" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("User tidak ditemukan");
  });

  it("login gagal - password salah", async () => {
    const res = await request(app)
      .post("/api/user/login")
      .send({ username: "raka20", password: "salah" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Password salah");
  });
});

describe("Groups API", () => {
  let groupId: number;

  it("buat grup baru - sukses", async () => {
    const res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ nama: "UT Manajemen", link: "https://wa.link/xxx", jenis: "MABA" });

    expect(res.status).toBe(201);
    expect(res.body.id).toBeDefined();
    expect(res.body.nama).toBe("UT Manajemen");
    groupId = res.body.id;
  });

  it("buat grup gagal - tanpa token", async () => {
    const res = await request(app)
      .post("/api/groups")
      .send({ nama: "UT Hukum", link: "https://wa.link/yyy", jenis: "MABA" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("buat grup gagal - field kurang", async () => {
    const res = await request(app)
      .post("/api/groups")
      .set("Authorization", `Bearer ${token}`)
      .send({ nama: "UT PGSD" }); // link & jenis kosong

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Nama, link, jenis wajib diisi");
  });

    it("ambil daftar grup - dengan filter search", async () => {
    const res = await request(app)
        .get("/api/groups?search=manajemen")
        .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.some((g: any) =>
        g.nama.toLowerCase().includes("manajemen")
    )).toBe(true);
    });

  it("ambil daftar grup - dengan filter search", async () => {
    const res = await request(app)
      .get("/api/groups?search=manajemen")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].nama.toLowerCase()).toContain("manajemen");
  });

  it("ambil daftar grup gagal - tanpa token", async () => {
    const res = await request(app).get("/api/groups");
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("update grup - sukses", async () => {
    const res = await request(app)
      .put(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nama: "UT Manajemen Update",
        link: "https://wa.link/zzz",
        jenis: "MABA",
      });

    expect(res.status).toBe(200);
    expect(res.body.nama).toBe("UT Manajemen Update");
  });

  it("update grup gagal - id tidak ada", async () => {
    const res = await request(app)
      .put(`/api/groups/99999`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        nama: "Not Exist",
        link: "https://wa.link/not",
        jenis: "MABA",
      });

    expect(res.status).toBe(500); // Prisma error kalau id tidak ada
  });

  it("ubah status grup - sukses", async () => {
    const res = await request(app)
      .patch(`/api/groups/${groupId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "NONAKTIF" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("NONAKTIF");
  });

  it("ubah status grup gagal - status invalid", async () => {
    const res = await request(app)
      .patch(`/api/groups/${groupId}/status`)
      .set("Authorization", `Bearer ${token}`)
      .send({ status: "INVALID" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Status harus AKTIF atau NONAKTIF");
  });

  it("hapus grup - sukses", async () => {
    const res = await request(app)
      .delete(`/api/groups/${groupId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(204);
  });

  it("hapus grup gagal - id tidak ada", async () => {
    const res = await request(app)
      .delete(`/api/groups/99999`)
      .set("Authorization", `Bearer ${token}`);

    expect([400, 500]).toContain(res.status); // Prisma throw error
  });
});
