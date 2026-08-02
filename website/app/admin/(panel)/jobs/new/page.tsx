"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const WORK_MODES = ["remote", "hybrid", "onsite"];
const JOB_TYPES = ["full-time", "part-time", "internship", "contract"];
const EXPERIENCE_LEVELS = ["fresher", "1-3-years", "3-5-years", "5-plus-years"];

function linesToArray(value: string): string[] {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function NewJobPage() {
  const router = useRouter();

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
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title.trim() || !company.trim() || !location.trim() || !description.trim()) {
      toast.error("Title, company, location, and description are required.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: `${slugify(company)}-${slugify(title)}`,
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
        toast.error(json.message || "Failed to create job.");
        return;
      }

      toast.success("Job created.");
      router.push(`/admin/jobs/${json.jobId}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold text-bone md:text-4xl">New Job</h1>
        <p className="mt-2 text-slate">Starts hidden — publish once details are complete.</p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-3xl border border-amber/20 bg-panel p-8 shadow-md"
      >
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
              placeholder="e.g. Bengaluru, India"
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
              placeholder="e.g. software-engineer"
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
            placeholder="React, TypeScript, Node.js"
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
            placeholder="https://…"
            className="w-full rounded-xl border border-bone/15 bg-panel px-4 py-3 text-bone outline-none focus:border-amber"
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-amber py-4 text-lg font-bold text-white transition hover:bg-amber-dim disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create Job"}
        </button>
      </form>
    </div>
  );
}
