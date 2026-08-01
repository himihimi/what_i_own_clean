import createMiddleware from "next-intl/middleware";

import { routing } from "./i18n/routing";

/**
 * Next.js 16 renamed Middleware to Proxy; the file must be called `proxy.ts`
 * at the project root. next-intl still ships its handler as
 * `next-intl/middleware` — same function, older name.
 *
 * It negotiates a locale from the URL, the cookie next-intl sets, and the
 * Accept-Language header, then redirects `/` to `/en` or `/zh`.
 */
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals, and files with an extension.
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
