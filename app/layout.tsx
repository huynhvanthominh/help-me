"use client"
import "./globals.css";
import { usePathname, useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter()
  const path = usePathname();
  const isHome = path === "/"
  return (
    <html lang="en">
      <body
        className={"p-10"}
      >
        {!isHome && <div className="cursor-pointer" onClick={() => router.back()}>Back</div>}
        {children}
      </body>
    </html>
  );
}
