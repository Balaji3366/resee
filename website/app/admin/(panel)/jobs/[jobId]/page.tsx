"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import ConfirmModal from "@/components/ConfirmModal";
import { useAdminJobDetail } from "@/hooks/useAdminJobDetail";

const WORK_MODES = ["remote", "hybrid", "onsite"];
const JOB_TYPES = ["full-time", "part-time", "internship", "contract"];
const EXPERIENCE_LEVELS = ["fresher", "1-3-years", "3-5-years", "5-plus-years"];

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AdminJobEditorPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = use(params);
  const router = useRouter();
  const { data: job, loading, refetch } = useAdminJobDetail(jobId);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [roleSlug, setRoleSlug] = useState("");
  const [workMode, setWorkMode] = useState("remote");
  const [jobType, setJobType] = useState("full-time");
  const [experienceLevel, setExperienceLevel] = useState("fresher");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [skillsInput, setSkillsInput] = useState("");
  const [description, setDescription] = useState("");
  const [responsibilitiesInput, setResponsibilitiesInput] = useState("");
  const [eligibilityInput, setEligibilityInput] = useState("");
  const [applyUrl, setApplyUrl] = useState("");
  const [savingMeta, setSavingMeta] = useState(false);
  const [savingAvailability, setSavingAvailability] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!job) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTitle(job.title);
    setCompany(job.company);
    setLocation(job.location);
    setRoleSlug(job.roleSlug ?? "");
    setWorkMode(job.workMode);
    setJobType(job.jobType);
    setExperienceLevel(job.experienceLevel);
    setSalaryMin(job.salaryMin?.toString() ?? "");
    setSalaryMax(job.salaryMax?.toString() ?? "");
    setSkillsInput(job.skills.join(", "));
    setDescription(job.description);
    setResponsibilitiesInput(job.responsibilities.join("\n"));
    setEligibilityInput(job.eligibility.join("\n"));
    setApplyUrl(job.applyUrl ?? "");
  }, [job]);

  async function handleSaveMeta() {
    setSavingMeta(true);

    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          company,
          location,
          roleSlug: roleSlug || null,
          workMode,
          jobType,
          experienceLevel,
          salaryMin: salaryMin ? Number(salaryMin) : null,
          salaryMax: salaryMax ? Number(salaryMax) : null,
          skills: skillsInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          description,
          responsibilities: linesToArray(responsibilitiesInput),
          eligibility: linesToArray(eligibilityInput),
          applyUrl: applyUrl || null,
        }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to save changes.");
        return;
      }

      toast.success("Saved.");
      refetch();
    } finally {
      setSavingMeta(false);
    }
  }

  async function handleToggleAvailability() {
    if (!job) return;
    setSavingAvailability(true);

    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: !job.isAvailable }),
      });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to update availability.");
        return;
      }

      toast.success(job.isAvailable ? "Job hidden." : "Job published.");
      refetch();
    } finally {
      setSavingAvailability(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);

    try {
      const res = await fetch(`/api/admin/jobs/${jobId}`, { method: "DELETE" });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Failed to delete job.");
        return;
      }

      toast.success("Job deleted.");
      router.push("/admin/jobs");
    } finally {
      setDeleting(false);
    }
  }

  if (loading || !job) {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="h-64 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">
            {job.title}
          </h1>
          <span
            className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-bold ${
              job.isAvailable ? "bg-teal-dim/20 text-teal" : "bg-panel-2 text-slate"
            }`}
          >
            {job.isAvailable ? "Available" : "Draft"}
          </span>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleToggleAvailability}
            disabled={savingAvailability}
            className={
              job.isAvailable
                ? "rounded-xl border border-red-400/30 px-5 py-2.5 font-semibold text-red-400 disabled:opacity-60"
                : "rounded-xl bg-amber px-5 py-2.5 font-semibold text-white transition hover:bg-amber-dim disabled:opacity-60"
            }
          >
            {job.isAvailable ? "Hide Job" : "Publish Job"}
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
            className="rounded-xl border border-bone/15 px-5 py-2.5 font-semibold text-bone transition hover:border-red-400/50 hover:text-red-400"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="space-y-5 rounded-3xl border border-amber/20 bg-panel p-8 shadow-md">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Company</label>
            <input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Location</label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">
              Role Slug (optional)
            </label>
            <input
              value={roleSlug}
              onChange={(e) => setRoleSlug(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Work Mode</label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            >
              {WORK_MODES.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Job Type</label>
            <select
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            >
              {JOB_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">Experience</label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">
              Salary Min (LPA, optional)
            </label>
            <input
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-semibold text-slate">
              Salary Max (LPA, optional)
            </label>
            <input
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
              className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">
            Skills (comma-separated)
          </label>
          <input
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">
            Responsibilities (one per line)
          </label>
          <textarea
            value={responsibilitiesInput}
            onChange={(e) => setResponsibilitiesInput(e.target.value)}
            rows={4}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">
            Eligibility (one per line)
          </label>
          <textarea
            value={eligibilityInput}
            onChange={(e) => setEligibilityInput(e.target.value)}
            rows={3}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold text-slate">
            Apply URL (optional)
          </label>
          <input
            value={applyUrl}
            onChange={(e) => setApplyUrl(e.target.value)}
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <button
          onClick={handleSaveMeta}
          disabled={savingMeta}
          className="w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
        >
          {savingMeta ? "Saving..." : "Save Job"}
        </button>
      </div>

      <p className="mt-2 text-xs text-slate">Slug: {job.slug}</p>

      <ConfirmModal
        open={deleteOpen}
        title="Delete this job posting?"
        message="This can't be undone. Any saved jobs or applications referencing this posting will be deleted too."
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
