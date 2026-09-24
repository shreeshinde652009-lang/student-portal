'use client';

import type { SupabaseClient } from '@supabase/supabase-js';

export type ExamDaySummary = {
  id: string;
  exam_id: string;
  day_number: number;
  title: string;
  scheduled_date: string | null;
  start_time: string | null;
  end_time: string | null;
  duration_minutes: number;
  is_published: boolean;
  question_count: number;
};

export type DayAttempt = {
  id: string;
  exam_id: string;
  exam_day_id: string | null;
  application_id: string;
  status: string;
  score: number | null;
  total_marks: number | null;
  result_published: boolean;
  started_at: string | null;
  submitted_at: string | null;
};

export async function loadExamDays(client: SupabaseClient, examId: string) {
  const [{ data: days, error: daysError }, { data: questions, error: questionsError }] = await Promise.all([
    client.from('exam_days').select('id,exam_id,day_number,title,scheduled_date,start_time,end_time,duration_minutes,is_published').eq('exam_id', examId).order('day_number'),
    client.from('exam_questions').select('day_id').eq('exam_id', examId),
  ]);
  if (daysError) throw daysError;
  if (questionsError) throw questionsError;
  const counts = new Map<string, number>();
  for (const question of questions ?? []) counts.set(question.day_id, (counts.get(question.day_id) ?? 0) + 1);
  return ((days ?? []) as Omit<ExamDaySummary, 'question_count'>[]).map((day) => ({ ...day, question_count: counts.get(day.id) ?? 0 }));
}

export function getDayStatus(attempt: DayAttempt | undefined) {
  if (!attempt) return 'Not Started';
  if (attempt.status === 'submitted' || attempt.status === 'completed' || attempt.status === 'expired') return attempt.result_published ? 'Published' : 'Result Pending';
  if (attempt.status === 'in_progress' || attempt.status === 'active') return 'In Progress';
  return attempt.status;
}

export function formatDayDate(date: string | null) {
  return date ? new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Information unavailable';
}

export function formatDayTime(time: string | null) {
  return time ? time.slice(0, 5) : 'Information unavailable';
}

export const daySubject = (day: ExamDaySummary) => day.title || `Day ${day.day_number}`;

export async function loadPublishedExamForStudent(client: SupabaseClient) {
  const { data: exam, error } = await client.from('exams').select('id,code,title,total_marks').eq('is_published', true).order('created_at', { ascending: false }).limit(1).maybeSingle();
  if (error) throw error;
  return exam;
}

