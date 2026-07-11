"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { NewsForm } from "../../../../components/news/NewsForm";
import { useAuth } from "../../../../lib/auth";
import { Spinner } from "../../../../components/ui/Spinner";

export default function NewNewsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading) return <Spinner className="py-20" />;

  if (!user) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Redirecionando para login...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Nova Notícia</h1>
      <p className="text-sm text-gray-500">Logado como: {user.name} ({user.email})</p>
      <NewsForm />
    </div>
  );
}
