import { Box } from '@mui/material';
import { useState } from 'react';

import AutoExitDialog from './AutoExitDialog';
import NotCollectedText from '@/components/elements/NotCollectedText';
import RouterLink from '@/components/elements/RouterLink';
import { ColumnDef } from '@/components/elements/table/types';
import DeleteMutationButton from '@/modules/dataFetching/components/DeleteMutationButton';
import GenericTableWithData from '@/modules/dataFetching/components/GenericTableWithData';
import HmisEnum from '@/modules/hmis/components/HmisEnum';
import { Routes } from '@/routes/routes';
import { HmisEnums } from '@/types/gqlEnums';
import {
  AutoExitConfigFieldsFragment,
  DeleteAutoExitConfigDocument,
  DeleteAutoExitConfigMutation,
  DeleteAutoExitConfigMutationVariables,
  GetAutoExitConfigsDocument,
  GetAutoExitConfigsQuery,
  GetAutoExitConfigsQueryVariables,
} from '@/types/gqlTypes';
import { evictAutoExitConfigs } from '@/utils/cacheUtil';
import { generateSafePath } from '@/utils/pathEncoding';

const columns: ColumnDef<AutoExitConfigFieldsFragment>[] = [
  {
    header: 'Length of Absence',
    render: ({ lengthOfAbsenceDays }) => <>{lengthOfAbsenceDays} Days</>,
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
];

const AutoExitTable = () => {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <>
      <GenericTableWithData<
        GetAutoExitConfigsQuery,
        GetAutoExitConfigsQueryVariables,
        AutoExitConfigFieldsFragment
      >
        queryVariables={{}}
        queryDocument={GetAutoExitConfigsDocument}
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
                  DeleteAutoExitConfigMutation,
                  DeleteAutoExitConfigMutationVariables
                >
                  queryDocument={DeleteAutoExitConfigDocument}
                  variables={{ id }}
                  idPath={'deleteAutoExitConfig.autoExitConfig.id'}
                  recordName='Auto Exit Config'
                  onSuccess={() => evictAutoExitConfigs()}
                >
                  Delete
                </DeleteMutationButton>
              </Box>
            ),
          },
        ]}
        pagePath='autoExitConfigs'
        noData='No auto exit configs'
        showFilters
        recordType='AutoExitConfig'
        paginationItemName='auto exit config'
        handleRowClick={(row) => setSelected(row.id)}
      />
      <AutoExitDialog
        open={!!selected}
        autoExitId={selected || ''}
        onClose={() => setSelected(null)}
      />
    </>
  );
};
export default AutoExitTable;
