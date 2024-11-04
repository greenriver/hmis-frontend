import { useMemo } from 'react';
import {
  AllEnrollmentDetailsFragment,
  DataCollectionFeatureRole,
} from '@/types/gqlTypes';

const useEnrollmentDataCollectionFeature = ({
  enrollment,
  role,
}: {
  enrollment?: AllEnrollmentDetailsFragment;
  role?: DataCollectionFeatureRole;
}) => {
  return useMemo(
    () => enrollment?.dataCollectionFeatures.find((f) => f.role === role),
    [enrollment, role]
  );
};

export default useEnrollmentDataCollectionFeature;
