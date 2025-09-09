"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type Group = {
  id: number;
  nama: string;
  link: string;
  jenis: string;
  status: string;
};

const LOGO_URL =
  "https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"; // logo WA

export default function GroupList() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [jenisTabs, setJenisTabs] = useState<string[]>([]);
  const [query, setQuery] = useState(""); // state untuk pencarian

  useEffect(() => {
    apiFetch<Group[]>("/groups")
      .then((res) => {
        setGroups(res);
        const jenisUnique = Array.from(new Set(res.map((g) => g.jenis)));
        setJenisTabs(jenisUnique);
      })
      .catch((err: unknown) => {
        if (err instanceof Error) setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading daftar grup...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  const handleSearch = () => {
    setQuery(search.toLowerCase());
  };

    // filteredGroups: hanya grup aktif + cocok search
    const filteredGroups = groups.filter(
    (g) =>
        g.status === "AKTIF" && // 👈 tampilkan hanya grup aktif
        g.nama.toLowerCase().includes(query)
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-6 px-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-blue-700">📚 Grup Mahasiswa UT</h1>
        <p className="text-gray-600">
          Temukan grup WhatsApp berdasarkan jurusan, daerah, atau komunitas.
        </p>
      </div>

      {/* Tabs */}
    <Tabs defaultValue={jenisTabs[0] ?? ""} className="w-full">
    <TabsList className="flex flex-wrap justify-center gap-2 bg-white/60 backdrop-blur rounded-lg p-1 shadow-sm">
        {jenisTabs.map((j) => (
        <TabsTrigger
            key={j}
            value={j}
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white
                    transition-all duration-300 px-4 py-2 rounded-md"
        >
            {j}
        </TabsTrigger>
        ))}
    </TabsList>

    {jenisTabs.map((j) => (
    <TabsContent
        key={j}
        value={j}
        className="mt-4 space-y-2 animate-fadeIn"
    >
        {filteredGroups
        .filter((g) => g.jenis === j)
        .map((g) => (
            <Card
            key={g.id}
            className="w-full hover:bg-gray-50 transition-colors shadow-sm"
            >
            <CardContent className="flex items-center gap-3 p-2">
                <Avatar className="w-8 h-8">
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
                className="font-medium hover:underline flex-1"
                >
                {g.nama}
                </a>
            </CardContent>
            </Card>
        ))}

        {filteredGroups.filter((g) => g.jenis === j).length === 0 && (
        <p className="text-center text-gray-500">
            Tidak ada grup aktif untuk kategori ini.
        </p>
        )}
    </TabsContent>
    ))}
    </Tabs>

    </div>
  );
}
