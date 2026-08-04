import type { CSSProperties } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ChatMessage } from "@/types/chat";
import AIErrorState from "@/components/ai/AIErrorState";
import AIDisclosureBadge from "@/components/ai/AIDisclosureBadge";
import type { AIError, AIErrorCode } from "@/types/ai";
import { User, Bot, Sparkles, FileText, GraduationCap, Briefcase } from "lucide-react";

const RETRYABLE_CODES = new Set(["rate_limited", "provider_error"]);

function toAIError(msg: ChatMessage): AIError {
  const code = (msg.errorCode ?? "unknown") as AIErrorCode;
  return {
    code,
    message: msg.errorMessage ?? "Something went wrong. Please try again.",
    retryable: RETRYABLE_CODES.has(code),
  };
}

type Props = {
  chat: ChatMessage[];
  chatLoading: boolean;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
};

export default function ChatMessages({ chat, chatLoading, messagesEndRef }: Props) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-8">
      {chatLoading ? (
        <div className="flex h-full items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber border-t-transparent" />

            <p className="text-sm text-slate">Loading conversation...</p>
          </div>
        </div>
      ) : (
        <>
          {chat.length === 0 && (
            <div className="flex min-h-full flex-col items-center justify-center px-6">
              <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-bone via-amber to-amber-dim text-white shadow-xl">
                <Bot size={38} />
              </div>

              <h1 className="font-display text-4xl font-bold tracking-tight text-bone">
                Welcome to RESEE
              </h1>

              <p className="mt-3 max-w-xl text-center text-lg text-slate">
                Your AI Career Companion
              </p>

              <p className="mt-2 max-w-2xl text-center text-slate leading-7">
                Ask anything about your career, resume, interviews, learning roadmap or professional
                growth.
              </p>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                <button className="flex items-center gap-2 rounded-full border border-amber/20 bg-panel px-5 py-3 text-sm font-medium text-bone shadow-sm transition hover:border-amber-dim hover:shadow-md">
                  <FileText size={18} />
                  Review my resume
                </button>

                <button className="flex items-center gap-2 rounded-full border border-amber/20 bg-panel px-5 py-3 text-sm font-medium text-bone shadow-sm transition hover:border-amber-dim hover:shadow-md">
                  <Briefcase size={18} />
                  Mock interview
                </button>

                <button className="flex items-center gap-2 rounded-full border border-amber/20 bg-panel px-5 py-3 text-sm font-medium text-bone shadow-sm transition hover:border-amber-dim hover:shadow-md">
                  <GraduationCap size={18} />
                  Learning roadmap
                </button>

                <button className="flex items-center gap-2 rounded-full border border-amber/20 bg-panel px-5 py-3 text-sm font-medium text-bone shadow-sm transition hover:border-amber-dim hover:shadow-md">
                  <Sparkles size={18} />
                  Career guidance
                </button>
              </div>

              <p className="mt-10 text-sm text-slate">
                Start typing below to begin your conversation.
              </p>
            </div>
          )}

          {chat.length > 0 &&
            chat.map((msg, index) => (
              <div
                key={index}
                className={`mb-8 flex ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex w-full max-w-[88%] items-end gap-3 ${
                    msg.sender === "You" ? "ml-auto flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-md ${
                      msg.sender === "You"
                        ? "bg-gradient-to-br from-amber-dim to-amber"
                        : "bg-gradient-to-br from-bone via-amber to-amber-dim"
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
                        ? "bg-gradient-to-br from-amber to-amber-dim text-white"
                        : "border border-amber/20 bg-gradient-to-br from-panel-2 to-panel text-bone"
                    }`}
                  >
                    <div
                      className="
                        prose
                        prose-sm
                        max-w-none
                        prose-headings:text-bone
                        prose-p:text-bone
                        prose-li:text-bone
                        prose-strong:text-bone
                        prose-code:text-amber-dim
                        prose-pre:bg-transparent
                      "
                    >
                      {msg.sender === "AI" && msg.errorCode ? (
                        <AIErrorState error={toAIError(msg)} />
                      ) : msg.sender === "AI" && msg.text === "" ? (
                        <div className="flex items-center gap-2 text-slate-500">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-amber-dim" />
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-amber-dim"
                            style={{ animationDelay: "0.15s" }}
                          />
                          <div
                            className="h-2 w-2 animate-bounce rounded-full bg-amber-dim"
                            style={{ animationDelay: "0.3s" }}
                          />

                          <span className="ml-2 font-medium">Thinking...</span>
                        </div>
                      ) : (
                        <>
                          {msg.sender === "AI" && (
                            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-amber">
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
                                  ? "border-white/20 bg-panel/10 text-white"
                                  : "border-amber-dim/20 bg-panel"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <FileText size={20} />

                                <div>
                                  <p className="text-sm font-semibold">{msg.attachmentName}</p>

                                  <p className="text-xs opacity-70">
                                    {msg.attachmentSize
                                      ? `${(msg.attachmentSize / 1024).toFixed(1)} KB`
                                      : ""}
                                  </p>
                                </div>
                              </div>

                              <span className="text-xs font-medium">Open</span>
                            </a>
                          )}
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || "");

                                if (match) {
                                  return (
                                    <SyntaxHighlighter
                                      style={oneDark as { [key: string]: CSSProperties }}
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

                          {msg.sender === "AI" && msg.text && (
                            <AIDisclosureBadge className="mt-3" />
                          )}
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
