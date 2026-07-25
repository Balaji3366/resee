"use client";

type Props = {
  files: string[];
  selectedFile: string;
  setSelectedFile: (file: string) => void;
  setSummary: (summary: string) => void;
};

const cleanFileName = (name: string) => {
  return name.replace(/^\d+-/, "");
};

export default function RecentFiles({
  files,
  selectedFile,
  setSelectedFile,
  setSummary,
}: Props) {
  return (
    <div className="h-[430px] rounded-[30px] border border-[#D4AF37]/20 bg-white p-8 shadow-[0_20px_70px_rgba(10,59,46,.08)] flex flex-col">

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[#06281F]">
            Recent Files
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Select a document for AI analysis
          </p>
        </div>

        <div className="rounded-full bg-[#EEF7F2] px-4 py-1.5 text-sm font-bold text-[#0A3B2E]">
          {files.length}
        </div>
      </div>

      <div className="mt-6 h-[520px] overflow-y-auto space-y-4 pr-2">

        {files.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-[#D4AF37]/30 bg-[#F8FAF8] p-8 text-center">

            <div className="mb-4 text-4xl">📄</div>

            <p className="font-semibold text-[#06281F]">
              No Documents Yet
            </p>

            <p className="mt-2 text-sm text-gray-500">
              Upload your first PDF to get started.
            </p>

          </div>
        ) : (
          files.map((fileName) => (
            <button
              key={fileName}
              onClick={() => {
                setSelectedFile(fileName);
                setSummary("");
              }}
              className={`w-full rounded-2xl border p-4 text-left transition-all duration-300 ${
                selectedFile === fileName
                  ? "border-[#14532D] bg-[#EEF7F2] shadow-md"
                  : "border-[#D4AF37]/20 bg-white hover:border-[#D4AF37] hover:bg-[#F8FAF8] hover:shadow-md"
              }`}
            >
              <div className="flex items-center justify-between gap-3">

                <div className="flex items-center gap-3 overflow-hidden">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#0A3B2E] to-[#14532D] text-lg text-white">
                    📄
                  </div>

                  <div className="overflow-hidden">
                    <p className="truncate font-semibold text-[#06281F]">
                      {cleanFileName(fileName)}
                    </p>

                    <p className="text-xs text-gray-500">
                      PDF Document
                    </p>
                  </div>

                </div>

                {selectedFile === fileName && (
                  <span className="rounded-full bg-[#0A3B2E] px-3 py-1 text-xs font-semibold text-white">
                    Active
                  </span>
                )}

              </div>
            </button>
          ))
        )}

      </div>
    </div>
  );
}