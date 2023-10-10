import AddIcon from '@mui/icons-material/Add';
import { Button, Paper } from '@mui/material';

import { useCallback, useMemo, useState } from 'react';

import { useProjectDashboardContext } from './ProjectDashboard';

import { ColumnDef } from '@/components/elements/table/types';
import PageTitle from '@/components/layout/PageTitle';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import { useFormDialog } from '@/modules/form/hooks/useFormDialog';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { HudRecordMetadataHistoryColumn } from '@/modules/hmis/components/HudRecordMetadata';
import { parseAndFormatDateRange } from '@/modules/hmis/hmisUtil';
import { ProjectPermissionsFilter } from '@/modules/permissions/PermissionsFilters';
import { cache } from '@/providers/apolloClient';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DeleteHmisParticipationDocument,
  DeleteHmisParticipationMutation,
  DeleteHmisParticipationMutationVariables,
  FormRole,
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

const HmisParticipations = () => {
  const { project } = useProjectDashboardContext();
  const [viewingRecord, setViewingRecord] = useState<
    HmisParticipationFieldsFragment | undefined
  >();

  const localConstants = useMemo(
    () => ({
      projectStartDate: project.operatingStartDate,
      projectEndDate: project.operatingEndDate,
    }),
    [project]
  );

  const { openFormDialog, renderFormDialog, closeDialog } =
    useFormDialog<HmisParticipationFieldsFragment>({
      formRole: FormRole.HmisParticipation,
      onCompleted: () => {
        cache.evict({
          id: `Project:${project.id}`,
          fieldName: 'hmisParticipations',
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
      fieldName: 'hmisParticipations',
    });
    setViewingRecord(undefined);
    closeDialog();
    setViewingRecord(undefined);
  }, [closeDialog, project]);

  return (
    <>
      <PageTitle
        title='HMIS Participation Records'
        actions={
          <ProjectPermissionsFilter
            id={project.id}
            permissions='canEditProjectDetails'
          >
            <Button
              onClick={openFormDialog}
              variant='outlined'
              startIcon={<AddIcon fontSize='small' />}
            >
              Add HMIS Participation
            </Button>
          </ProjectPermissionsFilter>
        }
      />
      <Paper data-testid='hmisParticipationsCard'>
        <>
          <GenericTableWithData
            queryVariables={{ id: project.id }}
            queryDocument={GetProjectHmisParticipationsDocument}
            columns={columns}
            pagePath='project.hmisParticipations'
            noData='No HMIS Participation records'
            recordType='HmisParticipation'
            handleRowClick={(record) => {
              setViewingRecord(record);
              openFormDialog();
            }}
          />

          {renderFormDialog({
            title: `${viewingRecord ? 'Update' : 'Add'} HMIS Participation`,

            otherActions: viewingRecord ? (
              <DeleteMutationButton<
                DeleteHmisParticipationMutation,
                DeleteHmisParticipationMutationVariables
              >
                queryDocument={DeleteHmisParticipationDocument}
                variables={{ input: { id: viewingRecord.id } }}
                idPath={'deleteHmisParticipation.hmisParticipation.id'}
                recordName='HMIS Participation Record'
                onSuccess={onSuccessfulDelete}
              >
                Delete
              </DeleteMutationButton>
            ) : null,
          })}
        </>
      </Paper>
    </>
  );
};
export default HmisParticipations;
