// Shared helpers for resolving a notification's `route`/`link` field into a
// navigable destination. OSFA staff can attach an arbitrary `link` when
// creating announcements — sometimes they paste a full URL copied straight
// from their own (OSFA) browser tab, e.g. "https://iskomo.vercel.app/osfa/notifications".
// Treating every absolute URL as "external" would send students to OSFA-only
// pages in a new tab. Same-origin URLs are actually internal routes and must
// go through the normal role-prefix resolution; only cross-origin URLs are
// genuinely external links.
export function resolveNotifRoute(route: string | null | undefined): { external: boolean; path: string | null } {
  if (!route) return { external: false, path: null };
  if (/^https?:\/\//i.test(route)) {
    try {
      const url = typeof window !== 'undefined' ? new URL(route, window.location.origin) : new URL(route);
      if (typeof window !== 'undefined' && url.origin === window.location.origin) {
        return { external: false, path: url.pathname + url.search + url.hash };
      }
    } catch { /* malformed URL — fall through and treat as external */ }
    return { external: true, path: route };
  }
  return { external: false, path: route };
}

// Strips any role prefix the sender may have typed (e.g. /student/iskolarships
// or /osfa/scholarships) and prepends the current viewer's role base — avoids
// /student/student/... or cross-role 404s/redirects.
export function withRoleBase(path: string, roleBase: '/student' | '/osfa'): string {
  return `${roleBase}${path.replace(/^\/(osfa|student)/, '')}`;
}
