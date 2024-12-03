import type { Metadata } from "next";
import "../globals.css";
import { Sidevar } from "@/Components/Sider/Sidevar";

export const metadata: Metadata = {
  title: "Panizzeria",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="flex flex-row">
          <Sidevar />
          {children}
      </body>
    </html>
  );
}