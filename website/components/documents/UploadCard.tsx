"use client";

type Props = {
  file: File | null;
  setFile: (file: File | null) => void;
  uploading: boolean;
  uploadSuccess: string;
  uploadFile: () => void;
};

const cleanFileName = (name: string) => {
  return name
    .replace(/^\d+-/, "")
    .replace(" uploaded successfully!", "");
};

export default function UploadCard({
  file,
  setFile,
  uploading,
  uploadSuccess,
  uploadFile,
}: Props) {
  return (
    <div className="h-[430px] rounded-[30px] border border-amber/20 bg-panel p-8 shadow-[0_20px_70px_rgba(10,59,46,.08)] flex flex-col">

      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber to-amber-dim shadow-lg ring-4 ring-amber/20">
        <span className="text-4xl">📄</span>
      </div>

      <h2 className="font-display text-3xl font-bold text-bone">
        Upload PDF
      </h2>

      <p className="mt-3 text-slate">
        Drag & drop your PDF or browse your files to start AI-powered analysis.
      </p>

      <label className="mt-8 flex cursor-pointer items-center justify-center rounded-2xl border border-amber bg-panel px-6 py-3.5 font-bold text-amber transition-all duration-300 hover:bg-ink hover:shadow-md">
        📁 Choose PDF

        <input
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={(e) => {
            if (e.target.files?.length) {
              setFile(e.target.files[0]);
            }
          }}
        />
      </label>

      {file && (
        <div className="mt-5 rounded-2xl border border-amber/20 bg-ink p-5">
          <p className="truncate font-semibold text-bone">
            {file.name}
          </p>

          <p className="mt-2 text-sm text-slate">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      )}

      <button
        onClick={uploadFile}
        disabled={uploading || !file}
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-amber to-amber-dim py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-slate/40 disabled:text-white disabled:shadow-none"
      >
        {uploading ? "Uploading..." : "Upload & Analyze"}
      </button>

      {!file && (
        <p className="mt-3 text-center text-xs text-slate">
          PDF only • Max 5 MB
        </p>
      )}

      {uploadSuccess && (
        <div className="mt-6 rounded-2xl border border-amber/20 bg-panel p-5">
          <h3 className="font-bold text-amber-dim">
            ✅ Upload Successful
          </h3>

          <p className="mt-3 break-words font-medium text-bone">
            {cleanFileName(uploadSuccess)}
          </p>

          <p className="mt-2 flex items-center gap-2 text-xs text-slate">
            <span>✨</span>
            <span>Ready for AI Analysis</span>
          </p>
        </div>
      )}
    </div>
  );
}