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
    <div className="border-t border-amber/20 bg-panel px-5 pt-4 pb-5">

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="mb-3 flex items-center justify-between rounded-2xl border border-amber-dim/20 bg-panel-2 px-4 py-3">

          <div className="flex min-w-0 items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-dim/10">
              <FileText
                size={18}
                className="text-amber-dim"
              />
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-bone">
                {selectedFile.name}
              </p>

              <p className="text-xs text-slate">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedFile(null)}
            className="rounded-lg p-2 text-slate transition hover:bg-panel-2 hover:text-red-400"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Input Box */}
      <div className="flex items-center gap-3 rounded-3xl border border-amber/20 bg-ink p-3 shadow-sm transition-all focus-within:border-amber-dim focus-within:shadow-md">

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
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-slate transition hover:bg-panel hover:text-amber"
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
            text-bone
            placeholder:text-slate
            outline-none
            disabled:text-slate
          "
        />

        {/* Voice */}
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-2xl text-slate transition hover:bg-panel hover:text-amber"
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
            from-bone
            to-amber-dim
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
              <span className="h-2 w-2 animate-bounce rounded-full bg-panel"></span>

              <span
                className="h-2 w-2 animate-bounce rounded-full bg-panel"
                style={{ animationDelay: "0.15s" }}
              ></span>

              <span
                className="h-2 w-2 animate-bounce rounded-full bg-panel"
                style={{ animationDelay: "0.3s" }}
              ></span>
            </div>
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>

      {/* Footer */}
      <div className="mt-2 flex items-center justify-between px-2 text-xs text-slate">
        <span>
          AI responses may contain mistakes. Verify important career
          decisions.
        </span>

        <span className="font-medium text-amber">
          Powered by RESEE AI
        </span>
      </div>
    </div>
  );
}