import { NewsForm } from "../../../../../components/news/NewsForm";

export default async function EditNewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Editar Notícia</h1>
      <NewsForm newsId={slug} />
    </div>
  );
}
