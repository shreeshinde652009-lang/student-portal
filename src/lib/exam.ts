import { createClient } from '@/lib/supabase/client'

export type Exam = { id: string; title: string; code: string; description: string | null; duration_minutes: number; total_marks: number; passing_marks: number; starts_at: string | null; ends_at: string | null }
export type Question = { id: string; question_number: number; prompt: string; options: string[]; marks: number }

export async function getExamData(examId: string) {
  const supabase = createClient()
  const [{ data: exam, error: examError }, { data: questions, error: questionError }] = await Promise.all([
    supabase.from('exams').select('id,title,code,description,duration_minutes,total_marks,passing_marks,starts_at,ends_at').eq('id', examId).maybeSingle(),
    supabase.from('exam_questions').select('id,question_number,prompt,options,marks').eq('exam_id', examId).order('question_number'),
  ])
  if (examError || questionError) throw new Error('Unable to load examination')
  return { exam: exam as Exam | null, questions: (questions || []) as Question[] }
}
