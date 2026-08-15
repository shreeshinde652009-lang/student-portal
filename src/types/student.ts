export type ApplicationStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';

export interface StudentApplication {
  id?: string;
  applicationNumber: string;
  userId: string;
  fullName: string;
  fatherName: string;
  motherName: string;
  dob: string;
  gender: string;
  mobile: string;
  email: string;
  category: string;
  address: string;
  district: string;
  state: string;
  sscBoard: string;
  sscPassingYear: string;
  sscPercentage: string;
  hscBoard: string;
  hscPassingYear: string;
  hscPercentage: string;
  domicileNumber: string;
  photoUrl: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export type RegistrationFormData = Omit<StudentApplication, 'id' | 'applicationNumber' | 'userId' | 'photoUrl' | 'status' | 'createdAt' | 'updatedAt'> & {
  password: string;
  confirmPassword: string;
  photoFile?: File | null;
};
