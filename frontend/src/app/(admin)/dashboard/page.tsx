"use client";

import { FileText, Users, FolderTree, Tags, Eye, TrendingUp } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Spinner } from "../../../components/ui/Spinner";
import { StatusBadge } from "../../../components/ui/badge";
import { formatRelative } from "../../../lib/utils";
import { useDashboardStats } from "../../../hooks/useStats";

export default function DashboardPage() {
  const { data: stats, isLoading, error } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Erro ao carregar dashboard</p>
      </div>
    );
  }

  const statCards = [
    { label: "Total de Notícias", value: stats.totalNews, icon: FileText, color: "text-blue-600 bg-blue-100" },
    { label: "Publicadas", value: stats.publishedNews, icon: Eye, color: "text-green-600 bg-green-100" },
    { label: "Rascunhos", value: stats.draftNews, icon: TrendingUp, color: "text-yellow-600 bg-yellow-100" },
    { label: "Categorias", value: stats.totalCategories, icon: FolderTree, color: "text-purple-600 bg-purple-100" },
    { label: "Tags", value: stats.totalTags, icon: Tags, color: "text-pink-600 bg-pink-100" },
    { label: "Usuários", value: stats.totalUsers, icon: Users, color: "text-indigo-600 bg-indigo-100" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.color}`}>
                <card.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <p className="text-xs text-gray-500">{card.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Recent News */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Notícias Recentes</h2>
        {stats.recentNews.length === 0 ? (
          <p className="text-sm text-gray-500">Nenhuma notícia cadastrada.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {stats.recentNews.map((news) => (
              <div key={news.id} className="flex items-center justify-between py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{news.title}</p>
                  <p className="text-xs text-gray-500">
                    {news.author.name} &middot; {formatRelative(news.created_at)}
                  </p>
                </div>
                <StatusBadge status={news.status} />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
