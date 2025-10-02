import { createContext, ReactNode } from 'react';

/**
 * Context to provide assessment-specific information to components within an assessment form.
 */
interface AssessmentContextType {
  formDefinitionIdentifier?: string; // string identifier such as "housing_assessment"
  formDefinitionId?: string; // database ID of this specific form version
  enrollmentId: string;
  clientId: string;
  assessmentId?: string;
}

const AssessmentContext = createContext<AssessmentContextType | null>(null);

interface AssessmentContextProviderProps extends AssessmentContextType {
  children: ReactNode;
}

/**
 * Provider component to supply assessment context to all child components.
 */
export const AssessmentContextProvider: React.FC<
  AssessmentContextProviderProps
> = ({ children, ...contextValue }) => {
  return (
    <AssessmentContext.Provider value={contextValue}>
      {children}
    </AssessmentContext.Provider>
  );
};

export default AssessmentContext;
