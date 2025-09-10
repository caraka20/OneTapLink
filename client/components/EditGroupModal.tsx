"use client";

import { useState, useEffect } from "react";
import { api, apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { showSuccess, showError } from "@/lib/alert";

type Group = {
  id: number;
  nama: string;
  link: string;
  jenis: string;
  status: string;
};

type Props = {
  mode: "create" | "edit";
  group?: Group;
  onClose: () => void;
  onSaved: () => void;
};

export default function EditGroupModal({ mode, group, onClose, onSaved }: Props) {
  const [link, setLink] = useState(group?.link || "");
  const [nama, setNama] = useState(group?.nama || "");
  const [jenis, setJenis] = useState(group?.jenis || "");
  const [customJenis, setCustomJenis] = useState("");
  const [status, setStatus] = useState<Group["status"]>(group?.status || "AKTIF");
  const [loading, setLoading] = useState(false);
  const [jenisOptions, setJenisOptions] = useState<string[]>([]);

  // 🚀 Ambil jenis unik dari DB
  useEffect(() => {
    const fetchJenis = async () => {
      try {
        const token = localStorage.getItem("token")!;
        const res = await apiFetch<Group[]>("/groups", {}, token);
        const uniqueJenis = Array.from(new Set(res.map((g) => g.jenis).filter(Boolean)));
        setJenisOptions(uniqueJenis);
      } catch (err) {
        console.error("❌ gagal fetch jenis:", err);
      }
    };
    fetchJenis();
  }, []);

  // 🚀 Auto-generate nama dari link
  useEffect(() => {
    const fetchGroupName = async () => {
      if (!link || mode === "edit") return;
      try {
        const res = await api.get<{ title: string }>(
          `/resolve-wa-link?url=${encodeURIComponent(link)}`
        );
        if (res?.title) setNama(res.title);
      } catch (err) {
        console.error("❌ gagal ambil nama grup:", err);
      }
    };
    fetchGroupName();
  }, [link, mode]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token")!;
      const finalJenis = jenis === "Lainnya" ? customJenis : jenis;

      if (mode === "create") {
        await api.post("/groups", { nama, link, jenis: finalJenis, status }, token);
        showSuccess("✅ Grup berhasil ditambahkan");
      } else {
        await api.put(`/groups/${group?.id}`, { nama, link, jenis: finalJenis, status }, token);
        showSuccess("✅ Grup berhasil diupdate");
      }
      onSaved();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) showError(err.message);
      else showError("Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Tambah Grup" : "Edit Grup"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {/* Input Link WA */}
          <Input
            placeholder="Link WhatsApp Grup"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />

          {/* Input Nama */}
          <Input
            placeholder="Nama Grup"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />

            {/* Jenis Grup */}
            <select
            className="w-full border rounded p-2 text-sm"
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
            >
            <option disabled hidden value="">
                Pilih Jenis Grup
            </option>
            {jenisOptions.map((j) => (
                <option key={j} value={j}>
                {j}
                </option>
            ))}
            <option value="Lainnya">Lainnya</option>
            </select>

            {/* Input tambahan kalau pilih Lainnya */}
            {jenis === "Lainnya" && (
            <Input
                placeholder="Isi jenis grup lain"
                value={customJenis}
                onChange={(e) => setCustomJenis(e.target.value)}
            />
            )}


          {/* Status */}
          <select
            className="w-full border rounded p-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as Group["status"])}
          >
            <option value="AKTIF">AKTIF</option>
            <option value="NONAKTIF">NONAKTIF</option>
          </select>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
