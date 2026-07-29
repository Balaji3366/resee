import { supabase } from "@/lib/supabase";
import Link from "next/link";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ViewReportPage({
  params,
}: Props) {
  const { id } = await params;

  const { data } = await supabase
    .from("resume_history")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-panel-2">
        <h1 className="font-display text-3xl font-bold text-red-400">
          Report not found
        </h1>
      </section>
    );
  }

  const score = data.ats_score;

  const strengths =
    data.report
      .match(/STRENGTHS:([\s\S]*?)WEAKNESSES:/)?.[1]
      ?.split("\n")
      .filter((line: string) => line.trim().startsWith("-"))
      .map((line: string) => line.replace("-", "").trim()) || [];

  const weaknesses =
    data.report
      .match(/WEAKNESSES:([\s\S]*?)SUGGESTIONS:/)?.[1]
      ?.split("\n")
      .filter((line: string) => line.trim().startsWith("-"))
      .map((line: string) => line.replace("-", "").trim()) || [];

  const suggestions =
    data.report
      .match(/SUGGESTIONS:([\s\S]*)/)?.[1]
      ?.split("\n")
      .filter((line: string) => line.trim().startsWith("-"))
      .map((line: string) => line.replace("-", "").trim()) || [];

  return (
    <section className="min-h-screen bg-panel-2 py-20">
      <div className="mx-auto max-w-5xl px-6">

        <div className="rounded-3xl bg-panel p-10 shadow-xl">

          <h1 className="font-display text-center text-4xl font-bold text-bone">
            📄 AI Resume Report
          </h1>

          <p className="mt-4 text-center text-slate">
            {data.file_name}
          </p>

          {/* ATS Score */}
          <div className="mt-10 rounded-2xl bg-panel-2 p-8">

            <h2 className="font-display text-2xl font-bold text-blue-400">
              📊 ATS Score
            </h2>

            <p
              className={`mt-4 text-5xl font-extrabold ${
                score >= 75
                  ? "text-green-400"
                  : score >= 50
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {score}/100
            </p>

            <div className="mt-5 h-4 w-full rounded-full bg-panel-2">
              <div
                className={`h-4 rounded-full ${
                  score >= 75
                    ? "bg-green-600"
                    : score >= 50
                    ? "bg-yellow-500"
                    : "bg-red-600"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>

          </div>

          {/* Strengths */}

          <div className="mt-8 rounded-2xl bg-panel-2 p-8">

            <h2 className="font-display mb-5 text-2xl font-bold text-green-400">
              💪 Strengths
            </h2>

            <ul className="space-y-3">
              {strengths.map((item: string, index: number) => (
                <li key={index}>
                  ✅ {item}
                </li>
              ))}
            </ul>

          </div>

          {/* Weaknesses */}

          <div className="mt-8 rounded-2xl bg-panel-2 p-8">

            <h2 className="font-display mb-5 text-2xl font-bold text-yellow-400">
              ⚠ Weaknesses
            </h2>

            <ul className="space-y-3">
              {weaknesses.map((item: string, index: number) => (
                <li key={index}>
                  ❌ {item}
                </li>
              ))}
            </ul>

          </div>

          {/* Suggestions */}

          <div className="mt-8 rounded-2xl bg-panel-2 p-8">

            <h2 className="font-display mb-5 text-2xl font-bold text-purple-400">
              🚀 Suggestions
            </h2>

            <ul className="space-y-3">
              {suggestions.map((item: string, index: number) => (
                <li key={index}>
                  💡 {item}
                </li>
              ))}
            </ul>

          </div>

          <div className="mt-10 flex justify-center">

            <Link
              href="/resume-history"
              className="rounded-xl bg-indigo-600 px-8 py-4 font-semibold text-white transition hover:bg-indigo-700"
            >
              ← Back to History
            </Link>

          </div>

        </div>
      </div>
    </section>
  );
}