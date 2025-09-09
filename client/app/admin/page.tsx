"use client";

import { useEffect, useState } from "react";
import { api, apiFetch } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import AdminForm from "@/components/AdminForm";
import EditGroupModal from "@/components/EditGroupModal";
import { showSuccess, showError, showConfirm } from "@/lib/alert";

type Group = {
  id: number;
  nama: string;
  link: string;
  jenis: string;
  status: string;
};

export default function AdminPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [jenisTabs, setJenisTabs] = useState<string[]>([]);
  const [activeJenis, setActiveJenis] = useState("Semua");
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

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
    fetchGroups();
  }, []);

  if (loading) return <p className="text-center text-gray-500">Loading...</p>;

  const filteredGroups =
    activeJenis === "Semua"
      ? groups
      : groups.filter((g) => g.jenis === activeJenis);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            Dashboard Admin
          </h1>
          <p className="text-gray-600 mt-2">
            Kelola grup WhatsApp UT dengan mudah, cepat, dan rapi ✨
          </p>
        </header>

        {/* Form Tambah Grup */}
        <div className="shadow-md rounded-xl bg-white/80 backdrop-blur-sm border border-slate-200 p-6">
          <AdminForm onCreated={fetchGroups} />
        </div>

        {/* Tabs Jenis */}
        <Tabs value={activeJenis} onValueChange={setActiveJenis}>
          <TabsList className="flex flex-wrap gap-3 justify-center bg-white shadow rounded-lg p-2">
            {jenisTabs.map((j) => (
              <TabsTrigger
                key={j}
                value={j}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all 
                  data-[state=active]:bg-indigo-600 data-[state=active]:text-white 
                  hover:bg-indigo-100"
              >
                {j}
              </TabsTrigger>
            ))}
          </TabsList>

          {jenisTabs.map((j) => (
            <TabsContent key={j} value={j} className="space-y-3 mt-6">
              {filteredGroups.length === 0 ? (
                <p className="text-center text-gray-500 italic">
                  Belum ada grup untuk kategori <span className="font-semibold">{j}</span>.
                </p>
              ) : (
                filteredGroups.map((g, i) => (
                  <Card
                    key={g.id}
                    className="transition-all duration-200 hover:shadow-lg hover:scale-[1.01] border border-slate-200"
                  >
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        {/* Penomoran */}
                        <span className="text-sm text-gray-400 w-6 text-right">
                          {i + 1}.
                        </span>
                        {/* Bulatan Status */}
                        <div
                          className={`w-3 h-3 rounded-full ${
                            g.status === "AKTIF" ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        {/* Nama Grup */}
                        <a
                          href={g.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline font-medium text-gray-800"
                        >
                          {g.nama}
                        </a>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingGroup(g)}
                          className="hover:bg-indigo-50"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            const result = await showConfirm(
                              `Hapus grup "${g.nama}"?`
                            );
                            if (result.isConfirmed) {
                              try {
                                const token = localStorage.getItem("token")!;
                                await api.delete(`/groups/${g.id}`, token);
                                showSuccess("Grup berhasil dihapus");
                                fetchGroups();
                              } catch (err: unknown) {
                                if (err instanceof Error) {
                                  showError(
                                    err.message || "Gagal menghapus grup"
                                  );
                                } else {
                                  showError("Gagal menghapus grup");
                                }
                              }
                            }
                          }}
                        >
                          Hapus
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Modal Edit */}
        {editingGroup && (
          <EditGroupModal
            group={editingGroup}
            onClose={() => setEditingGroup(null)}
            onUpdated={fetchGroups}
          />
        )}
      </div>
    </div>
  );
}
