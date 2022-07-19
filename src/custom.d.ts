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

// FIXME: codegen all of these!
interface Enrollment {
  id: string;
  entryDate: string;
  exitDate?: string;
  project: { projectName: string };
}

interface Client {
  id: string;
  ssn?: string;
  firstName?: string;
  preferredName?: string;
  lastName?: string;
  dob?: string;
  enrollments?: Enrollment[];
}

interface ClientQuery {
  readonly totalCount: number;
  readonly offset: number;
  readonly limit: number;
  readonly nodes: Client[];
}
