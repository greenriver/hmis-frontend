import { Box } from '@mui/material';

import { Stack } from '@mui/system';
import { capitalize } from 'lodash-es';
import ProjectApplicabilitySummary from '../formRules/ProjectApplicabilitySummary';
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
} from '@/types/gqlTypes';
import { evictProjectConfigs } from '@/utils/cacheUtil';

const columns: ColumnDef<ProjectConfigFieldsFragment>[] = [
  {
    header: 'Config Type',
    render: ({ configType }) => (
      <HmisEnum enumMap={HmisEnums.ProjectConfigType} value={configType} />
    ),
  },
  {
    header: 'Project Applicability',
    render: (config) => <ProjectApplicabilitySummary rule={config} />,
  },
  {
    header: 'Config Options',
    render: ({ configOptions }) => {
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
            header: '',
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
                >
                  Delete
                </DeleteMutationButton>
              </Box>
            ),
          },
        ]}
        pagePath='projectConfigs'
        noData='No project configs'
        recordType='ProjectConfig'
        paginationItemName='project config'
        handleRowClick={onClickRow}
        showTopToolbar
      />
    </>
  );
};
export default ProjectConfigTable;
