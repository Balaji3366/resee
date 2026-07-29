"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import ConfirmModal from "@/components/ConfirmModal";

type Props = {
  files: string[];
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  setSummary: (summary: string) => void;
  fetchFiles: () => Promise<void>;
};

const cleanFileName = (name: string) => {
  return name.replace(/^\d+-/, "");
};

export default function RecentFiles({
  files,
  selectedFile,
  setSelectedFile,
  setSummary,
  fetchFiles,
}: Props) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [fileToDelete, setFileToDelete] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function deleteFile() {
    if (!fileToDelete) return;

    setDeleting(true);

    try {
      const res = await fetch("/api/files", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName: fileToDelete,
        }),
      });

      if (!res.ok) {
        throw new Error();
      }

      toast.success("Document deleted successfully.");

      if (selectedFile === fileToDelete) {
        setSelectedFile("");
        setSummary("");
      }

      await fetchFiles();

      setShowDeleteModal(false);
      setFileToDelete("");
    } catch {
      toast.error("Failed to delete document.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex h-[430px] flex-col rounded-[30px] border border-amber/20 bg-panel p-8 shadow-[0_20px_70px_rgba(10,59,46,.08)]">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-bone">
            Recent Files
          </h2>

          <p className="mt-1 text-sm text-slate">
            Select a document for AI analysis
          </p>
        </div>

        <div className="rounded-full bg-panel px-4 py-1.5 text-sm font-bold text-amber">
          {files.length}
        </div>
      </div>

      <div className="mt-2 flex-1 overflow-y-auto pr-2 [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-panel-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-amber-dim/40 hover:[&::-webkit-scrollbar-thumb]:bg-amber-dim/70">
        {files.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-amber/30 bg-ink p-8 text-center">
            <div className="mb-4 text-4xl">📄</div>

            <p className="font-semibold text-bone">
              No Documents Yet
            </p>

            <p className="mt-2 text-sm text-slate">
              Upload your first PDF to get started.
            </p>
          </div>
        ) : (
          files.map((fileName) => (
            <div
              key={fileName}
              onClick={() => {
                setSelectedFile(fileName);
                setSummary("");
              }}
              className={`mb-3 w-full cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                selectedFile === fileName
                  ? "border-amber-dim bg-panel shadow-md"
                  : "border-amber/20 bg-panel hover:border-amber hover:bg-ink hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber to-amber-dim text-lg text-white">
                    📄
                  </div>

                  <div className="overflow-hidden">
                    <p className="truncate font-semibold text-bone">
                      {cleanFileName(fileName)}
                    </p>

                    <p className="text-xs text-slate">
                      PDF Document
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {selectedFile === fileName && (
                    <span className="rounded-full bg-amber px-3 py-1 text-xs font-semibold text-white">
                      Active
                    </span>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFileToDelete(fileName);
                      setShowDeleteModal(true);
                    }}
                    className="rounded-lg p-2 text-slate transition hover:bg-panel-2 hover:text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        open={showDeleteModal}
        title="Delete Document?"
        message={`Are you sure you want to delete "${cleanFileName(
          fileToDelete
        )}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        loading={deleting}
        onConfirm={deleteFile}
        onCancel={() => {
          setShowDeleteModal(false);
          setFileToDelete("");
        }}
      />
    </div>
  );
}