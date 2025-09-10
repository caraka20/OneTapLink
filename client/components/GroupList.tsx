"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl md:text-3xl font-extrabold text-blue-700 tracking-tight drop-shadow-sm">
          📚 Grup Mahasiswa UT
        </h1>
        <p className="text-gray-600 text-sm md:text-base mt-1">
          Temukan grup WhatsApp berdasarkan jurusan, daerah, atau komunitas.
        </p>
      </div>

      {/* Filter Tabs → 2 kolom, full width */}
      <div className="bg-white shadow-md rounded-2xl mx-2 sm:mx-4 mb-6">
        <div className="grid grid-cols-2 gap-3 p-3">
          {jenisTabs.map((j) => (
            <button
              key={j}
              onClick={() => setActiveJenis(j)}
              className={cn(
                "w-full px-3 py-3 rounded-xl font-semibold text-sm transition-all",
                activeJenis === j
                  ? "bg-gradient-to-r from-indigo-600 to-blue-500 text-white shadow-md"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              <div className="flex items-center justify-between">
                <span>{j}</span>
                <span
                  className={cn(
                    "ml-2 px-2 py-0.5 rounded-full text-xs font-bold",
                    activeJenis === j
                      ? "bg-white/30 text-white"
                      : "bg-gray-300 text-gray-800"
                  )}
                >
                  {countByJenis(j)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Group List → full width, no padding */}
      <div className="space-y-2">
        {filteredGroups.map((g) => (
          <a
            key={g.id}
            href={g.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between px-3 py-3 
                       bg-white shadow-sm hover:shadow-md hover:bg-indigo-50 
                       transition-all group rounded-none"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="w-8 h-8 border shadow">
                <AvatarImage
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WA"
                />
                <AvatarFallback>WA</AvatarFallback>
              </Avatar>
              <span className="font-medium text-gray-800 text-sm sm:text-base truncate">
                {g.nama}
              </span>
            </div>
            <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-indigo-500 flex-shrink-0" />
          </a>
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
