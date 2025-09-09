"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showSuccess, showError } from "@/lib/alert";

type Props = {
  group: {
    id: number;
    nama: string;
    link: string;
    jenis: string;
    status: string;
  };
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditGroupModal({ group, onClose, onUpdated }: Props) {
  const [nama, setNama] = useState(group.nama);
  const [link, setLink] = useState(group.link);
  const [jenis, setJenis] = useState(group.jenis);
  const [status, setStatus] = useState(group.status);
  const [jenisOptions, setJenisOptions] = useState<string[]>([]);

  useEffect(() => {
    // Ambil semua jenis dari server untuk pilihan select
    const fetchJenis = async () => {
      try {
        const token = localStorage.getItem("token")!;
        const res = await api.get<{ jenis: string }[]>("/groups", token);
        const uniqueJenis = Array.from(new Set(res.map((g) => g.jenis)));
        setJenisOptions(uniqueJenis);
      } catch {
        setJenisOptions([group.jenis]);
      }
    };
    fetchJenis();
  }, [group.jenis]);

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token")!;
      await api.put(`/groups/${group.id}`, { nama, link, jenis }, token);
      await api.patch(`/groups/${group.id}/status`, { status }, token);

      showSuccess("Grup berhasil diperbarui");
      onUpdated();
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) showError(err.message);
      else showError("Gagal update grup");
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Grup</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <Input
            placeholder="Nama Grup"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
          />
          <Input
            placeholder="Link Grup"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />

          {/* Pilihan Jenis */}
          <Select value={jenis} onValueChange={setJenis}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Jenis Grup" />
            </SelectTrigger>
            <SelectContent>
              {jenisOptions.map((j) => (
                <SelectItem key={j} value={j}>
                  {j}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Pilihan Status */}
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AKTIF">AKTIF</SelectItem>
              <SelectItem value="NONAKTIF">NONAKTIF</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>Simpan</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
