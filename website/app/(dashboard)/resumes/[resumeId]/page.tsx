"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Copy, Download, History } from "lucide-react";
import { useResumeDetail } from "@/hooks/useResumeDetail";
import { useResumeAutosave } from "@/hooks/useResumeAutosave";
import { useResumeTemplates } from "@/hooks/useResumeTemplates";
import SortableList from "@/components/admin/SortableList";
import SectionEditorPanel from "@/components/resume-builder/SectionEditorPanel";
import AddSectionMenu from "@/components/resume-builder/AddSectionMenu";
import AutosaveIndicator from "@/components/resume-builder/AutosaveIndicator";
import VersionHistoryDrawer from "@/components/resume-builder/VersionHistoryDrawer";
import ZoomControl from "@/components/resume-builder/ZoomControl";
import ModernTemplate from "@/components/resume-builder/templates/ModernTemplate";
import AtsFriendlyTemplate from "@/components/resume-builder/templates/AtsFriendlyTemplate";
import { downloadResumePdf } from "@/lib/resume-pdf";
import { createEmptySection, type ResumeContent, type ResumeSectionType } from "@/types/resume-builder";

const inputClass =
  "w-full rounded-lg border border-bone/15 bg-ink px-3 py-2 text-sm text-bone placeholder:text-slate focus:border-amber focus:outline-none";

