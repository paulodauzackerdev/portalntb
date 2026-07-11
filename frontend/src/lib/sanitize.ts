import DOMPurify from "dompurify";

/**
 * Sanitiza HTML para renderização segura no frontend.
 * Segunda camada de defesa contra XSS (a primeira está no backend com sanitize-html).
 */
export function sanitizeHtml(html: string): string {
  if (typeof window === "undefined") {
    // SSR: não temos DOMPurify no servidor, confiar na sanitização do backend
    return html;
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "b", "i", "u", "em", "strong", "a", "img",
      "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "pre", "code",
      "figure", "figcaption", "span", "div",
      "iframe", "hr", "sub", "sup", "table", "thead", "tbody", "tr", "th", "td",
    ],
    ALLOWED_ATTR: [
      "href", "target", "rel", "title",
      "src", "alt", "width", "height",
      "style", "class",
      "frameborder", "allowfullscreen",
    ],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ["target"], // permite target em links
  });
}
