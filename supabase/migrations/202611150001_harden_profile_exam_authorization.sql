BEGIN;

REVOKE ALL PRIVILEGES ON TABLE
  public.profiles,
  public.applications,
  public.module_settings,
  public.exams,
  public.exam_days,
  public.exam_questions,
  public.exam_attempts,
  public.exam_answers
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.profiles TO authenticated;
GRANT INSERT (id, full_name, mobile, date_of_birth, category, domicile_state)
  ON TABLE public.profiles TO authenticated;
GRANT UPDATE (id, full_name, mobile, date_of_birth, category, domicile_state)
  ON TABLE public.profiles TO authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.applications TO authenticated;
GRANT SELECT ON TABLE public.module_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.exams TO authenticated;
GRANT SELECT, UPDATE ON TABLE public.exam_days TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.exam_questions TO authenticated;
GRANT SELECT ON TABLE public.exam_attempts, public.exam_answers TO authenticated;

DROP POLICY IF EXISTS exam_days_admin_manage ON public.exam_days;
CREATE POLICY exam_days_admin_manage ON public.exam_days
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles AS profile
      WHERE profile.id = (SELECT auth.uid())
        AND profile.role IN ('admin', 'super_admin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles AS profile
      WHERE profile.id = (SELECT auth.uid())
        AND profile.role IN ('admin', 'super_admin')
    )
  );

CREATE OR REPLACE FUNCTION public.start_exam_day_attempt(p_exam_day_id uuid, p_application_id uuid)
RETURNS TABLE (attempt_id uuid, expires_at timestamp with time zone, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
declare
  v_user_id uuid := auth.uid();
  v_attempt public.exam_attempts%rowtype;
  v_total_marks integer;
  v_exam_id uuid;
begin
  if v_user_id is null then raise exception 'Not authenticated'; end if;
  if not exists (
    select 1 from public.applications as a
    where a.id = p_application_id and a.user_id = v_user_id
  ) then raise exception 'Application does not belong to authenticated user'; end if;
  if not exists (
    select 1 from public.hall_ticket_details as htd
    where htd.application_id = p_application_id and htd.status = 'published'
  ) then raise exception 'Published hall ticket not found'; end if;

  select ed.exam_id, coalesce(sum(eq.marks), 0)::integer
    into v_exam_id, v_total_marks
  from public.exam_days as ed
  join public.exams as e on e.id = ed.exam_id
  left join public.exam_questions as eq on eq.day_id = ed.id
  where ed.id = p_exam_day_id
    and ed.is_published = true
    and e.is_published = true
    and ed.scheduled_date = current_date
    and (e.starts_at is null or now() >= e.starts_at)
    and (e.ends_at is null or now() <= e.ends_at)
  group by ed.exam_id;

  if v_exam_id is null then raise exception 'Exam day is not published or available today'; end if;

  select ea.*
    into v_attempt
  from public.exam_attempts as ea
  where ea.exam_day_id = p_exam_day_id
    and ea.application_id = p_application_id
    and ea.user_id = v_user_id
    and ea.status in ('active', 'submitted')
  order by ea.started_at desc
  limit 1;

  if found then
    return query select v_attempt.id, v_attempt.expires_at, v_attempt.status::text;
    return;
  end if;

  begin
    insert into public.exam_attempts (exam_id, exam_day_id, application_id, user_id, started_at, expires_at, status, total_marks)
    select ed.exam_id, ed.id, p_application_id, v_user_id, now(), now() + make_interval(mins => coalesce(ed.duration_minutes, 60)), 'active', v_total_marks
    from public.exam_days as ed
    where ed.id = p_exam_day_id
    returning * into v_attempt;
  exception when unique_violation then
    select ea.* into v_attempt
    from public.exam_attempts as ea
    where ea.exam_day_id = p_exam_day_id
      and ea.application_id = p_application_id
      and ea.user_id = v_user_id
    order by ea.started_at desc
    limit 1;
  end;

  if v_attempt.id is null then raise exception 'Exam day could not be started'; end if;
  return query select v_attempt.id, v_attempt.expires_at, v_attempt.status::text;
end;
$function$;

CREATE OR REPLACE FUNCTION public.save_exam_answer(
  p_attempt_id uuid,
  p_question_id uuid,
  p_selected_option text,
  p_marked_for_review boolean DEFAULT false,
  p_current_question integer DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
declare
  v_attempt public.exam_attempts%rowtype;
begin
  select ea.*
    into v_attempt
  from public.exam_attempts as ea
  where ea.id = p_attempt_id
    and ea.user_id = auth.uid()
  for update;
  if not found then raise exception 'Attempt not found'; end if;
  if v_attempt.status <> 'active' or now() > v_attempt.expires_at then
    raise exception 'Attempt is no longer active';
  end if;
  if not exists (
    select 1
    from public.exam_questions as eq
    where eq.id = p_question_id
      and eq.exam_id = v_attempt.exam_id
      and (v_attempt.exam_day_id is null or eq.day_id = v_attempt.exam_day_id)
  ) then raise exception 'Question does not belong to attempt'; end if;

  insert into public.exam_answers (attempt_id, question_id, selected_option, marked_for_review, updated_at)
  values (p_attempt_id, p_question_id, nullif(p_selected_option, ''), p_marked_for_review, now())
  on conflict (attempt_id, question_id) do update
    set selected_option = excluded.selected_option,
        marked_for_review = excluded.marked_for_review,
        updated_at = now();

  update public.exam_attempts as ea
    set current_question = greatest(0, p_current_question)
  where ea.id = p_attempt_id
    and ea.user_id = auth.uid();

  return jsonb_build_object('saved', true, 'updated_at', now(), 'expires_at', v_attempt.expires_at);
end;
$function$;

ALTER FUNCTION public.start_exam_attempt(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.start_exam_day_attempt(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.save_exam_answer(uuid, uuid, text, boolean, integer) SET search_path = '';
ALTER FUNCTION public.submit_exam_attempt(uuid) SET search_path = '';
ALTER FUNCTION public.enforce_student_capacity() SET search_path = '';

REVOKE ALL PRIVILEGES ON FUNCTION public.start_exam_attempt(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.start_exam_day(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.start_exam_day_attempt(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_exam_day_attempt(uuid, uuid) TO authenticated;

REVOKE ALL PRIVILEGES ON FUNCTION public.save_exam_answer(uuid, uuid, text, boolean, integer)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_exam_answer(uuid, uuid, text, boolean, integer)
  TO authenticated;

REVOKE ALL PRIVILEGES ON FUNCTION public.submit_exam_attempt(uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.submit_exam_attempt(uuid) TO authenticated;

REVOKE ALL PRIVILEGES ON FUNCTION public.save_exam_answer(uuid, uuid, text, boolean)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.submit_exam_attempt(uuid, jsonb)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.enforce_student_capacity()
  FROM PUBLIC, anon, authenticated;

COMMIT;
