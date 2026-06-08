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

// A few pages are named differently between the two portals (e.g. the OSFA
// "scholarships" list is the student "iskolarships" page, and OSFA's
// "registrations" page is the student's singular "registration" page). Map the
// role-stripped bare path onto the destination role's actual page name so
// cross-role links resolve to a real route instead of 404ing.
const CROSS_ROLE_RENAME: Record<'/student' | '/osfa', Record<string, string>> = {
  '/student': { '/scholarships': '/iskolarships', '/registrations': '/registration' },
  '/osfa':    { '/iskolarships': '/scholarships', '/registration': '/registrations' },
};

// Strips any role prefix the sender may have typed (e.g. /student/iskolarships
// or /osfa/scholarships), translates portal-specific page names, and prepends
// the current viewer's role base — avoids /student/student/... or cross-role
// 404s/redirects.
export function withRoleBase(path: string, roleBase: '/student' | '/osfa'): string {
  const bare = path.replace(/^\/(osfa|student)/, '');
  return `${roleBase}${CROSS_ROLE_RENAME[roleBase][bare] ?? bare}`;
}
