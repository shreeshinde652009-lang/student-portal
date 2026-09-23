import { createClient } from '@/lib/supabase/client'

export type Exam = { id: string; title: string; code: string; description: string | null; duration_minutes: number; total_marks: number; passing_marks: number; starts_at: string | null; ends_at: string | null }
export type Question = { id: string; question_number: number; prompt: string; options: string[]; marks: number }
export type ExamDay = { id: string; exam_id: string; day_number: number; title: string; duration_minutes: number; is_published: boolean; question_count?: number }

export async function getPublishedExamDays(examId: string) {
  const supabase = createClient()
  const { data, error } = await supabase.from('exam_days').select('id,exam_id,day_number,title,duration_minutes,is_published').eq('exam_id', examId).eq('is_published', true).order('day_number')
  if (error) throw new Error('Unable to load examination days')
  return (data || []) as ExamDay[]
}

export async function getExamDayData(dayId: string) {
  const supabase = createClient()
  const { data: day, error: dayError } = await supabase.from('exam_days').select('id,exam_id,day_number,title,duration_minutes,is_published').eq('id', dayId).eq('is_published', true).maybeSingle()
  if (dayError || !day) throw new Error('This examination day is not currently available.')
  const { data: questions, error } = await supabase.from('exam_questions').select('id,question_number,prompt,options,marks').eq('day_id', dayId).order('question_number')
  if (error) throw new Error('Unable to load examination day questions')
  return { day: day as ExamDay, questions: (questions || []) as Question[] }
}

export async function getExamData(examId: string) {
  const supabase = createClient()
  const [{ data: exam, error: examError }, { data: questions, error: questionError }] = await Promise.all([
    supabase
      .from('exams')
      .select('id,title,code,description,duration_minutes,total_marks,passing_marks,starts_at,ends_at')
      .eq('id', examId)
      .eq('is_published', true)
      .maybeSingle(),
    supabase
      .from('exam_questions')
      .select('id,question_number,prompt,options,marks')
      .eq('exam_id', examId)
      .order('question_number'),
  ])
  if (examError || questionError) throw new Error('Unable to load examination')
  return { exam: exam as Exam | null, questions: (questions || []) as Question[] }
}

export async function getPublishedExamData() {
  const supabase = createClient()
  const { data: exams, error } = await supabase
    .from('exams')
    .select('id,title,code,description,duration_minutes,total_marks,passing_marks,starts_at,ends_at')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) throw new Error('Unable to load examination')
  const exam = (exams?.[0] || null) as Exam | null
  if (!exam) return { exam: null, questions: [] as Question[] }

  const { data: questions, error: questionError } = await supabase
    .from('exam_questions')
    .select('id,question_number,prompt,options,marks')
    .eq('exam_id', exam.id)
    .order('question_number')

  if (questionError) throw new Error('Unable to load examination')
  return { exam, questions: (questions || []) as Question[] }
}
