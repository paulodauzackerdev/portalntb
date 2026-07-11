export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // Remove acentos
    .replace(/[^a-z0-9]+/g, "-")    // Substitui caracteres especiais por hífen
    .replace(/^-|-$/g, "")           // Remove hífens no início/fim
    .replace(/-+/g, "-");            // Remove hífens duplicados
}
