import { Header } from "../../components/layouts/Header";
import { Footer } from "../../components/layouts/Footer";
import { getPublicCategories } from "../../lib/categories.server";
import { apiGet } from "../../lib/api.server";
import { PORTAL_NAME, PORTAL_TAGLINE, PORTAL_DESCRIPTION } from "../../lib/utils";

interface PortalInfo {
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
}

interface BannerData {
  imageUrl: string;
  alt: string | null;
  linkUrl: string | null;
}

async function getPortalInfo(): Promise<PortalInfo> {
  try {
    const res = await apiGet<PortalInfo>("/portal/info");
    if (res.success && res.data) return res.data;
  } catch {}
  return { name: PORTAL_NAME, slug: "portal", description: PORTAL_DESCRIPTION, logo: null };
}

async function getActiveBanner(): Promise<BannerData | null> {
  try {
    const res = await apiGet<BannerData>("/banner");
    if (res.success && res.data) return res.data;
  } catch {}
  return null;
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const [categories, portal, banner] = await Promise.all([
    getPublicCategories(),
    getPortalInfo(),
    getActiveBanner(),
  ]);

  return (
    <>
      <Header categories={categories} portalName={portal.name} portalTagline={portal.description || PORTAL_TAGLINE} banner={banner} />
      <main className="flex-1">{children}</main>
      <Footer portalName={portal.name} portalDescription={portal.description || ""} />
    </>
  );
}
