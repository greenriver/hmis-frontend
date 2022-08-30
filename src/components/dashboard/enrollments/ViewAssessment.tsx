import { useParams } from 'react-router-dom';

import { useEnrollmentCrumbs } from './useEnrollmentCrumbs';

import Breadcrumbs from '@/components/elements/Breadcrumbs';
import Loading from '@/components/elements/Loading';

const ViewAssessment = () => {
  const { assessmentId } = useParams() as {
    assessmentId: string;
  };
  const [crumbs, loading] = useEnrollmentCrumbs(`Assessment ${assessmentId}`);

  if (loading) return <Loading />;
  if (!crumbs) throw Error('Enrollment not found');

  return (
    <>
      <Breadcrumbs crumbs={crumbs} />
    </>
  );
};

export default ViewAssessment;
