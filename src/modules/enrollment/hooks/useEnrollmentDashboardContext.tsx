import { useOutletContext } from 'react-router';
import { EnrollmentDashboardContext } from '@/modules/enrollment/components/pages/EnrollmentDashboard';

export default function useEnrollmentDashboardContext() {
  return useOutletContext<EnrollmentDashboardContext>();
}
