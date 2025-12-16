import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  const isStaticAsset =
    /\.(svg|png|jpg|jpeg|gif|ico|css|js|woff|woff2|ttf|eot|webp|mp4|webm)$/i.test(
      pathname
    );

  if (isStaticAsset) {
    return supabaseResponse;
  }

  const isProductRoute = pathname.startsWith("/product");
  const isPublicRoute =
    pathname === "/" ||
    pathname.startsWith("/product") ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/software-house");

  console.log("[v0] Middleware check:", {
    pathname,
    hasUser: !!user,
    isPublicRoute,
  });

  if (isProductRoute) {
    return supabaseResponse;
  }

  if (!(user || isPublicRoute)) {
    console.log("[v0] Redirecting to login - no user and not a public route");
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  if (isPublicRoute) {
    console.log("[v0] Allowing access to public route:", pathname);
  }

  // Redirect authenticated users away from auth pages
  if (user && pathname.startsWith("/auth")) {
    console.log("[v0] Redirecting authenticated user away from auth pages");
    const url = request.nextUrl.clone();
    url.pathname = "/onboarding-chat";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
