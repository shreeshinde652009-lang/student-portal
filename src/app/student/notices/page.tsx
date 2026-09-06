import { StudentModulePage } from '@/components/student/StudentModulePage';

export default function NoticesPage() {
  return <StudentModulePage settingKey="notices_enabled" title="Notices" description="Read official notices and announcements published by the CET Cell." tableName="notices" />;
}
