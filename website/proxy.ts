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
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

          response = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;
  const isAdminPath = pathname === "/admin" || pathname.startsWith("/admin/");

  // A thrown auth/database error here (network blip, malformed cookie) must
  // never surface as a raw 500 on every protected route — fail closed to the
  // relevant login page instead, same outcome as "not authenticated".
  let user;
  try {
    ({
      data: { user },
    } = await supabase.auth.getUser());
  } catch (error) {
    console.error("proxy: auth.getUser() failed:", error);
    return NextResponse.redirect(new URL(isAdminPath ? "/admin/login" : "/login", request.url));
  }

  if (isAdminPath) {
    if (pathname === "/admin/login" || pathname === "/admin/unauthorized") {
      return response;
    }

    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    try {
      const { data: adminRow } = await supabase
        .from("admin_users")
        .select("role")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!adminRow) {
        return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
      }
    } catch (error) {
      console.error("proxy: admin_users lookup failed:", error);
      return NextResponse.redirect(new URL("/admin/unauthorized", request.url));
    }

    return response;
  }

  const isProtected = PROTECTED_ROUTES.some((route) => pathname.startsWith(route));

  if (!isProtected) {
    return response;
  }

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  let onboardingCompleted = false;
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", user.id)
      .single();

    onboardingCompleted = profile?.onboarding_completed ?? false;
  } catch (error) {
    console.error("proxy: profiles lookup failed:", error);
    // Fail closed: treat as onboarding-incomplete rather than letting an
    // unexpected error grant access to a protected route.
    if (pathname !== "/onboarding") {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
    return response;
  }

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
