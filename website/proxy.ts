import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/documents",
  "/resume",
  "/resume-history",
  "/chat",
  "/quiz",
  "/onboarding",
  "/settings",
  "/learning",
  "/practice",
  "/progress",
  "/resumes",
  "/interviews",
  "/jobs",
];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

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

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdminPath) {
    if (pathname === "/admin/login" || pathname === "/admin/unauthorized") {
      return response;
    }

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    const { data: adminRow } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .maybeSingle();

    if (!adminRow) {
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
    }

    return response;
  }

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (!isProtected) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("onboarding_completed")
    .eq("id", user.id)
    .single();

  const onboardingCompleted = profile?.onboarding_completed ?? false;

  if (!onboardingCompleted && pathname !== "/onboarding") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  const isEditingOnboarding = request.nextUrl.searchParams.get("edit") === "true";

  if (onboardingCompleted && pathname === "/onboarding" && !isEditingOnboarding) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/documents/:path*",
    "/resume/:path*",
    "/resume-history/:path*",
    "/chat/:path*",
    "/quiz/:path*",
    "/onboarding/:path*",
    "/settings/:path*",
    "/learning/:path*",
    "/practice/:path*",
    "/progress/:path*",
    "/resumes/:path*",
    "/interviews/:path*",
    "/jobs/:path*",
    "/admin/:path*",
  ],
};
