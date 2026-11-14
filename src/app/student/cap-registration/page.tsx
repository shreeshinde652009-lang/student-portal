import { StudentModulePage } from '@/components/student/StudentModulePage';

export default function CapRegistrationPage() {
  return <StudentModulePage settingKey="cap_registration_enabled" title="CAP Registration" description="Review your Centralized Admission Process registration and published allotment updates." tableName="cap_registrations" />;
}
