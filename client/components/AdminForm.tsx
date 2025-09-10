"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Props = {
  onCreated: () => void;
};

export default function AdminForm({ onCreated }: Props) {
  const [link, setLink] = useState("");
  const [nama, setNama] = useState("");
  const [jenis, setJenis] = useState("");
  const [jenisOptions, setJenisOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchJenis = async () => {
      try {
        const token = localStorage.getItem("token")!;
        const res = await apiFetch<{ jenis: string }[]>("/groups", {}, token);
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
      console.warn("Gagal ambil nama grup otomatis, isi manual.");
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token")!;
      await apiFetch(
        "/groups",
        {
          method: "POST",
          body: JSON.stringify({ link, nama, jenis }),
        },
        token
      );
      setLink("");
      setNama("");
      setJenis("");
      onCreated();
    } catch (err) {
      if (err instanceof Error) alert(err.message);
    }
  };

  return (
    <Card>
      <CardContent className="space-y-3 p-4">
        {/* Link Grup WA */}
        <Input
          placeholder="Link Grup WhatsApp"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          onBlur={handleLinkBlur}
        />

        {/* Nama Grup */}
        <Input
          placeholder="Nama Grup"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
        />

        {/* Jenis grup pakai select */}
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

        <Button onClick={handleSubmit} className="w-full">
          Tambah Grup
        </Button>
      </CardContent>
    </Card>
  );
}
