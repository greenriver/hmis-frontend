import { Box } from '@mui/material';

import { Stack } from '@mui/system';
import { capitalize } from 'lodash-es';
import { ProjectConfigFormRule } from '../formRules/FormRule';
import NotCollectedText from '@/components/elements/NotCollectedText';
import { ColumnDef } from '@/components/elements/table/types';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
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
              {capitalize(key.replaceAll(/_/g, ' '))}: {parsedOptions[key]}
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
  return (
    <>
      <GenericTableWithData<
        GetProjectConfigsQuery,
        GetProjectConfigsQueryVariables,
        ProjectConfigFieldsFragment
      >
        queryVariables={{}}
        queryDocument={GetProjectConfigsDocument}
        columns={[
          ...columns,
          {
            key: 'Delete',
            render: ({ id }) => (
              <Box
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                <DeleteMutationButton<
                  DeleteProjectConfigMutation,
                  DeleteProjectConfigMutationVariables
                >
                  queryDocument={DeleteProjectConfigDocument}
                  variables={{ id }}
                  idPath={'deleteProjectConfig.projectConfig.id'}
                  recordName='Project Config'
                  onSuccess={() => evictProjectConfigs()}
                  onlyIcon
                />
              </Box>
            ),
          },
        ]}
        pagePath='projectConfigs'
        noData='No project configs'
        recordType='ProjectConfig'
        paginationItemName='project config'
        handleRowClick={onClickRow}
        rowActionTitle='Edit Project Config'
        showTopToolbar
      />
    </>
  );
};
export default ProjectConfigTable;
