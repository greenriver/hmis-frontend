declare module '*.svg' {
  const content: string;
  export default content;
}

interface HmisUser {
  email: string;
  name: string;
}

interface HmisError {
  type: string;
  message?: string;
}
interface HmisErrorResponse {
  error: HmisError;
}

// FIXME code-gen
interface Enrollment {
  id: string;
  entryDate: string;
  exitDate?: string;
  project: { projectName: string };
}

// FIXME code-gen
interface Client {
  id: string;
  ssn?: string;
  firstName?: string;
  preferredName?: string;
  lastName?: string;
  dob?: string;
  enrollments?: Enrollment[];
}
