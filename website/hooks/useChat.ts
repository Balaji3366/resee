"use client";

import { useState } from "react";

export type ChatMessage = {
  sender: "AI" | "You";
  text: string;
};

export type ChatSession = {
  id: string;
  title: string;
  created_at: string;
};

export default function useChat() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
const [chat, setChat] = useState<ChatMessage[]>([
  {
    sender: "AI",
    text: `# 👋 Welcome to RESEE AI

**See Your Future**

I'm **RESEE AI**, your personal AI career assistant.

I can help you with:

- 📄 Resume Reviews & ATS Analysis
- 🎤 Mock Interview Preparation
- 💻 Learning Roadmaps
- 📈 Career Planning & Growth
- 💼 Salary Guidance
- 🧠 Technical & HR Interview Questions

### 🚀 Try asking me:

- Review my resume
- Prepare me for an SDET interview
- Create a Python learning roadmap

**How can I help you today?**`,
  },
]);
  async function loadSessions() {
    try {
      const res = await fetch("/api/chat/sessions");
      const data = await res.json();
      console.log(data);
      setSessions(data);
    } catch (err) {
      console.error(err);
    }
  }
  return {
    message,
    setMessage,

    loading,
    setLoading,

    chat,
    setChat,

    sessions,
    setSessions,

    sessionId,
    setSessionId,

    loadSessions,
  };
}