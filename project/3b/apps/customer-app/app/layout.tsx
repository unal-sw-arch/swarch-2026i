import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import { getOptionalSession } from "@/lib/session";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "DELIUNAL Customer App",
  description: "Customer ordering experience for Prototype 2.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getOptionalSession();

  return (
    <html lang="en">
      <body className={`${inter.className} app-shell`}>
        <Providers>
          <SiteHeader session={session} />
          {children}
        </Providers>
      </body>
    </html>
  );
}
