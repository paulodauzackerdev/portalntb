"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { useNewsList, useDeleteNews, usePublishNews } from "../../../hooks/useNews";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { DataTable } from "../../../components/ui/data-table";
import { PaginationNav } from "../../../components/ui/pagination-nav";
import { StatusBadge } from "../../../components/ui/badge";
import { Spinner } from "../../../components/ui/Spinner";
import { formatDateTime } from "../../../lib/utils";
import { toast } from "../../../components/ui/use-toast";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";
import type { NewsItem } from "../../../types";

export default function AdminNewsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const { data, isLoading } = useNewsList({ page, limit: 15, search, status: status || undefined });
  const deleteNews = useDeleteNews();
  const publishNews = usePublishNews();

  const news = data?.data || [];
  const meta = data?.meta;

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Excluir notícia",
      description: "Tem certeza que deseja excluir esta notícia? Esta ação não pode ser desfeita.",
      confirmText: "Excluir",
      cancelText: "Cancelar",
      variant: "destructive",
    });
    if (!confirmed) return;
    try {
      await deleteNews.mutateAsync(id);
      toast({ title: "Notícia excluída", variant: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao excluir";
      toast({ title: "Erro ao excluir", description: message, variant: "destructive" });
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await publishNews.mutateAsync(id);
      toast({ title: "Notícia publicada!", variant: "success" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao publicar";
      toast({ title: "Erro ao publicar", description: message, variant: "destructive" });
    }
  };

  const columns = [
    { key: "title", header: "Título", className: "max-w-xs",
      render: (n: NewsItem) => (
        <span className="font-medium text-gray-900 truncate block">{n.title}</span>
      ),
    },
    { key: "author", header: "Autor",
      render: (n: NewsItem) => <span className="text-gray-600">{n.author.name}</span>,
    },
    { key: "category", header: "Categoria",
      render: (n: NewsItem) => <span className="text-gray-600">{n.category.name}</span>,
    },
    { key: "status", header: "Status",
      render: (n: NewsItem) => <StatusBadge status={n.status} />,
    },
    { key: "created_at", header: "Data",
      render: (n: NewsItem) => <span className="text-gray-500 text-xs">{formatDateTime(n.created_at)}</span>,
    },
    { key: "actions", header: "Ações", className: "text-right",
      render: (n: NewsItem) => (
        <div className="flex items-center gap-1 justify-end">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/noticias/${n.id}/edit`)}>
            Editar
          </Button>
          {n.status === "DRAFT" && (
            <Button variant="ghost" size="sm" onClick={() => handlePublish(n.id)} loading={publishNews.isPending}>
              Publicar
            </Button>
          )}
          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleDelete(n.id)} loading={deleteNews.isPending}>
            Excluir
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Notícias</h1>
        <Button onClick={() => router.push("/noticias/novo")}>
          <Plus className="w-4 h-4" />
          Nova Notícia
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar notícias..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          className="flex h-9 w-40 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="">Todos</option>
          <option value="DRAFT">Rascunhos</option>
          <option value="PUBLISHED">Publicados</option>
          <option value="ARCHIVED">Arquivados</option>
        </select>
      </div>

      {isLoading ? (
        <Spinner className="py-12" />
      ) : (
        <>
          <DataTable columns={columns} data={news} />
          {meta && <PaginationNav page={meta.page} totalPages={meta.totalPages} onChange={setPage} />}
        </>
      )}
      {confirmDialog}
    </div>
  );
}
