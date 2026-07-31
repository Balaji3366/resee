import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import PickerChipGrid from "@/components/interviews/PickerChipGrid";
import StepFooter from "@/components/onboarding/steps/StepFooter";
import type { InterviewRole, InterviewSetSummary } from "@/types/interview";

export default function StepSelectCareer({
  roles,
  sets,
  roleSlug,
  onSelect,
  onNext,
}: {
  roles: InterviewRole[];
  sets: InterviewSetSummary[];
  roleSlug: string | null;
  onSelect: (slug: string) => void;
  onNext: () => void;
}) {
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const filtered = roles.filter((role) =>
      role.name.toLowerCase().includes(query.trim().toLowerCase())
    );

    return filtered.map((role) => ({
      slug: role.slug,
      label: role.name,
      icon: role.icon,
      available: sets.some((s) => s.role.slug === role.slug && s.isAvailable),
    }));
  }, [roles, sets, query]);

  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-bone">Select Career</h2>
      <p className="mt-2 text-slate">Which role are you interviewing for?</p>

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-bone/15 bg-ink px-4 py-2.5">
        <Search size={16} className="text-slate" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search roles..."
          className="w-full bg-transparent text-sm text-bone placeholder:text-slate focus:outline-none"
        />
      </div>

      <div className="mt-4">
        <PickerChipGrid label="Roles" options={options} selectedSlug={roleSlug} onSelect={onSelect} />
      </div>

      <StepFooter onNext={onNext} nextDisabled={!roleSlug} />
    </div>
  );
}
