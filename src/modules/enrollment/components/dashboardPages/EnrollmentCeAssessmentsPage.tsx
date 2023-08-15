import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CeAssessmentFieldsFragment,
  GetEnrollmentCeAssessmentsQuery,
  GetEnrollmentCeAssessmentsQueryVariables,
  GetEnrollmentEventsDocument,
} from '@/types/gqlTypes';

const columns: ColumnDef<CeAssessmentFieldsFragment>[] = [
  {
    header: 'Date',
    render: (a) => parseAndFormatDate(a.assessmentDate),
  },
  {
    header: 'Level',
    render: (a) => (
      <HmisEnum value={a.assessmentLevel} enumMap={HmisEnums.AssessmentLevel} />
    ),
  },
  {
    header: 'Type',
    render: (a) => (
      <HmisEnum value={a.assessmentType} enumMap={HmisEnums.AssessmentType} />
    ),
  },
  {
    header: 'Location',
    render: (a) => a.assessmentLocation,
  },
  {
    header: 'Prioritization Status',
    render: (a) => (
      <HmisEnum
        value={a.prioritizationStatus}
        enumMap={HmisEnums.PrioritizationStatus}
      />
    ),
  },
];

const EnrollmentCeAssessmentsPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

  return (
    <TitleCard title='Coordinated Entry Assessments' headerVariant='border'>
      <GenericTableWithData<
        GetEnrollmentCeAssessmentsQuery,
        GetEnrollmentCeAssessmentsQueryVariables,
        CeAssessmentFieldsFragment
      >
        queryVariables={{ id: enrollmentId }}
        queryDocument={GetEnrollmentEventsDocument}
        columns={columns}
        pagePath='enrollment.events'
        noData='No events'
        headerCellSx={() => ({ color: 'text.secondary' })}
      />
    </TitleCard>
  );
};

export default EnrollmentCeAssessmentsPage;
