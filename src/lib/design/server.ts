import "server-only";

import { createClient } from "@supabase/supabase-js";
import { unstable_cache } from "next/cache";
import { DEFAULT_SITE_DESIGN, isSiteDesign, type SiteDesign } from "@/lib/design/presets";

export const SITE_DESIGN_SETTING_KEY = "site_design";
export const SITE_DESIGN_CACHE_TAG = "site-design";

async function readSiteDesign(): Promise<SiteDesign> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRole) return DEFAULT_SITE_DESIGN;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const supabase = createClient(url, serviceRole, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { data, error } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", SITE_DESIGN_SETTING_KEY)
      .abortSignal(controller.signal)
      .maybeSingle();
    return !error && isSiteDesign(data?.value) ? data.value : DEFAULT_SITE_DESIGN;
  } catch {
    return DEFAULT_SITE_DESIGN;
  } finally {
    clearTimeout(timer);
  }
}

const readCachedSiteDesign = unstable_cache(readSiteDesign, ["site-design-v1"], {
  revalidate: 60,
  tags: [SITE_DESIGN_CACHE_TAG],
});

export async function getSiteDesign(): Promise<SiteDesign> {
  try {
    return await readCachedSiteDesign();
  } catch {
    return DEFAULT_SITE_DESIGN;
  }
}
