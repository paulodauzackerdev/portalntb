"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Trash2, Save, Check, Library, MousePointerClick, CalendarDays, TrendingUp, Fingerprint, RotateCcw } from "lucide-react";
import NextImage from "next/image";
import { usePresignedUpload, uploadFileToPresignedUrl } from "../../../hooks/useUpload";
import { api } from "../../../lib/api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Spinner } from "../../../components/ui/Spinner";
import { toast } from "../../../components/ui/use-toast";

interface BannerData {
  id: string;
  imageKey: string;
  imageUrl: string;
  alt: string | null;
  linkUrl: string | null;
  active: boolean;
  totalClicks: number;
}

interface BannerStats {
  totalClicks: number;
  clicksToday: number;
  clicksThisWeek: number;
  uniqueIps: number;
  clicksByDay: { date: string; count: number }[];
}

interface UploadedImage {
  id: string;
  url: string;
  key: string;
}

export default function AdminBannerPage() {
  const presignedUpload = usePresignedUpload();
  const [banner, setBanner] = useState<BannerData | null>(null);
  const [stats, setStats] = useState<BannerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageKey, setImageKey] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [alt, setAlt] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [active, setActive] = useState(true);
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [showGallery, setShowGallery] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar banner atual, estatísticas e imagens já enviadas
  useEffect(() => {
    async function load() {
      try {
        const [bannerRes, statsRes, imagesRes] = await Promise.allSettled([
          api.get<BannerData>("/banner/admin"),
          api.get<BannerStats>("/banner/stats"),
          api.get<UploadedImage[]>("/upload/images"),
        ]);

        if (bannerRes.status === "fulfilled" && bannerRes.value.success && bannerRes.value.data) {
          const b = bannerRes.value.data;
          setBanner(b);
          setImageKey(b.imageKey);
          setImagePreview(b.imageUrl);
          setAlt(b.alt || "");
          setLinkUrl(b.linkUrl || "");
          setActive(b.active);
        }

        if (statsRes.status === "fulfilled" && statsRes.value.success) {
          setStats(statsRes.value.data);
        }

        if (imagesRes.status === "fulfilled" && imagesRes.value.success) {
          setUploadedImages(imagesRes.value.data || []);
        }
      } catch {
        // ignora
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const presigned = await presignedUpload.mutateAsync({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });
      await uploadFileToPresignedUrl(presigned.uploadUrl, file);
      setImageKey(presigned.key);
      setImagePreview(presigned.imageUrl);
      // Adicionar à galeria local
      setUploadedImages((prev) => [{ id: presigned.key, url: presigned.imageUrl, key: presigned.key }, ...prev]);
      setShowGallery(false);
      toast({ title: "Imagem enviada!" });
    } catch (err) {
      toast({
        title: "Erro no upload",
        description: err instanceof Error ? err.message : "Erro",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const selectImage = (img: UploadedImage) => {
    setImageKey(img.key);
    setImagePreview(img.url);
    setShowGallery(false);
  };

  const handleSave = async () => {
    if (!imageKey) {
      toast({ title: "Selecione uma imagem primeiro", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const res = await api.put<BannerData>("/banner", {
        imageKey,
        alt: alt || null,
        linkUrl: linkUrl || null,
        active,
      });
      if (res.success) {
        setBanner(res.data);
        // Recarrega estatísticas (pode ter mudado se o banner foi recriado)
        const newStatsRes = await api.get<BannerStats>("/banner/stats");
        if (newStatsRes.success) setStats(newStatsRes.data);
        toast({ title: "Banner salvo com sucesso!" });
      }
    } catch (err) {
      toast({
        title: "Erro ao salvar banner",
        description: err instanceof Error ? err.message : "Erro",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja remover o banner?")) return;
    try {
      await api.delete("/banner");
      setBanner(null);
      setStats(null);
      setImageKey("");
      setImagePreview("");
      setAlt("");
      setLinkUrl("");
      setActive(true);
      toast({ title: "Banner removido" });
    } catch (err) {
      toast({
        title: "Erro ao remover banner",
        description: err instanceof Error ? err.message : "Erro",
        variant: "destructive",
      });
    }
  };

  const handleResetStats = async () => {
    setResetting(true);
    try {
      await api.delete("/banner/stats");
      // Recarrega as stats para mostrar tudo zerado
      const statsRes = await api.get<BannerStats>("/banner/stats");
      if (statsRes.success) {
        setStats(statsRes.data);
      }
      toast({ title: "Estatísticas resetadas com sucesso!" });
    } catch (err) {
      toast({
        title: "Erro ao resetar estatísticas",
        description: err instanceof Error ? err.message : "Erro",
        variant: "destructive",
      });
    } finally {
      setResetting(false);
      setShowResetConfirm(false);
    }
  };

  if (loading) return <Spinner className="py-12" />;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Banner (Anúncio)</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gerencie o banner 728x90 que aparece no topo do site.
        </p>
      </div>

      {/* Preview */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Preview</h2>
        <div className="bg-gray-100 rounded-lg flex items-center justify-center min-h-[90px] overflow-hidden">
          {imagePreview ? (
            <NextImage
              src={imagePreview}
              alt={alt || "Banner"}
              width={728}
              height={90}
              className="max-w-full"
              style={{ maxHeight: "90px", objectFit: "contain" }}
            />
          ) : (
            <div className="text-center py-8">
              <Upload className="w-10 h-10 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Nenhuma imagem selecionada</p>
            </div>
          )}
        </div>
      </div>

      {/* Seleção de imagem: upload OU galeria */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">Imagem</h2>
          {uploadedImages.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowGallery(!showGallery)}
            >
              <Library className="w-4 h-4" />
              {showGallery ? "Fechar galeria" : "Escolher das enviadas"}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Enviando..." : "Upload nova imagem"}
          </Button>
        </div>
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

        {imageKey && (
          <p className="text-xs text-gray-400 truncate">{imageKey}</p>
        )}

        {/* Galeria de imagens enviadas */}
        {showGallery && uploadedImages.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-2">Selecione uma imagem já enviada:</p>
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
              {uploadedImages.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => selectImage(img)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    imageKey === img.key
                      ? "border-blue-500 ring-2 ring-blue-200"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <NextImage
                    src={img.url}
                    alt=""
                    fill
                    sizes="100px"
                    className="object-cover"
                  />
                  {imageKey === img.key && (
                    <div className="absolute top-1 right-1 bg-blue-500 text-white rounded-full p-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Configurações */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700">Configurações</h2>

        <Input
          label="Texto alternativo (alt)"
          placeholder="Descrição da imagem"
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
        />

        <Input
          label="Link de destino"
          placeholder="https://exemplo.com"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />

        <label className="flex items-center gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Banner ativo
        </label>
      </div>

      {/* Ações */}
      <div className="flex items-center gap-3">
        <Button onClick={handleSave} loading={saving}>
          <Save className="w-4 h-4" />
          Salvar Banner
        </Button>
        {banner && (
          <Button variant="destructive" onClick={handleDelete}>
            <Trash2 className="w-4 h-4" />
            Remover
          </Button>
        )}
      </div>

      {/* Estatísticas */}
      {banner && stats && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-700">Estatísticas</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={() => setShowResetConfirm(true)}
            >
              <RotateCcw className="w-4 h-4" />
              Resetar
            </Button>
          </div>

          {/* Cards de métricas */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <MousePointerClick className="w-4 h-4" />
                <span className="text-xs font-medium">Total de Cliques</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalClicks}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-700 mb-1">
                <CalendarDays className="w-4 h-4" />
                <span className="text-xs font-medium">Hoje</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.clicksToday}</p>
            </div>

            <div className="bg-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-purple-700 mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-medium">Esta Semana</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.clicksThisWeek}</p>
            </div>

            <div className="bg-amber-50 rounded-lg p-4">
              <div className="flex items-center gap-2 text-amber-700 mb-1">
                <Fingerprint className="w-4 h-4" />
                <span className="text-xs font-medium">IPs Únicos</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{stats.uniqueIps}</p>
            </div>
          </div>

          {/* Gráfico de cliques por dia (últimos 30 dias) */}
          {stats.clicksByDay.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Cliques por Dia (últimos 30 dias)
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-end gap-1 h-32">
                  {(() => {
                    const maxCount = Math.max(...stats.clicksByDay.map((d) => d.count), 1);
                    return stats.clicksByDay.map((day) => {
                      const height = (day.count / maxCount) * 100;
                      return (
                        <div
                          key={day.date}
                          className="flex-1 flex flex-col items-center justify-end group relative"
                        >
                          <div className="text-[10px] text-gray-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {day.count}
                          </div>
                          <div
                            className="w-full bg-blue-500 rounded-t hover:bg-blue-600 transition-colors cursor-pointer min-h-[2px]"
                            style={{ height: `${Math.max(height, 2)}%` }}
                            title={`${day.date}: ${day.count} cliques`}
                          />
                          <div className="text-[9px] text-gray-400 mt-1 truncate w-full text-center">
                            {new Date(day.date + "T00:00:00").toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          )}

          {stats.clicksByDay.length === 0 && stats.totalClicks > 0 && (
            <p className="text-sm text-gray-500">
              Os cliques existentes foram migrados do sistema anterior. Dados diários completos começarão a ser exibidos a partir de agora.
            </p>
          )}

          {stats.totalClicks === 0 && (
            <p className="text-sm text-gray-500">
              Nenhum clique registrado ainda. Compartilhe o link do banner para começar.
            </p>
          )}
        </div>
      )}

      {/* Modal de confirmação de reset */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Resetar estatísticas?</h3>
            <p className="text-sm text-gray-500 mb-6">
              Todos os registros de clique serão excluídos permanentemente. Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowResetConfirm(false)}
                disabled={resetting}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleResetStats}
                loading={resetting}
              >
                <RotateCcw className="w-4 h-4" />
                Resetar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
