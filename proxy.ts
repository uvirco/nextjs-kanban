import { auth } from "@/auth";

export default auth((req) => {
  // Skip authentication in development if SKIP_AUTH is set
  if (process.env.SKIP_AUTH === "true") {
    return;
  }

  const protectedPaths = ["/dashboard", "/board", "/task", "/profile"];
  const adminPaths = ["/admin"];
  const isProtectedRoute = protectedPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );
  const isAdminRoute = adminPaths.some((path) =>
    req.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedRoute && !req.auth) {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  if (isAdminRoute && (!req.auth || req.auth.user?.role !== "ADMIN")) {
    const newUrl = new URL("/dashboard", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
