import type { Metadata } from "next";

export const siteConfig = {
  name: "One Tap Link UT",
  url: "https://grups.mhsut.com",
  logo: "/logo.png",
  description:
    "Kumpulan link grup WhatsApp Mahasiswa Universitas Terbuka (UT) 2025. Temukan grup Camaba, Jurusan, dan UPBJJ dengan mudah di One Tap Link.",
  keywords: [
    "Grup UT",
    "Camaba UT 2025",
    "Grup WhatsApp UT",
    "Jurusan Universitas Terbuka",
    "Grup Mahasiswa Online UT",
  ],
};

export const baseMetadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.logo,
        width: 600,
        height: 600,
        alt: "Logo Universitas Terbuka",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};
