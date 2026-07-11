"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from "../../../hooks/useCategories";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../../../components/ui/dialog";
import { DataTable } from "../../../components/ui/data-table";
import { Spinner } from "../../../components/ui/Spinner";
import { toast } from "../../../components/ui/use-toast";
import { useConfirmDialog } from "../../../hooks/useConfirmDialog";
import type { Category } from "../../../types";

const categorySchema = z.object({
  name: z.string().min(2, "Mínimo de 2 caracteres").max(100),
  description: z.string().max(300).optional().or(z.literal("")),
  order: z.string().optional(),
});

function parseOrder(val: string | undefined): number {
  const n = parseInt(val || "0", 10);
  return isNaN(n) ? 0 : n;
}

type CategoryForm = z.infer<typeof categorySchema>;

export default function AdminCategoriesPage() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
  });

  const openCreate = () => {
    setEditingCategory(null);
    reset({ name: "", description: "", order: "0" });
    setDialogOpen(true);
  };

  const openEdit = (cat: Category) => {
    setEditingCategory(cat);
    reset({ name: cat.name, description: cat.description || "", order: String(cat.order) });
    setDialogOpen(true);
  };

  const onSubmit = async (data: CategoryForm) => {
    try {
      const payload = { ...data, order: parseOrder(data.order) };
      if (editingCategory) {
        await updateCategory.mutateAsync({ id: editingCategory.id, ...payload });
      } else {
        await createCategory.mutateAsync(payload);
      }
      setDialogOpen(false);
    } catch (err) {
      toast({ title: "Erro ao salvar categoria", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await confirm({
      title: "Excluir categoria",
      description: "Tem certeza? Categorias com notícias não podem ser excluídas.",
      confirmText: "Excluir",
      variant: "destructive",
    });
    if (!confirmed) return;
    try {
      await deleteCategory.mutateAsync(id);
      toast({ title: "Categoria excluída", variant: "success" });
    } catch (err) {
      toast({ title: "Erro ao excluir", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    }
  };

  const columns = [
    { key: "name", header: "Nome" },
    { key: "slug", header: "Slug" },
    { key: "order", header: "Ordem" },
    { key: "active", header: "Ativo",
      render: (c: Category) => c.active ? "Sim" : "Não",
    },
    { key: "actions", header: "Ações", className: "text-right",
      render: (c: Category) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>Editar</Button>
          <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleDelete(c.id)}>Excluir</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Categorias</h1>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Nova Categoria
        </Button>
      </div>

      {isLoading ? <Spinner className="py-12" /> : <DataTable columns={columns} data={categories || []} />}

      {confirmDialog}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Nome" error={errors.name?.message} {...register("name")} />
            <Input label="Descrição" error={errors.description?.message} {...register("description")} />
            <Input label="Ordem" type="number" error={errors.order?.message} {...register("order")} />
            <DialogFooter>
              <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button type="submit" loading={createCategory.isPending || updateCategory.isPending}>
                {editingCategory ? "Salvar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
