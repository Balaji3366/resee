"use client";

import { ChangeEvent, useState } from "react";
import BackButton from "@/components/BackButton";

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Easy");
  const [questions, setQuestions] = useState("10");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState("");

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.length) return;

    setFile(e.target.files[0]);
  }

  async function generateQuiz() {
    try {
      setLoading(true);
      setQuiz("");

      let fileName = "";

      // Upload file if selected
      if (file) {
        const uploadData = new FormData();
        uploadData.append("file", file);

        const uploadRes = await fetch("/api/uploads", {
          method: "POST",
          body: uploadData,
        });

        const uploadJson = await uploadRes.json();

        if (!uploadJson.success) {
          throw new Error(uploadJson.error);
        }

        fileName = uploadJson.filename;
      }

      const quizRes = await fetch("/api/quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileName,
          topic,
          difficulty,
          questions,
        }),
      });

      const quizJson = await quizRes.json();

      if (!quizJson.success) {
        throw new Error(quizJson.error);
      }

      setQuiz(quizJson.quiz);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black px-6 py-10">
      <div className="mx-auto max-w-5xl">

        <BackButton variant="dark" />

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/5 p-10 backdrop-blur-xl">

          <h1 className="text-center text-5xl font-bold text-white">
            📝 AI Quiz Generator
          </h1>

          <p className="mt-4 text-center text-slate-400">
            Upload study material or enter a topic to generate an AI quiz.
          </p>

          <div className="mt-10 space-y-8">

            <div>
              <label className="mb-2 block text-white">
                Quiz Topic
              </label>

              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="React, Java, QA..."
                className="w-full rounded-xl border border-white/10 bg-slate-900 p-4 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block text-white">
                Upload File (Optional)
              </label>

              <input
                type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                onChange={handleFileChange}
                className="w-full rounded-xl border border-dashed border-cyan-500 bg-slate-900 p-4 text-white"
              />

              {file && (
                <p className="mt-3 text-cyan-400">
                  📄 {file.name}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">

              <div>
                <label className="mb-2 block text-white">
                  Difficulty
                </label>

                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 p-4 text-white"
                >
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-white">
                  Questions
                </label>

                <select
                  value={questions}
                  onChange={(e) => setQuestions(e.target.value)}
                  className="w-full rounded-xl bg-slate-900 p-4 text-white"
                >
                  <option>5</option>
                  <option>10</option>
                  <option>15</option>
                  <option>20</option>
                </select>
              </div>

            </div>

            <button
              onClick={generateQuiz}
              disabled={loading}
              className="w-full rounded-xl bg-cyan-500 py-4 text-lg font-bold text-white hover:bg-cyan-600 disabled:opacity-50"
            >
              {loading ? "Generating..." : "🚀 Generate Quiz"}
            </button>

          </div>

        </div>

        {quiz && (
          <div className="mt-10 rounded-3xl bg-white/5 p-8">
            <h2 className="mb-6 text-3xl font-bold text-white">
              Generated Quiz
            </h2>

            <pre className="whitespace-pre-wrap text-slate-200">
              {quiz}
            </pre>
          </div>
        )}

      </div>
    </section>
  );
}