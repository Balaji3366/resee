import { useRef } from "react";
import {
  Send,
  Paperclip,
  Mic,
  X,
  FileText,
} from "lucide-react";

type Props = {
  message: string;
  loading: boolean;
  selectedFile: File | null;
  setMessage: (value: string) => void;
  setSelectedFile: (file: File | null) => void;
  sendMessage: () => void;
};

export default function ChatInput({
  message,
  loading,
  selectedFile,
  setSelectedFile,
  setMessage,
  sendMessage,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF, DOCX and TXT files are supported.");
      return;
    }

    setSelectedFile(file);

    // Allow selecting the same file again after removing it
    e.target.value = "";
  };

  return (
    <div className="border-t border-[#D4AF37]/20 bg-white px-5 pt-4 pb-5">

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-[#14532D]/20 bg-[#F4FBF6] px-4 py-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#14532D]/10">
              <FileText
                size={18}
                className="text-[#14532D]"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[#06281F]">
                {selectedFile.name}
              </p>

              <p className="text-xs text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="rounded-lg p-2 text-gray-500 transition hover:bg-red-50 hover:text-red-500"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Box */}
      <div className="flex items-center gap-3 rounded-3xl border border-[#D4AF37]/20 bg-[#F8FAF8] p-3 shadow-sm transition-all focus-within:border-[#14532D] focus-within:shadow-md">

        {/* Hidden File Picker */}
        <input
          ref={fileInputRef}
          type="file"
          hidden
          accept=".pdf,.doc,.docx,.txt"
          onChange={handleFileSelect}
        />

        {/* Attachment */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-gray-500 transition hover:bg-white hover:text-[#0A3B2E]"
          title="Attach File"
        >
          <Paperclip size={20} />
        </button>

        {/* Text Input */}
        <input
          type="text"
          value={message}
          disabled={loading}
          placeholder="Ask RESEE anything about your career..."
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          className="
            flex-1
            min-w-0
            bg-transparent
            px-2
            py-3
            text-[#06281F]
            placeholder:text-gray-400
            outline-none
            disabled:text-gray-400
          "
        />

        {/* Voice */}
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-gray-500 transition hover:bg-white hover:text-[#0A3B2E]"
          title="Voice Chat Coming Soon"
        >
          <Mic size={20} />
        </button>

        {/* Send */}
        <button
          onClick={sendMessage}
          disabled={loading}
          className="
            flex
            h-12
            w-12
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-r
            from-[#06281F]
            to-[#14532D]
            text-white
            transition-all
            duration-300
            hover:scale-105
            hover:shadow-lg
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {loading ? (
            <div className="flex gap-1">
              <span className="h-2 w-2 animate-bounce rounded-full bg-white"></span>

              <span
                className="h-2 w-2 animate-bounce rounded-full bg-white"
                style={{ animationDelay: "0.15s" }}
              ></span>

              <span
                className="h-2 w-2 animate-bounce rounded-full bg-white"
                style={{ animationDelay: "0.3s" }}
              ></span>
            </div>
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between px-2 text-xs text-gray-500">
        <span>
          AI responses may contain mistakes. Verify important career
          decisions.
        </span>

        <span className="font-medium text-[#0A3B2E]">
          Powered by RESEE AI
        </span>
      </div>
    </div>
  );
}