import type React from "react";
import { SideMenu } from "@/components/side-menu";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden">
      <SideMenu />
      <main className="w-full flex-1 overflow-auto md:w-auto">{children}</main>
    </div>
  );
}
