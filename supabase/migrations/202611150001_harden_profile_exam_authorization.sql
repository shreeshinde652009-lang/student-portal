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
GRANT UPDATE (full_name, mobile, date_of_birth, category, domicile_state)
  ON TABLE public.profiles TO authenticated;

GRANT SELECT, INSERT, UPDATE ON TABLE public.applications TO authenticated;
GRANT SELECT, INSERT, UPDATE ON TABLE public.module_settings TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.exams TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.exam_days TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.exam_questions TO authenticated;
GRANT SELECT ON TABLE public.exam_attempts, public.exam_answers TO authenticated;

ALTER FUNCTION public.start_exam_attempt(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.start_exam_day_attempt(uuid, uuid) SET search_path = '';
ALTER FUNCTION public.save_exam_answer(uuid, uuid, text, boolean, integer) SET search_path = '';
ALTER FUNCTION public.submit_exam_attempt(uuid) SET search_path = '';
ALTER FUNCTION public.enforce_student_capacity() SET search_path = '';

REVOKE ALL PRIVILEGES ON FUNCTION public.start_exam_attempt(uuid, uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.start_exam_attempt(uuid, uuid) TO authenticated;

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
