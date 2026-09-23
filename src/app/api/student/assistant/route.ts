import { generateText } from 'ai'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Authentication required' }, { status: 401 })

  const body = await request.json().catch(() => null)
  const message = typeof body?.message === 'string' ? body.message.trim().slice(0, 1200) : ''
  if (!message) return Response.json({ error: 'Message is required' }, { status: 400 })

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  if (profile?.role && profile.role !== 'student') return Response.json({ error: 'Student access required' }, { status: 403 })

  const result = await generateText({
    model: 'openai/gpt-5-mini',
    system: 'You are a student support assistant for an admissions portal. Help with navigation, application steps, document requirements, and exam rules. Never reveal answer keys, solve live exam questions, provide cheating assistance, or make admission decisions. Keep replies concise and factual. If asked about a live examination question, refuse and suggest using the official instructions or contacting support.',
    prompt: message,
  })
  return Response.json({ answer: result.text })
}
