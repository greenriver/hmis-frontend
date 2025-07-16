import { Box } from '@mui/material';

import { Stack } from '@mui/system';
import { capitalize } from 'lodash-es';
import { useCallback, useState } from 'react';
import { ProjectConfigFormRule } from '../formRules/FormRule';
import { CommonMenuItem } from '@/components/elements/CommonMenuButton';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { ColumnDef } from '@/components/elements/table/types';
import DeleteMutationConfirmationDialog from '@/modules/dataFetching/components/DeleteMutationConfirmationDialog';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { useFilters } from '@/modules/hmis/filterUtil';
import { HmisEnums } from '@/types/gqlEnums';
import {
  DeleteProjectConfigDocument,
  DeleteProjectConfigMutation,
  DeleteProjectConfigMutationVariables,
  GetProjectConfigsDocument,
  GetProjectConfigsQuery,
  GetProjectConfigsQueryVariables,
  ProjectConfigFieldsFragment,
  ProjectConfigType,
} from '@/types/gqlTypes';
import { evictProjectConfigs } from '@/utils/cacheUtil';

const columns: ColumnDef<ProjectConfigFieldsFragment>[] = [
  {
    header: 'Config Type',
    key: 'type',
    render: ({ configType }) => (
      <HmisEnum enumMap={HmisEnums.ProjectConfigType} value={configType} />
    ),
  },
  {
    header: 'Applicability Rule',
    key: 'rule',
    render: (config) => <ProjectConfigFormRule rule={config} />,
  },
  {
    header: 'Options',
    key: 'options',
    render: ({ configOptions, configType }) => {
      if (configType === ProjectConfigType.AutoEnter) {
        return <NotCollectedText>N/A</NotCollectedText>;
      }
      if (!configOptions) return;
      const parsedOptions = JSON.parse(configOptions);

      return (
        <Stack>
          {Object.keys(parsedOptions).map((key) => (
            <Box key={key}>
              {capitalize(key.replaceAll(/_/g, ' '))}:{' '}
              {(parsedOptions[key] || false)?.toString()}
            </Box>
          ))}
        </Stack>
      );
    },
  },
];

const ProjectConfigTable = ({
  onClickRow,
}: {
  onClickRow: (projectConfig: ProjectConfigFieldsFragment | null) => any;
}) => {
  const [recordToDelete, setRecordToDelete] = useState<string | undefined>(
    undefined
  );

  const rowSecondaryActionConfigs = useCallback(
    (row: ProjectConfigFieldsFragment): CommonMenuItem[] => {
      return [
        {
          title: 'Delete Config',
          key: 'delete',
          ariaLabel: `Delete Project Config, ${row.configType}`,
          onClick: () => {
            setRecordToDelete(row.id);
          },
        },
      ];
    },
    []
  );

  const filters = useFilters({
    type: 'ProjectConfigFilterOptions',
  });

  return (
    <>
      <GenericTableWithData<
        GetProjectConfigsQuery,
        GetProjectConfigsQueryVariables,
        ProjectConfigFieldsFragment
      >
        queryVariables={{}}
        queryDocument={GetProjectConfigsDocument}
        rowSecondaryActionConfigs={rowSecondaryActionConfigs}
        columns={columns}
        pagePath='projectConfigs'
        noData='No project configs'
        recordType='ProjectConfig'
        paginationItemName='project config'
        handleRowClick={onClickRow}
        rowActionTitle='Edit Config'
        filters={filters}
        showTopToolbar
      />
      <DeleteMutationConfirmationDialog<
        DeleteProjectConfigMutation,
        DeleteProjectConfigMutationVariables
      >
        open={!!recordToDelete}
        onClose={() => setRecordToDelete(undefined)}
        variables={{ id: recordToDelete || '' }}
        queryDocument={DeleteProjectConfigDocument}
        idPath={'deleteProjectConfig.projectConfig.id'}
        onSuccess={() => evictProjectConfigs()}
        recordName='Project Config'
      />
    </>
  );
};
export default ProjectConfigTable;
