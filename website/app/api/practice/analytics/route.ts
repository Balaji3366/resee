import { getServerSupabase } from "@/lib/supabaseServer";
import type { PracticeAnalyticsData, PracticeTrendPoint, TopicAccuracy } from "@/types/practice";

export const dynamic = "force-dynamic";

interface CompletedAttempt {
  totalQuestions: number;
  correctCount: number;
  score: number;
  timeTakenSeconds: number;
  completedAt: string;
}

function weekStartOf(date: Date): string {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diffToMonday);
  return d.toISOString().slice(0, 10);
}

function monthStartOf(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function bucketTrend(attempts: CompletedAttempt[], keyFn: (d: Date) => string): PracticeTrendPoint[] {
  const buckets = new Map<string, { questions: number; correct: number }>();

  for (const attempt of attempts) {
    const key = keyFn(new Date(attempt.completedAt));
    const bucket = buckets.get(key) ?? { questions: 0, correct: 0 };
    bucket.questions += attempt.totalQuestions;
    bucket.correct += attempt.correctCount;
    buckets.set(key, bucket);
  }

  return Array.from(buckets.entries())
    .map(([periodStart, b]) => ({
      periodStart,
      questionsSolved: b.questions,
      accuracyPercent: b.questions > 0 ? Math.round((b.correct / b.questions) * 100) : 0,
    }))
    .sort((a, b) => a.periodStart.localeCompare(b.periodStart));
}

export async function GET() {
  try {
    const supabase = await getServerSupabase();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const [{ data: topicAttempts }, { data: mockAttempts }] = await Promise.all([
      supabase
        .from("practice_attempts")
        .select("total_questions, correct_count, score, time_taken_seconds, completed_at, topic:practice_topics(title)")
        .eq("user_id", user.id)
        .eq("status", "completed"),
      supabase
        .from("mock_test_attempts")
        .select("total_questions, correct_count, score, time_taken_seconds, completed_at")
        .eq("user_id", user.id)
        .eq("status", "completed"),
    ]);

    const allCompleted: CompletedAttempt[] = [];
    const byTopic = new Map<string, { questions: number; correct: number }>();

    for (const attempt of topicAttempts ?? []) {
      if (!attempt.completed_at) continue;

      allCompleted.push({
        totalQuestions: attempt.total_questions,
        correctCount: attempt.correct_count ?? 0,
        score: attempt.score ?? 0,
        timeTakenSeconds: attempt.time_taken_seconds ?? 0,
        completedAt: attempt.completed_at,
      });

      const topic = attempt.topic as unknown as { title: string } | null;
      if (topic) {
        const bucket = byTopic.get(topic.title) ?? { questions: 0, correct: 0 };
        bucket.questions += attempt.total_questions;
        bucket.correct += attempt.correct_count ?? 0;
        byTopic.set(topic.title, bucket);
      }
    }

    for (const attempt of mockAttempts ?? []) {
      if (!attempt.completed_at) continue;

      allCompleted.push({
        totalQuestions: attempt.total_questions,
        correctCount: attempt.correct_count ?? 0,
        score: attempt.score ?? 0,
        timeTakenSeconds: attempt.time_taken_seconds ?? 0,
        completedAt: attempt.completed_at,
      });
    }

    const totalQuestionsSolved = allCompleted.reduce((sum, a) => sum + a.totalQuestions, 0);
    const totalCorrect = allCompleted.reduce((sum, a) => sum + a.correctCount, 0);
    const totalPracticeSeconds = allCompleted.reduce((sum, a) => sum + a.timeTakenSeconds, 0);
    const averageScore = allCompleted.length
      ? Math.round(allCompleted.reduce((sum, a) => sum + a.score, 0) / allCompleted.length)
      : 0;

    const topicAccuracies: TopicAccuracy[] = Array.from(byTopic.entries())
      .map(([topicTitle, b]) => ({
        topicTitle,
        accuracyPercent: b.questions > 0 ? Math.round((b.correct / b.questions) * 100) : 0,
        questionsSolved: b.questions,
      }))
      .sort((a, b) => a.accuracyPercent - b.accuracyPercent);

    const weakTopics = topicAccuracies.slice(0, 3);
    const strongTopics = [...topicAccuracies].reverse().slice(0, 3);

    const data: PracticeAnalyticsData = {
      totalQuestionsSolved,
      accuracyPercent: totalQuestionsSolved > 0 ? Math.round((totalCorrect / totalQuestionsSolved) * 100) : 0,
      averageScore,
      totalPracticeMinutes: Math.round(totalPracticeSeconds / 60),
      weakTopics,
      strongTopics,
      weekly: bucketTrend(allCompleted, weekStartOf),
      monthly: bucketTrend(allCompleted, monthStartOf),
    };

    return Response.json({ success: true, analytics: data });
  } catch (error) {
    console.error("Practice analytics error:", error);

    return Response.json(
      { success: false, message: "Failed to load analytics." },
      { status: 500 }
    );
  }
}
