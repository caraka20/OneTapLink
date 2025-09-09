import "./globals.css";

export const metadata = {
  title: "One Tap Link",
  description: "Daftar grup WhatsApp UT",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
