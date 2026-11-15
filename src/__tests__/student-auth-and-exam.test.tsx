import type { ReactNode } from 'react';
import { readFileSync } from 'node:fs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RegisterPage from '@/app/register/page';
import StudentLoginPage from '@/app/student/login/page';
import AdminLoginPage from '@/app/admin/login/page';
import { ExamSchedule } from '@/components/student/ExamSchedule';

const { createClientMock } = vi.hoisted(() => ({ createClientMock: vi.fn() }));
vi.mock('@/lib/supabase', () => ({ createClient: createClientMock }));
vi.mock('next/link', async () => {
  const React = await import('react');
  return {
    default: ({ href, children }: { href: string; children: ReactNode }) =>
      React.createElement('a', { href }, children),
  };
});

type QueryResult = { data: unknown; error: { message: string } | null };
type QueryCall = { table: string; action: string; payload?: unknown };
type QueryBuilder = {
  select: (...args: unknown[]) => QueryBuilder;
  eq: (...args: unknown[]) => QueryBuilder;
  order: (...args: unknown[]) => QueryBuilder;
  limit: (...args: unknown[]) => QueryBuilder;
  insert: (payload: unknown) => QueryBuilder;
  upsert: (payload: unknown) => QueryBuilder;
  update: (payload: unknown) => QueryBuilder;
  single: () => Promise<QueryResult>;
  maybeSingle: () => Promise<QueryResult>;
  then: Promise<QueryResult>['then'];
};
type RpcCall = { name: string; args: Record<string, unknown> };

const user = { id: 'student-1', email: 'student@example.test' };
const application = { id: 'application-1', user_id: user.id };
const today = new Date().toISOString().slice(0, 10);
const day = {
  id: 'day-1',
  day_number: 1,
  title: 'Day One',
  scheduled_date: today,
  start_time: '00:00:00',
  end_time: '23:59:00',
  duration_minutes: 60,
};
const examQuestions = Array.from({ length: 50 }, (_, index) => ({
  id: `question-${index + 1}`,
  question_number: index + 1,
  prompt: `Question ${index + 1}`,
  options: ['First option', 'Second option', 'Third option', 'Fourth option'],
  marks: 1,
}));

function createMockSupabase(profileRole = 'admin') {
  const queryCalls: QueryCall[] = [];
  const rpcCalls: RpcCall[] = [];
  let isSubmitted = false;

  const getResult = (table: string, action: string): QueryResult => {
    if (table === 'exam_days') return { data: [day], error: null };
    if (table === 'applications') {
      return { data: action === 'insert' ? { id: application.id } : application, error: null };
    }
    if (table === 'exam_attempts') {
      return {
        data: isSubmitted ? [{ exam_day_id: day.id, status: 'submitted' }] : [],
        error: null,
      };
    }
    if (table === 'exam_questions') return { data: examQuestions, error: null };
    if (table === 'exam_answers') return { data: [], error: null };
    if (table === 'profiles' && action === 'select') return { data: { role: profileRole }, error: null };
    return { data: null, error: null };
  };

  const createBuilder = (table: string): QueryBuilder => {
    let action = 'select';
    const builder = {} as QueryBuilder;
    const chain = () => builder;
    builder.select = chain;
    builder.eq = chain;
    builder.order = chain;
    builder.limit = chain;
    builder.insert = (payload) => {
      action = 'insert';
      queryCalls.push({ table, action, payload });
      return builder;
    };
    builder.upsert = (payload) => {
      action = 'upsert';
      queryCalls.push({ table, action, payload });
      return builder;
    };
    builder.update = (payload) => {
      action = 'update';
      queryCalls.push({ table, action, payload });
      return builder;
    };
    builder.single = async () => getResult(table, action);
    builder.maybeSingle = async () => getResult(table, action);
    builder.then = ((onFulfilled, onRejected) =>
      Promise.resolve(getResult(table, action)).then(onFulfilled, onRejected)) as QueryBuilder['then'];
    return builder;
  };

  const client = {
    auth: {
      getUser: vi.fn(async () => ({ data: { user }, error: null })),
      signUp: vi.fn(async () => ({ data: { user, session: { access_token: 'test-session' } }, error: null })),
      signInWithPassword: vi.fn(async () => ({ data: { user }, error: null })),
    },
    from: vi.fn((table: string) => createBuilder(table)),
    storage: {
      from: vi.fn(() => ({ upload: vi.fn(async () => ({ data: { path: 'photo.png' }, error: null })) })),
    },
    rpc: vi.fn(async (name: string, args: Record<string, unknown>) => {
      rpcCalls.push({ name, args });
      if (name === 'start_exam_day_attempt') {
        return { data: [{ attempt_id: 'attempt-1', expires_at: new Date(Date.now() + 3_600_000).toISOString(), status: 'active' }], error: null };
      }
      if (name === 'submit_exam_attempt') {
        isSubmitted = true;
        return { data: [{ attempt_id: 'attempt-1', status: 'submitted', submitted_at: new Date().toISOString() }], error: null };
      }
      return { data: { saved: true }, error: null };
    }),
  };

  return { client, queryCalls, rpcCalls };
}