export default function ResumeEditorPage() {
  const params = useParams<{ resumeId: string }>();
  const resumeId = params.resumeId;
  const router = useRouter();

  const { data: resume, loading } = useResumeDetail(resumeId);
  const { data: templates } = useResumeTemplates();
  const { status: autosaveStatus, save, saveNow } = useResumeAutosave(resumeId);

  const [title, setTitle] = useState("");
  const [templateSlug, setTemplateSlug] = useState("");
  const [content, setContent] = useState<ResumeContent | null>(null);
  const [zoom, setZoom] = useState(80);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    if (resume) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTitle(resume.title);
      setTemplateSlug(resume.templateSlug);
      setContent(resume.content);
    }
  }, [resume]);

  function updateContent(next: ResumeContent) {
    setContent(next);
    save(next);
  }

  function handleTitleBlur() {
    fetch(`/api/resumes/${resumeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  }

  async function handleTemplateSwitch(slug: string) {
    setTemplateSlug(slug);
    await fetch(`/api/resumes/${resumeId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ templateSlug: slug, forceSnapshot: true }),
    });
  }

  async function handleDuplicate() {
    const res = await fetch(`/api/resumes/${resumeId}/duplicate`, { method: "POST" });
    const json = await res.json();
    if (json.success) router.push(`/resumes/${json.resumeId}`);
  }

  async function handleDownload() {
    if (!content) return;
    await saveNow(content);
    downloadResumePdf(templateSlug, content, title);
  }

  function handleRestored(restoredContent: ResumeContent) {
    setContent(restoredContent);
  }

  if (loading || !content) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="h-96 animate-pulse rounded-3xl border border-amber/20 bg-panel" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[96rem]">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/resumes" className="text-slate hover:text-bone" aria-label="Back">
            <ArrowLeft size={20} />
          </Link>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            className="border-b border-transparent bg-transparent font-display text-2xl font-bold text-bone hover:border-bone/20 focus:border-amber focus:outline-none"
          />
          <AutosaveIndicator status={autosaveStatus} />
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setHistoryOpen(true)}
            className="flex items-center gap-1.5 rounded-xl border border-bone/15 bg-panel px-4 py-2 text-sm font-semibold text-bone hover:bg-ink"
          >
            <History size={16} /> History
          </button>
          <button
            onClick={handleDuplicate}
            className="flex items-center gap-1.5 rounded-xl border border-bone/15 bg-panel px-4 py-2 text-sm font-semibold text-bone hover:bg-ink"
          >
            <Copy size={16} /> Duplicate
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-xl bg-amber px-4 py-2 text-sm font-semibold text-white hover:bg-amber-dim"
          >
            <Download size={16} /> Download PDF
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {templates && templates.filter((t) => t.isAvailable).length > 1 ? (
            <div className="rounded-2xl border border-amber/20 bg-panel p-4">
              <span className="text-xs font-semibold text-slate">Template</span>
              <div className="mt-2 flex gap-2">
                {templates
                  .filter((t) => t.isAvailable)
                  .map((t) => (
                    <button
                      key={t.slug}
                      onClick={() => handleTemplateSwitch(t.slug)}
                      className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                        templateSlug === t.slug
                          ? "bg-amber text-white"
                          : "bg-ink text-slate hover:text-bone"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-amber/20 bg-panel p-5">
            <h3 className="font-display text-lg font-bold text-bone">Personal Information</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-semibold text-slate">
                Full Name
                <input
                  value={content.personalInfo.fullName}
                  onChange={(e) =>
                    updateContent({
                      ...content,
                      personalInfo: { ...content.personalInfo, fullName: e.target.value },
                    })
                  }
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <label className="block text-xs font-semibold text-slate">
                Professional Title
                <input
                  value={content.personalInfo.title ?? ""}
                  onChange={(e) =>
                    updateContent({
                      ...content,
                      personalInfo: { ...content.personalInfo, title: e.target.value },
                    })
                  }
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <label className="block text-xs font-semibold text-slate">
                Email
                <input
                  value={content.personalInfo.email}
                  onChange={(e) =>
                    updateContent({
                      ...content,
                      personalInfo: { ...content.personalInfo, email: e.target.value },
                    })
                  }
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <label className="block text-xs font-semibold text-slate">
                Phone
                <input
                  value={content.personalInfo.phone}
                  onChange={(e) =>
                    updateContent({
                      ...content,
                      personalInfo: { ...content.personalInfo, phone: e.target.value },
                    })
                  }
                  className={`mt-1 ${inputClass}`}
                />
              </label>
              <label className="block text-xs font-semibold text-slate sm:col-span-2">
                Location
                <input
                  value={content.personalInfo.location}
                  onChange={(e) =>
                    updateContent({
                      ...content,
                      personalInfo: { ...content.personalInfo, location: e.target.value },
                    })
                  }
                  className={`mt-1 ${inputClass}`}
                />
              </label>
            </div>

            <div className="mt-4">
              <span className="text-xs font-semibold text-slate">Links</span>
              <div className="mt-2 space-y-2">
                {content.personalInfo.links.map((link, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={link.label}
                      onChange={(e) => {
                        const links = [...content.personalInfo.links];
                        links[i] = { ...links[i], label: e.target.value };
                        updateContent({ ...content, personalInfo: { ...content.personalInfo, links } });
                      }}
                      placeholder="LinkedIn"
                      className={inputClass}
                    />
                    <input
                      value={link.url}
                      onChange={(e) => {
                        const links = [...content.personalInfo.links];
                        links[i] = { ...links[i], url: e.target.value };
                        updateContent({ ...content, personalInfo: { ...content.personalInfo, links } });
                      }}
                      placeholder="https://linkedin.com/in/you"
                      className={inputClass}
                    />
                    <button
                      onClick={() => {
                        const links = content.personalInfo.links.filter((_, idx) => idx !== i);
                        updateContent({ ...content, personalInfo: { ...content.personalInfo, links } });
                      }}
                      className="shrink-0 text-slate hover:text-red-500"
                    >
                      &times;
                    </button>
                  </div>
                ))}
                <button
                  onClick={() =>
                    updateContent({
                      ...content,
                      personalInfo: {
                        ...content.personalInfo,
                        links: [...content.personalInfo.links, { label: "", url: "" }],
                      },
                    })
                  }
                  className="text-sm font-semibold text-amber hover:underline"
                >
                  + Add Link
                </button>
              </div>
            </div>
          </div>

          <SortableList
            items={content.sections}
            onReorder={(orderedIds) => {
              const reordered = orderedIds
                .map((id, index) => {
                  const section = content.sections.find((s) => s.id === id);
                  return section ? { ...section, order: index } : null;
                })
                .filter((s): s is NonNullable<typeof s> => s !== null);
              updateContent({ ...content, sections: reordered });
            }}
            renderItem={(section) => (
              <SectionEditorPanel
                section={section}
                onChange={(updated) =>
                  updateContent({
                    ...content,
                    sections: content.sections.map((s) => (s.id === updated.id ? updated : s)),
                  })
                }
                onDelete={() =>
                  updateContent({
                    ...content,
                    sections: content.sections.filter((s) => s.id !== section.id),
                  })
                }
              />
            )}
          />

          <AddSectionMenu
            existingTypes={content.sections.map((s) => s.type)}
            onAdd={(type: ResumeSectionType) =>
              updateContent({
                ...content,
                sections: [...content.sections, createEmptySection(type, content.sections.length)],
              })
            }
          />
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <div className="mb-3 flex justify-end">
            <ZoomControl zoom={zoom} onChange={setZoom} />
          </div>
          <div className="max-h-[80vh] overflow-auto rounded-2xl border border-bone/10 bg-slate/10 p-6">
            <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }}>
              {templateSlug === "ats-friendly" ? (
                <AtsFriendlyTemplate content={content} />
              ) : (
                <ModernTemplate content={content} />
              )}
            </div>
          </div>
        </div>
      </div>

      <VersionHistoryDrawer
        resumeId={resumeId}
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        onRestored={handleRestored}
      />
    </div>
  );
}
