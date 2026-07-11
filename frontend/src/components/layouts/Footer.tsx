import Link from "next/link";
import { getPublicCategories } from "../../lib/categories.server";
import { splitPortalName, PORTAL_DESCRIPTION } from "../../lib/utils";

interface FooterProps {
  portalName: string;
  portalDescription: string;
}

export async function Footer({ portalName, portalDescription }: FooterProps) {
  const categories = await getPublicCategories();
  const [firstWord, rest] = splitPortalName(portalName);

  return (
    <footer className="bg-gray-950 text-gray-400 mt-auto border-t border-gray-800">
      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block group mb-4">
              <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">
                <span className="text-blue-400">{firstWord}</span>{rest ? ` ${rest}` : ""}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 max-w-md leading-relaxed">
              {portalDescription || PORTAL_DESCRIPTION}
            </p>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] font-semibold text-gray-300 mb-4">
              Categorias
            </h4>
            {categories.length > 0 ? (
              <ul className="space-y-2.5">
                {categories.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      href={`/categorias/${cat.slug}`}
                      className="text-sm text-gray-500 hover:text-white transition-colors"
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-600">Nenhuma categoria cadastrada</p>
            )}
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs uppercase tracking-[0.15em] font-semibold text-gray-300 mb-4">
              Links
            </h4>
            <ul className="space-y-2.5">
              <li>
                <Link href="/rss" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Feed RSS
                </Link>
              </li>
              <li>
                <Link href="/sitemap.xml" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Sitemap
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-gray-500 hover:text-white transition-colors">
                  Painel Administrativo
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
          <span>&copy; {new Date().getFullYear()} {portalName}. Todos os direitos reservados.</span>
          <span>Feito com ♥ na Bahia</span>
        </div>
      </div>
    </footer>
  );
}
