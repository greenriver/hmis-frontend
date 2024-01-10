import React, { useMemo } from 'react';
import OccurrencePointForm, {
  OccurrencePointFormProps,
} from '@/modules/form/components/OccurrencePointForm';
import { AlwaysPresentLocalConstants } from '@/modules/form/util/formUtil';
import { DashboardEnrollment } from '@/modules/hmis/types';

const EnrollmentOccurrencePointForm: React.FC<
  Omit<OccurrencePointFormProps, 'record'> & { enrollment: DashboardEnrollment }
> = ({ enrollment, ...props }) => {
  const localConstants = useMemo(
    () => ({
      entryDate: enrollment.entryDate,
      exitDate: enrollment.exitDate,
      projectType: enrollment.project.projectType,
      ...AlwaysPresentLocalConstants,
    }),
    [enrollment.entryDate, enrollment.exitDate, enrollment.project.projectType]
  );

  // Pick list args for form and display
  const pickListArgs = useMemo(
    () => ({
      projectId: enrollment.project.id,
      householdId: enrollment.householdId,
    }),
    [enrollment]
  );

  const submitFormInputVariables = {
    clientId: enrollment.client.id,
    enrollmentId: enrollment.id,
  };

  return (
    <OccurrencePointForm
      submitFormInputVariables={submitFormInputVariables}
      pickListArgs={pickListArgs}
      localConstants={localConstants}
      record={enrollment}
      {...props}
    />
  );
};

export default EnrollmentOccurrencePointForm;
