"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Spinner } from "@/components/ui/Spinner";
import { useUpdateImage, useDeleteImage } from "@/hooks/useUpload";
import { Trash2, Save, Image as ImageIcon } from "lucide-react";

// ─── Tipos ───────────────────────────────────────────────────────

export interface UploadedImage {
  id: string;
  url: string;
  key?: string;
  alt?: string | null;
  caption?: string | null;
  size: number;
  mimeType: string;
  created_at: string;
}

interface ImageDetailModalProps {
  image: UploadedImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updated: UploadedImage) => void;
  onDelete: (id: string) => void;
}

// ─── Helpers ─────────────────────────────────────────────────────

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Componente ──────────────────────────────────────────────────

export function ImageDetailModal({
  image,
  open,
  onOpenChange,
  onUpdate,
  onDelete,
}: ImageDetailModalProps) {
  const updateMutation = useUpdateImage();
  const deleteMutation = useDeleteImage();

  // Estados dos campos editáveis
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // Confirmação de exclusão
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Sincronizar campos quando a imagem mudar
  useEffect(() => {
    if (image) {
      setAlt(image.alt ?? "");
      setCaption(image.caption ?? "");
      setIsDirty(false);
    }
  }, [image]);

  // Marcar como alterado quando o usuário editar
  function handleAltChange(value: string) {
    setAlt(value);
    setIsDirty(true);
  }

  function handleCaptionChange(value: string) {
    setCaption(value);
    setIsDirty(true);
  }

  // ─── Salvar ────────────────────────────────────────────────────

  async function handleSave() {
    if (!image) return;

    try {
      const updated = await updateMutation.mutateAsync({
        id: image.id,
        alt: alt || null,
        caption: caption || null,
      });

      onUpdate(updated);
      setIsDirty(false);
      toast({ title: "Alterações salvas!", variant: "success" });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Erro ao salvar",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    }
  }

  // ─── Excluir ───────────────────────────────────────────────────

  async function handleDelete() {
    if (!image) return;

    try {
      await deleteMutation.mutateAsync(image.id);
      onDelete(image.id);
      setConfirmDelete(false);
      toast({ title: "Imagem removida com sucesso!", variant: "success" });
      onOpenChange(false);
    } catch (err) {
      toast({
        title: "Erro ao excluir",
        description: err instanceof Error ? err.message : "Tente novamente",
        variant: "destructive",
      });
    }
  }

  // ─── Loading state (sem imagem selecionada) ────────────────────

  if (!image) return null;

  const isSaving = updateMutation.isPending;
  const isDeleting = deleteMutation.isPending;
  const isBusy = isSaving || isDeleting;

  // ─── Render ────────────────────────────────────────────────────

  return (
    <>
      {/* Modal principal */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da imagem</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Preview da imagem */}
            <div className="relative w-full max-h-[50vh] bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
              {image.url ? (
                <Image
                  src={image.url}
                  alt={alt || "Preview da imagem"}
                  width={800}
                  height={600}
                  className="object-contain max-h-[50vh] w-auto"
                  style={{ width: "auto", height: "auto" }}
                  unoptimized
                />
              ) : (
                <div className="flex items-center justify-center h-48 text-gray-400">
                  <ImageIcon className="w-16 h-16" />
                </div>
              )}
            </div>

            {/* Metadados */}
            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              {image.key && (
                <div className="col-span-2 truncate">
                  <span className="font-medium">Key: </span>
                  <code className="text-xs">{image.key}</code>
                </div>
              )}
              <div>
                <span className="font-medium">Tamanho: </span>
                {formatSize(image.size)}
              </div>
              <div>
                <span className="font-medium">Tipo: </span>
                {image.mimeType}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Enviada em: </span>
                {formatDate(image.created_at)}
              </div>
            </div>

            {/* Campos editáveis */}
            <div className="space-y-3">
              <div className="space-y-1">
                <Label htmlFor="alt">Texto alternativo (alt)</Label>
                <Input
                  id="alt"
                  placeholder="Descrição da imagem para acessibilidade"
                  value={alt}
                  onChange={(e) => handleAltChange(e.target.value)}
                  disabled={isBusy}
                  maxLength={255}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="caption">Legenda (caption)</Label>
                <Textarea
                  id="caption"
                  placeholder="Legenda exibida junto à imagem"
                  value={caption}
                  onChange={(e) => handleCaptionChange(e.target.value)}
                  disabled={isBusy}
                  maxLength={500}
                  rows={3}
                />
              </div>
            </div>

            {/* Ações */}
            <div className="flex items-center justify-between pt-2 border-t">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                disabled={isBusy}
                loading={isDeleting}
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Excluindo..." : "Excluir"}
              </Button>

              <div className="flex items-center gap-2">
                {isDirty && (
                  <span className="text-xs text-amber-600 font-medium">
                    Alterações não salvas
                  </span>
                )}
                <Button
                  variant="default"
                  size="sm"
                  onClick={handleSave}
                  disabled={isBusy || (!isDirty && alt === (image.alt ?? "") && caption === (image.caption ?? ""))}
                  loading={isSaving}
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? "Salvando..." : "Salvar alterações"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmação de exclusão */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir imagem?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A imagem será removida do
              storage e do banco de dados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Excluindo..." : "Confirmar exclusão"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
