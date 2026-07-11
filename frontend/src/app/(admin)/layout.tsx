"use client";

import { AdminLayoutContent } from "../../components/layouts/AdminLayout";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminLayoutContent>{children}</AdminLayoutContent>;
}
