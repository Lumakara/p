import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Routes that require an authenticated session.
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/orders(.*)",
  "/api/admin(.*)",
]);

const isAdminRoute = createRouteMatcher(["/dashboard(.*)", "/api/admin(.*)"]);

function adminIds(): string[] {
  return (process.env.ADMIN_USER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default clerkMiddleware(async (auth, req) => {
  if (!isProtectedRoute(req)) return;

  const { userId, sessionClaims, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  if (isAdminRoute(req)) {
    const role = (sessionClaims as { metadata?: { role?: string } } | null)
      ?.metadata?.role;
    const allowed = role === "admin" || adminIds().includes(userId);
    if (!allowed) {
      // Non-admins are sent to the home page (or 403 for API routes).
      if (req.nextUrl.pathname.startsWith("/api")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      return NextResponse.redirect(new URL("/", req.url));
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files.
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes.
    "/(api|trpc)(.*)",
  ],
};
