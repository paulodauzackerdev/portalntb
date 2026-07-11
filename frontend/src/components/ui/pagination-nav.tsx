"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"

interface PaginationNavProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

export function PaginationNav({ page, totalPages, onChange }: PaginationNavProps) {
  if (totalPages <= 1) return null

  const pages: (number | "ellipsis")[] = []
  const maxVisible = 5

  if (totalPages <= maxVisible + 2) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (page > 3) pages.push("ellipsis")
    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)
    for (let i = start; i <= end; i++) pages.push(i)
    if (page < totalPages - 2) pages.push("ellipsis")
    pages.push(totalPages)
  }

  return (
    <nav className="mx-auto flex w-full items-center justify-center gap-1" aria-label="pagination">
      <Button
        variant="ghost"
        size="sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="gap-1 pl-2.5"
      >
        <ChevronLeft className="h-4 w-4" />
        <span>Anterior</span>
      </Button>

      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
            ...
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? "outline" : "ghost"}
            size="sm"
            className="min-w-[2rem]"
            onClick={() => onChange(p)}
          >
            {p}
          </Button>
        )
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="gap-1 pr-2.5"
      >
        <span>Próximo</span>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}