function fillRegistrationForm(container: HTMLElement) {
  const form = container.querySelector('form');
  if (!form) throw new Error('Registration form was not rendered.');

  const fields = form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>('[name]');
  fields.forEach((field) => {
    if (field instanceof HTMLInputElement && field.type === 'file') return;
    let value = 'Test value';
    if (field.name === 'email') value = user.email;
    if (field.name === 'password' || field.name === 'confirmPassword') value = 'strong-password-123';
    if (field.name === 'mobile') value = '1234567890';
    if (field.name === 'dob') value = '2005-04-20';
    if (field.name === 'category') value = 'OPEN';
    if (field.tagName === 'SELECT') value = (field as HTMLSelectElement).options[0]?.value ?? '';
    fireEvent.change(field, { target: { name: field.name, value } });
  });

  const photoInput = form.querySelector<HTMLInputElement>('input[type="file"]');
  if (!photoInput) throw new Error('Photo upload control was not rendered.');
  fireEvent.change(photoInput, {
    target: { files: [new File(['photo'], 'student.png', { type: 'image/png' })] },
  });
}

beforeEach(() => {
  createClientMock.mockReturnValue(createMockSupabase().client);
  vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:student-photo');
  window.sessionStorage.clear();
});

afterEach(() => cleanup());

describe('student registration', () => {
  it('creates the profile, application, and photo after signup', async () => {
    const harness = createMockSupabase();
    createClientMock.mockReturnValue(harness.client);
    const { container } = render(<RegisterPage />);
    fillRegistrationForm(container);
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    expect(await screen.findByText('Registration Successful!')).toBeTruthy();
    expect(harness.client.auth.signUp).toHaveBeenCalledWith({ email: user.email, password: 'strong-password-123' });
    const profileUpsert = harness.queryCalls.find((call) => call.table === 'profiles' && call.action === 'upsert');
    expect(profileUpsert?.payload).toMatchObject({ id: user.id, full_name: 'Test value' });
    expect(harness.queryCalls.some((call) => call.table === 'applications' && call.action === 'insert')).toBe(true);
    expect(harness.queryCalls.some((call) => call.table === 'documents' && call.action === 'insert')).toBe(true);
  });
});

describe('student login', () => {
  it('authenticates a student with email and password', async () => {
    const harness = createMockSupabase();
    createClientMock.mockReturnValue(harness.client);
    const userInteraction = userEvent.setup();
    render(<StudentLoginPage />);
    await userInteraction.type(screen.getByPlaceholderText('candidate@example.com'), user.email);
    await userInteraction.type(screen.getByPlaceholderText('Enter password'), 'strong-password-123');
    await userInteraction.click(screen.getByRole('button', { name: /login to application dashboard/i }));

    await waitFor(() => expect(harness.client.auth.signInWithPassword).toHaveBeenCalledWith({ email: user.email, password: 'strong-password-123' }));
    expect(screen.queryByText('Invalid email or password. Please check your credentials.')).toBeNull();
  });
});

describe('admin login', () => {
  it('checks the authenticated profile role before granting the admin session flag', async () => {
    const harness = createMockSupabase('admin');
    createClientMock.mockReturnValue(harness.client);
    const userInteraction = userEvent.setup();
    render(<AdminLoginPage />);
    await userInteraction.type(screen.getByPlaceholderText('admin@mahacet.org'), user.email);
    await userInteraction.type(screen.getByPlaceholderText('Enter admin password'), 'strong-password-123');
    await userInteraction.click(screen.getByRole('button', { name: /access admin console/i }));

    await waitFor(() => expect(window.sessionStorage.getItem('isAdmin')).toBe('true'));
    expect(harness.client.auth.signInWithPassword).toHaveBeenCalledWith({ email: user.email, password: 'strong-password-123' });
    expect(harness.client.from).toHaveBeenCalledWith('profiles');
  });

  it('denies an authenticated non-admin profile', async () => {
    const harness = createMockSupabase('student');
    createClientMock.mockReturnValue(harness.client);
    const userInteraction = userEvent.setup();
    render(<AdminLoginPage />);
    await userInteraction.type(screen.getByPlaceholderText('admin@mahacet.org'), user.email);
    await userInteraction.type(screen.getByPlaceholderText('Enter admin password'), 'strong-password-123');
    await userInteraction.click(screen.getByRole('button', { name: /access admin console/i }));

    expect(await screen.findByText('Admin access denied.')).toBeTruthy();
    expect(window.sessionStorage.getItem('isAdmin')).toBeNull();
  });
});

