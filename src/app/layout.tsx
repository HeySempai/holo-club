import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter/index.css";
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource/space-grotesk/500.css";
import "@fontsource/space-grotesk/600.css";
import "@fontsource/space-grotesk/700.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Holo Club · Sobres sellados cada mes",
  description:
    "Club de suscripción de sobres de Pokémon TCG en inglés: 10 sobres sellados de fábrica cada mes, a precio justo y con envío a todo México.",
  openGraph: {
    title: "Holo Club",
    description: "Sobres sellados. Precio justo. Cada mes en tu puerta.",
    locale: "es_MX",
    type: "website",
  },
};

export const viewport: Viewport = { themeColor: "#12131C" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-MX">
      <body className="antialiased">{children}</body>
    </html>
  );
}
