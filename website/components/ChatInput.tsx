type Props = {
  message: string;
  loading: boolean;
  setMessage: (value: string) => void;
  sendMessage: () => void;
};

export default function ChatInput({
  message,
  loading,
  setMessage,
  sendMessage,
}: Props) {
  return (
    <div className="border-t border-[#D4AF37]/20 bg-white p-5">
      <div className="flex items-center gap-4">

        <input
          type="text"
          placeholder="Ask Mentora anything about your career..."
          value={message}
          disabled={loading}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              sendMessage();
            }
          }}
          className="
            flex-1
            rounded-2xl
            border
            border-[#D4AF37]/30
            bg-[#F8FAF8]
            px-5
            py-4
            text-[#06281F]
            placeholder:text-gray-500
            outline-none
            transition
            focus:border-[#14532D]
            focus:ring-4
            focus:ring-[#14532D]/10
            disabled:bg-gray-100
            disabled:text-gray-400
          "
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="
            flex
            min-w-[120px]
            items-center
            justify-center
            rounded-2xl
            bg-gradient-to-r
            from-[#0A3B2E]
            to-[#14532D]
            px-6
            py-4
            font-semibold
            text-white
            transition-all
            duration-300
            hover:-translate-y-0.5
            hover:shadow-lg
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          {loading ? (
            <div className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 animate-bounce rounded-full bg-white"></span>

              <span
                className="h-2.5 w-2.5 animate-bounce rounded-full bg-white"
                style={{ animationDelay: "0.15s" }}
              ></span>

              <span
                className="h-2.5 w-2.5 animate-bounce rounded-full bg-white"
                style={{ animationDelay: "0.3s" }}
              ></span>
            </div>
          ) : (
            "Send"
          )}
        </button>

      </div>
    </div>
  );
}