import AddIcon from '@mui/icons-material/Add';
import { Button, Paper } from '@mui/material';

import { Stack } from '@mui/system';
import { useCallback, useMemo } from 'react';

import { useProjectDashboardContext } from './ProjectDashboard';

import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useViewEditRecordDialogs } from '@/modules/form/hooks/useViewEditRecordDialogs';
import { HudRecordMetadataHistoryColumn } from '@/modules/hmis/components/HudRecordMetadata';
import { parseAndFormatDateRange, yesNo } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  CeParticipationFieldsFragment,
  DeleteCeParticipationDocument,
  FormRole,
  GetProjectCeParticipationsDocument,
  NoYes,
} from '@/types/gqlTypes';

const columns: ColumnDef<CeParticipationFieldsFragment>[] = [
  {
    header: 'Active Period',
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
    render: ({ accessPoint }: CeParticipationFieldsFragment) =>
      yesNo(accessPoint),
  },
  {
    header: 'Assessments',
    render: ({
      accessPoint,
      preventionAssessment,
      crisisAssessment,
      housingAssessment,
    }: CeParticipationFieldsFragment) => {
      const assmts = [];
      if (preventionAssessment === NoYes.Yes) {
        assmts.push('Prevention Assessment');
      }
      if (crisisAssessment === NoYes.Yes) {
        assmts.push('Crisis Assessment');
      }
      if (housingAssessment === NoYes.Yes) {
        assmts.push('Housing Assessment');
      }
      if (assmts.length === 0) {
        return accessPoint === NoYes.Yes ? 'No Assessments' : 'N/A';
      }
      return (
        <Stack direction='column'>
          {assmts.map((str) => (
            <span>{str}</span>
          ))}
        </Stack>
      );
    },
  },
  {
    header: 'Direct Services',
    render: ({ accessPoint, directServices }: CeParticipationFieldsFragment) =>
      yesNo(directServices, accessPoint === NoYes.Yes ? 'Unknown' : 'N/A'),
  },
  {
    header: 'Receives Referrals',
    render: ({ receivesReferrals }: CeParticipationFieldsFragment) =>
      yesNo(receivesReferrals, 'Unknown'),
  },
  HudRecordMetadataHistoryColumn,
];

const CeParticipations = () => {
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
      formRole: FormRole.CeParticipation,
      recordName: 'CE Participation',
      evictCache,
      deleteRecordDocument: DeleteCeParticipationDocument,
      deleteRecordIdPath: 'deleteCeParticipation.ceParticipation.id',
      maxWidth: 'sm',
      localConstants,
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
        />
      </Paper>
      {editRecordDialog()}
    </>
  );
};
export default CeParticipations;
