import { supabaseAdmin } from "@/lib/supabase-admin";
import {
  getCompletedCourses,
  countCompletedQuestions,
  countDistinctActiveDays,
} from "@/lib/progressAggregation";
import type {
  ApplicationStatus,
} from "@/types/jobs";
import type { UserContext, UserContextSkill } from "@/types/ai";

/**
 * Aggregates a user's full profile across every module into one typed
 * object for AI features to consume. Reuses lib/progressAggregation.ts's
 * exported functions rather than re-deriving completion/streak logic,
 * and mirrors app/api/progress/skills/route.ts's per-skill scoring
 * (topic accuracy from practice_attempts, lessons-capped-at-60%/quiz-
 * passed-100% from module_progress) rather than writing parallel
 * queries.
 */
export async function buildUserContext(userId: string): Promise<UserContext> {
  const [
    profileResult,
    resumeResult,
    skillsResult,
    linkedTopicsResult,
    linkedModulesResult,
    interviewAttemptsResult,
    savedJobsResult,
    applicationsResult,
    completedCourses,
    totalQuestionsSolved,
    distinctActiveDays,
  ] = await Promise.all([
    supabaseAdmin
      .from("profiles")
      .select(
        "goal, target_career, role_type, skill_level, current_streak, longest_streak, total_learning_minutes, education, experience, current_skills, dream_company, dream_salary, interests"
      )
      .eq("id", userId)
      .maybeSingle(),
    supabaseAdmin
      .from("resumes")
      .select("title, template_slug, content, updated_at")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabaseAdmin.from("skills").select("id, slug, name").order("sort_order"),
    supabaseAdmin.from("practice_topics").select("id, skill_id").not("skill_id", "is", null),
    supabaseAdmin
      .from("course_modules")
      .select("id, skill_id, lessons(id)")
      .not("skill_id", "is", null),
    supabaseAdmin
      .from("interview_attempts")
      .select("status, completed_questions, completed_at, set:interview_sets(title)")
      .eq("user_id", userId)
      .eq("status", "completed")
      .order("completed_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("saved_jobs")
      .select("job:jobs(role_slug)")
      .eq("user_id", userId),
    supabaseAdmin.from("job_applications").select("status").eq("user_id", userId),
    getCompletedCourses(supabaseAdmin, userId),
    countCompletedQuestions(supabaseAdmin, userId),
    countDistinctActiveDays(supabaseAdmin, userId),
  ]);

  const profile = profileResult.data;

  // --- Overall lesson completion, mirroring app/api/progress/overview/route.ts ---
  const [{ count: lessonsCompleted }, { data: availableCourses }] = await Promise.all([
    supabaseAdmin.from("lesson_progress").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabaseAdmin.from("courses").select("id").eq("is_available", true),
  ]);

  const availableCourseIds = (availableCourses ?? []).map((c) => c.id);

  const { count: totalLessonsAvailable } = availableCourseIds.length
    ? await supabaseAdmin.from("lessons").select("id", { count: "exact", head: true }).in("course_id", availableCourseIds)
    : { count: 0 };

  const overallCompletionPercent =
    totalLessonsAvailable && totalLessonsAvailable > 0
      ? Math.round(((lessonsCompleted ?? 0) / totalLessonsAvailable) * 100)
      : 0;

  // --- Practice accuracy (all completed topic + mock-test attempts) ---
  const [{ data: topicAttempts }, { data: mockAttempts }] = await Promise.all([
    supabaseAdmin
      .from("practice_attempts")
      .select("correct_count, total_questions")
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabaseAdmin
      .from("mock_test_attempts")
      .select("correct_count, total_questions")
      .eq("user_id", userId)
      .eq("status", "completed"),
  ]);

  const allAttempts = [...(topicAttempts ?? []), ...(mockAttempts ?? [])];
  const totalCorrect = allAttempts.reduce((sum, a) => sum + (a.correct_count ?? 0), 0);
  const totalAnswered = allAttempts.reduce((sum, a) => sum + a.total_questions, 0);
  const accuracyPercent = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;

  // --- Per-skill scoring, mirroring app/api/progress/skills/route.ts ---
  const linkedTopics = linkedTopicsResult.data ?? [];
  const linkedModules = linkedModulesResult.data ?? [];
  const topicIds = linkedTopics.map((t) => t.id);
  const moduleIds = linkedModules.map((m) => m.id);

  const [{ data: topicAccuracyRows }, { data: moduleProgressRows }] = await Promise.all([
    topicIds.length
      ? supabaseAdmin
          .from("practice_attempts")
          .select("topic_id, correct_count, total_questions")
          .eq("user_id", userId)
          .eq("status", "completed")
          .in("topic_id", topicIds)
      : Promise.resolve({ data: [] as { topic_id: string; correct_count: number; total_questions: number }[] }),
    moduleIds.length
      ? supabaseAdmin
          .from("module_progress")
          .select("module_id, lessons_completed_count, quiz_passed")
          .eq("user_id", userId)
          .in("module_id", moduleIds)
      : Promise.resolve({ data: [] as { module_id: string; lessons_completed_count: number; quiz_passed: boolean }[] }),
  ]);

  const topicTotals = new Map<string, { correct: number; total: number }>();
  for (const row of topicAccuracyRows ?? []) {
    const totals = topicTotals.get(row.topic_id) ?? { correct: 0, total: 0 };
    totals.correct += row.correct_count ?? 0;
    totals.total += row.total_questions;
    topicTotals.set(row.topic_id, totals);
  }
  const topicPercentById = new Map<string, number>();
  for (const [topicId, totals] of topicTotals.entries()) {
    topicPercentById.set(topicId, totals.total > 0 ? Math.round((totals.correct / totals.total) * 100) : 0);
  }

  const moduleProgressByModuleId = new Map((moduleProgressRows ?? []).map((r) => [r.module_id, r]));
  const modulePercentById = new Map<string, number>();
  for (const mod of linkedModules) {
    const totalLessons = ((mod as { lessons?: { id: string }[] }).lessons ?? []).length;
    const progress = moduleProgressByModuleId.get(mod.id);

    if (progress?.quiz_passed) modulePercentById.set(mod.id, 100);
    else if (totalLessons > 0 && progress)
      modulePercentById.set(mod.id, Math.round((progress.lessons_completed_count / totalLessons) * 100 * 0.6));
    else modulePercentById.set(mod.id, 0);
  }

  const skills: UserContextSkill[] = (skillsResult.data ?? []).map((skill) => {
    const percents: number[] = [];
    for (const topic of linkedTopics) if (topic.skill_id === skill.id) percents.push(topicPercentById.get(topic.id) ?? 0);
    for (const mod of linkedModules) if (mod.skill_id === skill.id) percents.push(modulePercentById.get(mod.id) ?? 0);

    return {
      slug: skill.slug,
      name: skill.name,
      percent: percents.length > 0 ? Math.round(percents.reduce((s, p) => s + p, 0) / percents.length) : 0,
    };
  });

  const sortedByPercent = [...skills].sort((a, b) => b.percent - a.percent);
  const strongTopics = sortedByPercent.filter((s) => s.percent > 0).slice(0, 3).map((s) => s.name);
  const weakTopics = [...skills]
    .filter((s) => !strongTopics.includes(s.name))
    .sort((a, b) => a.percent - b.percent)
    .slice(0, 3)
    .map((s) => s.name);

  // --- Resume ---
  const resumeRow = resumeResult.data;
  const resumeContent = resumeRow?.content as
    | { personalInfo?: { fullName?: string }; skills?: string[]; experience?: unknown[]; education?: unknown[] }
    | undefined;

  // --- Jobs ---
  const savedJobRows = savedJobsResult.data ?? [];
  const savedJobRoles = Array.from(
    new Set(
      savedJobRows
        .map((r) => (r.job as unknown as { role_slug: string | null } | null)?.role_slug)
        .filter((slug): slug is string => Boolean(slug))
    )
  );

  const applicationsByStatus: Record<string, number> = {};
  for (const app of applicationsResult.data ?? []) {
    const status = app.status as ApplicationStatus;
    applicationsByStatus[status] = (applicationsByStatus[status] ?? 0) + 1;
  }

  return {
    userId,
    careerGoal: profile?.goal ?? null,
    targetCareer: profile?.target_career ?? null,
    roleType: profile?.role_type ?? null,
    skillLevel: profile?.skill_level ?? null,
    resume: resumeRow
      ? {
          title: resumeRow.title,
          templateSlug: resumeRow.template_slug,
          fullName: resumeContent?.personalInfo?.fullName ?? "",
          skills: resumeContent?.skills ?? [],
          experienceCount: resumeContent?.experience?.length ?? 0,
          educationCount: resumeContent?.education?.length ?? 0,
          updatedAt: resumeRow.updated_at,
        }
      : null,
    skills,
    learning: {
      completedCourseCount: completedCourses.length,
      overallCompletionPercent,
      totalLearningMinutes: profile?.total_learning_minutes ?? 0,
      currentStreak: profile?.current_streak ?? 0,
      longestStreak: profile?.longest_streak ?? 0,
      distinctActiveDays,
    },
    practice: {
      totalQuestionsSolved,
      accuracyPercent,
      weakTopics,
      strongTopics,
    },
    interviews: {
      completedCount: (interviewAttemptsResult.data ?? []).length,
      recentResults: (interviewAttemptsResult.data ?? []).map((row) => ({
        title: (row.set as unknown as { title: string } | null)?.title ?? "",
        completedAt: row.completed_at ?? "",
        questionsAnswered: row.completed_questions ?? 0,
      })),
    },
    jobs: {
      savedJobCount: savedJobRows.length,
      savedJobRoles,
      applicationCount: (applicationsResult.data ?? []).length,
      applicationsByStatus,
    },
    legacyProfile: {
      education: profile?.education ?? null,
      experience: profile?.experience ?? null,
      currentSkills: profile?.current_skills ?? null,
      dreamCompany: profile?.dream_company ?? null,
      dreamSalary: profile?.dream_salary ?? null,
      interests: profile?.interests ?? null,
    },
    builtAt: new Date().toISOString(),
  };
}