export async function loadAttempts(client: SupabaseClient, applicationId: string, examId: string) {
  const { data, error } = await client.from('exam_attempts').select('id,exam_id,exam_day_id,application_id,status,score,total_marks,result_published,started_at,submitted_at').eq('application_id', applicationId).eq('exam_id', examId).order('started_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as DayAttempt[];
}

type JsonRecord = Record<string, unknown>;
export const applicationName = (application: JsonRecord) => String(application.fullName || application.full_name || 'Information unavailable');
export const applicationEmail = (application: JsonRecord) => String(application.email || 'Information unavailable');
export const applicationValue = (application: JsonRecord, key: string) => String(application[key] || 'Information unavailable');

export function latestAttemptForDay(attempts: DayAttempt[], dayId: string) {
  return attempts.find((attempt) => attempt.exam_day_id === dayId);
}

export function isPublishedAttempt(attempt: DayAttempt | undefined) {
  return Boolean(attempt && attempt.result_published && ['submitted', 'completed', 'expired'].includes(attempt.status));
}

export function scoreForDay(attempt: DayAttempt | undefined) {
  return isPublishedAttempt(attempt) ? `${attempt?.score ?? 0} / ${attempt?.total_marks ?? 50}` : getDayStatus(attempt);
}

export function examDaysTotal(days: ExamDaySummary[]) {
  return days.reduce((total, day) => total + (day.question_count || 0), 0);
}

export function safeError(error: unknown) {
  return error instanceof Error ? error.message : 'Unable to load examination information.';
}

export type { JsonRecord };

export function emptyDaySchedule(days: ExamDaySummary[], attempts: DayAttempt[]) {
  return days.map((day) => ({ day, attempt: latestAttemptForDay(attempts, day.id), status: getDayStatus(latestAttemptForDay(attempts, day.id)) }));
}

export function getExamDayCount(days: ExamDaySummary[]) {
  return days.filter((day) => day.is_published).length;
}

export function clientIsReady(client: SupabaseClient) {
  return Boolean(client);
}

export function normalizeDayMarks(day: ExamDaySummary) {
  return day.question_count || 50;
}

export function totalPublishedScore(rows: { day: ExamDaySummary; attempt?: DayAttempt }[]) {
  return rows.reduce((sum, row) => sum + (isPublishedAttempt(row.attempt) ? Number(row.attempt?.score ?? 0) : 0), 0);
}

export function totalPublishedMarks(rows: { day: ExamDaySummary; attempt?: DayAttempt }[]) {
  return rows.reduce((sum, row) => sum + (isPublishedAttempt(row.attempt) ? Number(row.attempt?.total_marks ?? normalizeDayMarks(row.day)) : 0), 0);
}

export function asRecord(value: unknown): JsonRecord {
  return value && typeof value === 'object' ? value as JsonRecord : {};
}

export function joinApplicationData(application: { personal_data?: unknown; academic_data?: unknown; application_number?: string }) {
  return { ...asRecord(application.personal_data), ...asRecord(application.academic_data), applicationNumber: application.application_number };
}

export function formatDateTime(value: string | null) {
  return value ? new Date(value).toLocaleString('en-IN') : 'Information unavailable';
}

export function isCompletedAttempt(attempt: DayAttempt | undefined) {
  return Boolean(attempt && ['submitted', 'completed', 'expired'].includes(attempt.status));
}

export function statusClasses(status: string) {
  return status === 'Published' ? 'bg-emerald-50 text-emerald-700' : status === 'Result Pending' ? 'bg-amber-50 text-amber-700' : status === 'In Progress' ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-600';
}

export function sortDays(days: ExamDaySummary[]) { return [...days].sort((a, b) => a.day_number - b.day_number); }

export function dayLabel(day: ExamDaySummary) { return `Day ${day.day_number}`; }

export function questionLabel(day: ExamDaySummary) { return `${day.question_count || 50} questions`; }

export function marksLabel(day: ExamDaySummary) { return `${day.question_count || 50} marks`; }

export function resultIsVisible(attempt: DayAttempt | undefined) { return isPublishedAttempt(attempt); }

export function attemptedCount(rows: { attempt?: DayAttempt }[]) { return rows.filter((row) => isCompletedAttempt(row.attempt)).length; }

export function publishedRows(rows: { attempt?: DayAttempt }[]) { return rows.filter((row) => isPublishedAttempt(row.attempt)); }

export function percentage(score: number, total: number) { return total ? ((score / total) * 100).toFixed(2) : '0.00'; }

export function examTotalMarks(days: ExamDaySummary[]) { return days.reduce((sum, day) => sum + normalizeDayMarks(day), 0); }

export function examTotalQuestions(days: ExamDaySummary[]) { return days.reduce((sum, day) => sum + (day.question_count || 0), 0); }

export function dayHeading(day: ExamDaySummary) { return `${dayLabel(day)} — ${daySubject(day)}`; }

export function hasSixDays(days: ExamDaySummary[]) { return days.length === 6; }

export function unavailable(value: unknown) { return value === null || value === undefined || value === ''; }

export function display(value: unknown) { return unavailable(value) ? 'Information unavailable' : String(value); }

export function scoreStatus(attempt: DayAttempt | undefined) { return getDayStatus(attempt); }

export function isAttempted(attempt: DayAttempt | undefined) { return Boolean(attempt); }

export function displayScore(attempt: DayAttempt | undefined) { return scoreForDay(attempt); }

export function displayDay(day: ExamDaySummary) { return `${dayLabel(day)} — ${daySubject(day)}`; }

export function dayMarks(day: ExamDaySummary) { return normalizeDayMarks(day); }

export function dayQuestions(day: ExamDaySummary) { return day.question_count || 50; }

export function attemptForDay(attempts: DayAttempt[], day: ExamDaySummary) { return latestAttemptForDay(attempts, day.id); }

export function statusForDay(attempts: DayAttempt[], day: ExamDaySummary) { return getDayStatus(attemptForDay(attempts, day)); }

export function publishedScore(attempts: DayAttempt[], day: ExamDaySummary) { return scoreForDay(attemptForDay(attempts, day)); }
