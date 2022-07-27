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
