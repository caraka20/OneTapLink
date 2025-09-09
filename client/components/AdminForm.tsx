"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { showError, showSuccess } from "@/lib/alert";

type Props = {
  onCreated: () => void;
};

type Group = {
  id: number;
  nama: string;
  link: string;
  jenis: string;
  status: string;
};

export default function AdminForm({ onCreated }: Props) {
  const [nama, setNama] = useState("");
  const [link, setLink] = useState("");
  const [jenis, setJenis] = useState("");
  const [customJenis, setCustomJenis] = useState("");
  const [jenisOptions, setJenisOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchJenis = async () => {
      try {
        const token = localStorage.getItem("token")!;
        const res = await apiFetch<Group[]>("/groups", {}, token);

        const uniqueJenis = Array.from(new Set(res.map((g) => g.jenis)));
        setJenisOptions(uniqueJenis);
      } catch {
        setJenisOptions([]);
      }
    };
    fetchJenis();
  }, []);

  const handleLinkBlur = async () => {
    if (!link) return;
    try {
      const res = await apiFetch<{ title: string }>(
        `/resolve-wa-link?url=${encodeURIComponent(link)}`
      );
      setNama(res.title);
    } catch {
      console.warn("Gagal ambil judul grup, isi manual");
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token")!;
      await apiFetch(
        "/groups",
        {
          method: "POST",
          body: JSON.stringify({
            nama,
            link,
            jenis: jenis === "Lainnya" ? customJenis : jenis,
          }),
        },
        token
      );
      setNama("");
      setLink("");
      setJenis("");
      setCustomJenis("");
      showSuccess("Grup berhasil ditambahkan");
      onCreated();
    } catch (err: unknown) {
      if (err instanceof Error) showError(err.message);
      else showError("Gagal menambahkan grup");
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        <Input
          placeholder="Link Grup WhatsApp"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onBlur={handleLinkBlur}
        />

        <Input
          placeholder="Nama Grup"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />

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
            <SelectItem value="Lainnya">Lainnya</SelectItem>
          </SelectContent>
        </Select>

        {jenis === "Lainnya" && (
          <Input
            placeholder="Tulis jenis grup"
            value={customJenis}
            onChange={(e) => setCustomJenis(e.target.value)}
          />
        )}

        <Button onClick={handleSubmit} className="w-full">
          Tambah Grup
        </Button>
      </CardContent>
    </Card>
  );
}
