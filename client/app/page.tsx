import GroupList from "../components/GroupList";
import { baseMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = {
  ...baseMetadata,
  title: "Grup WhatsApp Mahasiswa UT 2025",
};

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-green-100">
      {/* Hero Section */}
      <section className="relative py-16 px-6 text-center overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div className="w-[500px] h-[500px] rounded-full bg-blue-300/20 blur-3xl animate-pulse" />
          <div className="w-[400px] h-[400px] rounded-full bg-green-300/20 blur-3xl animate-pulse delay-200" />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 drop-shadow-sm">
          🎓 One Tap Link UT
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
          Semua grup WhatsApp Mahasiswa UT dalam satu tempat.
          Cari, temukan, dan bergabung dengan mudah.
        </p>
      </section>

      {/* Content Section */}
      <section className="relative max-w-3xl mx-auto -mt-8 p-6">
        <div className="rounded-2xl bg-white/70 backdrop-blur-md shadow-xl border border-white/40">
          <GroupList />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 text-center text-sm text-gray-500 pb-6">
        ✨ Dibuat dengan ❤️ untuk Mahasiswa UT
      </footer>
    </main>
  );
}
