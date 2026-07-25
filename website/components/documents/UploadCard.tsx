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
    <div className="h-[430px] rounded-[30px] border border-[#D4AF37]/20 bg-white p-8 shadow-[0_20px_70px_rgba(10,59,46,.08)] flex flex-col">

      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0A3B2E] to-[#14532D] shadow-lg ring-4 ring-[#D4AF37]/20">
        <span className="text-4xl">📄</span>
      </div>

      <h2 className="text-3xl font-bold text-[#06281F]">
        Upload PDF
      </h2>

      <p className="mt-3 text-gray-600">
        Drag & drop your PDF or browse your files to start AI-powered analysis.
      </p>

      <label className="mt-8 flex cursor-pointer items-center justify-center rounded-2xl border border-[#D4AF37] bg-white px-6 py-3.5 font-bold text-[#0A3B2E] transition-all duration-300 hover:bg-[#F8FAF8] hover:shadow-md">
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
        <div className="mt-5 rounded-2xl border border-[#D4AF37]/20 bg-[#F8FAF8] p-5">
          <p className="truncate font-semibold text-[#06281F]">
            {file.name}
          </p>

          <p className="mt-2 text-sm text-gray-500">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      )}

      <button
        onClick={uploadFile}
        disabled={uploading || !file}
        className="mt-6 w-full rounded-2xl bg-gradient-to-r from-[#0A3B2E] to-[#14532D] py-3.5 font-bold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:bg-[#7A8D85] disabled:text-white disabled:shadow-none"
      >
        {uploading ? "Uploading..." : "Upload & Analyze"}
      </button>

      {!file && (
        <p className="mt-3 text-center text-xs text-gray-500">
          PDF only • Max 5 MB
        </p>
      )}

      {uploadSuccess && (
        <div className="mt-6 rounded-2xl border border-[#D4AF37]/20 bg-[#EEF7F2] p-5">
          <h3 className="font-bold text-[#14532D]">
            ✅ Upload Successful
          </h3>

          <p className="mt-3 break-words font-medium text-[#06281F]">
            {cleanFileName(uploadSuccess)}
          </p>

          <p className="mt-2 flex items-center gap-2 text-xs text-gray-600">
            <span>✨</span>
            <span>Ready for AI Analysis</span>
          </p>
        </div>
      )}
    </div>
  );
}