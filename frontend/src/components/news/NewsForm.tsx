"use client";

import { useState, useEffect, useCallback } from "react";
import NextImage from "next/image";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import ImageExtension from "@tiptap/extension-image";
import LinkExtension from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Image,
} from "lucide-react";

import { useCreateNews, useUpdateNews, useNews } from "../../hooks/useNews";
import { useCategories } from "../../hooks/useCategories";
import { useTags, useCreateTag } from "../../hooks/useTags";
import { usePresignedUpload, uploadFileToPresignedUrl } from "../../hooks/useUpload";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Spinner } from "../ui/Spinner";
import { toast } from "../ui/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const newsFormSchema = z.object({
  title: z.string().min(3, "Mínimo de 3 caracteres").max(200),
  excerpt: z.string().max(500).optional().or(z.literal("")),
  category_id: z.string().min(1, "Selecione uma categoria"),
  tag_ids: z.array(z.string()).optional(),
  seo_title: z.string().max(200).optional().or(z.literal("")),
  seo_description: z.string().max(300).optional().or(z.literal("")),
  seo_keywords: z.string().max(500).optional().or(z.literal("")),
  is_featured: z.boolean().optional(),
  is_breaking: z.boolean().optional(),
});

type NewsFormData = z.infer<typeof newsFormSchema>;

interface NewsFormProps {
  newsId?: string;
}