async function openExamAttempt(userInteraction: ReturnType<typeof userEvent.setup>, harness: ReturnType<typeof createMockSupabase>) {
  render(<ExamSchedule examId="exam-1" />);
  await userInteraction.click(await screen.findByRole('button', { name: /start examination/i }));
  await screen.findByText('1. Question 1');
  expect(harness.rpcCalls.find((call) => call.name === 'start_exam_day_attempt')?.args).toEqual({
    p_exam_day_id: day.id,
    p_application_id: application.id,
  });
}

describe('migration compatibility', () => {
  const migration = readFileSync(`${process.cwd()}/supabase/migrations/202611150001_harden_profile_exam_authorization.sql`, 'utf8');

  it('grants UPDATE(id) so the existing profile upsert can handle conflicts', () => {
    expect(migration).toMatch(/GRANT UPDATE\s*\(\s*id\s*,/i);
  });

  it('keeps admin exam-day edits behind an admin-only RLS policy', () => {
    expect(migration).toContain('CREATE POLICY exam_days_admin_manage');
    expect(migration).toMatch(/profile\.role IN \('admin', 'super_admin'\)/i);
    expect(migration).toMatch(/GRANT SELECT, UPDATE ON TABLE public\.exam_days TO authenticated/i);
  });

  it('revokes legacy exam entry and answer overloads', () => {
    expect(migration).toContain('REVOKE ALL PRIVILEGES ON FUNCTION public.start_exam_day(uuid, uuid)');
    expect(migration).toContain('REVOKE ALL PRIVILEGES ON FUNCTION public.save_exam_answer(uuid, uuid, text, boolean)');
    expect(migration).not.toContain('GRANT EXECUTE ON FUNCTION public.start_exam_day(uuid, uuid)');
  });
});

describe('exam workflow', () => {
  it('starts the day through the authenticated start RPC and restores its questions', async () => {
    const harness = createMockSupabase();
    createClientMock.mockReturnValue(harness.client);
    await openExamAttempt(userEvent.setup(), harness);

    expect(screen.getByText('50 questions · 50 marks · 60 minutes')).toBeTruthy();
    expect(harness.queryCalls.some((call) => call.table === 'exam_attempts' && ['insert', 'update'].includes(call.action))).toBe(false);
  });

  it('saves an answer through the five-argument RPC, not a table write', async () => {
    const harness = createMockSupabase();
    createClientMock.mockReturnValue(harness.client);
    const userInteraction = userEvent.setup();
    await openExamAttempt(userInteraction, harness);
    await userInteraction.click(screen.getAllByRole('radio')[0]);

    await waitFor(() => expect(harness.rpcCalls.find((call) => call.name === 'save_exam_answer')?.args).toEqual({
      p_attempt_id: 'attempt-1',
      p_question_id: 'question-1',
      p_selected_option: 'A',
      p_marked_for_review: false,
      p_current_question: 0,
    }));
    expect(harness.queryCalls.some((call) => call.table === 'exam_answers' && ['insert', 'update'].includes(call.action))).toBe(false);
  });

  it('submits the attempt through the one-argument RPC and marks the day complete', async () => {
    const harness = createMockSupabase();
    createClientMock.mockReturnValue(harness.client);
    const userInteraction = userEvent.setup();
    await openExamAttempt(userInteraction, harness);
    await userInteraction.click(screen.getByRole('button', { name: /submit day/i }));

    expect((await screen.findByRole('status')).textContent).toContain('Day submitted.');
    expect(harness.rpcCalls.find((call) => call.name === 'submit_exam_attempt')?.args).toEqual({ p_attempt_id: 'attempt-1' });
    expect(screen.getByText('Completed')).toBeTruthy();
    expect(harness.queryCalls.some((call) => call.table === 'exam_attempts' && ['insert', 'update'].includes(call.action))).toBe(false);
  });
});
