"use client";

import { useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";
import { toast } from "sonner";

export default function AdminFileUpload({
  label,
  value,
  onChange,
  accept = "image/*",
}: {
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  accept?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/upload", { method: "POST", body: formData });
      const json = await res.json();

      if (!json.success) {
        toast.error(json.message || "Upload failed.");
        return;
      }

      onChange(json.url);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate">{label}</label>

      {value ? (
        <div className="relative overflow-hidden rounded-xl border border-bone/15">
          {accept.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt={label} className="h-40 w-full object-cover" />
          ) : (
            <div className="flex h-16 items-center gap-2 px-4 text-sm text-bone">
              <span className="truncate">{value.split("/").pop()}</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-bone/25 text-slate transition hover:border-amber disabled:opacity-60"
        >
          <UploadCloud size={24} />
          {uploading ? "Uploading..." : "Click to upload"}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
}
