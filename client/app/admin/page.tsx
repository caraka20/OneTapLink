"use client";

import { useEffect, useState } from "react";
import { api, apiFetch } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import EditGroupModal from "@/components/EditGroupModal";
import { showSuccess, showError, showConfirm } from "@/lib/alert";
import { useAuth } from "@/lib/useAuth";
import { Pencil, Trash2, Plus } from "lucide-react";

type Group = {
  id: number;
  nama: string;
  link: string;
  jenis: string;
  status: string;
};

export default function AdminPage() {
  const { loading: authLoading } = useAuth();
  const [groups, setGroups] = useState<Group[]>([]);
  const [jenisTabs, setJenisTabs] = useState<string[]>([]);
  const [activeJenis, setActiveJenis] = useState("Semua");
  const [loading, setLoading] = useState(true);

  const [modalMode, setModalMode] = useState<"create" | "edit" | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const fetchGroups = async () => {
    try {
      const token = localStorage.getItem("token")!;
      const res = await apiFetch<Group[]>("/groups", {}, token);
      setGroups(res);
      const jenisUnique = Array.from(new Set(res.map((g) => g.jenis)));
      setJenisTabs(["Semua", ...jenisUnique]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) fetchGroups();
  }, [authLoading]);

  if (authLoading) return <p className="text-center text-gray-500">Cek login...</p>;
  if (loading) return <p className="text-center text-gray-500">Loading data...</p>;

  const filteredGroups =
    activeJenis === "Semua" ? groups : groups.filter((g) => g.jenis === activeJenis);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 p-2">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Header */}
        <header className="text-center relative py-6">
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-indigo-100 via-purple-50 to-pink-100 rounded-b-3xl"></div>

          <div className="flex flex-col items-center gap-2">
            <div className="flex items-center gap-2">
              <img
                src="data:image/jpeg;base64,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"
                alt="WhatsApp"
                className="w-8 h-8"
              />
              <h1 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Dashboard Admin Grup UT
              </h1>
            </div>
            <p className="text-gray-600 text-xs md:text-sm">
              Kelola & pantau semua grup WhatsApp Mahasiswa UT dengan mudah ✨
            </p>
          </div>

          {/* Statistik ringkas */}
          <div className="mt-4 grid grid-cols-3 gap-2 max-w-md mx-auto text-xs">
            <div className="bg-white shadow rounded-lg p-2">
              <p className="font-bold text-indigo-600">{groups.length}</p>
              <p className="text-gray-500">Total Grup</p>
            </div>
            <div className="bg-white shadow rounded-lg p-2">
              <p className="font-bold text-green-600">
                {groups.filter((g) => g.status === "AKTIF").length}
              </p>
              <p className="text-gray-500">Aktif</p>
            </div>
            <div className="bg-white shadow rounded-lg p-2">
              <p className="font-bold text-red-600">
                {groups.filter((g) => g.status === "NONAKTIF").length}
              </p>
              <p className="text-gray-500">Nonaktif</p>
            </div>
          </div>
        </header>

        {/* Floating Button (Tambah Grup) */}
        <div className="fixed bottom-4 right-4 z-50">
          <Button
            size="icon"
            className="rounded-full shadow-md bg-indigo-600 hover:bg-indigo-700 h-10 w-10"
            onClick={() => {
              setModalMode("create");
              setSelectedGroup(null);
            }}
          >
            <Plus className="w-5 h-5 text-white" />
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={activeJenis} onValueChange={setActiveJenis}>
          <TabsList className="flex flex-wrap gap-1 justify-center bg-white shadow rounded-md p-1">
            {jenisTabs.map((j) => (
              <TabsTrigger
                key={j}
                value={j}
                className="px-2 py-1 rounded text-xs font-medium transition-all
                  data-[state=active]:bg-indigo-600 data-[state=active]:text-white 
                  hover:bg-indigo-100"
              >
                {j}
              </TabsTrigger>
            ))}
          </TabsList>

          {jenisTabs.map((j) => (
            <TabsContent key={j} value={j} className="space-y-1 mt-3">
              {filteredGroups.length === 0 ? (
                <p className="text-center text-gray-400 italic text-xs">
                  Belum ada grup untuk kategori{" "}
                  <span className="font-semibold">{j}</span>.
                </p>
              ) : (
                filteredGroups.map((g, i) => (
                  <Card
                    key={g.id}
                    className="w-full border border-slate-200 rounded-md shadow-sm"
                  >
                    <CardContent className="flex items-center justify-between px-1 py-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-gray-400">{i + 1}.</span>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            g.status === "AKTIF" ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <a
                          href={g.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline font-medium text-gray-800 text-xs truncate"
                        >
                          {g.nama}
                        </a>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          size="icon"
                          variant="outline"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            setModalMode("edit");
                            setSelectedGroup(g);
                          }}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="destructive"
                          className="h-6 w-6 p-0"
                          onClick={async () => {
                            const result = await showConfirm(
                              `Hapus grup "${g.nama}"?`
                            );
                            if (result.isConfirmed) {
                              try {
                                const token = localStorage.getItem("token")!;
                                await api.delete(`/groups/${g.id}`, token);
                                showSuccess("✅ Grup berhasil dihapus");
                                fetchGroups();
                              } catch (err: unknown) {
                                if (err instanceof Error) {
                                  showError(err.message || "Gagal menghapus grup");
                                } else {
                                  showError("Gagal menghapus grup");
                                }
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Modal Edit / Tambah */}
        {modalMode && (
          <EditGroupModal
            mode={modalMode}
            group={selectedGroup || undefined}
            onClose={() => {
              setModalMode(null);
              setSelectedGroup(null);
            }}
            onSaved={fetchGroups}
          />
        )}
      </div>
    </div>
  );
}
