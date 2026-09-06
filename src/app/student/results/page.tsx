import { StudentModulePage } from '@/components/student/StudentModulePage';

export default function ResultsPage() {
  return <StudentModulePage settingKey="results_enabled" title="Results" description="View published examination results and score updates linked to your application." tableName="results" />;
}
