"use client";

import { Trash2, Plus, X } from "lucide-react";
import {
  RESUME_SECTION_LABELS,
  createEmptyEducationItem,
  createEmptyExperienceItem,
  createEmptyProjectItem,
  createEmptyCertificationItem,
  createEmptyReferenceItem,
  createEmptyLanguageItem,
  type ResumeSection,
} from "@/types/resume-builder";

const inputClass =
  "w-full rounded-lg border border-bone/15 bg-ink px-3 py-2 text-sm text-bone placeholder:text-slate focus:border-amber focus:outline-none";

function TextField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block text-xs font-semibold text-slate">
      {label}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`mt-1 ${inputClass}`}
      />
    </label>
  );
}

function ItemCard({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="relative rounded-xl border border-bone/10 bg-panel p-4">
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove"
        className="absolute right-3 top-3 text-slate hover:text-red-500"
      >
        <X size={16} />
      </button>
      <div className="grid gap-3 pr-6 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function AddItemButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1 text-sm font-semibold text-amber hover:underline"
    >
      <Plus size={14} /> {label}
    </button>
  );
}

export default function SectionEditorPanel({
  section,
  onChange,
  onDelete,
}: {
  section: ResumeSection;
  onChange: (section: ResumeSection) => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-amber/20 bg-panel p-5">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-bone">
          {RESUME_SECTION_LABELS[section.type]}
        </h3>
        <button
          type="button"
          onClick={onDelete}
          className="flex items-center gap-1 text-sm text-slate hover:text-red-500"
        >
          <Trash2 size={16} /> Remove
        </button>
      </div>

      {section.type === "summary" && (
        <textarea
          value={section.data.text}
          onChange={(e) => onChange({ ...section, data: { text: e.target.value } })}
          rows={5}
          placeholder="A short summary of your professional background..."
          className={inputClass}
        />
      )}

      {section.type === "skills" && (
        <TagListEditor
          items={section.data.items}
          onChange={(items) => onChange({ ...section, data: { items } })}
          placeholder="e.g. React"
        />
      )}

      {(section.type === "achievements" || section.type === "interests") && (
        <TagListEditor
          items={section.data.items}
          onChange={(items) => onChange({ ...section, data: { items } })}
          placeholder="Add an entry"
        />
      )}

      {section.type === "education" && (
        <div className="space-y-3">
          {section.data.items.map((item, i) => (
            <ItemCard
              key={item.id}
              onRemove={() =>
                onChange({
                  ...section,
                  data: { items: section.data.items.filter((_, idx) => idx !== i) },
                })
              }
            >
              <TextField label="Institution" value={item.institution} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { institution: v })} />
              <TextField label="Degree" value={item.degree} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { degree: v })} />
              <TextField label="Field of Study" value={item.field} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { field: v })} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Start" value={item.startDate} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { startDate: v })} placeholder="2020" />
                <TextField label="End" value={item.endDate} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { endDate: v })} placeholder="2024" />
              </div>
              <div className="sm:col-span-2">
                <TextField label="Description (optional)" value={item.description ?? ""} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { description: v })} />
              </div>
            </ItemCard>
          ))}
          <AddItemButton
            label="Add Education"
            onClick={() =>
              onChange({ ...section, data: { items: [...section.data.items, createEmptyEducationItem()] } })
            }
          />
        </div>
      )}

      {section.type === "experience" && (
        <div className="space-y-3">
          {section.data.items.map((item, i) => (
            <ItemCard
              key={item.id}
              onRemove={() =>
                onChange({
                  ...section,
                  data: { items: section.data.items.filter((_, idx) => idx !== i) },
                })
              }
            >
              <TextField label="Role" value={item.role} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { role: v })} />
              <TextField label="Company" value={item.company} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { company: v })} />
              <div className="grid grid-cols-2 gap-3">
                <TextField label="Start" value={item.startDate} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { startDate: v })} placeholder="Jan 2022" />
                <TextField label="End" value={item.endDate} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { endDate: v })} placeholder="Present" />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate">
                <input
                  type="checkbox"
                  checked={item.current}
                  onChange={(e) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { current: e.target.checked })}
                />
                Currently working here
              </label>
              <div className="sm:col-span-2">
                <span className="text-xs font-semibold text-slate">Bullet Points</span>
                <div className="mt-1 space-y-2">
                  {item.bullets.map((bullet, bi) => (
                    <div key={bi} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={bullet}
                        onChange={(e) => {
                          const bullets = [...item.bullets];
                          bullets[bi] = e.target.value;
                          updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { bullets });
                        }}
                        className={inputClass}
                        placeholder="Describe an accomplishment..."
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, {
                            bullets: item.bullets.filter((_, idx) => idx !== bi),
                          })
                        }
                        className="shrink-0 text-slate hover:text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <AddItemButton
                    label="Add Bullet"
                    onClick={() => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { bullets: [...item.bullets, ""] })}
                  />
                </div>
              </div>
            </ItemCard>
          ))}
          <AddItemButton
            label="Add Experience"
            onClick={() =>
              onChange({ ...section, data: { items: [...section.data.items, createEmptyExperienceItem()] } })
            }
          />
        </div>
      )}

      {section.type === "projects" && (
        <div className="space-y-3">
          {section.data.items.map((item, i) => (
            <ItemCard
              key={item.id}
              onRemove={() =>
                onChange({
                  ...section,
                  data: { items: section.data.items.filter((_, idx) => idx !== i) },
                })
              }
            >
              <TextField label="Name" value={item.name} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { name: v })} />
              <TextField label="Link (optional)" value={item.link ?? ""} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { link: v })} />
              <div className="sm:col-span-2">
                <TextField label="Description" value={item.description} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { description: v })} />
              </div>
              <div className="sm:col-span-2">
                <TextField
                  label="Tech Stack (comma-separated)"
                  value={item.techStack.join(", ")}
                  onChange={(v) =>
                    updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, {
                      techStack: v.split(",").map((s) => s.trim()).filter(Boolean),
                    })
                  }
                />
              </div>
            </ItemCard>
          ))}
          <AddItemButton
            label="Add Project"
            onClick={() =>
              onChange({ ...section, data: { items: [...section.data.items, createEmptyProjectItem()] } })
            }
          />
        </div>
      )}

      {section.type === "certifications" && (
        <div className="space-y-3">
          {section.data.items.map((item, i) => (
            <ItemCard
              key={item.id}
              onRemove={() =>
                onChange({
                  ...section,
                  data: { items: section.data.items.filter((_, idx) => idx !== i) },
                })
              }
            >
              <TextField label="Name" value={item.name} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { name: v })} />
              <TextField label="Issuer" value={item.issuer} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { issuer: v })} />
              <TextField label="Date" value={item.date} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { date: v })} />
            </ItemCard>
          ))}
          <AddItemButton
            label="Add Certification"
            onClick={() =>
              onChange({ ...section, data: { items: [...section.data.items, createEmptyCertificationItem()] } })
            }
          />
        </div>
      )}

      {section.type === "languages" && (
        <div className="space-y-3">
          {section.data.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={item.name}
                onChange={(e) => {
                  const items = [...section.data.items];
                  items[i] = { ...items[i], name: e.target.value };
                  onChange({ ...section, data: { items } });
                }}
                placeholder="Language"
                className={inputClass}
              />
              <input
                type="text"
                value={item.level}
                onChange={(e) => {
                  const items = [...section.data.items];
                  items[i] = { ...items[i], level: e.target.value };
                  onChange({ ...section, data: { items } });
                }}
                placeholder="Proficiency"
                className={inputClass}
              />
              <button
                type="button"
                onClick={() =>
                  onChange({ ...section, data: { items: section.data.items.filter((_, idx) => idx !== i) } })
                }
                className="shrink-0 text-slate hover:text-red-500"
              >
                <X size={16} />
              </button>
            </div>
          ))}
          <AddItemButton
            label="Add Language"
            onClick={() =>
              onChange({ ...section, data: { items: [...section.data.items, createEmptyLanguageItem()] } })
            }
          />
        </div>
      )}

      {section.type === "references" && (
        <div className="space-y-3">
          {section.data.items.map((item, i) => (
            <ItemCard
              key={item.id}
              onRemove={() =>
                onChange({
                  ...section,
                  data: { items: section.data.items.filter((_, idx) => idx !== i) },
                })
              }
            >
              <TextField label="Name" value={item.name} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { name: v })} />
              <TextField label="Relation" value={item.relation} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { relation: v })} />
              <TextField label="Contact" value={item.contact} onChange={(v) => updateItemAt(section.data.items, (items) => onChange({ ...section, data: { items } }), i, { contact: v })} />
            </ItemCard>
          ))}
          <AddItemButton
            label="Add Reference"
            onClick={() =>
              onChange({ ...section, data: { items: [...section.data.items, createEmptyReferenceItem()] } })
            }
          />
        </div>
      )}
    </div>
  );
}

function updateItemAt<I>(items: I[], onChange: (items: I[]) => void, index: number, patch: Partial<I>) {
  const next = items.slice();
  next[index] = { ...next[index], ...patch };
  onChange(next);
}

function TagListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => {
              const next = [...items];
              next[i] = e.target.value;
              onChange(next);
            }}
            placeholder={placeholder}
            className={inputClass}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="shrink-0 text-slate hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      ))}
      <AddItemButton label="Add" onClick={() => onChange([...items, ""])} />
    </div>
  );
}
