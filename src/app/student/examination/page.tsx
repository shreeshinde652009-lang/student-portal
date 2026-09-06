import { StudentModulePage } from '@/components/student/StudentModulePage';

export default function ExaminationPage() {
  return <StudentModulePage settingKey="exam_enabled" title="Examination" description="View published examination schedules, centres, and candidate instructions." tableName="examinations" />;
}
