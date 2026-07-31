"use client";

import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import PickerChipGrid from "@/components/interviews/PickerChipGrid";
import MultiSelectChips from "./MultiSelectChips";
import { useInterviewRoles } from "@/hooks/useInterviewRoles";
import { useJobPreferences } from "@/hooks/useJobPreferences";
import type { JobWorkMode } from "@/types/jobs";

const WORK_MODES: { value: JobWorkMode; label: string }[] = [
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
  { value: "onsite", label: "Onsite" },
];

export default function JobPreferencesCard() {
  const { data: roles } = useInterviewRoles();
  const { data: preferences, hasPreferences, loading, update } = useJobPreferences();

  const [editing, setEditing] = useState(false);
  const [preferredRoles, setPreferredRoles] = useState<string[]>([]);
  const [preferredWorkMode, setPreferredWorkMode] = useState<JobWorkMode | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (preferences) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreferredRoles(preferences.preferredRoles);
      setPreferredWorkMode(preferences.preferredWorkMode);
    }
  }, [preferences]);

  useEffect(() => {
    if (!loading && !hasPreferences) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditing(true);
    }
  }, [loading, hasPreferences]);

  async function handleSave() {
    setSaving(true);
    try {
      await update({
        preferredRoles,
        preferredLocations: preferences?.preferredLocations ?? [],
        preferredWorkMode,
      });
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="h-40 animate-pulse rounded-3xl border border-amber/20 bg-panel" />;
  }

  if (!editing) {
    const roleLabels = (roles ?? [])
      .filter((r) => preferredRoles.includes(r.slug))
      .map((r) => r.name);

    return (
      <div className="rounded-2xl border border-amber/20 bg-panel p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate">Your job preferences</p>
            <p className="mt-1 text-bone">
              {roleLabels.length > 0 ? roleLabels.join(", ") : "Any role"}
              {preferredWorkMode ? ` · ${preferredWorkMode}` : ""}
            </p>
          </div>
          <button
            onClick={() => setEditing(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border border-bone/15 px-3 py-2 text-sm font-semibold text-bone hover:bg-ink"
          >
            <Settings2 size={14} /> Edit
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-amber/20 bg-panel p-6">
      <h3 className="font-display text-lg font-bold text-bone">Set your job preferences</h3>
      <p className="mt-1 text-sm text-slate">
        Helps us recommend jobs that actually match what you&apos;re looking for.
      </p>

      <div className="mt-4 space-y-4">
        <MultiSelectChips
          label="Preferred Roles"
          options={(roles ?? []).map((r) => ({ slug: r.slug, label: r.name, icon: r.icon }))}
          selectedSlugs={preferredRoles}
          onToggle={(slug) =>
            setPreferredRoles((prev) =>
              prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
            )
          }
        />

        <PickerChipGrid
          label="Preferred Work Mode"
          options={WORK_MODES.map((m) => ({ slug: m.value, label: m.label, available: true }))}
          selectedSlug={preferredWorkMode}
          onSelect={(slug) => setPreferredWorkMode(slug as JobWorkMode)}
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="mt-6 w-full rounded-xl bg-amber py-3 font-semibold text-white transition hover:bg-amber-dim disabled:opacity-60"
      >
        {saving ? "Saving..." : "Save Preferences"}
      </button>
    </div>
  );
}
