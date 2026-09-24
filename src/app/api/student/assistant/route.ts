import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  console.info('[student-assistant] request reached API')
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError) console.warn('[student-assistant] authentication lookup failed', { category: authError.name })
  if (!user) {
    console.info('[student-assistant] authentication failed')
    return Response.json({ error: 'Authentication required' }, { status: 401 })
  }
  console.info('[student-assistant] authentication succeeded')

  const body = await request.json().catch(() => null)
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 1200) : ''
  if (!message) return Response.json({ error: 'Message is required' }, { status: 400 })

  const { data: activeAttempt } = await supabase.from('exam_attempts').select('id,expires_at,status').eq('user_id', user.id).eq('status', 'active').gt('expires_at', new Date().toISOString()).limit(1).maybeSingle()
  const asksForAnswer = /answer|option|solve|hint|correct|question\s*\d+/i.test(message)
  if (activeAttempt && asksForAnswer) return Response.json({ answer: "I can help with portal or technical support, but I can't provide answers or hints for an active exam question." })

  const { data: application, error: applicationError } = await supabase
    .from('applications')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle()
  if (applicationError) {
    console.warn('[student-assistant] student lookup failed', { category: applicationError.code || applicationError.name })
    return Response.json({ error: 'Student access validation failed' }, { status: 503 })
  }
  if (!application) {
    console.info('[student-assistant] student lookup returned no application')
    return Response.json({ error: 'Student access required' }, { status: 403 })
  }
  console.info('[student-assistant] student lookup succeeded')

  try {
    console.info('[student-assistant] AI provider request started', { model: 'openai/gpt-5-mini' })
    const result = await generateText({
      model: 'openai/gpt-5-mini',
      system: 'You are a student support assistant for an admissions portal. Help with navigation, application steps, document requirements, and exam rules. Never reveal answer keys, solve live exam questions, provide cheating assistance, or make admission decisions. Keep replies concise and factual. If asked about a live examination question, refuse and suggest using the official instructions or contacting support.',
      prompt: message,
    })
    console.info('[student-assistant] AI provider request succeeded')
    return Response.json({ answer: result.text })
  } catch (error) {
    const category = error instanceof Error ? error.name : 'UnknownError'
    console.error('[student-assistant] AI provider request failed', { category })
    return Response.json({ error: 'The student assistant is temporarily unavailable. Please try again shortly.' }, { status: 503 })
  }
}