export function NewsForm({ newsId }: NewsFormProps) {
  const router = useRouter();
  const isEditing = !!newsId;

  const { data: news, isLoading: loadingNews } = useNews(newsId || "");
  const { data: categories } = useCategories();
  const { data: tags } = useTags();
  const createNews = useCreateNews();
  const updateNews = useUpdateNews();
  const createTag = useCreateTag();
  const queryClient = useQueryClient();
  const presignedUpload = usePresignedUpload();

  const [coverImageKey, setCoverImageKey] = useState<string | null>(null);
  const [coverImagePreview, setCoverImagePreview] = useState<string | null>(null);
  const [coverImageAlt, setCoverImageAlt] = useState("");
  const [uploading, setUploading] = useState(false);
  const [content, setContent] = useState("");
  const [newTagName, setNewTagName] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension,
      LinkExtension.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Escreva o conteúdo da notícia..." }),
    ],
    content: "",
    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewsFormData>({
    resolver: zodResolver(newsFormSchema),
    defaultValues: {
      title: "",
      excerpt: "",
      category_id: "",
      tag_ids: [],
      seo_title: "",
      seo_description: "",
      seo_keywords: "",
      is_featured: false,
      is_breaking: false,
    },
  });

  // Preencher formulário se editando
  useEffect(() => {
    if (news) {
      reset({
        title: news.title,
        excerpt: news.excerpt || "",
        category_id: news.category.id,
        tag_ids: news.tags.map((t) => t.id),
        seo_title: news.seo_title || "",
        seo_description: news.seo_description || "",
        seo_keywords: news.seo_keywords || "",
        is_featured: news.is_featured,
        is_breaking: news.is_breaking,
      });
      const key = news.cover_image_key || null;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCoverImageKey(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCoverImagePreview(news.cover_image_url || news.cover_image || key);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCoverImageAlt(news.cover_image_alt || "");
    }
  }, [news?.id, reset]);

  // Sincronizar conteúdo do editor quando a notícia carregar
  useEffect(() => {
    if (news?.content && editor) {
      editor.commands.setContent(news.content);
    }
  }, [news?.content, editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const presigned = await presignedUpload.mutateAsync({
        filename: file.name,
        contentType: file.type,
        size: file.size,
      });
      // Upload do arquivo direto pro R2 via URL assinada
      await uploadFileToPresignedUrl(presigned.uploadUrl, file);
      // Salvar a key retornada
      setCoverImageKey(presigned.key);
      // Preview: usar URL pública já resolvida pelo backend
      setCoverImagePreview(presigned.imageUrl);
      toast({ title: "Imagem enviada com sucesso!" });
    } catch (err) {
      console.error("Erro no upload:", err);
      toast({ title: "Erro ao fazer upload da imagem", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }, [presignedUpload]);

  const addTag = async () => {
    if (!newTagName.trim()) return;
    try {
      await createTag.mutateAsync({ name: newTagName.trim() });
      setNewTagName("");
      queryClient.invalidateQueries({ queryKey: ["tags"] });
    } catch (err) {
      toast({ title: "Erro ao criar tag", description: err instanceof Error ? err.message : "Erro", variant: "destructive" });
    }
  };

  const onSubmit = async (data: NewsFormData) => {
    setSubmitError(null);
    try {
      const textContent = (content || '').replace(/<[^>]*>/g, '').trim();

      if (textContent.length < 50) {
        setSubmitError(`Conteúdo deve ter no mínimo 50 caracteres (atual: ${textContent.length}). Digite mais texto no editor.`);
        return;
      }

      if (!data.category_id) {
        setSubmitError("Selecione uma categoria.");
        return;
      }

      const payload = {
        ...data,
        content,
        cover_image_key: coverImageKey || null,
        cover_image_alt: coverImageAlt || null,
        tag_ids: data.tag_ids || [],
      };

      if (isEditing) {
        await updateNews.mutateAsync({ id: newsId!, ...payload });
      } else {
        await createNews.mutateAsync(payload);
      }
      router.push("/noticias");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao salvar notícia";
      console.error("Erro ao criar notícia:", err);
      setSubmitError(message);
    }
  };

  if (isEditing && loadingNews) {
    return <Spinner className="py-12" />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl">
      {/* Title */}
      <Input
        label="Título"
        placeholder="Título da notícia"
        error={errors.title?.message}
        {...register("title")}
      />

      {/* Content Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Conteúdo</label>
        {!editor ? (
          <p className="text-xs text-gray-500 mb-1">Carregando editor...</p>
        ) : (!content || content.replace(/<[^>]*>/g, '').trim().length < 50 ? (
          <p className="text-xs text-amber-600 mb-1">Mínimo de 50 caracteres ({content ? content.replace(/<[^>]*>/g, '').trim().length : 0}/50)</p>
        ) : null)}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded ${editor?.isActive("bold") ? "bg-gray-200" : "hover:bg-gray-200"}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded ${editor?.isActive("italic") ? "bg-gray-200" : "hover:bg-gray-200"}`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`p-1.5 rounded ${editor?.isActive("heading", { level: 2 }) ? "bg-gray-200" : "hover:bg-gray-200"}`}
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`p-1.5 rounded ${editor?.isActive("bulletList") ? "bg-gray-200" : "hover:bg-gray-200"}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`p-1.5 rounded ${editor?.isActive("orderedList") ? "bg-gray-200" : "hover:bg-gray-200"}`}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBlockquote().run()}
              className={`p-1.5 rounded ${editor?.isActive("blockquote") ? "bg-gray-200" : "hover:bg-gray-200"}`}
            >
              <Quote className="w-4 h-4" />
            </button>
            <span className="w-px h-5 bg-gray-300 mx-1" />
            <button
              type="button"
              onClick={() => editor?.chain().focus().undo().run()}
              className="p-1.5 rounded hover:bg-gray-200"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().redo().run()}
              className="p-1.5 rounded hover:bg-gray-200"
            >
              <Redo className="w-4 h-4" />
            </button>
          </div>
          {/* Editor */}
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none p-4 min-h-[300px] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Excerpt */}
        <div className="md:col-span-2">
          <Input
            label="Resumo (Excerpt)"
            placeholder="Breve resumo da notícia..."
            error={errors.excerpt?.message}
            {...register("excerpt")}
          />
        </div>

        {/* Category */}
        <div className="space-y-1">
          <label className="text-sm font-medium leading-none">Categoria</label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            {...register("category_id")}
          >
            <option value="">Selecione...</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.category_id?.message && <p className="text-sm text-destructive">{errors.category_id.message}</p>}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {(tags || []).map((tag) => (
              <label key={tag.id} className="flex items-center gap-1 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  value={tag.id}
                  {...register("tag_ids")}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                {tag.name}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Nova tag..."
              className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
            <Button type="button" variant="secondary" size="sm" onClick={addTag}>
              Adicionar
            </Button>
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de Capa</label>
          {coverImagePreview ? (
            <div className="relative rounded-lg overflow-hidden mb-2">
              <NextImage src={coverImagePreview} alt="Preview" width={400} height={128} className="w-full h-32 object-cover" />
              <button
                type="button"
                onClick={() => { setCoverImageKey(null); setCoverImagePreview(null); }}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded"
              >
                Remover
              </button>
            </div>
          ) : (
            <label className="flex items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
              <div className="text-center">
                <Image className="w-6 h-6 text-gray-400 mx-auto mb-1" aria-hidden="true" />
                <span className="text-xs text-gray-500">
                  {uploading ? "Enviando..." : "Clique para upload"}
                </span>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImageUpload(file);
                }}
              />
            </label>
          )}
          <Input
            placeholder="Texto alternativo"
            value={coverImageAlt}
            onChange={(e) => setCoverImageAlt(e.target.value)}
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register("is_featured")} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Notícia em destaque
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" {...register("is_breaking")} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            Notícia urgente
          </label>
        </div>

        {/* SEO */}
        <div className="md:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">SEO</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="SEO Title" placeholder="Título para SEO" {...register("seo_title")} />
            <Input label="SEO Description" placeholder="Descrição para SEO" {...register("seo_description")} />
            <Input label="SEO Keywords" placeholder="palavra1, palavra2" {...register("seo_keywords")} />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-4">
          {submitError}
        </div>
      )}

      {/* Validation Errors Summary */}
      {Object.keys(errors).length > 0 && (
        <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg p-4">
          <p className="font-medium mb-1">Corrija os erros abaixo:</p>
          <ul className="list-disc list-inside space-y-1">
            {errors.title && <li>Título: {errors.title.message}</li>}
            {errors.category_id && <li>Categoria: {errors.category_id.message}</li>}
            {errors.excerpt && <li>Resumo: {errors.excerpt.message}</li>}
          </ul>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t">
        <Button
          type="submit"
          loading={createNews.isPending || updateNews.isPending}
        >
          {isEditing ? "Salvar Alterações" : "Criar Notícia"}
        </Button>
        <Button type="button" variant="secondary" onClick={() => router.push("/noticias")}>
          Cancelar
        </Button>
      </div>
    </form>
  );
}
