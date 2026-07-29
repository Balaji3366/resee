"use client";

import { useEffect, useRef, useState } from "react";
import DeleteChatModal from "@/components/DeleteChatModal";
import BackButton from "@/components/BackButton";
import ChatSidebar from "@/components/ChatSidebar";
import ChatHeader from "@/components/ChatHeader";
import ChatMessages from "@/components/ChatMessages";
import ChatInput from "@/components/ChatInput";
import { toast } from "sonner";
import { ChatMessage, ChatSession } from "@/types/chat";
import { uploadAttachment } from "@/lib/uploadAttachment";

export default function AIChat() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [selectedChat, setSelectedChat] =
    useState<ChatSession | null>(null);

  const [chatLoading, setChatLoading] = useState(false);
  const [chat, setChat] = useState<ChatMessage[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [chat, loading]);

  async function loadSessions() {
    try {
      const res = await fetch("/api/chat/sessions");
      const data = await res.json();

      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  }

  async function loadChat(session: ChatSession) {
    setChatLoading(true);

    try {
      const res = await fetch(`/api/chat/${session.id}`);

      if (!res.ok) {
        throw new Error("Failed to load chat");
      }

      const data = await res.json();

      setSessionId(session.id);

      setChat(
      data.map((msg: any) => ({
        sender: msg.sender,
        text: msg.message,

        attachmentName: msg.attachment_name,
        attachmentUrl: msg.attachment_url,
        attachmentType: msg.attachment_type,
        attachmentSize: msg.attachment_size,
      }))
    );
    } catch (err) {
      console.error(err);
    } finally {
      setChatLoading(false);
    }
  }
    async function sendMessage() {
    if (!message.trim() || loading) return;

    const userMessage = message;
    let attachment = null;

      if (selectedFile) {
        try {
          attachment = await uploadAttachment(selectedFile);
          console.log("UPLOAD RESULT", attachment);
          console.log("Attachment:", attachment);
        } catch (error) {
          console.error(error);
          toast.error("Failed to upload attachment.");
          return;
        }
      }

    // Latest history (includes current user message)
    const history: ChatMessage[] = [
      ...chat,
      {
        sender: "You",
        text: userMessage,

        attachmentName: attachment?.name ?? null,
        attachmentUrl: attachment?.url ?? null,
        attachmentType: attachment?.type ?? null,
        attachmentSize: attachment?.size ?? null,
      },
    ];

        setLoading(true);
      setMessage("");
      setSelectedFile(null);

    // Show user message immediately
    console.log("ADDING TO CHAT", {
      attachmentName: attachment?.name,
      attachmentUrl: attachment?.url,
      attachmentType: attachment?.type,
      attachmentSize: attachment?.size,
    });
    setChat((prev) => [
  ...prev,
  {
    sender: "You",
    text: userMessage,

    attachmentName: attachment?.name ?? null,
    attachmentUrl: attachment?.url ?? null,
    attachmentType: attachment?.type ?? null,
    attachmentSize: attachment?.size ?? null,
  },
  {
    sender: "AI",
    text: "",
  },
]);

    try {
      const res = await fetch("/api/chat/stream", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
        message: userMessage,
        history,
        sessionId,
        attachment,
      }),
      });

      if (!res.body) {
        throw new Error("No response body");
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, {
          stream: true,
        });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const lines = event.split("\n");

          const eventName = lines
            .find((l) => l.startsWith("event:"))
            ?.replace("event:", "")
            .trim();

          const dataLine = lines
            .find((l) => l.startsWith("data:"))
            ?.replace("data:", "")
            .trim();

          if (!eventName || !dataLine) continue;

          const data = JSON.parse(dataLine);

          switch (eventName) {
            case "session":
              if (!sessionId && data.sessionId) {
                setSessionId(data.sessionId);
                loadSessions();
              }
              break;

            case "chunk":
              setChat((prev) => {
                const updated = [...prev];

                const lastIndex = updated
                  .map((m) => m.sender)
                  .lastIndexOf("AI");

                if (lastIndex !== -1) {
                  updated[lastIndex] = {
                    ...updated[lastIndex],
                    text:
                      updated[lastIndex].text + data.text,
                  };
                }

                return updated;
              });
              break;

            case "done":
              setLoading(false);
              break;
          }
        }
      }
    } catch (err) {
      console.error(err);

      setChat((prev) => [
        ...prev,
        {
          sender: "AI",
          text: "❌ Something went wrong.",
        },
      ]);

      setLoading(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/chat/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete chat");
      }

      setSessions((prev) =>
        prev.filter((chat) => chat.id !== id)
      );

      toast.success("Conversation deleted");

      if (sessionId === id) {
        setSessionId(null);
        setChat([]);
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete chat");
    }
  }
    return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-ink via-white to-panel px-8 py-8">
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mx-auto flex h-[calc(100vh-130px)] max-w-7xl gap-8">
          {/* Sidebar */}
          <ChatSidebar
            sessions={sessions}
            activeChatId={sessionId}
            onChatClick={loadChat}
            onNewChat={() => {
              setSessionId(null);
              setSelectedChat(null);

              setChat([]);
              setMessage("");
              setSelectedFile(null);

              setLoading(false);
              setChatLoading(false);
            }}
            onDeleteClick={(chat) => {
              setSelectedChat(chat);
            }}
          />

          {/* Chat Window */}
          <div className="flex flex-1 flex-col overflow-hidden rounded-[30px] border border-amber/20 bg-panel shadow-[0_20px_70px_rgba(10,59,46,.08)]">
            {/* Header */}
            <ChatHeader />

            {/* Messages */}
            <ChatMessages
              chat={chat}
              chatLoading={chatLoading}
              messagesEndRef={messagesEndRef}
            />

            {/* Input */}
            <ChatInput
            message={message}
            loading={loading}
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            setMessage={setMessage}
            sendMessage={sendMessage}
          />
          </div>
        </div>
      </section>

      <DeleteChatModal
        open={selectedChat !== null}
        title={selectedChat?.title ?? ""}
        onCancel={() => setSelectedChat(null)}
        onConfirm={() => {
          if (selectedChat) {
            handleDelete(selectedChat.id);
          }

          setSelectedChat(null);
        }}
      />
    </>
  );
}