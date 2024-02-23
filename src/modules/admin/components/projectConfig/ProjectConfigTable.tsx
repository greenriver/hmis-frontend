import { Box } from '@mui/material';

import { capitalize } from 'lodash-es';
import NotCollectedText from '@/components/elements/NotCollectedText';
import RouterLink from '@/components/elements/RouterLink';
import { ColumnDef } from '@/components/elements/table/types';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  ProjectConfigFieldsFragment,
  DeleteProjectConfigDocument,
  DeleteProjectConfigMutation,
  DeleteProjectConfigMutationVariables,
  GetProjectConfigsDocument,
  GetProjectConfigsQuery,
  GetProjectConfigsQueryVariables,
} from '@/types/gqlTypes';
import { evictProjectConfigs } from '@/utils/cacheUtil';
import { generateSafePath } from '@/utils/pathEncoding';

const columns: ColumnDef<ProjectConfigFieldsFragment>[] = [
  {
    header: 'Config Type',
    render: ({ configType }) => (
      <HmisEnum enumMap={HmisEnums.HmisProjectConfigType} value={configType} />
    ),
  },
  {
    header: 'Project Type',
    render: ({ projectType }) =>
      projectType ? (
        <HmisEnum enumMap={HmisEnums.ProjectType} value={projectType} />
      ) : (
        <NotCollectedText>Any Project Type</NotCollectedText>
      ),
  },
  {
    header: 'Project',
    render: ({ project }) =>
      project ? (
        <RouterLink
          to={generateSafePath(Routes.PROJECT, { projectId: project.id })}
        >
          {project.projectName}
        </RouterLink>
      ) : (
        <NotCollectedText variant='body2'>Any Project</NotCollectedText>
      ),
  },
  {
    header: 'Organization',
    render: ({ organization }) =>
      organization ? (
        <RouterLink
          to={generateSafePath(Routes.ORGANIZATION, {
            organizationId: organization.id,
          })}
        >
          {organization.organizationName}
        </RouterLink>
      ) : (
        <NotCollectedText variant='body2'>Any Organization</NotCollectedText>
      ),
  },
  {
    header: 'Config Options',
    render: ({ configOptions }) => {
      if (!configOptions) return;
      const parsedOptions = JSON.parse(configOptions);

      return Object.keys(parsedOptions).map((key) => {
        return (
          <span key={key}>
            {capitalize(key.replaceAll(/_/g, ' '))}: {parsedOptions[key]}
          </span>
        );
      });
    },
  },
];

const ProjectConfigTable = ({
  setSelectedId,
}: {
  selectedId?: string | null;
  setSelectedId: (id: string | null) => any;
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
        showFilters
        recordType='ProjectConfig'
        paginationItemName='project config'
        handleRowClick={(row) => setSelectedId(row.id)}
      />
    </>
  );
};
export default ProjectConfigTable;
