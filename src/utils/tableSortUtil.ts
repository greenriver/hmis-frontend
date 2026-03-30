import { HmisEnums } from '@/types/gqlEnums';
import {
  AssessmentSortOption,
  EnrollmentSortOption,
  HouseholdSortOption,
  ProjectSortOption,
} from '@/types/gqlTypes';

export const getSortOptionForType = (
  recordType: string
): Record<string, string> | null => {
  const expectedName = `${recordType}SortOption`;
  if (expectedName in HmisEnums) {
    const key = expectedName as keyof typeof HmisEnums;
    return HmisEnums[key];
  }

  // console.debug('No sort options for', recordType);
  return null;
};

export const getDefaultSortOptionForType = (
  recordType: string
): string | null => {
  if (recordType === 'Assessment') return AssessmentSortOption.AssessmentDate;
  if (recordType === 'Enrollment') return EnrollmentSortOption.MostRecent;
  if (recordType === 'Household') return HouseholdSortOption.MostRecent;
  if (recordType === 'Project') return ProjectSortOption.Name;

  return null;
};
