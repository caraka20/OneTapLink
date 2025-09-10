"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

type Group = {
  id: number;
  nama: string;
  link: string;
  jenis: string;
  status: string;
};

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [jenisTabs, setJenisTabs] = useState<string[]>([]);
  const [activeJenis, setActiveJenis] = useState<string>("Semua");

  useEffect(() => {
    apiFetch<Group[]>("/groups")
      .then((res) => {
        setGroups(res);
        const jenisUnique = Array.from(new Set(res.map((g) => g.jenis)));
        setJenisTabs(["Semua", ...jenisUnique]);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return <p className="text-gray-500 text-center">Loading daftar grup...</p>;
  if (error)
    return <p className="text-red-500 text-center">Error: {error}</p>;

  const filteredGroups = groups.filter(
    (g) =>
      g.status === "AKTIF" &&
      (activeJenis === "Semua" || g.jenis === activeJenis)
  );

  const countByJenis = (jenis: string) => {
    if (jenis === "Semua") return groups.filter((g) => g.status === "AKTIF").length;
    return groups.filter((g) => g.status === "AKTIF" && g.jenis === jenis).length;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8 px-4 sm:px-6 lg:px-12">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-blue-700 tracking-tight drop-shadow-sm">
          📚 Grup Mahasiswa UT
        </h1>
        <p className="text-gray-600 text-sm md:text-base mt-2">
          Temukan grup WhatsApp berdasarkan jurusan, daerah, atau komunitas.
        </p>
      </div>

      {/* Filter Buttons → grid 3 kolom */}
      <div className="bg-white shadow rounded-lg p-3 mb-8">
        <div className="grid grid-cols-3 gap-2">
          {jenisTabs.map((j) => (
            <button
              key={j}
              onClick={() => setActiveJenis(j)}
              className={cn(
                "relative w-full px-2 py-2 rounded-md font-medium text-xs sm:text-sm transition-all",
                "flex items-center justify-center",
                activeJenis === j
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {j}
              {/* Badge jumlah */}
              <span
                className={cn(
                  "ml-2 px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold",
                  activeJenis === j
                    ? "bg-white/20 text-white"
                    : "bg-gray-300 text-gray-800"
                )}
              >
                {countByJenis(j)}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Group List */}
      <div className="grid gap-4">
        {filteredGroups.map((g) => (
          <Card
            key={g.id}
            className="hover:shadow-md transition-all rounded-lg bg-white"
          >
            <CardContent className="flex items-center gap-4 p-3">
              <Avatar className="w-8 h-8 shadow">
                <AvatarImage
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WA"
                />
                <AvatarFallback>WA</AvatarFallback>
              </Avatar>
              <a
                href={g.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium hover:underline flex-1 truncate text-gray-800"
              >
                {g.nama}
              </a>
            </CardContent>
          </Card>
        ))}

        {filteredGroups.length === 0 && (
          <p className="text-center text-gray-500 italic text-sm">
            Tidak ada grup aktif untuk kategori ini.
          </p>
        )}
      </div>
    </div>
  );
}
