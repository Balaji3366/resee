import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ChatMessage } from "@/types/chat";
import {
  User,
  Bot,
  Sparkles,
  FileText,
  GraduationCap,
  Briefcase,
} from "lucide-react";

type Props = {
  chat: ChatMessage[];
  chatLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export default function ChatMessages({
  chat,
  chatLoading,
  messagesEndRef,
}: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      {chatLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0A3B2E] border-t-transparent" />

            <p className="text-sm text-gray-500">
              Loading conversation...
            </p>
          </div>
        </div>
      ) : (
        <>
          {chat.length === 0 && (
            <div className="flex min-h-full flex-col items-center justify-center px-6">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-[#06281F] via-[#0A3B2E] to-[#14532D] text-white shadow-xl">
                <Bot size={38} />
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-[#06281F]">
                Welcome to RESEE
              </h1>

              <p className="mt-3 max-w-xl text-center text-lg text-gray-600">
                Your AI Career Companion
              </p>

              <p className="mt-2 max-w-2xl text-center text-gray-500 leading-7">
                Ask anything about your career, resume, interviews,
                learning roadmap or professional growth.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <button className="flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white px-5 py-3 text-sm font-medium text-[#06281F] shadow-sm transition hover:border-[#14532D] hover:shadow-md">
                  <FileText size={18} />
                  Review my resume
                </button>

                <button className="flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white px-5 py-3 text-sm font-medium text-[#06281F] shadow-sm transition hover:border-[#14532D] hover:shadow-md">
                  <Briefcase size={18} />
                  Mock interview
                </button>

                <button className="flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white px-5 py-3 text-sm font-medium text-[#06281F] shadow-sm transition hover:border-[#14532D] hover:shadow-md">
                  <GraduationCap size={18} />
                  Learning roadmap
                </button>

                <button className="flex items-center gap-2 rounded-full border border-[#D4AF37]/20 bg-white px-5 py-3 text-sm font-medium text-[#06281F] shadow-sm transition hover:border-[#14532D] hover:shadow-md">
                  <Sparkles size={18} />
                  Career guidance
                </button>
              </div>

              <p className="mt-10 text-sm text-gray-400">
                Start typing below to begin your conversation.
              </p>
            </div>
          )}

          {chat.length > 0 &&
            chat.map((msg, index) => (
                            <div
                key={index}
                className={`mb-8 flex ${
                  msg.sender === "You"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                <div
                  className={`flex w-full max-w-[88%] items-end gap-3 ${
                    msg.sender === "You"
                      ? "ml-auto flex-row-reverse"
                      : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-md ${
                      msg.sender === "You"
                        ? "bg-gradient-to-br from-[#14532D] to-[#0A3B2E]"
                        : "bg-gradient-to-br from-[#06281F] via-[#0A3B2E] to-[#14532D]"
                    }`}
                  >
                    {msg.sender === "You" ? (
                      <User size={18} strokeWidth={2.4} />
                    ) : (
                      <Bot size={18} strokeWidth={2.4} />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={`w-full rounded-2xl px-6 py-4 shadow-lg ${
                      msg.sender === "You"
                        ? "bg-gradient-to-br from-[#0A3B2E] to-[#14532D] text-white"
                        : "border border-[#D4AF37]/20 bg-gradient-to-br from-[#F8FCF9] to-[#EEF7F2] text-[#06281F]"
                    }`}
                  >
                    <div
                      className="
                        prose
                        prose-sm
                        max-w-none
                        prose-headings:text-[#06281F]
                        prose-p:text-[#06281F]
                        prose-li:text-[#06281F]
                        prose-strong:text-[#06281F]
                        prose-code:text-[#14532D]
                        prose-pre:bg-transparent
                      "
                    >
                      {msg.sender === "AI" && msg.text === "" ? (
                        <div className="flex items-center gap-2 text-slate-500">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-[#14532D]" />
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-[#14532D]"
                            style={{ animationDelay: "0.15s" }}
                          />
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-[#14532D]"
                            style={{ animationDelay: "0.3s" }}
                          />

                          <span className="ml-2 font-medium">
                            Thinking...
                          </span>
                        </div>
                      ) : (
                        <>
                          {msg.sender === "AI" && (
                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-[#0A3B2E]">
                              <Bot size={13} />
                              RESEE AI
                            </div>
                          )}

                          {msg.sender === "You" && (
                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-white/80">
                              <User size={13} />
                              You
                            </div>
                          )}
                          {msg.attachmentUrl && (
                          <a
                            href={msg.attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`mb-4 flex items-center justify-between rounded-xl border px-4 py-3 transition hover:shadow ${
                              msg.sender === "You"
                                ? "border-white/20 bg-white/10 text-white"
                                : "border-[#14532D]/20 bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <FileText size={20} />

                              <div>
                                <p className="text-sm font-semibold">
                                  {msg.attachmentName}
                                </p>

                                <p className="text-xs opacity-70">
                                  {msg.attachmentSize
                                    ? `${(msg.attachmentSize / 1024).toFixed(1)} KB`
                                    : ""}
                                </p>
                              </div>
                            </div>

                            <span className="text-xs font-medium">
                              Open
                            </span>
                          </a>
                        )}
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({
                                className,
                                children,
                                ...props
                              }) {
                                const match = /language-(\w+)/.exec(
                                  className || ""
                                );

                                if (match) {
                                  return (
                                    <SyntaxHighlighter
                                      style={oneDark as any}
                                      language={match[1]}
                                      PreTag="div"
                                    >
                                      {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                  );
                                }

                                return (
                                  <code
                                    className="rounded bg-slate-800 px-1 py-0.5 text-pink-300"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              },
                            }}
                          >
                            {msg.text}
                          </ReactMarkdown>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
              