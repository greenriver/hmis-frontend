import AddIcon from '@mui/icons-material/Add';
import { Button, Paper } from '@mui/material';

import { useCallback, useMemo } from 'react';

import { useProjectDashboardContext } from '../../projects/components/ProjectDashboard';

import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useViewEditRecordDialogs } from '@/modules/form/hooks/useViewEditRecordDialogs';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { HudRecordMetadataHistoryColumn } from '@/modules/hmis/components/HudRecordMetadata';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DeleteHmisParticipationDocument,
  RecordFormRole,
  GetProjectHmisParticipationsDocument,
  HmisParticipationFieldsFragment,
} from '@/types/gqlTypes';

const columns: ColumnDef<HmisParticipationFieldsFragment>[] = [
  {
    header: 'Participation Type',
    render: ({ hmisParticipationType }: HmisParticipationFieldsFragment) => (
      <HmisEnum
        value={hmisParticipationType}
        enumMap={HmisEnums.HMISParticipationType}
      />
    ),
  },
  {
    header: 'Active Period',
    render: ({
      hmisParticipationStatusStartDate,
      hmisParticipationStatusEndDate,
    }: HmisParticipationFieldsFragment) =>
      parseAndFormatDateRange(
        hmisParticipationStatusStartDate,
        hmisParticipationStatusEndDate
      ),
  },
  HudRecordMetadataHistoryColumn,
];

const HmisParticipationsPage = () => {
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
      fieldName: 'hmisParticipations',
    });
  }, [project.id]);

  const { onSelectRecord, editRecordDialog, openFormDialog } =
    useViewEditRecordDialogs({
      variant: project.access.canEditProjectDetails ? 'edit_only' : 'view_only',
      inputVariables: { projectId: project.id },
      formRole: RecordFormRole.HmisParticipation,
      recordName: 'HMIS Participation',
      evictCache,
      deleteRecordDocument: DeleteHmisParticipationDocument,
      deleteRecordIdPath: 'deleteHmisParticipation.hmisParticipation.id',
      maxWidth: 'sm',
      localConstants,
      projectId: project.id,
    });

  return (
    <>
      <PageTitle
        title='HMIS Participation Records'
        actions={
          project.access.canEditProjectDetails && (
            <Button
              onClick={openFormDialog}
              variant='outlined'
              startIcon={<AddIcon fontSize='small' />}
            >
              Add HMIS Participation
            </Button>
          )
        }
      />
      <Paper data-testid='hmisParticipationsCard'>
        <GenericTableWithData
          queryVariables={{ id: project.id }}
          queryDocument={GetProjectHmisParticipationsDocument}
          columns={columns}
          pagePath='project.hmisParticipations'
          noData='No HMIS Participation records'
          recordType='HmisParticipation'
          handleRowClick={
            project.access.canEditProjectDetails ? onSelectRecord : undefined
          }
        />
      </Paper>
      {editRecordDialog()}
    </>
  );
};
export default HmisParticipationsPage;
