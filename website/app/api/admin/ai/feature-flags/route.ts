import { authorizeAdminRequest } from "@/lib/adminAuth";
import { getFeatureFlagDetails, setFeatureFlag } from "@/lib/ai/featureFlags";
import { logAdminAction } from "@/lib/logging/auditLogger";
import type { FeatureFlag } from "@/lib/config/featureFlags.config";
import { featureFlags as staticDefaults } from "@/lib/config/featureFlags.config";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const flags = await getFeatureFlagDetails();

    return Response.json({ success: true, flags });
  } catch (error) {
    console.error("Admin feature flags list error:", error);

    return Response.json(
      { success: false, message: "Failed to load feature flags." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await authorizeAdminRequest();
    if (auth.error) return auth.error;

    const body = await request.json();
    const { slug, enabled } = body ?? {};

    if (typeof slug !== "string" || !(slug in staticDefaults) || typeof enabled !== "boolean") {
      return Response.json(
        { success: false, message: "A known flag slug and boolean enabled value are required." },
        { status: 400 }
      );
    }

    await setFeatureFlag(slug as FeatureFlag, enabled);

    void logAdminAction({
      adminUserId: auth.userId,
      action: "ai_feature_flag_toggled",
      targetTable: "feature_flags",
      targetId: slug,
      after: { enabled },
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("Admin feature flag update error:", error);

    return Response.json(
      { success: false, message: "Failed to update feature flag." },
      { status: 500 }
    );
  }
}
