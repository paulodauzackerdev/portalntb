"use client";

import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTags, useCreateTag, useDeleteTag } from "../../../hooks/useTags";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { DataTable } from "../../../components/ui/data-table";
import { Spinner } from "../../../components/ui/Spinner";
import { toast } from "../../../components/ui/use-toast";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";
import type { Tag } from "../../../types";

const tagSchema = z.object({
  name: z.string().min(2, "Mínimo de 2 caracteres").max(50),
});

type TagForm = z.infer<typeof tagSchema>;

export default function AdminTagsPage() {
  const [search, setSearch] = useState("");
  const { data: tags, isLoading } = useTags(search);
  const createTag = useCreateTag();
  const deleteTag = useDeleteTag();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const [dialogOpen, setDialogOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TagForm>({
    resolver: zodResolver(tagSchema),
  });

  const onSubmit = async (data: TagForm) => {
    try {
      await createTag.mutateAsync(data);
      setDialogOpen(false);
      reset({ name: "" });
    } catch (err) {
      toast({ title: "Erro ao criar tag", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Excluir tag",
      description: "Tem certeza que deseja excluir esta tag?",
      confirmText: "Excluir",
      variant: "destructive",
    });
    if (!confirmed) return;
    try {
      await deleteTag.mutateAsync(id);
    } catch (err) {
      toast({ title: "Erro ao excluir", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    }
  };

  const columns = [
    { key: "name", header: "Nome" },
    { key: "slug", header: "Slug" },
    { key: "actions", header: "Ações", className: "text-right",
      render: (t: Tag) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(t.id)}>Excluir</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
        <Button onClick={() => { reset({ name: "" }); setDialogOpen(true); }}>
          <Plus className="w-4 h-4" />
          Nova Tag
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar tags..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
      </div>

      {isLoading ? <Spinner className="py-12" /> : <DataTable columns={columns} data={tags || []} />}

      {confirmDialog}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Tag</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Nome" error={errors.name?.message} {...register("name")} />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={createTag.isPending}>Criar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
