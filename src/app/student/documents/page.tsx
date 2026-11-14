import { StudentModulePage } from '@/components/student/StudentModulePage';

export default function DocumentsPage() {
  return <StudentModulePage settingKey="documents_enabled" title="Documents" description="Access documents published against your candidate application." tableName="documents" />;
}
