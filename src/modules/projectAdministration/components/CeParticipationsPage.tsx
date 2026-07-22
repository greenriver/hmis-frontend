import AddIcon from '@mui/icons-material/Add';
import { Button, Paper } from '@mui/material';

import { Stack } from '@mui/system';
import { useCallback, useMemo } from 'react';

import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { isFirstErrorWithFullMessage } from '@/modules/errors/util';
import { useViewEditRecordDialogs } from '@/modules/form/hooks/useViewEditRecordDialogs';
import { HudRecordMetadataHistoryColumn } from '@/modules/hmis/components/HudRecordMetadata';
import { parseAndFormatDateRange, yesNo } from '@/modules/hmis/hmisUtil';
import { useProjectDashboardContext } from '@/modules/projects/components/ProjectDashboard';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  CeParticipationFieldsFragment,
  DeleteCeParticipationDocument,
  RecordFormRole,
  GetProjectCeParticipationsDocument,
  NoYes,
} from '@/types/gqlTypes';

const columns: ColumnDef<CeParticipationFieldsFragment>[] = [
  {
    header: 'Active Period',
    key: 'activePeriod',
    render: ({
      ceParticipationStatusStartDate,
      ceParticipationStatusEndDate,
    }: CeParticipationFieldsFragment) =>
      parseAndFormatDateRange(
        ceParticipationStatusStartDate,
        ceParticipationStatusEndDate
      ),
  },
  {
    header: 'Access Point',
    key: 'accessPoint',
    render: ({ accessPoint }: CeParticipationFieldsFragment) =>
      yesNo(accessPoint),
  },
  {
    header: 'Provided by Project',
    key: 'servicesProvided',
    render: ({
      accessPoint,
      ceParticipationServices,
    }: CeParticipationFieldsFragment) => {
      if (ceParticipationServices.length === 0) {
        return accessPoint === NoYes.Yes ? 'Not Specified' : 'N/A';
      }
      return (
        <Stack direction='column'>
          {ceParticipationServices.map((str) => (
            <span>{HmisEnums.CeParticipationServices[str]}</span>
          ))}
        </Stack>
      );
    },
  },
  {
    header: 'Receives Referrals',
    key: 'receivesReferrals',
    render: ({ receivesReferrals }: CeParticipationFieldsFragment) =>
      yesNo(receivesReferrals, 'Unknown'),
  },
  HudRecordMetadataHistoryColumn,
];

const CeParticipationsPage = () => {
  const { project } = useProjectDashboardContext();

  const localConstants = useMemo(
    () => ({
      projectStartDate: project.operatingStartDate,
      projectEndDate: project.operatingEndDate,
    }),
    [project]
  );

  const evictCache = useCallback(() => {
    cache.evict({
      id: `Project:${project.id}`,
      fieldName: 'ceParticipations',
    });
  }, [project.id]);

  const { onSelectRecord, editRecordDialog, openFormDialog } =
    useViewEditRecordDialogs({
      variant: project.access.canEditProjectDetails ? 'edit_only' : 'view_only',
      inputVariables: { projectId: project.id },
      formRole: RecordFormRole.CeParticipation,
      recordName: 'CE Participation',
      evictCache,
      deleteRecordDocument: DeleteCeParticipationDocument,
      deleteRecordIdPath: 'deleteCeParticipation.ceParticipation.id',
      maxWidth: 'sm',
      localConstants,
      projectId: project.id,
      errorFilter: isFirstErrorWithFullMessage,
    });

  return (
    <>
      <PageTitle
        title='CE Participation Records'
        actions={
          project.access.canEditProjectDetails && (
            <Button
              onClick={openFormDialog}
              variant='outlined'
              startIcon={<AddIcon fontSize='small' />}
            >
              Add CE Participation
            </Button>
          )
        }
      />
      <Paper data-testid='ceParticipationsCard'>
        <GenericTableWithData
          queryVariables={{ id: project.id }}
          queryDocument={GetProjectCeParticipationsDocument}
          columns={columns}
          pagePath='project.ceParticipations'
          noData='No CE Participation records'
          recordType='CeParticipation'
          handleRowClick={
            project.access.canEditProjectDetails ? onSelectRecord : undefined
          }
          rowActionTitle='Edit CE Participation'
        />
      </Paper>
      {editRecordDialog()}
    </>
  );
};
export default CeParticipationsPage;
