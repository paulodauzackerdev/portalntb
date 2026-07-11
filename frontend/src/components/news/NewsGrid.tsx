import type { NewsItem } from "../../types";
import { NewsCard } from "./NewsCard";
import { EmptyState } from "../ui/EmptyState";

interface NewsGridProps {
  news: NewsItem[];
  title?: string;
}

export function NewsGrid({ news, title }: NewsGridProps) {
  if (news.length === 0) {
    return (
      <EmptyState
        title="Nenhuma notícia encontrada"
        description="Volte mais tarde para conferir as novidades."
      />
    );
  }

  return (
    <section>
      {title && (
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px flex-1 bg-gray-200" />
          <h2 className="text-lg font-bold text-gray-900 uppercase tracking-[0.1em]">
            {title}
          </h2>
          <div className="h-px flex-1 bg-gray-200" />
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {news.map((item, index) => (
          <NewsCard key={item.id} news={item} index={index} />
        ))}
      </div>
    </section>
  );
}
