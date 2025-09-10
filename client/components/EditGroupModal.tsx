// EditGroupModal.tsx
"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
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
  const [jenis, setJenis] = useState(group?.jenis || "Jurusan");
  const [status, setStatus] = useState<Group["status"]>(group?.status || "AKTIF");
  const [loading, setLoading] = useState(false);

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
      if (mode === "create") {
        await api.post("/groups", { nama, link, jenis, status }, token);
        showSuccess("✅ Grup berhasil ditambahkan");
      } else {
        await api.put(`/groups/${group?.id}`, { nama, link, jenis, status }, token);
        showSuccess("✅ Grup berhasil diupdate");
      }
      onSaved();
      onClose();
   } catch (err: unknown) {
  if (err instanceof Error) {
    showError(err.message);
  } else {
    showError("Terjadi kesalahan");
  }
}
 finally {
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

          {/* Input Nama (auto terisi kalau create) */}
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
            <option value="Jurusan">Jurusan</option>
            <option value="UPBJJ">UPBJJ</option>
            <option value="Lainnya">Lainnya</option>
          </select>

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
