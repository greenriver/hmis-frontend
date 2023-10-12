import AddIcon from '@mui/icons-material/Add';
import { Button, Paper } from '@mui/material';

import { Stack } from '@mui/system';
import { useCallback, useMemo, useState } from 'react';

import { useProjectDashboardContext } from './ProjectDashboard';

import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import { HudRecordMetadataHistoryColumn } from '@/modules/hmis/components/HudRecordMetadata';
import { parseAndFormatDateRange, yesNo } from '@/modules/hmis/hmisUtil';
import { cache } from '@/providers/apolloClient';
import {
  CeParticipationFieldsFragment,
  DeleteCeParticipationDocument,
  DeleteCeParticipationMutation,
  DeleteCeParticipationMutationVariables,
  FormRole,
  GetProjectCeParticipationsDocument,
  NoYes,
} from '@/types/gqlTypes';

const columns: ColumnDef<CeParticipationFieldsFragment>[] = [
  {
    header: 'Access Point',
    render: ({ accessPoint }: CeParticipationFieldsFragment) =>
      yesNo(accessPoint),
  },
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
  const [viewingRecord, setViewingRecord] = useState<
    CeParticipationFieldsFragment | undefined
  >();

  const localConstants = useMemo(
    () => ({
      projectStartDate: project.operatingStartDate,
      projectEndDate: project.operatingEndDate,
    }),
    [project]
  );

  const { openFormDialog, renderFormDialog, closeDialog } =
    useFormDialog<CeParticipationFieldsFragment>({
      formRole: FormRole.CeParticipation,
      onCompleted: () => {
        cache.evict({
          id: `Project:${project.id}`,
          fieldName: 'ceParticipations',
        });
        setViewingRecord(undefined);
      },
      onClose: () => setViewingRecord(undefined),
      inputVariables: { projectId: project.id },
      record: viewingRecord,
      localConstants,
    });

  const onSuccessfulDelete = useCallback(() => {
    cache.evict({
      id: `Project:${project.id}`,
      fieldName: 'ceParticipations',
    });
    setViewingRecord(undefined);
    closeDialog();
    setViewingRecord(undefined);
  }, [closeDialog, project]);

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
            project.access.canEditProjectDetails
              ? (record) => {
                  setViewingRecord(record);
                  openFormDialog();
                }
              : undefined
          }
        />
      </Paper>
      {project.access.canEditProjectDetails &&
        renderFormDialog({
          title: `${viewingRecord ? 'Update' : 'Add'} CE Participation`,

          otherActions: viewingRecord ? (
            <DeleteMutationButton<
              DeleteCeParticipationMutation,
              DeleteCeParticipationMutationVariables
            >
              queryDocument={DeleteCeParticipationDocument}
              variables={{ input: { id: viewingRecord.id } }}
              idPath={'deleteCeParticipation.ceParticipation.id'}
              recordName='CE Participation Record'
              onSuccess={onSuccessfulDelete}
            >
              Delete
            </DeleteMutationButton>
          ) : null,
        })}
    </>
  );
};
export default CeParticipations;
