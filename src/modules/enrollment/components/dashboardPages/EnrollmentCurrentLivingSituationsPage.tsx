import AddIcon from '@mui/icons-material/Add';
import { Button } from '@mui/material';

import { ColumnDef } from '@/components/elements/table/types';
import TitleCard from '@/components/elements/TitleCard';
import { useEnrollmentDashboardContext } from '@/components/pages/EnrollmentDashboard';
import NotFound from '@/components/pages/NotFound';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { parseAndFormatDate } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CurrentLivingSituation,
  CurrentLivingSituationFieldsFragment,
  FormRole,
  GetEnrollmentCurrentLivingSituationsDocument,
  GetEnrollmentCurrentLivingSituationsQuery,
  GetEnrollmentCurrentLivingSituationsQueryVariables,
} from '@/types/gqlTypes';

const baseColumns: ColumnDef<CurrentLivingSituationFieldsFragment>[] = [
  {
    header: 'Date Provided',
    render: (e) => parseAndFormatDate(e.informationDate),
  },
  {
    header: 'Current Living Situation',
    render: (e) => (
      <HmisEnum
        value={e.currentLivingSituation}
        enumMap={HmisEnums.LivingSituation}
      />
    ),
  },
  {
    header: 'Details',
    width: '40%',
    render: (e) => e.locationDetails,
  },
];

const EnrollmentCurrentLivingSituationsPage = () => {
  const { enrollment } = useEnrollmentDashboardContext();
  const enrollmentId = enrollment?.id;
  const clientId = enrollment?.client.id;

  const { openFormDialog, renderFormDialog } =
    useFormDialog<CurrentLivingSituation>({
      formRole: FormRole.CurrentLivingSituation,
      onCompleted: () => {
        cache.evict({
          id: `Enrollment:${enrollmentId}`,
          fieldName: 'currentLivingSituations',
        });
      },
      inputVariables: { enrollmentId },
    });

  if (!enrollment || !enrollmentId || !clientId) return <NotFound />;

  return (
    <>
      <TitleCard
        title='Current Living Situations'
        headerVariant='border'
        actions={
          <Button
            onClick={openFormDialog}
            variant='outlined'
            startIcon={<AddIcon fontSize='small' />}
          >
            Add Current Living Situation
          </Button>
        }
      >
        <GenericTableWithData<
          GetEnrollmentCurrentLivingSituationsQuery,
          GetEnrollmentCurrentLivingSituationsQueryVariables,
          CurrentLivingSituationFieldsFragment
        >
          queryVariables={{ id: enrollmentId }}
          queryDocument={GetEnrollmentCurrentLivingSituationsDocument}
          columns={baseColumns}
          pagePath='enrollment.currentLivingSituations'
          noData='No current living situations'
          recordType='CurrentLivingSituation'
          headerCellSx={() => ({ color: 'text.secondary' })}
        />
      </TitleCard>
      {renderFormDialog({
        title: 'Add Current Living Situation',
      })}
    </>
  );
};

export default EnrollmentCurrentLivingSituationsPage;
