"use client";

import Image from "next/image";
import { useState, useEffect, useCallback, useRef } from "react";
import { Upload, Image as ImageIcon } from "lucide-react";
import { usePresignedUpload, uploadFileToPresignedUrl } from "../../../hooks/useUpload";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Spinner } from "../../../components/ui/Spinner";
import { EmptyState } from "../../../components/ui/EmptyState";
import { toast } from "../../../components/ui/use-toast";
import {
  ImageDetailModal,
  type UploadedImage,
} from "./_components/ImageDetailModal";

export default function AdminUploadsPage() {
  const presignedUpload = usePresignedUpload();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  // Estado do modal de detalhes
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Carregar imagens da API
  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<UploadedImage[]>("/upload/images");
        if (res.success) {
          setImages(res.data || []);
        }
      } catch {
        // ignora
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const presigned = await presignedUpload.mutateAsync({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });
      await uploadFileToPresignedUrl(presigned.uploadUrl, file);

      // Adicionar ao state local — usar o ID real do banco
      const newImage: UploadedImage = {
        id: presigned.id,
        url: presigned.imageUrl,
        size: file.size,
        mimeType: file.type,
        created_at: new Date().toISOString(),
      };
      setImages((prev) => [newImage, ...prev]);
      toast({ title: "Upload realizado!", variant: "success" });
    } catch (err) {
      toast({ title: "Erro ao fazer upload", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [presignedUpload]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Uploads</h1>
        <Button disabled={uploading} onClick={() => fileInputRef.current?.click()}>
          <Upload className="w-4 h-4" />
          {uploading ? "Enviando..." : "Upload"}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      {uploading && <Spinner className="py-8" />}

      {images.length === 0 && !uploading ? (
        <EmptyState
          icon={<ImageIcon className="w-16 h-16" />}
          title="Nenhuma imagem enviada"
          description="Faça upload de imagens para usar nas notícias."
          action={
            <>
              <Button onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-4 h-4" />
                Primeiro Upload
              </Button>
            </>
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {images.map((img) => (
            <Card
              key={img.id}
              className="overflow-hidden cursor-pointer transition-all hover:shadow-md focus-visible:outline-none"
              onClick={() => {
                setSelectedImage(img);
                setModalOpen(true);
              }}
            >
              <div className="aspect-square bg-gray-100 relative">
                <Image
                  src={img.url}
                  alt={img.alt ?? ""}
                  fill
                  sizes="150px"
                  className="object-cover"
                />
              </div>
              <div className="p-2 space-y-1">
                <p className="text-xs text-gray-500 truncate">
                  {(img.size / 1024).toFixed(0)} KB
                </p>
                {img.alt && (
                  <p className="text-xs text-gray-400 truncate">
                    {img.alt}
                  </p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de detalhes da imagem */}
      <ImageDetailModal
        image={selectedImage}
        open={modalOpen}
        onOpenChange={(open) => {
          setModalOpen(open);
          if (!open) setSelectedImage(null);
        }}
        onUpdate={(updated) => {
          setImages((prev) =>
            prev.map((img) => (img.id === updated.id ? updated : img))
          );
        }}
        onDelete={(id) => {
          setImages((prev) => prev.filter((img) => img.id !== id));
        }}
      />
    </div>
  );
}
